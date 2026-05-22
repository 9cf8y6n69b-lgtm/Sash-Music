const { ContextMenuCommandBuilder, EmbedBuilder, ApplicationCommandType, escapeMarkdown } = require("discord.js");

module.exports = {
  command: new ContextMenuCommandBuilder()
    .setName("Play Song")
    .setType(ApplicationCommandType.Message),

  run: async (client, interaction) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let node = await client.getLavalink(client);
    if (!node) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("Lavalink node is not connected")],
      });
    }

    const targetMsg =
      interaction.channel.messages.cache.get(interaction.targetId) ??
      (await interaction.channel.messages.fetch(interaction.targetId).catch(() => null));

    const query = targetMsg?.content;
    if (!query || !query.trim()) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Please select a message with valid text content.")],
        ephemeral: true,
      });
    }

    let player = client.manager.getPlayer(interaction.guild.id);
    const isNewPlayer = !player;

    if (isNewPlayer) {
      player = client.createPlayer(interaction.channel, channel);
      await player.connect();
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(":mag_right: **Searching...**"),
      ],
      fetchReply: true,
    });

    const res = await player.search({ query }, interaction.user).catch((err) => {
      client.error(err);
      return { loadType: "error" };
    });

    if (res.loadType === "error") {
      if (!player.queue.current) player.destroy();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There was an error while searching.")],
      });
    }

    if (res.loadType === "empty") {
      if (!player.queue.current) player.destroy();
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("No results were found.")],
      });
    }

    if (res.loadType === "track" || res.loadType === "search") {
      const track = res.tracks[0];
      await player.queue.add(track);
      if (!player.playing) await player.play({ paused: false });

      const title = escapeMarkdown(track.info.title).replace(/[\[\]]/g, "");
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: "Added to queue", iconURL: client.config.iconURL })
            .setDescription(`[${title}](${track.info.uri})`)
            .addFields(
              { name: "Added by", value: `<@${interaction.user.id}>`, inline: true },
              {
                name: "Duration",
                value: track.info.isStream
                  ? "`LIVE 🔴`"
                  : `\`${client.ms(track.info.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\``,
                inline: true,
              }
            )
            .setThumbnail(
              track.info.artworkUrl ??
              `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`
            ),
        ],
      });
    }

    if (res.loadType === "playlist") {
      await player.queue.add(res.tracks);
      if (!player.playing) await player.play({ paused: false });

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: "Playlist added to queue", iconURL: client.config.iconURL })
            .setDescription(`[${res.playlist?.name ?? "Playlist"}](${query})`)
            .addFields(
              { name: "Enqueued", value: `\`${res.tracks.length}\` songs`, inline: true }
            ),
        ],
      });
    }
  },
};
