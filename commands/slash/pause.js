const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("pause")
	.setDescription("Pauses the current playing track")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Nothing is playing.")],
				ephemeral: true,
			});
		}

		if (player.paused) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Current playing track is already paused!")],
				ephemeral: true,
			});
		}

		await player.pause(true);
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`⏸ | **Paused!**`),
			],
		});
	});

module.exports = command;
