const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("shuffle")
	.setDescription("Randomizes the queue")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There is no music playing.")],
				ephemeral: true,
			});
		}

		if (!player.queue || !player.queue.tracks.length) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There are not enough songs in the queue to shuffle.")],
				ephemeral: true,
			});
		}

		await player.queue.shuffle();
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription("🔀 | **Successfully shuffled the queue.**"),
			],
		});
	});

module.exports = command;
