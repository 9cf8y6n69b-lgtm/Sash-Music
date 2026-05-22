/**
 * @param {import("../lib/DiscordMusicBot")} client
 * @returns {import("lavalink-client").LavalinkNode | undefined}
 */
module.exports = async (client) => {
  if (!client.manager) return undefined;
  for (const node of client.manager.nodeManager.nodes.values()) {
    if (node.connected) return node;
  }
  return undefined;
};
