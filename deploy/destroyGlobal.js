const { Client, GatewayIntentBits } = require("discord.js");
const config = require("../config");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(config.token);

client.on("ready", async () => {
  const commands = await client.application.commands.fetch();
  if (commands.size === 0) {
    console.log("No global commands found.");
    process.exit(0);
  }

  let deleted = 0;
  for (const command of commands.values()) {
    await client.application.commands.delete(command.id);
    console.log(`Deleted: ${command.name} (${command.id})`);
    deleted++;
  }
  console.log(`Successfully deleted ${deleted} global command(s).`);
  process.exit(0);
});
