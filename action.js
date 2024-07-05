const simpleGit = require("simple-git");
const fs = require("fs-extra");

async function handleGit(moduleName) {
  try {
    const REPO_URL = `https://${process.env.GIT_USER}:${process.env.GIT_PASSWORD}@github.com/amirghdev/${process.env.GIT_REPOSITORY}`;
    const git = simpleGit();
    await git.clone(REPO_URL, `./temp-repo`);
    await fs.copy(`./temp-repo/src/${moduleName}`, `./src/${moduleName}`);
    await fs.remove("./temp-repo");

    const files = await fs.readdir(`./src/${moduleName}`);
    console.log(files);

    console.log(`${moduleName} module moved into src folder`);
  } catch (error) {
    console.log(error);
    return error;
  }
}

// async function handleFilePermission(path) {}

module.exports.handleDatabase = () => {
  console.log("adding database module");
  handleGit("database");
};

module.exports.handleUpload = () => {
  console.log("adding upload module");
  handleGit("upload");
};

module.exports.handleHelper = () => {
  console.log("adding helper module");
  handleGit("helper");
};

module.exports.handleEmail = () => {
  console.log("adding email module");
  handleGit("email");
};

module.exports.handleEnv = async (name, value) => {
  try {
    const exits = await fs.pathExists(".env");

    if (exits) {
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
    console.log(error);
    throw error;
  }
};
