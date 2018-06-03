var Evaluation = artifacts.require("Evaluation");

contract('Evaluation', function(accounts) {
  var semester = "SoSe18";
  var duration = 14;
  var offset = 14;
  var owner = accounts[0];
  var accNoFunds = "0x1111155593cb5dcf9813b9640426174f51111111";
  var courseId = 1;
  var answersUintTest1 = [1, 4, 4];
  var answersUintTest2 = [1, 2];
  var ansersTxtTestEmpty = [];
  var answersTxtTest1 = [web3.fromAscii("Abra")];
  let eval;

  beforeEach('Setup contract for each test', async function () {
    eval = await Evaluation.new(semester, offset, duration);
  })

  it('Has an owner', async () => {
    assert.equal(await eval.owner(), owner)
  })

  it("Admin can register an account for evaluation", async () => {
   const receipt = await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   console.log(`Gas for registerAccountForCourseEval:${receipt.receipt.gasUsed}`);
   let isRegistered = await eval.checkRegistration(accounts[1], courseId, {from: owner});
   assert.equal(isRegistered, true, "The account wasn't registered for the course evaluation");
  });

  it("Double course registration is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[2], courseId, {from: owner});
   try{
     await eval.registerAccountForCourseEval(accounts[2], courseId, {from: owner});
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
     await eval.registerAccountForCourseEval(accounts[2], courseId, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Registered attendant can evaluate the course", async () => {
   try{
     await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
     await eval.increaseNowTime(offset);
     await eval.evaluateCourse(courseId, answersUintTest1,
       answersTxtTest1, {from: accounts[1]});
   }
   catch(e){
     assert.fail(e.message);
   }

  let res = await eval.isCourseEvaluatedByAccount(accounts[1], 1);
  assert.equal(res, true, "This course should be evaluated");
  });

  it("Results of evaluation are saved correctly", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   await eval.increaseNowTime(offset);
   const receipt = await eval.evaluateCourse(courseId, answersUintTest1,
    answersTxtTest1, {from: accounts[1]});
   console.log(`Gas for evaluateCourse: ${receipt.receipt.gasUsed}`);
   let savedAns;
   for (i = 0; i < answersUintTest1.length; i++){
     savedAns = await eval.readEvaluation(accounts[1], courseId, i, {from: owner});
     assert.equal(answersUintTest1[i], savedAns, "The results of evaluation are not saved correctly");
   }
   savedAns = await eval.readEvaluation(accounts[1], courseId, 3, {from: owner});
   assert.equal(web3.toAscii(answersTxtTest1[0]), savedAns, "The results of evaluation are not saved correctly");
  });

  it("Evaluation before the evaluation period is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
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
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   await eval.increaseNowTime(offset+duration+1);
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
   await eval.increaseNowTime(offset);
   try{
     await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("The person cannot evaluate twice", async () => {
    await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
    await eval.increaseNowTime(offset);
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
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner});
    await eval.registerAccountForCourseEval(accounts[1], 2, {from: owner});
    await eval.increaseNowTime(offset);
    await eval.evaluateCourse(1, answersUintTest1, answersTxtTest1, {from: accounts[1]});
    await eval.evaluateCourse(2, answersUintTest2, ansersTxtTestEmpty, {from: accounts[1]});
  });

  it("Incorrect number of answers pro evaluation is not possible", async () => {
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner});
    await eval.increaseNowTime(offset);
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
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner});
    await eval.increaseNowTime(offset);
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

});
