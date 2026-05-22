/**
 * Forward raw Discord gateway packets to lavalink-client.
 * lavalink-client needs VOICE_STATE_UPDATE and VOICE_SERVER_UPDATE
 * to get the session data required to stream audio to Discord.
 *
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {*} data - Raw gateway packet
 */
module.exports = (client, data) => {
  if (!client.manager) return;
  client.manager.sendRawData(data);
};
