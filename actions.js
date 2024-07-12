const simpleGit = require("simple-git");
const fs = require("fs-extra");
const inquirer = require("inquirer");

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

async function addTopImport(moduleNames) {
  try {
    const file = await fs.readFile("./src/app.module.ts", { encoding: "utf-8" });
    const fileArray = file.split("\n");
    for (let i = 0; i < moduleNames.length; i++) {
      const firstLetter = moduleNames[i].charAt(0).toUpperCase();
      const moduleName = `${firstLetter}${moduleNames[i].slice(1)}Module`;
      const importPath = `import { ${moduleName} } from './${moduleNames[i]}/${moduleNames[i]}.module';`;
      for (let j = 0; j < fileArray.length; j++) {
        if (fileArray[j].startsWith("@Module")) {
          fileArray.splice(j, 0, importPath);
          handleImportsArray(moduleName, fileArray);
          await fs.writeFile("./src/app.module.ts", fileArray.join("\n"));
          console.log(`${moduleNames[i]} module import updated!`);
          break;
        }
      }
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function handleImportsArray(moduleName, fileArray) {
  try {
    for (let i = 0; i < fileArray.length; i++) {
      if (fileArray[i].startsWith("@Module")) {
        let nextIndex = fileArray[i + 1].trim();
        //* there is no imports
        if (nextIndex.startsWith("controllers")) {
          fileArray.splice(i + 1, 0, `  imports: [${moduleName}],`);
          await fs.writeFile("./src/app.module.ts", fileArray.join("\n"));
          //* one line import like this imports: [test,test1,test2,test3]
        } else if (nextIndex.startsWith("imports") && nextIndex.endsWith(",")) {
          const arrayOfChar = nextIndex.split("");
          const charIndex = arrayOfChar.indexOf("]");
          if (nextIndex == "imports: []," || nextIndex == "imports: []") {
            arrayOfChar.splice(charIndex, 0, `${moduleName}`);
          } else {
            arrayOfChar.splice(charIndex, 0, `, ${moduleName}`);
          }
          nextIndex = `  ${arrayOfChar.join("")}`;
          fileArray[i + 1] = nextIndex;
          await fs.writeFile("./src/app.module.ts", fileArray.join("\n"));
          //* multiply line of imports
        } else if (nextIndex.startsWith("imports") && nextIndex.endsWith("[")) {
          const index = fileArray.indexOf("  ],");
          fileArray.splice(index, 0, `    ${moduleName},`);
          await fs.writeFile("./src/app.module.ts", fileArray.join("\n"));
        } else {
          throw "something went wrong!";
        }
      }
    }
  } catch (error) {
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

module.exports.handleGit = async (moduleNames) => {
  try {
    const REPO_URL = `https://${process.env.GIT_USERNAME}:${process.env.GIT_PASSWORD}@github.com/${process.env.GIT_USERNAME}/${process.env.GIT_REPOSITORY}`;
    const git = simpleGit();

    // 1. clone the repo & 2. copy module from repo & 3. delete repo
    await git.clone(REPO_URL, `./temp-repo`);

    for (let i = 0; i < moduleNames.length; i++) {
      const exists = await fs.exists(`./src/${moduleNames[i]}`);
      if (exists) {
        await fs.remove("./temp-repo");
        throw `${moduleNames[i]} module already exists in src folder`;
      } else {
        await fs.ensureDir(`./temp-repo/src/${moduleNames[i]}`);
      }
      await fs.copy(`./temp-repo/src/${moduleNames[i]}`, `./src/${moduleNames[i]}`);
      console.log(`${moduleNames[i]} module moved into src folder`);
    }
    await fs.remove("./temp-repo");

    const updateImport = await inquirer.prompt({
      type: "confirm",
      name: "update",
      message: "update imports ?",
    });

    if (updateImport.update) {
      await addTopImport(moduleNames);
    }

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
