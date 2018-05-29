var Evaluation = artifacts.require("Evaluation");
var QuestionsLib = artifacts.require("QuestionsLib");
var HSKALib = artifacts.require("HSKALib");

module.exports = function(deployer) {
  deployer.deploy(QuestionsLib);
  deployer.deploy(HSKALib);
  deployer.link(QuestionsLib, Evaluation);
  deployer.link(HSKALib, Evaluation);
  deployer.deploy(Evaluation, "SoSe18", 14);
};
