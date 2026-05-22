const readline = require("readline");
const { REST, Routes } = require("discord.js");
const getConfig = require("../util/getConfig");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

(async () => {
  const config = await getConfig();
  const rest = new REST().setToken(config.token);

  rl.question("Enter the guild ID to delete commands from: ", async (guild) => {
    console.log("Deleting guild commands...");
    await rest
      .put(Routes.applicationGuildCommands(config.clientId, guild), { body: [] })
      .catch(console.error);
    console.log("Done.");
    rl.close();
  });
})();
