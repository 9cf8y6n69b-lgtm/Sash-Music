const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("loop")
	.setDescription("Loops the current song (track → queue → off)")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Nothing is playing right now.")],
				ephemeral: true,
			});
		}

		if (player.repeatMode === "off") {
			await player.setRepeatMode("track");
		} else if (player.repeatMode === "track") {
			await player.setRepeatMode("queue");
		} else {
			await player.setRepeatMode("off");
		}

		const modeText = { track: "🔂 Track Loop", queue: "🔁 Queue Loop", off: "Loop Off" };
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`👍 | **${modeText[player.repeatMode]}**`),
			],
		});
	});

module.exports = command;
