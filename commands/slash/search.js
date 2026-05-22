const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const command = new SlashCommand()
  .setName("search")
  .setDescription("Search for a song and pick from results")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("The song to search for")
      .setRequired(true)
  )
  .setRun(async (client, interaction) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) return;

    if (!client.manager) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Lavalink node is not connected")],
      });
    }

    const search = interaction.options.getString("query");
    if (!search || !search.trim()) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Please provide a valid search query.")],
        ephemeral: true,
      });
    }

    let player = client.manager.getPlayer(interaction.guild.id);
    const isNewPlayer = !player;

    if (isNewPlayer) {
      player = client.createPlayer(interaction.channel, channel);
    }

    await interaction.deferReply().catch(() => {});

    if (isNewPlayer) await player.connect();
    let res;

    try {
      res = await player.search({ query: search }, interaction.user);
    } catch {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("An error occurred while searching.")],
      });
    }

    if (res.loadType === "error" || res.loadType === "empty") {
      return interaction.editReply({
        embeds: [new EmbedBuilder().setColor(0xff0000).setDescription(`No results found for \`${search}\``)],
      });
    }

    const max = Math.min(res.tracks.length, 10);
    const options = res.tracks.slice(0, max).map((track) => ({
      label: track.info.title.slice(0, 100),
      value: track.info.uri,
      description: track.info.isStream
        ? "LIVE"
        : `${prettyMilliseconds(track.info.duration, { secondsDecimalDigits: 0 })} — ${track.info.author}`.slice(0, 100),
    }));

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("search_select")
        .setPlaceholder("Select a song")
        .addOptions(options)
    );

    const reply = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription(`Results for \`${search}\`. Pick one within \`30 seconds\``),
      ],
      components: [menu],
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      if (!i.isStringSelectMenu()) return;
      await i.deferUpdate();

      const uri = i.values[0];
      const result = await player.search({ query: uri }, interaction.user).catch(() => null);
      if (!result || !result.tracks[0]) return;

      const track = result.tracks[0];
      await player.queue.add(track);
      if (!player.playing && !player.paused) await player.play({ paused: false });

      await i.editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: "Added to queue", iconURL: client.config.iconURL })
            .setDescription(`[${track.info.title}](${track.info.uri})`)
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
            .setThumbnail(`https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`),
        ],
        components: [],
      });
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          embeds: [new EmbedBuilder().setColor(client.config.embedColor).setDescription("No track selected — timed out.")],
          components: [],
        }).catch(() => {});
      }
    });
  });

module.exports = command;
