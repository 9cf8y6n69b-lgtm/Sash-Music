const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("replay")
	.setDescription("Replay current playing track")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("I'm not playing anything.")],
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		await player.seek(0);

		const song = player.queue.current;
		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`🔄 | **Replaying [${song.info.title}](${song.info.uri})**`),
			],
		});
	});

module.exports = command;
