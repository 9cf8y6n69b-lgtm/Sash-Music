const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, escapeMarkdown } = require("discord.js");

const command = new SlashCommand()
  .setName("play")
  .setDescription("Plays a song from YouTube, Spotify, Soundcloud, etc.")
  .addStringOption((option) =>
    option
      .setName("song")
      .setDescription("The song name or URL you want to play")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .setRun(async (client, interaction) => {

    await interaction.deferReply();

    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    let node = await client.getLavalink(client);
    if (!node) {
      return interaction.editReply({
        embeds: [client.ErrorEmbed("Lavalink node is not connected")],
      });
    }

    const query = interaction.options.getString("song") || interaction.options.getString("query");
    if (!query || !query.trim()) {
      return interaction.editReply({
        embeds: [client.ErrorEmbed("Please provide a valid song name or URL.")],
      });
    }

    let player = client.manager.getPlayer(interaction.guild.id);
    const isNewPlayer = !player;

    if (isNewPlayer) {
      player = client.createPlayer(interaction.channel, channel);
      await player.connect();
    }

    player.set("requester", interaction.user);

    const res = await player.search({ query }, interaction.user).catch((err) => {
      client.error(err);
      return { loadType: "error" };
    });

    if (res.loadType === "error") {
      if (isNewPlayer) player.destroy();
      return interaction.editReply({
        embeds: [client.ErrorEmbed("There was an error while searching for that song.")],
      });
    }

    if (res.loadType === "empty") {
      if (isNewPlayer) player.destroy();
      return interaction.editReply({
        embeds: [client.ErrorEmbed("No results were found for that query.")],
      });
    }

    if (res.loadType === "track" || res.loadType === "search") {
      const track = res.tracks[0];
      await player.queue.add(track);
      if (!player.playing) {
        await player.play({ paused: false });
      }

      const title = escapeMarkdown(track.info.title).replace(/[\[\]]/g, "");
      const addEmbed = new EmbedBuilder()
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
        );

      if (player.queue.tracks.length > 1) {
        addEmbed.addFields({
          name: "Position in queue",
          value: `\`${player.queue.tracks.length}\``,
          inline: true,
        });
      }

      return interaction.editReply({ embeds: [addEmbed] });
    }

    if (res.loadType === "playlist") {
      await player.queue.add(res.tracks);
      if (!player.playing) {
        await player.play({ paused: false });
      }

      const playlistEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({ name: "Playlist added to queue", iconURL: client.config.iconURL })
        .setDescription(`[${res.playlist?.name ?? "Playlist"}](${query})`)
        .addFields(
          { name: "Enqueued", value: `\`${res.tracks.length}\` songs`, inline: true },
          {
            name: "Playlist duration",
            value: `\`${client.ms(res.playlist?.duration ?? 0, { colonNotation: true, secondsDecimalDigits: 0 })}\``,
            inline: true,
          }
        );

      if (res.tracks[0]?.info?.artworkUrl) {
        playlistEmbed.setThumbnail(res.tracks[0].info.artworkUrl);
      }

      return interaction.editReply({ embeds: [playlistEmbed] });
    }
  });

module.exports = command;
