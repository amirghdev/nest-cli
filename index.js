#!/usr/bin/env node
require("dotenv").config();
const { program } = require("commander");

const inquirer = require("inquirer");

const { handleDatabase, handleEmail, handleHelper, handleUpload, handleEnv } = require("./action");
const ui = new inquirer.ui.BottomBar();

try {
  program.version("1.0.0").description("Custom CLI for managing NestJS project");

  program.command("add").action(async () => {
    if (!process.env.GIT_USER) {
      const data = await inquirer.prompt([
        {
          type: "question",
          name: "username",
          message: "enter your git username",
        },
      ]);
      handleEnv("GIT_USER", data.username);
    }
    if (!process.env.GIT_PASSWORD) {
      const data = await inquirer.prompt([
        {
          type: "password",
          name: "password",
          message: "enter your git password (token)",
        },
      ]);
      handleEnv("GIT_PASSWORD", data.password);
    }
    if (!process.env.GIT_REPOSITORY) {
      const data = await inquirer.prompt([
        {
          type: "question",
          name: "repository",
          message: "enter your git repo with .git",
        },
      ]);
      handleEnv("GIT_REPOSITORY", data.repository);
    }
    addCommand();
  });
  program.command("help").action(async () => {
    ui.log.write("hi welcome to my nestjs basic cli use add command");
    process.exit(0);
  });
  program.parse();
} catch (error) {
  console.log(error);
  return error;
}

async function addCommand() {
  const action = await inquirer.prompt([
    {
      type: "list",
      name: "module",
      message: "Enter the module name you want to clone:",
      choices: ["database", "upload", "email", "helper"],
    },
  ]);
  switch (action.module) {
    case "database":
      handleDatabase();
      break;
    case "upload":
      handleUpload();
      break;
    case "email":
      handleEmail();
      break;
    case "helper":
      handleHelper();
      break;
  }
}
