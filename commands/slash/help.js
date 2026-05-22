const SlashCommand = require("../../lib/SlashCommand");
const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");

const command = new SlashCommand()
  .setName("help")
  .setDescription("Shows all available commands in an interactive modern menu")
  .setRun(async (client, interaction) => {
    await interaction.deferReply().catch(() => {});

    const commands = await LoadCommands().then((cmds) =>
      [].concat(cmds.slash)
    );

    const customEmojis = client.config.emojis;

    const parseEmojiOption = (emojiStr) => {
      if (!emojiStr) return undefined;
      const match = emojiStr.match(/:(\d+)>/);
      return match ? { id: match[1] } : emojiStr;
    };

    const categories = {
      music: {
        title: `${customEmojis.music} Music Controls`,
        emoji: customEmojis.music,
        description: "Standard and advanced audio playbacks, queue, and playback controls.",
        commands: [
          "play", "pause", "resume", "stop", "skip", "skipto", "previous",
          "replay", "seek", "volume", "queue", "nowplaying", "loop", "loopq",
          "shuffle", "filters", "lyrics", "move", "remove", "clear", "summon"
        ]
      },
      config: {
        title: `${customEmojis.stats} Bot Settings`,
        emoji: customEmojis.stats,
        description: "System and automated configuration toggles for the bot.",
        commands: [
          "247", "autoleave", "autopause", "autoqueue", "clean", "guildleave", "stats", "reload"
        ]
      },
      utility: {
        title: `${customEmojis.user} General Utility`,
        emoji: customEmojis.user,
        description: "Utility tools, network ping, and resource indicators.",
        commands: [
          "ping", "help"
        ]
      }
    };

    const getCmdInfo = (name) => {
      const cmd = commands.find((c) => c.name === name);
      return {
        name: name,
        description: cmd ? cmd.description : "No description available."
      };
    };

    let gitHash = "unknown";
    try {
      gitHash = require("child_process").execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    } catch {}

    const buildHomeEmbed = () => {
      return new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: `${client.user.username} Help Menu`,
          iconURL: client.config.iconURL
        })
        .setThumbnail(client.config.iconURL)
        .setDescription(
          `Welcome to **${client.user.username}**! I am a premium Discord music bot designed to provide elite audio playback.\n\nUse the **select menu** below to browse through our commands by category.`
        )
        .addFields(
          {
            name: `${customEmojis.music} Music Controls`,
            value: `\`${categories.music.commands.length}\` commands for ultimate audio playback control.`,
            inline: false
          },
          {
            name: `${customEmojis.stats} Bot Settings`,
            value: `\`${categories.config.commands.length}\` settings to automate and manage playback.`,
            inline: false
          },
          {
            name: `${customEmojis.user} General Utility`,
            value: `\`${categories.utility.commands.length}\` utility and info commands.`,
            inline: false
          }
        )
        .setTimestamp()
        .setFooter({ text: `Total Commands: ${commands.length} • Build: ${gitHash}` });
    };

    const buildCategoryEmbed = (categoryKey) => {
      const cat = categories[categoryKey];
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: `${categoryKey.toUpperCase()} Category`,
          iconURL: client.config.iconURL
        })
        .setDescription(`*${cat.description}*\n\n`)
        .setTimestamp()
        .setFooter({ text: `Category: ${categoryKey.toUpperCase()} • Build: ${gitHash}` });

      cat.commands.forEach((cmdName) => {
        const info = getCmdInfo(cmdName);
        embed.addFields({ name: `/${info.name}`, value: info.description });
      });

      return embed;
    };

    const getSelectMenu = (selected = "home") => {
      const menu = new StringSelectMenuBuilder()
        .setCustomId("help_menu_select")
        .setPlaceholder("Choose a category to browse...")
        .addOptions([
          {
            label: "Home Menu",
            description: "Go back to the main menu dashboard",
            value: "home",
            emoji: "🏡",
            default: selected === "home"
          },
          {
            label: "Music Controls",
            description: categories.music.description,
            value: "music",
            emoji: parseEmojiOption(categories.music.emoji),
            default: selected === "music"
          },
          {
            label: "Bot Settings",
            description: categories.config.description,
            value: "config",
            emoji: parseEmojiOption(categories.config.emoji),
            default: selected === "config"
          },
          {
            label: "General Utility",
            description: categories.utility.description,
            value: "utility",
            emoji: parseEmojiOption(categories.utility.emoji),
            default: selected === "utility"
          }
        ]);

      return new ActionRowBuilder().addComponents(menu);
    };

    const msg = await interaction.editReply({
      embeds: [buildHomeEmbed()],
      components: [getSelectMenu()],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 600_000,
      idle: 120_000,
    });

    collector.on("collect", async (i) => {
      if (i.customId !== "help_menu_select") return;
      await i.deferUpdate();

      const choice = i.values[0];
      let embed;

      if (choice === "home") {
        embed = buildHomeEmbed();
      } else {
        embed = buildCategoryEmbed(choice);
      }

      await i.editReply({
        embeds: [embed],
        components: [getSelectMenu(choice)]
      });
    });

    collector.on("end", async () => {

      await interaction.editReply({ components: [] }).catch(() => {});
    });
  });

module.exports = command;
