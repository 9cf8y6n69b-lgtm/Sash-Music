const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("previous")
	.setDescription("Go back to the previous song.")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There are no previous songs for this session.")],
				ephemeral: true,
			});
		}

		const previousTrack = player.queue.previous?.[0];
		if (!previousTrack) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There is no previous song in the queue.")],
				ephemeral: true,
			});
		}

		if (player.queue.current) {
			await player.queue.add(player.queue.current, 0);
		}
		await player.queue.add(previousTrack, 0);
		await player.stopPlaying(false, false);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`⏮ | Previous song: **${previousTrack.info.title}**`),
			],
		});
	});

module.exports = command;
