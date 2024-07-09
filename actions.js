const simpleGit = require("simple-git");
const fs = require("fs-extra");
const inquirer = require("inquirer");

module.exports.handleGit = async (moduleNames) => {
  try {
    const REPO_URL = `https://${process.env.GIT_USERNAME}:${process.env.GIT_PASSWORD}@github.com/${process.env.GIT_USERNAME}/${process.env.GIT_REPOSITORY}`;
    const git = simpleGit();

    // 1. clone the repo & 2. copy module from repo & 3. delete repo
    await git.clone(REPO_URL, `./temp-repo`);

    for (let i = 0; i < moduleNames.length; i++) {
      await fs.ensureDir(`./temp-repo/src/${moduleNames[i]}`);
      await fs.copy(`./temp-repo/src/${moduleNames[i]}`, `./src/${moduleNames[i]}`);
      console.log(`${moduleNames[i]} module moved into src folder`);
    }
    await fs.remove("./temp-repo");
    return;

    //* file permission
    // const files = await fs.readdir(`./src/${moduleName}`);
    // for (let i = 0; i < files.length; i++) {
    //   handleFilesPermission(files[i], moduleName);
    // }
  } catch (error) {
    console.log(error);
    return error;
  }
};

async function handleFilesPermission(name, module) {
  try {
    if (!name.endsWith(".ts")) {
      handleFolderPermission(name, module);
    } else {
      await fs.chmod(`./src/${module}/${name}`, 0o755);
    }
    return;
  } catch (error) {
    console.log("error in handleFilePermission method");
    console.log(error);
    return error;
  }
}

async function handleFolderPermission(folderName, module) {
  try {
    const files = await fs.readdir(`./src/${module}/${folderName}`);
    if (files.length > 0) {
      for (let i = 0; i < array.length; i++) {
        await fs.chmod(`./src/${module}/${folderName}/${files[i]}`, 0o755);
      }
    }
    return;
  } catch (error) {
    console.log("error in handleFolderPermission method");
    console.log(error);
    return error;
  }
}

module.exports.handleEnv = async (name, value) => {
  try {
    const exists = await fs.pathExists(".env");
    if (exists) {
      const content = await fs.readFile(".env", "utf8");
      const arr = content.split("\n");
      arr.push(`${name} = ${value}`);
      await fs.writeFile(".env", arr.join("\n"));
      process.env[name] = value;
      fs.chmod(".env", 0o755);
      return;
    } else {
      await fs.createFile(".env");
      await fs.writeFile(".env", `${name} = ${value}`);
      process.env[name] = value;
      fs.chmod(".env", 0o755);
      return;
    }
  } catch (error) {
    console.log("error in handleEnv");
    console.log(error);
    return error;
  }
};

module.exports.updateEnvs = async (names) => {
  try {
    await fs.ensureFile(".env");
    const file = await fs.readFile(".env", { encoding: "utf-8" });
    const lines = file.split("\n");
    for (let i = 0; i < names.length; i++) {
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].startsWith(`GIT_${names[i]}`)) {
          await updateEnv(`GIT_${names[i]}`, lines, j, lines[j]);
        }
      }
    }
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

async function updateEnv(name, file, index, currentValue) {
  try {
    currentValue = currentValue.split("=");
    const newValue = await inquirer.prompt({
      type: "question",
      name,
      message: `enter new value for ${name} current value : ${currentValue[1].trim()}`,
    });
    file[index] = `${name} = ${newValue[name]}`;
    await fs.writeFile(".env", file.join("\n"));
    console.log(`${name} updated !`);
  } catch (error) {
    console.log(error);
    return error;
  }
}
