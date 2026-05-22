const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("move")
	.setDescription("Moves track to a different position")
	.addIntegerOption((option) =>
		option
			.setName("track")
			.setDescription("The track number to move")
			.setRequired(true)
	)
	.addIntegerOption((option) =>
		option
			.setName("position")
			.setDescription("The position to move the track to")
			.setRequired(true)
	)
	.setRun(async (client, interaction) => {
		const track = interaction.options.getInteger("track");
		const position = interaction.options.getInteger("position");

		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There's nothing playing.")],
				ephemeral: true,
			});
		}

		const queueLength = player.queue.tracks.length;
		let trackNum = Number(track) - 1;
		if (trackNum < 0 || trackNum >= queueLength) {
			return interaction.reply({ content: "❌ | **Invalid track number**", ephemeral: true });
		}

		let dest = Number(position) - 1;
		if (dest < 0 || dest >= queueLength) {
			return interaction.reply({ content: "❌ | **Invalid position number**", ephemeral: true });
		}

		const thing = player.queue.tracks[trackNum];

		await player.queue.splice(trackNum, 1);

		await player.queue.splice(dest, 0, thing);

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(client.config.embedColor)
					.setDescription(`✅ | **Moved track \`${trackNum + 1}\` to position \`${dest + 1}\`**`),
			],
		});
	});

module.exports = command;
