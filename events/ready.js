/**
 * @param {import("../lib/DiscordMusicBot")} client
 */
module.exports = (client) => {
  client.manager.init(client.user);
  client.user.setPresence(client.config.presence);
  client.log("Successfully logged in as " + client.user.tag);
  
  // Deploy commands automatically on bot startup
  client.deployCommands();
};
