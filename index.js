#!/usr/bin/env node
require("dotenv").config();
const { program } = require("commander");

//* commands
const { addCommand, helpCommand, updateCommand, aboutCommand } = require("./commands");

try {
  program.version("1.0.0").description("Custom CLI for managing NestJS project");

  //? command lists
  program.command("add").action(addCommand);
  program.command("help").action(helpCommand);
  program.command("update").action(updateCommand);
  program.command("about").action(aboutCommand);

  program.parse();
} catch (error) {
  console.log("error");
  console.log(error);
  return error;
}
