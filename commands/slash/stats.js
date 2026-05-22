const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");
require("moment-duration-format");
const { EmbedBuilder } = require("discord.js");
const os = require("os");

const command = new SlashCommand()
	.setName("stats")
	.setDescription("Get information about the bot")
	.setRun(async (client, interaction) => {
		const osver = os.platform() + " " + os.release();
		const nodeVersion = process.version;

		const runtime = moment
			.duration(client.uptime)
			.format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");

		const sysuptime = moment
			.duration(os.uptime() * 1000)
			.format("d[ Days]・h[ Hrs]・m[ Mins]・s[ Secs]");

		let gitHash = "unknown";
		try {
			gitHash = require("child_process").execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
		} catch {}

		const node = client.manager?.nodeManager?.nodes?.values()?.next()?.value;
		const nodeStats = node?.stats;

		const lavaSection = nodeStats
			? `\`\`\`yml\nUptime: ${moment.duration(nodeStats.uptime).format("D[d], H[h], m[m]")}\nRAM: ${(nodeStats.memory.used / 1024 / 1024).toFixed(2)} MB\nPlaying: ${nodeStats.playingPlayers} of ${nodeStats.players}\`\`\``
			: "`Not connected`";

		const statsEmbed = new EmbedBuilder()
			.setTitle(`${client.user.username} Information`)
			.setColor(client.config.embedColor)
			.setDescription(
				`\`\`\`yml\nName: ${client.user.username} [${client.user.id}]\nPing: ${client.ws.ping}ms\nUptime: ${runtime}\`\`\``
			)
			.addFields(
				{ name: "Lavalink", value: lavaSection, inline: true },
				{
					name: "Bot Stats",
					value: `\`\`\`yml\nGuilds: ${client.guilds.cache.size}\nNode.js: ${nodeVersion}\nCommands run: ${client.commandsRan}\nSongs played: ${client.songsPlayed}\`\`\``,
					inline: true,
				},
				{
					name: "System",
					value: `\`\`\`yml\nOS: ${osver}\nUptime: ${sysuptime}\`\`\``,
					inline: false,
				}
			)
			.setFooter({ text: `Build: ${gitHash}` });

		return interaction.reply({ embeds: [statsEmbed] });
	});

module.exports = command;
