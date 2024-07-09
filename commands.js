require("dotenv").config();
//* imports
const { handleGit, handleEnv, updateEnvs } = require("./actions");

//* modules
const inquirer = require("inquirer");
const ui = new inquirer.ui.BottomBar();

module.exports.addCommand = async () => {
  if (!process.env.GIT_USERNAME) {
    const data = await inquirer.prompt([
      {
        type: "question",
        name: "username",
        message: "enter your git username",
      },
    ]);
    await handleEnv("GIT_USERNAME", data.username);
  }
  if (!process.env.GIT_PASSWORD) {
    const data = await inquirer.prompt([
      {
        type: "password",
        name: "password",
        message: "enter your git password (token)",
      },
    ]);
    await handleEnv("GIT_PASSWORD", data.password);
  }
  if (!process.env.GIT_REPOSITORY) {
    const data = await inquirer.prompt([
      {
        type: "question",
        name: "repository",
        message: "enter your git repo with .git",
      },
    ]);
    await handleEnv("GIT_REPOSITORY", data.repository);
  }
  let folders = "";
  if (!process.env.GIT_FOLDERS) {
    console.log("there is no GIT_FOLDERS file");
    const data = await inquirer.prompt([
      {
        type: "question",
        name: "folders",
        message: "enter your git modules like this (test,test1,test2,test3)",
      },
    ]);
    folders = data.folders;
    await handleEnv("GIT_FOLDERS", data.folders);
  }

  const choices = process.env.GIT_FOLDERS;
  const list = choices.split(",");
  const actions = await inquirer.prompt([
    {
      type: "checkbox",
      name: "modules",
      message: "select the modules name you want to clone",
      choices: list,
    },
  ]);
  await handleGit(actions.modules);
};

module.exports.helpCommand = async () => {
  ui.log.write("hi welcome to my nestjs basic cli use add command");
  process.exit(0);
};

module.exports.updateCommand = async () => {
  const envForUpdate = await inquirer.prompt([
    {
      type: "checkbox",
      name: "envNames",
      message: "select which env you want to update",
      choices: ["USERNAME", "PASSWORD", "REPOSITORY", "FOLDERS"],
    },
  ]);
  await updateEnvs(envForUpdate.envNames);
};
