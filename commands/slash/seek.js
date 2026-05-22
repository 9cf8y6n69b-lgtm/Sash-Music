const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
	.setName("seek")
	.setDescription("Seek to a specific time in the current song.")
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription("Seek to time you want. Ex 1h 30m | 2h | 80m | 53s")
			.setRequired(true)
	)
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

		await interaction.deferReply();

		const rawArgs = interaction.options.getString("time");
		const args = rawArgs.split(' ');
		const rawTime = [];
		for (let i = 0; i < args.length; i++) {
			const parsed = ms(args[i]);
			if (parsed !== undefined) {
				rawTime.push(parsed);
			}
		}

		if (rawTime.length === 0) {
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("❌ | **Invalid time format! Use formats like `10s`, `2m`, `1h 30m`.**")],
			});
		}

		const time = rawTime.reduce((a, b) => a + b, 0);
		const position = player.position;
		const duration = player.queue.current.info.duration;

		if (time <= duration) {
			await player.seek(time);
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(
							`⏩ | **${player.queue.current.info.title}** has been ${
								time < position ? "rewound" : "seeked"
							} to **${ms(time, { long: true })}**`
						),
				],
			});
		} else {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(
							`❌ | **Unable to seek. The time specified exceeds the track's duration of ${ms(duration, { long: true })}.**`
						),
				],
			});
		}
	});

module.exports = command;
