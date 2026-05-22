const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (client, message) => {
  if (!client.user) return;

  const refront = `^<@!?${client.user.id}>`;
  const mention = new RegExp(refront + "$");

  const invite = `https://discord.com/oauth2/authorize?client_id=${client.config.clientId}&permissions=277083450689&scope=bot%20applications.commands`;

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Invite me").setURL(invite)
  );

  if (message.content?.match(mention)) {
    const mentionEmbed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setDescription(
        `My prefix on this server is \`/\` (Slash Command).\nTo get started type \`/help\` to see all my commands.`
      );

    message.channel.send({ embeds: [mentionEmbed], components: [buttons] });
  }
};
