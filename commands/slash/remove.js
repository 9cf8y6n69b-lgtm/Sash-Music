const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder, escapeMarkdown } = require("discord.js");

const command = new SlashCommand()
	.setName("remove")
	.setDescription("Remove a track from the queue")
	.addIntegerOption((option) =>
		option
			.setName("number")
			.setDescription("The track number in the queue to remove")
			.setRequired(true)
	)
	.setRun(async (client, interaction) => {
		const trackNumber = interaction.options.getInteger("number");

		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There are no songs in the queue.")],
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const position = Number(trackNumber) - 1;
		const queueLength = player.queue.tracks.length;

		if (position < 0 || position >= queueLength) {
			const boundsEmbed = new EmbedBuilder()
				.setColor(client.config.embedColor)
				.setDescription(`❌ | **Invalid track number. The queue currently has only \`${queueLength}\` tracks.**`);
			return interaction.editReply({ embeds: [boundsEmbed] });
		}

		const track = player.queue.tracks[position];
		const title = escapeMarkdown(track.info.title).replace(/[\[\]]/g, "");

		await player.queue.remove(position);

		const removeEmbed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setDescription(`✅ | **Removed [${title}](${track.info.uri}) from the queue.**`);
		return interaction.editReply({ embeds: [removeEmbed] });
	});

module.exports = command;
