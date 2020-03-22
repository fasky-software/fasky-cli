const inquirer = require("inquirer");

const list = ["firebase", "translations", "navigation"];

module.exports = {
  askAboutProjectDetails: () => {
    const questions = [
      {
        name: "name",
        type: "input",
        message: "Enter your project name:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your project name.";
          }
        }
      },
      {
        type: "checkbox",
        name: "features",
        message: "Select the features you wish to add:",
        choices: list,
        default: ["node_modules", "bower_components"]
      }
    ];
    return inquirer.prompt(questions);
  }
};
