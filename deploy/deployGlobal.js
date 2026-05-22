const { REST, Routes } = require("discord.js");
const getConfig = require("../util/getConfig");
const LoadCommands = require("../util/loadCommands");

(async () => {
  const config = await getConfig();
  const rest = new REST().setToken(config.token);
  const commands = await LoadCommands().then((cmds) =>
    [].concat(cmds.slash).concat(cmds.context)
  );

  console.log("Deploying commands globally...");
  await rest
    .put(Routes.applicationCommands(config.clientId), { body: commands })
    .catch(console.error);
  console.log("Successfully deployed commands!");
})();
