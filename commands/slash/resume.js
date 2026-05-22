const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("resume")
	.setDescription("Resume current track")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There is no song playing right now.")],
				ephemeral: true,
			});
		}

		if (!player.paused) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Current track is already resumed")],
				ephemeral: true,
			});
		}

		await player.resume();
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`⏯ **Resumed!**`),
			],
		});
	});

module.exports = command;
