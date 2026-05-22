const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("summon")
	.setDescription("Summons the bot to your voice channel.")
	.setRun(async (client, interaction) => {
		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			return interaction.reply({
				embeds: [client.ErrorEmbed("You must be in a voice channel to use this command.")],
				ephemeral: true,
			});
		}

		let player = client.manager.getPlayer(interaction.guild.id);

		if (!player) {

			player = client.createPlayer(interaction.channel, voiceChannel);
			await player.connect();
		} else if (voiceChannel.id !== player.voiceChannelId) {

			player.voiceChannelId = voiceChannel.id;
			await player.connect();
		}

		return interaction.reply({
			embeds: [client.Embed(`:thumbsup: | **Successfully joined <#${voiceChannel.id}>!**`)],
		});
	});

module.exports = command;
