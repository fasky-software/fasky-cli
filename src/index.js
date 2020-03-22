#!/usr/bin/env node
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const inquirer = require("./inquirer");
const { exec } = require("child_process");

clear();

console.log(
  chalk.yellow(figlet.textSync("Fasky", { horizontalLayout: "full" }))
);

const printSuccess = text => {
  console.log(`✅ ${text}`);
};

const executeCommand = (command, loadingText, successText) => {
  return new Promise((resolve, reject) => {
    const status = new Spinner(loadingText);
    status.start();
    exec(command, async function(err, stdout, stderr) {
      if (err) {
        reject(err);
        return;
      }
      status.stop();
      printSuccess(successText);
      resolve();
    });
  });
};

const hasInstalledReactNative = () => {
  return new Promise((resolve, reject) => {
    const status = new Spinner("Looking for react-native...");
    status.start();
    exec("npm list -g react-native --json", async function(
      err,
      stdout,
      stderr
    ) {
      const output = JSON.parse(stdout);

      if (
        output &&
        output.dependencies &&
        output.dependencies["react-native"]
      ) {
        status.stop();
        printSuccess("found react-native");
        resolve(true);
        return;
      }

      status.stop();
      resolve(false);
    });
  });
};

const installReactNative = () => {
  return executeCommand(
    "npm install -g react-native",
    "Downloading required tools...",
    "successfully installed react-native"
  );
};

const createReactNativeProject = name => {
  const command = `npx react-native init ${name} --template react-native-template-typescript`.toString();
  return executeCommand(
    command,
    "Creating project...",
    "successfully created project"
  );
};

const installTranslations = async name => {
  let command = `cd ${name} && npm install --save react-i18next i18next`;
  await executeCommand(
    command,
    "Installing translation dependencies (react-i18next, i18next)..",
    "successfully installed translation dependencies (2/2)"
  );

  return;
};

const installFirebase = async name => {
  let command = `cd ${name} && npm install --save @react-native-firebase/app`;
  await executeCommand(
    command,
    "Installing firebase dependencies (@react-native-firebase/app)",
    "successfully installed firebase dependencies (1/1)"
  );

  return;
};

const installNavigation = async name => {
  let command = `cd ${name} && npm install --save @react-navigation/native @react-navigation/bottom-tabs react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view`;
  await executeCommand(
    command,
    "Installing navigation dependencies",
    "successfully installed navigation dependencies (7/7)"
  );

  return;
};

const installPods = async name => {
  let command = `cd ${name} && cd ios && pod install`;
  await executeCommand(command, "Installing Pods", "successfully Pods");
};

const hasFeatureOn = (features, feature) => {
  return features.indexOf(feature) !== -1;
};

const setupFolderStructure = (name, features) => {
  let command = `cd ${name} && mkdir -p src && cd src && mkdir -p assets && mkdir -p components && mkdir -p screens && mkdir -p utils`;
  if (hasFeatureOn(features, "translations")) {
    command += " && mkdir -p assets/translations";
  }

  return executeCommand(
    command,
    "Setup folder structure",
    "folder structure created"
  );
};

const generateCopyCodeCommand = (name, filePath, aliasPath = filePath) => {
  return `curl -o ./${name}${aliasPath} https://raw.githubusercontent.com/fasky-software/reactnativebase/master/reactnativebase${filePath}`;
};

const copyCodeFromBaseProject = (name, features) => {
  let command = generateCopyCodeCommand(name, "/src/components/CustomText.tsx");
  command += " && " + generateCopyCodeCommand(name, "/index.js");

  if (hasFeatureOn(features, "translations")) {
    command +=
      " && " +
      generateCopyCodeCommand(name, "/src/assets/translations/en.json");

    command +=
      " && " +
      generateCopyCodeCommand(name, "/src/utils/InitTranslationFramework.ts");
  }

  command +=
    " && " + generateCopyCodeCommand(name, "/src/components/CustomView.tsx");
  command += " && " + generateCopyCodeCommand(name, "/src/utils/Theme.ts");

  if (hasFeatureOn(features, "navigation")) {
    command +=
      " && " +
      generateCopyCodeCommand(
        name,
        "/src/AppWithNavigation.tsx",
        "/src/App.tsx"
      );
  } else {
    command += " && " + generateCopyCodeCommand(name, "/src/App.tsx");
  }

  return executeCommand(
    command,
    "Copy code from remote repository",
    "Code successfully copied"
  );
};

const printAdditionalSteps = async () => {
  console.log("✨ Additional steps required ✨");
  console.log(
    "➡ https://invertase.io/oss/react-native-firebase/quick-start/ios-firebase-credentials"
  );
  console.log(
    "➡ https://invertase.io/oss/react-native-firebase/quick-start/android-firebase-credentials"
  );
};

const run = async () => {
  const result = await hasInstalledReactNative();

  if (!result) {
    await installReactNative();
  }

  const details = await inquirer.askAboutProjectDetails();
  await createReactNativeProject(details.name);
  await setupFolderStructure(details.name, details.features);

  if (hasFeatureOn(details.features, "translations")) {
    await installTranslations(details.name);
  }

  if (hasFeatureOn(details.features, "firebase")) {
    await installFirebase(details.name);
  }

  if (hasFeatureOn(details.features, "navigation")) {
    await installNavigation(details.name);
  }

  await copyCodeFromBaseProject(details.name, details.features);
  await installPods(details.name);
  printAdditionalSteps();
};

run();
