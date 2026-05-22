const Controller = require("../util/Controller");
const yt = require("youtube-sr").default;
const { EmbedBuilder } = require("discord.js");

/**
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").Interaction} interaction
 */
module.exports = async (client, interaction) => {

  if (interaction.isChatInputCommand()) {
    const command = client.slashCommands.find(
      (x) => x.name === interaction.commandName
    );
    if (!command || !command.run) {
      return interaction.reply({ content: "Command not found.", ephemeral: true });
    }

    client.commandsRan++;
    try {
      await command.run(client, interaction, interaction.options);
    } catch (err) {
      client.error(`Command [${interaction.commandName}] error: ${err?.message ?? err}`);
      const errEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription(`❌ | An error occurred: \`${err?.message ?? "Unknown error"}\``);

      if (interaction.replied || interaction.deferred) {
        interaction.editReply({ embeds: [errEmbed], components: [] }).catch(() => {});
      } else {
        interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      }
    }
    return;
  }

  if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
    const command = client.contextCommands.find(
      (x) => x.command.name === interaction.commandName
    );
    if (!command || !command.run) {
      return interaction.reply({ content: "Command not found.", ephemeral: true });
    }

    client.commandsRan++;
    try {
      await command.run(client, interaction, interaction.options);
    } catch (err) {
      client.error(`ContextMenu [${interaction.commandName}] error: ${err?.message ?? err}`);
      const errEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription(`❌ | An error occurred: \`${err?.message ?? "Unknown error"}\``);

      if (interaction.replied || interaction.deferred) {
        interaction.editReply({ embeds: [errEmbed], components: [] }).catch(() => {});
      } else {
        interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
      }
    }
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId.startsWith("controller")) {
      try {
        await Controller(client, interaction);
      } catch (err) {
        client.error(`Controller error: ${err?.message ?? err}`);
      }
    }
  }

  if (interaction.isAutocomplete()) {
    const url = interaction.options.getFocused();
    if (!url) return interaction.respond([]).catch(() => {});

    const urlPatterns = [
      /^((?:https?:)\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)[\w\-]+(\S+)?$/,
      /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
      /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
      /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
      /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)[\w\-\.]+|[^&]+)\/[\w\-\.]+/,
    ];

    const isUrl = urlPatterns.some((r) => r.test(url));

    if (interaction.commandName === "play") {
      try {
        const choices = [];
        if (isUrl) {
          choices.push({ name: url.slice(0, 100), value: url });
        } else {
          const results = await yt
            .search(url, { safeSearch: false, limit: 10 })
            .catch(() => []);
          results.forEach((x) => {
            if (x.title && x.url)
              choices.push({ name: x.title.slice(0, 100), value: x.url });
          });
        }
        return interaction.respond(choices).catch(() => {});
      } catch {
        return interaction.respond([]).catch(() => {});
      }
    }
  }
};
