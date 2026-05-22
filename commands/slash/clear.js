const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("clear")
	.setDescription("Clear all tracks from queue")
	.setRun(async (client, interaction, options) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.getPlayer(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xff0000)
						.setDescription("Lavalink node is not connected"),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xff0000)
						.setDescription("Nothing is playing right now."),
				],
				ephemeral: true,
			});
		}
		
		if (!player.queue || !player.queue.tracks.length) {
			let cembed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription("❌ | **Invalid, Not enough track to be cleared.**");
			
			return interaction.reply({ embeds: [cembed], ephemeral: true });
		}
		
		await player.queue.splice(0, player.queue.tracks.length);
		
		let clearEmbed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setDescription(`✅ | **Cleared the queue!**`);
		
		return interaction.reply({ embeds: [clearEmbed] });
	});

module.exports = command;