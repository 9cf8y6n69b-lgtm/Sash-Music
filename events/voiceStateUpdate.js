const { EmbedBuilder } = require("discord.js");

/**
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").VoiceState} oldState
 * @param {import("discord.js").VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  const guildId = newState.guild.id;
  const player = client.manager.getPlayer(guildId);

  if (!player || !player.connected) return;

  const stateChange = {};
  if (!oldState.channel && newState.channel) stateChange.type = "JOIN";
  if (oldState.channel && !newState.channel) stateChange.type = "LEAVE";
  if (oldState.channel && newState.channel) {
    if (oldState.channel.id === newState.channel.id) return;
    stateChange.type = "MOVE";
  }
  if (!oldState.channel && !newState.channel) return;

  if (oldState.channel && newState.channel && newState.id === client.config.clientId) {
    if (newState.serverMute && !oldState.serverMute) {
      return player.pause(true);
    }
    if (!newState.serverMute && oldState.serverMute) {
      return player.pause(false);
    }
  }

  if (stateChange.type === "MOVE") {
    if (oldState.channel?.id === player.voiceChannelId) stateChange.type = "LEAVE";
    else if (newState.channel?.id === player.voiceChannelId) stateChange.type = "JOIN";
    else return;
  }

  if (stateChange.type === "JOIN") stateChange.channel = newState.channel;
  if (stateChange.type === "LEAVE") stateChange.channel = oldState.channel;

  if (!stateChange.channel || stateChange.channel.id !== player.voiceChannelId) return;

  player.prevMembers = player.members;
  player.members = stateChange.channel.members.filter((m) => !m.user.bot).size;

  const sendEmbed = async (embed) =>
    client.channels.cache.get(player.textChannelId)?.send({ embeds: [embed] });

  if (stateChange.type === "JOIN") {
    if (player.get("autoPause") === true) {
      const members = stateChange.channel.members.filter((m) => !m.user.bot).size;
      if (members === 1 && player.paused && members !== player.prevMembers) {
        player.resume();
        const msg = await sendEmbed(
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle("Resumed!")
            .setDescription(`Playing [${player.queue.current?.info?.title}](${player.queue.current?.info?.uri})`)
            .setFooter({ text: "The current song has been resumed." })
        );
        player.setResumeMessage(client, msg ?? null);
        if (msg) setTimeout(() => { if (!client.isMessageDeleted(msg)) { msg.delete().catch(() => {}); client.markMessageAsDeleted(msg); } }, 5000);
      }
    }
  }

  if (stateChange.type === "LEAVE") {
    const members = stateChange.channel.members.filter((m) => !m.user.bot).size;
    const twentyFourSeven = player.get("twentyFourSeven");
    const autoPause = player.get("autoPause");
    const autoLeave = player.get("autoLeave");

    if (autoPause && !autoLeave) {
      if (members === 0 && !player.paused && player.playing) {
        player.pause(true);
        const msg = await sendEmbed(
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setTitle("Paused!")
            .setFooter({ text: "Paused because there's no one in the voice channel." })
        );
        player.setPausedMessage(client, msg ?? null);
      }
    } else if (autoLeave && members === 0) {
      const leave = async () => {
        const msg = await sendEmbed(
          new EmbedBuilder()
            .setColor(client.config.embedColor)
            .setAuthor({ name: "Disconnected!", iconURL: client.config.iconURL })
            .setFooter({ text: "Left because there is no one in the voice channel." })
            .setTimestamp()
        );
        if (msg) setTimeout(() => msg.delete().catch(() => {}), 5000);
        player.destroy();
        player.set("autoQueue", false);
      };

      if (twentyFourSeven) {
        setTimeout(async () => {
          const now = stateChange.channel.members.filter((m) => !m.user.bot).size;
          if (now === 0 && player.connected) await leave();
        }, client.config.disconnectTime);
      } else {
        await leave();
      }
    }
  }
};
