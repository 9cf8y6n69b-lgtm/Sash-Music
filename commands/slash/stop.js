const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("stop")
	.setDescription("Stops music and leaves the voice channel (clears queue)")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("I'm not in a channel.")],
				ephemeral: true,
			});
		}

		if (player.get("twentyFourSeven")) {
			await player.queue.splice(0, player.queue.tracks.length);
			await player.stopPlaying(true, false);
			player.set("autoQueue", false);
		} else {
			player.destroy();
		}

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(":wave: | **Bye Bye!**"),
			],
		});
	});

module.exports = command;
