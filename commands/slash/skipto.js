const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("skipto")
	.setDescription("skip to a specific song in the queue")
	.addIntegerOption((option) =>
		option
			.setName("number")
			.setDescription("The track number to skip to")
			.setRequired(true)
	)
	.setRun(async (client, interaction) => {
		const trackNumber = interaction.options.getInteger("number");

		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("I'm not in a channel.")],
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const position = Number(trackNumber);
		const queueLength = player.queue.tracks.length;

		if (position <= 0 || position > queueLength) {
			const invalidEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setDescription(`❌ | **Invalid position. The queue currently has only \`${queueLength}\` tracks.**`);
			return interaction.editReply({ embeds: [invalidEmbed] });
		}

		try {
			if (position > 1) {

				await player.queue.splice(0, position - 1);
			}
			await player.stopPlaying(false, false);

			const successEmbed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription(`✅ | **Skipped to position \`${position}\`**`);
			return interaction.editReply({ embeds: [successEmbed] });
		} catch (err) {
			client.error(err);
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("An error occurred while skipping.")],
			});
		}
	});

module.exports = command;
