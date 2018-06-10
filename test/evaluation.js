var Evaluation = artifacts.require("Evaluation");

contract('Evaluation', function(accounts) {
  var semester = "SoSe18";
  var evaluation = 14;
  var registration = 14;
  var owner = accounts[0];

  var courseId = 1;
  var answersUintTest1 = [1, 4, 4];
  var answersUintTest2 = [1, 2];
  var ansersTxtTestEmpty = "";

//Txt answers test data
  var delim = "//";
  var answersTxtTest1p1 = "Test./ AHAHAHA sasawrasdxzzf3223r23r";
  var answersTxtTest1p2 = "afaSASDmmm   asfsadad";
  var answersTxtTest1p3 = "Da landa";
  var answersTxtTest1p4 = "Раз два три";

  var answersTxtTest1 = answersTxtTest1p1;
  var answersTxtTest2 = answersTxtTest1p1.concat(delim, answersTxtTest1p2,
     delim, answersTxtTest1p3, delim, answersTxtTest1p4);
//////////////////////////

  var ethAmount = 5000000000000000;
  var smallEthAmount = 1
  let eval;
  let accNoFunds = web3.personal.newAccount('test123');
  web3.personal.unlockAccount(accNoFunds, 'test123');

  beforeEach('Setup contract for each test', async function () {
    eval = await Evaluation.new(semester, registration, evaluation);
  })

  it('Has an owner', async () => {
    assert.equal(await eval.owner(), owner)
  })

  it("Admin can register an account for evaluation", async () => {
   const receipt = await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner, value: smallEthAmount});
   console.log(`Gas for registerAccountForCourseEval:${receipt.receipt.gasUsed}`);
   let isRegistered = await eval.checkRegistration(accounts[1], courseId, {from: owner});
   assert.equal(isRegistered, true, "The account wasn't registered for the course evaluation");
  });

  it("Double course registration is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[2], courseId, {from: owner, value: smallEthAmount});
   try{
     await eval.registerAccountForCourseEval(accounts[2], courseId, {from: owner, value: smallEthAmount});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Normal user cannot register an attendant", async () => {
   try{
     await eval.registerAccountForCourseEval(accounts[2], courseId, {from: accounts[1], value: smallEthAmount});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Registered attendant can evaluate the course", async () => {
    console.log(`Attendant balance before evaluation:${web3.eth.getBalance(accNoFunds)}`);
    await eval.registerAccountForCourseEval(accNoFunds, courseId, {from: owner, value: ethAmount});
    await eval.increaseNowTime(registration);
    let esGas = await eval.evaluateCourse.estimateGas(courseId, answersUintTest1, answersTxtTest1, {from: accNoFunds});
    console.log("Estimated Gas: " + esGas);
    console.log("Gas price: " + web3.eth.gasPrice);
    console.log("Gas cost: " + (esGas * web3.eth.gasPrice));
    console.log(`Attendant balance before evaluation:${web3.eth.getBalance(accNoFunds)}`);
    await eval.evaluateCourse(courseId, answersUintTest1, answersTxtTest1, {gas: esGas, from: accNoFunds});
    console.log(`Attendant balance after evaluation:${web3.eth.getBalance(accNoFunds)}`);
    let res = await eval.isCourseEvaluatedByAccount(accNoFunds, 1);
    assert.equal(res, true, "This course should be evaluated");
  });

  it("Results of evaluation are saved correctly. Test#1", async () => {
   var txt = "Assah  iia / asdasds";
   await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner, value: smallEthAmount});
   await eval.increaseNowTime(registration);
   await eval.evaluateCourse(1, answersUintTest1, txt, {from: accounts[1]});
   let savedAns;
   for (i = 0; i < answersUintTest1.length; i++){
     savedAns = await eval.readEvaluation(accounts[1], 1, i, {from: owner});
     assert.equal(answersUintTest1[i], savedAns, "The results of uint evaluation are not saved correctly");
   }
   savedAns = await eval.readEvaluation(accounts[1], 1, 3, {from: owner});
   assert.equal(savedAns, txt, "The results of txt evaluation are not saved correctly");
  });

  it("Results of evaluation are saved correctly. Test#2", async () => {
   var txt = "adas//33/44//22ASdadsad/AAdAd/A dasdASd//adas//55";
   await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
   await eval.increaseNowTime(registration);
   await eval.evaluateCourse(3, answersUintTest2, txt, {from: accounts[1]});
   let savedAns;
   for (i = 0; i < answersUintTest2.length; i++){
     savedAns = await eval.readEvaluation(accounts[1], 3, i, {from: owner});
     assert.equal(answersUintTest2[i], savedAns, "The results of uint evaluation are not saved correctly");
   }
   savedAns = await eval.readEvaluation(accounts[1], 3, 2, {from: owner});
   assert.equal(savedAns, "adas", "The results of txt evaluation are not saved correctly");

   savedAns = await eval.readEvaluation(accounts[1], 3, 3, {from: owner});
   assert.equal(savedAns, "33/44", "The results of txt evaluation are not saved correctly");

   savedAns = await eval.readEvaluation(accounts[1], 3, 4, {from: owner});
   assert.equal(savedAns, "22ASdadsad/AAdAd/A dasdASd", "The results of txt evaluation are not saved correctly");

   savedAns = await eval.readEvaluation(accounts[1], 3, 5, {from: owner});
   assert.equal(savedAns, "adas", "The results of txt evaluation are not saved correctly");
  });

  it("Evaluation before the evaluation period is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner, value: smallEthAmount});
   try{
    await eval.evaluateCourse(courseId, answersUintTest1, answersTxtTest1, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Evaluation after the evaluation is expired is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner, value: smallEthAmount});
   await eval.increaseNowTime(registration+evaluation+1);
   try{
    await eval.evaluateCourse(courseId, answersUintTest1, answersTxtTest1, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Registration is not possible during and after the evaluation period", async () => {
   await eval.increaseNowTime(registration);
   try{
     await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner, value: smallEthAmount});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("The person cannot evaluate twice", async () => {
    await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    await eval.evaluateCourse(courseId, answersUintTest1, answersTxtTest1, {from: accounts[1]});
   try{
    await eval.evaluateCourse(courseId, answersUintTest1, answersTxtTest1, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("The person can evaluate multiple courses", async () => {
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner, value: smallEthAmount});
    await eval.registerAccountForCourseEval(accounts[1], 2, {from: owner, value: smallEthAmount});
    await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    await eval.evaluateCourse(1, answersUintTest1, answersTxtTest1, {from: accounts[1]});
    await eval.evaluateCourse(2, answersUintTest2, ansersTxtTestEmpty, {from: accounts[1]});
    await eval.evaluateCourse(3, [3,3], answersTxtTest2, {from: accounts[1]});
  });

  it("Incorrect number of answers pro evaluation is not possible", async () => {
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    try{
      await eval.evaluateCourse(1, answersUintTest2, answersTxtTest1, {from: accounts[1]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  });

  it("Incorrect types of answers are not possible", async () => {
    var testFalseArray = [1,2,"AAA"];
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    try{
      await eval.evaluateCourse(1, testFalseArray, answersTxtTest1, {from: accounts[1]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      const numberErr = e.message.search('number') >= 0;
      assert(revertErr || numberErr, "Expected throw, got '" + e + "' instead");
      let res = await eval.isCourseEvaluatedByAccount(accounts[1], 1);
      assert.equal(res, false, "This course should not be evaluated");
      return;
    }
    assert.fail('Expected throw not received');
  });

  it("UInt-Questions can be answered with max values", async () => {
    var answersUint = [6, 5];
    await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    await eval.evaluateCourse(3, answersUint, answersTxtTest2, {from: accounts[1]});
    let savedAns;
    for (i = 0; i < 3; i++){
     savedAns = await eval.readEvaluation(accounts[1], 3, i, {from: owner});
     console.log(savedAns);
    }
  });

  it("UInt-Questions cannot be answered with 0 value", async () => {
    var answersUint = [0, 5];
    await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    try{
      await eval.evaluateCourse(3, answersUint, answersTxtTest2, {from: accounts[1]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      let res = await eval.isCourseEvaluatedByAccount(accounts[1], 3);
      assert.equal(res, false, "This course should not be evaluated");
      return;
    }
    assert.fail('Expected throw not received');
  });

  it("UInt-Questions cannot be answered with value more than max", async () => {
    var answersUint = [6, 6];
    await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
    await eval.increaseNowTime(registration);
    try{
      await eval.evaluateCourse(3, answersUint, answersTxtTest2, {from: accounts[1]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      let res = await eval.isCourseEvaluatedByAccount(accounts[1], 3);
      assert.equal(res, false, "This course should not be evaluated");
      return;
    }
    assert.fail('Expected throw not received');
  });

  it("getAvailableCourses test", async () => {
    var answersUint = [6, 6];
    await eval.registerAccountForCourseEval(accounts[1], 3, {from: owner, value: smallEthAmount});
    console.log(`Balanace before:${web3.eth.getBalance(accounts[1])}`);
    let coursesArr = await eval.getAvailableCourses(accounts[1])
    console.log(`Balanace after:${web3.eth.getBalance(accounts[1])}`);
    assert.equal(coursesArr[0], 3, "Bad results");
    console.log(coursesArr);
  });

  //Do more tests...
  //??
  //Profit

  //Start with Frontend <-

});
