const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("loopq")
	.setDescription("Loop the current song queue")
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
						.setDescription("There is no music playing."),
				],
				ephemeral: true,
			});
		}
		
		if (player.setRepeatMode(player.repeatMode === "queue" ? "off" : "queue")) {
			;
		}
		const queueRepeat = player.repeatMode === "queue" ? "enabled" : "disabled";
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(
						`:thumbsup: | **Loop queue is now \`${ queueRepeat }\`**`,
					),
			],
		});
	});

module.exports = command;
