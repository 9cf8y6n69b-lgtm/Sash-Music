const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("skip")
	.setDescription("Skip the current song")
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
						.setDescription("There is nothing to skip."),
				],
				ephemeral: true,
			});
		} 
        	const song = player.queue.current;
	        const autoQueue = player.get("autoQueue");
                if (player.queue[0] == undefined && (!autoQueue || autoQueue === false)) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0xff0000)
					.setDescription(`There is nothing after [${ song.info.title }](${ song.info.uri }) in the queue.`),
			],
		})}
		
		player.queue.previous = player.queue.current;
		player.stopPlaying(false, false);
		
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription("✅ | **Skipped!**"),
			],
		});
	});

module.exports = command;
