const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  escapeMarkdown,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const prettyMilliseconds = require("pretty-ms");
const jsoning = require("jsoning");
const { LavalinkManager } = require("lavalink-client");
const ConfigFetcher = require("../util/getConfig");
const Logger = require("./Logger");
const getLavalink = require("../util/getLavalink");
const getChannel = require("../util/getChannel");
const colors = require("colors");
const { applyEpicPlayer } = require("./EpicPlayer");

class DiscordMusicBot extends Client {
  /**
   * Create the music client
   * @param {import("discord.js").ClientOptions} props
   */
  constructor(props = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  }) {
    super(props);

    ConfigFetcher().then((conf) => {
      this.config = conf;
      this.build();
    });

    /** @type {Collection<string, import("./SlashCommand")>} */
    this.slashCommands = new Collection();
    this.contextCommands = new Collection();

    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));

    this.LoadCommands();
    this.LoadEvents();

    this.database = new jsoning("db.json");

    this.deletedMessages = new WeakSet();
    this.getLavalink = getLavalink;
    this.getChannel = getChannel;
    this.ms = prettyMilliseconds;
    this.commandsRan = 0;
    this.songsPlayed = 0;
  }

  log(text) { this.logger.log(text); }
  warn(text) { this.logger.warn(text); }
  error(text) { this.logger.error(text); }

  build() {
    this.warn("Started the bot...");
    this.login(this.config.token);

    if (this.config.debug === true) {
      this.warn("Debug mode is enabled!");
      process.on("unhandledRejection", (error) => console.log(error));
      process.on("uncaughtException", (error) => console.log(error));
    } else {
      process.on("unhandledRejection", () => {});
      process.on("uncaughtException", () => {});
    }

    const client = this;
    let playedTracks = [];

    this.manager = new LavalinkManager({
      nodes: this.config.nodes.map((n) => ({
        authorization: n.password,
        host: n.host,
        port: n.port,
        id: n.identifier,
        retryAmount: n.retryAmount,
        retryDelay: n.retryDelay,
        secure: n.secure,
      })),
      sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      client: {
        id: this.config.clientId,
        username: "EnzoMusic",
      },
      playerOptions: {
        defaultSearchPlatform: "ytsearch",
        volumeDecrementer: 0.75,
      },
      queueOptions: {
        maxPreviousTracks: 10,
      },
      autoSkip: true,
    });

    this.manager.nodeManager.on("connect", (node) =>
      this.log(`Node: ${node.id} | Lavalink node is connected.`)
    );
    this.manager.nodeManager.on("reconnecting", (node) =>
      this.warn(`Node: ${node.id} | Lavalink node is reconnecting.`)
    );
    this.manager.nodeManager.on("disconnect", (node) =>
      this.warn(`Node: ${node.id} | Lavalink node is disconnected.`)
    );
    this.manager.nodeManager.on("error", (node, err) =>
      this.warn(`Node: ${node.id} | Lavalink node error: ${err.message}`)
    );

    this.manager.on("playerCreate", (player) => {
      applyEpicPlayer(player);
      player.set("twentyFourSeven", client.config.twentyFourSeven);
      player.set("autoQueue", client.config.autoQueue);
      player.set("autoPause", client.config.autoPause);
      player.set("autoLeave", client.config.autoLeave);
      this.warn(
        `Player: ${player.guildId} | Player created in ${
          client.guilds.cache.get(player.guildId)?.name ?? "a guild"
        }`
      );
    });

    this.manager.on("playerDestroy", (player) => {
      this.warn(`Player: ${player.guildId} | Player destroyed`);
      player.setNowplayingMessage(client, null);
    });

    this.manager.on("playerMove", (player, oldChannel, newChannel) => {
      const guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;
      const channel = guild.channels.cache.get(player.textChannelId);
      if (oldChannel === newChannel) return;
      if (!newChannel) {
        if (channel) {
          channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setDescription(`Disconnected from <#${oldChannel}>`),
            ],
          });
        }
        return player.destroy();
      } else {
        player.voiceChannelId = newChannel;
        setTimeout(() => player.pause(false), 1000);
      }
    });

    this.manager.on("trackStart", async (player, track) => {
      client.songsPlayed++;
      playedTracks.push(track.info.identifier);
      if (playedTracks.length >= 100) playedTracks.shift();

      this.warn(
        `Player: ${player.guildId} | Now playing [${colors.blue(track.info.title)}]`
      );

      const title = escapeMarkdown(track.info.title)
        .replace(/\]/g, "")
        .replace(/\[/g, "");

      const trackEmbed = this.Embed()
        .setAuthor({ name: "Now playing", iconURL: this.config.iconURL })
        .setDescription(`[${title}](${track.info.uri})`)
        .addFields(
          {
            name: `${this.config.emojis.user} Requested by`,
            value: `${track.requester ?? `<@${client.user.id}>`}`,
            inline: true,
          },
          {
            name: `${this.config.emojis.duration} Duration`,
            value: track.info.isStream
              ? `${this.config.emojis.live} \`LIVE\``
              : `\`${prettyMilliseconds(track.info.duration, { colonNotation: true })}\``,
            inline: true,
          }
        );

      try {
        trackEmbed.setThumbnail(
          `https://img.youtube.com/vi/${track.info.identifier}/maxresdefault.jpg`
        );
      } catch {
        trackEmbed.setThumbnail(track.info.artworkUrl ?? null);
      }

      const nowPlaying = await client.channels.cache
        .get(player.textChannelId)
        ?.send({
          embeds: [trackEmbed],
          components: [client.createController(player.guildId, player)],
        })
        .catch(this.warn.bind(this));

      player.setNowplayingMessage(client, nowPlaying);
    });

    this.manager.on("trackError", (player, track, payload) => {
      this.warn(`Player: ${player.guildId} | Track error: ${payload?.exception?.message}`);
      const title = escapeMarkdown(track.info.title).replace(/[\[\]]/g, "");
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Playback error!")
        .setDescription(`Failed to load track: \`${title}\``)
        .setFooter({ text: "Oops! something went wrong but it's not your fault!" });
      client.channels.cache.get(player.textChannelId)?.send({ embeds: [errorEmbed] });
    });

    this.manager.on("trackStuck", (player, track) => {
      this.warn(`Player: ${player.guildId} | Track stuck`);
      const title = escapeMarkdown(track.info.title).replace(/[\[\]]/g, "");
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Track stuck!")
        .setDescription(`Failed to play track: \`${title}\``)
        .setFooter({ text: "Oops! something went wrong but it's not your fault!" });
      client.channels.cache.get(player.textChannelId)?.send({ embeds: [errorEmbed] });
    });

    this.manager.on("queueEnd", async (player, track) => {
      const autoQueue = player.get("autoQueue");

      if (autoQueue) {
        const identifier = track.info.identifier;
        const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
        const res = await player.search({ query: search }, player.get("requester")).catch(() => null);

        if (!res || res.loadType === "error" || res.loadType === "empty") {
          return player.destroy();
        }

        const nextTrack = res.tracks.find((t) => !playedTracks.includes(t.info.identifier));
        if (nextTrack) {
          await player.queue.add(nextTrack);
          await player.play({ paused: false });
        }
        return;
      }

      const twentyFourSeven = player.get("twentyFourSeven");

      const queueEmbed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({ name: "The queue has ended", iconURL: client.config.iconURL })
        .setFooter({ text: "Queue ended" })
        .setTimestamp();

      const endMsg = await client.channels.cache
        .get(player.textChannelId)
        ?.send({ embeds: [queueEmbed] });

      if (endMsg) setTimeout(() => endMsg.delete().catch(() => {}), 5000);

      try {
        if (!player.playing && !twentyFourSeven) {
          setTimeout(async () => {
            if (!player.playing && player.connected) {
              const disconnEmbed = new EmbedBuilder()
                .setColor(client.config.embedColor)
                .setAuthor({ name: "Disconnected!", iconURL: client.config.iconURL })
                .setDescription("The player has been disconnected due to inactivity.");

              const disconnMsg = await client.channels.cache
                .get(player.textChannelId)
                ?.send({ embeds: [disconnEmbed] });

              if (disconnMsg) setTimeout(() => disconnMsg.delete().catch(() => {}), 6000);
              player.destroy();
            }
          }, client.config.disconnectTime);
        } else if (!player.playing && twentyFourSeven) {
          this.warn(`Player: ${player.guildId} | Queue ended [${colors.blue("24/7 ENABLED")}]`);
        }
        player.setNowplayingMessage(client, null);
      } catch (err) {
        this.error(err);
      }
    });
  }

  isMessageDeleted(message) { return this.deletedMessages.has(message); }
  markMessageAsDeleted(message) { this.deletedMessages.add(message); }

  /**
   * @param {string} [text]
   * @returns {EmbedBuilder}
   */
  Embed(text) {
    const embed = new EmbedBuilder().setColor(this.config.embedColor);
    if (text) embed.setDescription(text);
    return embed;
  }

  /**
   * @param {string} text
   * @returns {EmbedBuilder}
   */
  ErrorEmbed(text) {
    return new EmbedBuilder().setColor(0xff0000).setDescription("❌ | " + text);
  }

  LoadEvents() {
    const EventsDir = path.join(__dirname, "..", "events");
    fs.readdir(EventsDir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const event = require(EventsDir + "/" + file);
        this.on(file.split(".")[0] === "ready" ? "clientReady" : file.split(".")[0], event.bind(null, this));
        this.warn("Event Loaded: " + file.split(".")[0]);
      });
    });
  }

  LoadCommands() {
    const SlashDir = path.join(__dirname, "..", "commands", "slash");
    fs.readdir(SlashDir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const cmd = require(SlashDir + "/" + file);
        if (!cmd || !cmd.run) {
          return this.warn(`Unable to load Command: ${file.split(".")[0]} — missing run()`);
        }
        this.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
        this.log("Slash Command Loaded: " + file.split(".")[0]);
      });
    });

    const ContextDir = path.join(__dirname, "..", "commands", "context");
    fs.readdir(ContextDir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const cmd = require(ContextDir + "/" + file);
        if (!cmd.command || !cmd.run) {
          return this.warn(`Unable to load Command: ${file.split(".")[0]} — missing command/run`);
        }
        this.contextCommands.set(file.split(".")[0].toLowerCase(), cmd);
        this.log("ContextMenu Loaded: " + file.split(".")[0]);
      });
    });
  }

  /**
   * @param {import("discord.js").TextChannel} textChannel
   * @param {import("discord.js").VoiceChannel} voiceChannel
   */
  createPlayer(textChannel, voiceChannel) {
    return this.manager.createPlayer({
      guildId: textChannel.guild.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannel.id,
      selfDeaf: this.config.serverDeafen ?? true,
      volume: this.config.defaultVolume,
    });
  }

  createController(guildId, player) {
    const emojis = this.config.emojis;
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`controller:${guildId}:Stop`)
        .setEmoji(emojis.stop),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`controller:${guildId}:Replay`)
        .setEmoji(emojis.replay),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`controller:${guildId}:PlayAndPause`)
        .setEmoji(player.playing ? emojis.pause : emojis.play),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`controller:${guildId}:Next`)
        .setEmoji(emojis.next),

      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`controller:${guildId}:Loop`)
        .setEmoji(
          player.repeatMode === "track" ? emojis.loop1
          : player.repeatMode === "queue" ? emojis.loop
          : emojis.loop
        )
    );
  }
}

module.exports = DiscordMusicBot;
