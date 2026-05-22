const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
	.setName("nowplaying")
	.setDescription("Shows the song currently playing in the voice channel.")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("The bot isn't in a channel.")],
				ephemeral: true,
			});
		}

		if (!player.queue.current) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There's nothing playing.")],
				ephemeral: true,
			});
		}

		const song = player.queue.current;
		const title = escapeMarkdown(song.info.title).replace(/[\[\]]/g, "");

		const embed = new EmbedBuilder()
			.setColor(client.config.embedColor)
			.setAuthor({ name: "Now Playing", iconURL: client.config.iconURL })
			.setDescription(`[${title}](${song.info.uri})`)
			.addFields(
				{ name: `${client.config.emojis.user} Requested by`, value: `<@${song.requester?.id ?? song.requester}>`, inline: true },
				{
					name: `${client.config.emojis.duration} Duration`,
					value: song.info.isStream
						? `${client.config.emojis.live} \`LIVE\``
						: `\`${prettyMilliseconds(player.position, { secondsDecimalDigits: 0 })} / ${prettyMilliseconds(song.info.duration, { secondsDecimalDigits: 0 })}\``,
					inline: true,
				}
			)
			.setThumbnail(
				song.info.artworkUrl ??
				`https://img.youtube.com/vi/${song.info.identifier}/maxresdefault.jpg`
			);

		return interaction.reply({ embeds: [embed] });
	});

module.exports = command;
