const { EmbedBuilder } = require("discord.js");

/**
 * @param {import("../lib/DiscordMusicBot")} client
 * @param {import("discord.js").ButtonInteraction} interaction
 */
module.exports = async (client, interaction) => {
  const guildId = interaction.customId.split(":")[1];
  const property = interaction.customId.split(":")[2];
  const player = client.manager.getPlayer(guildId);

  if (!player) {
    await interaction.reply({
      embeds: [client.Embed("❌ | **There is no player to control in this server.**")],
      ephemeral: true,
    });
    return;
  }

  if (!interaction.member.voice.channel) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription("❌ | **You must be in a voice channel to use this action!**"),
      ],
      ephemeral: true,
    });
  }

  if (
    interaction.guild.members.me.voice.channel &&
    !interaction.guild.members.me.voice.channel.equals(interaction.member.voice.channel)
  ) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embedColor)
          .setDescription("❌ | **You must be in the same voice channel as me!**"),
      ],
      ephemeral: true,
    });
  }

  if (property === "Stop") {
    await player.queue.splice(0, player.queue.tracks.length);
    await player.stopPlaying(true, false);
    player.set("autoQueue", false);
    client.warn(`Player: ${guildId} | Stopped`);

    const msg = await interaction.channel.send({
      embeds: [client.Embed("⏹️ | **Successfully stopped the player**")],
    });
    setTimeout(() => msg.delete().catch(() => {}), 5000);

    return interaction.update({
      components: [client.createController(guildId, player)],
    });
  }

  if (property === "Replay") {
    const previousTrack = player.queue.previous?.[0];
    if (!previousTrack) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setColor(0xff0000).setDescription("There is no previous song."),
        ],
      });
    }
    await player.queue.add(previousTrack, 0);
    await player.stopPlaying(false, false);
    return interaction.deferUpdate();
  }

  if (property === "PlayAndPause") {
    if (!player || !player.queue.current) {
      const msg = await interaction.channel.send({
        embeds: [
          new EmbedBuilder().setColor(0xff0000).setDescription("There is no song playing."),
        ],
      });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
      return interaction.deferUpdate();
    }

    if (player.paused) {
      await player.resume();
    } else {
      await player.pause(true);
    }

    client.warn(`Player: ${guildId} | ${player.paused ? "Paused" : "Resumed"}`);
    return interaction.update({
      components: [client.createController(guildId, player)],
    });
  }

  if (property === "Next") {
    const autoQueue = player.get("autoQueue");
    if (player.queue.tracks.length === 0 && !autoQueue) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription("There is nothing next in the queue."),
        ],
      });
    }
    await player.stopPlaying(false, false);
    return interaction.deferUpdate();
  }

  if (property === "Loop") {
    if (player.repeatMode === "track") {
      await player.setRepeatMode("queue");
    } else if (player.repeatMode === "queue") {
      await player.setRepeatMode("off");
    } else {
      await player.setRepeatMode("track");
    }

    client.warn(`Player: ${guildId} | Loop set to ${player.repeatMode}`);
    return interaction.update({
      components: [client.createController(guildId, player)],
    });
  }

  return interaction.reply({
    ephemeral: true,
    content: "❌ | **Unknown controller option**",
  });
};
