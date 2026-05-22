const SlashCommand = require("../../lib/SlashCommand");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const { Rlyrics } = require("rlyrics");
const lyricsApi = new Rlyrics();

const command = new SlashCommand()
	.setName("lyrics")
	.setDescription("Get the lyrics of a song")
	.addStringOption((option) =>
		option
			.setName("song")
			.setDescription("The song to get lyrics for (leave empty to use current track)")
			.setRequired(false)
	)
	.setRun(async (client, interaction) => {
		await interaction.reply({
			embeds: [new EmbedBuilder().setColor(client.config.embedColor).setDescription("🔎 | **Searching...**")],
		});

		const player = client.manager?.getPlayer(interaction.guild.id);
		const args = interaction.options.getString("song");

		if (!args && !player) {
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There's nothing playing and no song was specified.")],
			});
		}

		const phrasesToRemove = [
			"Full Video", "Full Audio", "Official Music Video", "Lyrics", "Lyrical Video",
			"Feat.", "Ft.", "Official", "Audio", "Video", "HD", "4K", "Remix", "8K",
			"High Quality", "Extended", "DJ Edit", "with Lyrics", "Karaoke",
			"Instrumental", "Live", "Acoustic", "Cover",
		];

		let query = args;
		if (!query && player?.queue?.current) {
			query = player.queue.current.info.title
				.replace(new RegExp(phrasesToRemove.join("|"), "gi"), "")
				.replace(/\s*([\[\(].*?[\]\)])?\s*(\|.*)?\s*(\*.*)?$/, "")
				.trim();
		}

		if (!query) {
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("Could not determine a song to search.")],
			});
		}

		lyricsApi.search(query).then(async (lyricsData) => {
			if (!lyricsData || lyricsData.length === 0) {
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(0xff0000)
							.setDescription(`No results found for \`${query}\`!\nTry adding the artist name or searching manually.`),
					],
				});
			}

			const lyricsResults = lyricsData
				.slice(0, client.config.lyricsMaxResults)
				.map((item, i) => ({
					label: item.title.slice(0, 100),
					description: item.artist.slice(0, 100),
					value: i.toString(),
				}));

			const menu = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("choose-lyrics")
					.setPlaceholder("Choose a song")
					.addOptions(lyricsResults)
			);

			const reply = await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setDescription(`Results for \`${query}\`. Choose a song within \`30 seconds\`.`),
				],
				components: [menu],
			});

			const collector = reply.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 30000,
				max: 1,
			});

			collector.on("collect", async (i) => {
				if (!i.isStringSelectMenu()) return;
				await i.deferUpdate();

				const url = lyricsData[parseInt(i.values[0])].url;
				lyricsApi.find(url).then(async (lyrics) => {
					let lyricsText = lyrics.lyrics ?? "";
					const musixmatchIcon = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Musixmatch_logo_icon_only.svg/480px-Musixmatch_logo_icon_only.svg.png";

					if (lyricsText.length > 4096) {
						lyricsText = lyricsText.substring(0, 4050) + "\n\n[...]";
					}

					const lyricsEmbed = new EmbedBuilder()
						.setColor(client.config.embedColor)
						.setTitle(lyrics.name)
						.setURL(url)
						.setThumbnail(lyrics.icon)
						.setDescription(
							lyricsText.length === 0
								? "**Unfortunately we're not authorized to show these lyrics.**"
								: lyricsText.length > 4050
								? lyricsText + "\nTruncated — lyrics too long."
								: lyricsText
						)
						.setFooter({ text: "Lyrics provided by MusixMatch.", iconURL: musixmatchIcon });

					const sourceButton = new ActionRowBuilder().addComponents(
						new ButtonBuilder().setLabel("Source").setURL(url).setStyle(ButtonStyle.Link)
					);

					await i.editReply({ embeds: [lyricsEmbed], components: [sourceButton] });
				});
			});

			collector.on("end", async (collected) => {
				if (collected.size === 0) {
					await interaction.editReply({
						embeds: [new EmbedBuilder().setColor(client.config.embedColor).setDescription("No song selected — timed out.")],
						components: [],
					}).catch(() => {});
				}
			});
		}).catch((err) => {
			console.error(err);
			interaction.editReply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("An error occurred while searching for lyrics.")],
			});
		});
	});

module.exports = command;
