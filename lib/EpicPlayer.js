const { Message } = require("discord.js");
const Client = require("./DiscordMusicBot");

/**
 * Extends the base lavalink-client Player with message tracking helpers.
 * Used as a mixin — methods are added to every player instance after creation.
 * @param {import("lavalink-client").Player} player
 */
function applyEpicPlayer(player) {
  player.twentyFourSeven = false;

  /**
   * Deletes the old resume message and stores the new one.
   * @param {Client} client
   * @param {Message|null} message
   */
  player.setResumeMessage = function (client, message) {
    if (this.pausedMessage && !client.isMessageDeleted(this.pausedMessage)) {
      this.pausedMessage.delete().catch(() => {});
      client.markMessageAsDeleted(this.pausedMessage);
    }
    return (this.resumeMessage = message);
  };

  /**
   * Deletes the old pause message and stores the new one.
   * @param {Client} client
   * @param {Message|null} message
   */
  player.setPausedMessage = function (client, message) {
    if (this.resumeMessage && !client.isMessageDeleted(this.resumeMessage)) {
      this.resumeMessage.delete().catch(() => {});
      client.markMessageAsDeleted(this.resumeMessage);
    }
    return (this.pausedMessage = message);
  };

  /**
   * Deletes the old now-playing message and stores the new one.
   * @param {Client} client
   * @param {Message|null} message
   */
  player.setNowplayingMessage = function (client, message) {
    if (this.nowPlayingMessage && !client.isMessageDeleted(this.nowPlayingMessage)) {
      this.nowPlayingMessage.delete().catch(() => {});
      client.markMessageAsDeleted(this.nowPlayingMessage);
    }
    return (this.nowPlayingMessage = message);
  };

  return player;
}

module.exports = { applyEpicPlayer };
