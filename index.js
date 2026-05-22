require("dotenv").config();

const DiscordMusicBot = require("./lib/DiscordMusicBot");

const client = new DiscordMusicBot();

const getClient = () => client;

module.exports = { getClient };
