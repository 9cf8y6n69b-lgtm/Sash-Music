const SlashCommand = require("../../lib/SlashCommand");
const { EmbedBuilder } = require("discord.js");

const command = new SlashCommand()
	.setName("filters")
	.setDescription("Apply audio filters to the player")
	.addStringOption((option) =>
		option
			.setName("preset")
			.setDescription("The filter preset to apply")
			.setRequired(true)
			.addChoices(
				{ name: "Nightcore", value: "nightcore" },
				{ name: "BassBoost", value: "bassboost" },
				{ name: "Vaporwave", value: "vaporwave" },
				{ name: "8D", value: "eightD" },
				{ name: "Karaoke", value: "karaoke" },
				{ name: "Vibrato", value: "vibrato" },
				{ name: "Tremolo", value: "tremolo" },
				{ name: "Reset", value: "off" },
			),
	)
	.setRun(async (client, interaction) => {
		const preset = interaction.options.getString("preset");

		let channel = await client.getChannel(client, interaction);
		if (!channel) return;

		const player = client.manager?.getPlayer(interaction.guild.id);
		if (!player) {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(0xff0000).setDescription("There's no music playing.")],
				ephemeral: true,
			});
		}

		const filterEmbed = new EmbedBuilder().setColor(client.config.embedColor);
		const fm = player.filterManager;

		switch (preset) {
			case "nightcore":
				await fm.setTimescale({ speed: 1.2, pitch: 1.2, rate: 1 });
				filterEmbed.setDescription("✅ | **Nightcore** filter enabled!");
				break;
			case "bassboost":
				await fm.setEqualizer([
					{ band: 0, gain: 0.3 }, { band: 1, gain: 0.25 },
					{ band: 2, gain: 0.2 }, { band: 3, gain: 0.1 },
					{ band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
				]);
				filterEmbed.setDescription("✅ | **BassBoost** filter enabled!");
				break;
			case "vaporwave":
				await fm.setTimescale({ speed: 0.85, pitch: 0.85, rate: 1 });
				filterEmbed.setDescription("✅ | **Vaporwave** filter enabled!");
				break;
			case "eightD":
				await fm.setRotation({ rotationHz: 0.2 });
				filterEmbed.setDescription("✅ | **8D** filter enabled!");
				break;
			case "karaoke":
				await fm.setKaraoke({ level: 1, monoLevel: 1, filterBand: 220, filterWidth: 100 });
				filterEmbed.setDescription("✅ | **Karaoke** filter enabled!");
				break;
			case "vibrato":
				await fm.setVibrato({ frequency: 10, depth: 0.9 });
				filterEmbed.setDescription("✅ | **Vibrato** filter enabled!");
				break;
			case "tremolo":
				await fm.setTremolo({ frequency: 2, depth: 0.5 });
				filterEmbed.setDescription("✅ | **Tremolo** filter enabled!");
				break;
			case "off":
				await fm.resetFilters();
				filterEmbed.setDescription("✅ | All filters have been **reset**!");
				break;
			default:
				filterEmbed.setDescription("❌ | Invalid filter!");
		}

		return interaction.reply({ embeds: [filterEmbed] });
	});

module.exports = command;
