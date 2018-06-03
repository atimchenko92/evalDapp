var Evaluation = artifacts.require("Evaluation");

contract('Evaluation', function(accounts) {
  var semester = "SoSe18";
  var duration = 14;
  var offset = 14;
  var owner = accounts[0];
  var accNoFunds = "0x1111155593cb5dcf9813b9640426174f51111111";
  var courseId = 1;
  var answersTest = [web3.fromAscii("1"), web3.fromAscii("TestString"), web3.fromAscii("5")];
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
     await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
   }
   catch(e){
     assert.fail(e.message);
   }
  });

  it("Results of evaluation are saved correctly", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   await eval.increaseNowTime(offset);
   const receipt = await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
   console.log(`Gas for evaluateCourse:${receipt.receipt.gasUsed}`);

   for (i = 0; i < answersTest.length; i++){
     let savedAns = await eval.readEvaluation(accounts[1], courseId, i, {from: owner});
     assert.equal(web3.toAscii(answersTest[i]), savedAns, "The results of evaluation are not saved correctly");
   }
  });

  it("Evaluation before the evaluation is not possible", async () => {
   await eval.registerAccountForCourseEval(accounts[1], courseId, {from: owner});
   try{
    await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
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
    await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("Registration is not possible when evaluation begins", async () => {
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
    await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
   try{
    await eval.evaluateCourse(courseId, answersTest, {from: accounts[1]});
   }
   catch(e){
     const revertErr = e.message.search('revert') >= 0;
     assert(revertErr, "Expected throw, got '" + e + "' instead");
     return;
   }
   assert.fail('Expected throw not received');
  });

  it("The person can evaluate multiple courses", async () => {
    var answersTest2 = [web3.fromAscii("1"), web3.fromAscii("TestString")];
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner});
    await eval.registerAccountForCourseEval(accounts[1], 2, {from: owner});
    await eval.increaseNowTime(offset);
    await eval.evaluateCourse(1, answersTest, {from: accounts[1]});
    await eval.evaluateCourse(2, answersTest2, {from: accounts[1]});
  });

  it("Incorrect answers not possible: different answers amount", async () => {
    var answersTest2 = [web3.fromAscii("1"), web3.fromAscii("TestString")];
    await eval.registerAccountForCourseEval(accounts[1], 1, {from: owner});
    await eval.increaseNowTime(offset);
    try{
      await eval.evaluateCourse(1, answersTest2, {from: accounts[1]});
    }
    catch(e){
      const revertErr = e.message.search('revert') >= 0;
      assert(revertErr, "Expected throw, got '" + e + "' instead");
      return;
    }
    assert.fail('Expected throw not received');
  });


});
