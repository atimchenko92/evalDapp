var Evaluation = artifacts.require("Evaluation");
var QuestionsLib = artifacts.require("QuestionsLib");
var HSKALib = artifacts.require("HSKALib");
var Utils = artifacts.require("Utils");
var strings = artifacts.require("strings");

module.exports = function(deployer) {
  deployer.deploy(QuestionsLib);
  deployer.deploy(HSKALib);
  deployer.deploy(Utils);
  deployer.deploy(strings);
  deployer.link(QuestionsLib, Evaluation);
  deployer.link(HSKALib, Evaluation);
  deployer.link(Utils, Evaluation);
  deployer.link(strings, Evaluation);
  deployer.deploy(Evaluation, "SoSe18", 14, 14);
};
