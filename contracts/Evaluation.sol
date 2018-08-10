pragma solidity ^0.4.24;

import { QuestionsLib } from "./QuestionsLib.sol";
import { HSKALib } from "./HSKALib.sol";
import { Utils } from "./Utils.sol";
import { strings } from "./strings.sol";

contract Evaluation {
  using strings for *;

  mapping (address => mapping (uint => EvaluatedCourse)) public studentEvaluations;
  mapping (address => mapping (uint => bool)) public studentCourseRegistrations;
  mapping (uint => Course) public registeredCourses;

  address public owner;
  uint public coursesCount;
  uint public evalInitTimestamp;
  uint public evalStartTimestamp;
  uint public evalEndTimestamp;
  string public semester;
  uint public amountEvaluated;
  uint public amountRegistered;
  uint private testNow; //Test only

  struct Course {
    uint id;
    HSKALib.Courses courseKey;
    HSKALib.Lecturers lecturerKey;
    uint numberOfQuestions;
    mapping (uint => QuestionsLib.QuestionArchetype) questionsToEvaluate;
  }

  struct EvaluatedCourse{
    uint courseId;
    bool isEvaluated;
    mapping (uint => uint) answersToUIntQuestions;
    mapping (uint => string) answersToTxtQuestions; //Question id -> answer value
  }

  modifier onlyAdmin(){
    require(msg.sender == owner, "Not an owner");
    _;
  }

  modifier inRegistrationInterval(){
    require(testNow < evalStartTimestamp && testNow >= evalInitTimestamp, "Registration time interval is expired");
    _;
  }

  modifier inEvaluationInterval(){
    require(testNow <= evalEndTimestamp && testNow >= evalStartTimestamp, "Not in evaluation time interval");
    _;
  }

  event evaluatedEvent(
    uint indexed _courseId
  );

  constructor(string _semester, uint startOffsetInDays, uint _durationInDays) public {
    owner = msg.sender;
    semester = _semester;
    evalInitTimestamp = now;
    testNow = now;
    evalStartTimestamp = now + startOffsetInDays * 1 days;
    evalEndTimestamp = evalStartTimestamp + (_durationInDays * 1 days);

    //Register courses and assign questions
    registerCourseForEvaluation(HSKALib.Courses.course1, HSKALib.Lecturers.prof1);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q1);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q2);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q3);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q11);

    registerCourseForEvaluation(HSKALib.Courses.course2, HSKALib.Lecturers.prof1);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q3);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q10);

    registerCourseForEvaluation(HSKALib.Courses.course3, HSKALib.Lecturers.prof2);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q8);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q11);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q11);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q11);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q11);

    registerCourseForEvaluation(HSKALib.Courses.course4, HSKALib.Lecturers.prof3);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q5);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q7);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q9);
  }

  function registerCourseForEvaluation(HSKALib.Courses _courseKey, HSKALib.Lecturers _lecturerKey) private inRegistrationInterval returns (bool) {
    coursesCount++;
    registeredCourses[coursesCount] = Course ({
       id: coursesCount,
       courseKey: _courseKey,
       lecturerKey: _lecturerKey,
       numberOfQuestions: 0
     });

    return true;
  }

  function assignQuestionToCourse(uint _courseId, QuestionsLib.QuestionArchetype _qarch) private inRegistrationInterval returns (bool) {
     Course storage _course = registeredCourses[_courseId];
    _course.questionsToEvaluate[_course.numberOfQuestions] = _qarch;
    _course.numberOfQuestions++;

    return true;
  }

  // _courseId: course id to be evaluated
  // _uintAns: all answers for non-txt questions(for frontend: should be ordered)
  // _txtAnswers: all answers for txt-questions, delimetered by '//'
  function evaluateCourse(uint _courseId, uint[] _uintAns, string _txtAnswers)
   public inEvaluationInterval returns(bool) {
    require(studentCourseRegistrations[msg.sender][_courseId],
      "Not registered for this course");
    require(!studentEvaluations[msg.sender][_courseId].isEvaluated,
      "This course is already evaluated");

    uint uintAmount = getNumberOfUINTQuestions(_courseId);
    require(_uintAns.length == uintAmount,
      "The evaluation for this course is not complete");

    var s = _txtAnswers.toSlice();
    var delim = "//".toSlice();

    uint currentUintCnt = 0;

    for(uint i = 0; i < registeredCourses[_courseId].numberOfQuestions; i++){
      if (!QuestionsLib.isTextTypedInput(registeredCourses[_courseId].questionsToEvaluate[i])){
        require(_uintAns[currentUintCnt] > 0
          && _uintAns[currentUintCnt] <= QuestionsLib.getMaxVal(registeredCourses[_courseId].questionsToEvaluate[i]),
        "Incorrect answer" );
        studentEvaluations[msg.sender][_courseId].answersToUIntQuestions[i] = _uintAns[currentUintCnt];
        currentUintCnt++;
      }
      else{
        var currentStr = s.split(delim).toString();
        require(currentStr.toSlice().len() <= 128, "The answer exceeded 128 characters!");
        studentEvaluations[msg.sender][_courseId].answersToTxtQuestions[i] = currentStr;
      }
    }

    studentEvaluations[msg.sender][_courseId].isEvaluated = true;
    amountEvaluated++;
    emit evaluatedEvent(_courseId);
    return true;
  }

  function registerAccountForCourseEval(address _account, uint _courseId) payable public inRegistrationInterval onlyAdmin {
    require(!studentCourseRegistrations[_account][_courseId], "Student is already registered");
    require(registeredCourses[_courseId].id != 0, "The course is not registered");
    _account.transfer(msg.value);
    studentCourseRegistrations[_account][_courseId] = true;
    amountRegistered++;
  }

  function getCourseTitle(uint _cId) public view returns (string) {
    return HSKALib.getCourseName(registeredCourses[_cId].courseKey);
  }

  function getCourseLecturerName(uint _cId) public view returns (string) {
    return HSKALib.getLecturerName(registeredCourses[_cId].lecturerKey);
  }

  function getQuestionBodyByCourse(uint _cId, uint _qId) public view returns (string) {
    return QuestionsLib.getQuestionBody(registeredCourses[_cId].questionsToEvaluate[_qId]);
  }

  function readEvaluation(address _account, uint _courseId, uint _qId) public view returns(string){
    if(QuestionsLib.isTextTypedInput(registeredCourses[_courseId].questionsToEvaluate[_qId]))
      return studentEvaluations[_account][_courseId].answersToTxtQuestions[_qId];
    return Utils.uintToString(studentEvaluations[_account][_courseId].answersToUIntQuestions[_qId]);
  }

  function isCourseEvaluatedByAccount(address _account, uint _courseId) public view returns(bool){
    return studentEvaluations[_account][_courseId].isEvaluated;
  }

  function getNumberOfUINTQuestions(uint _courseId) public view returns(uint _counter) {
    for(uint i=0; i<registeredCourses[_courseId].numberOfQuestions; i++){
      if(!QuestionsLib.isTextTypedInput(registeredCourses[_courseId].questionsToEvaluate[i]))
        _counter++;
    }
  }

  function checkRegistration(address _adr, uint _courseId) public view returns (bool){
    return studentCourseRegistrations[_adr][_courseId];
  }

  function increaseNowTime(uint timeInDays) public {
    testNow += timeInDays * 1 days;
  }

  function decreaseNowTime(uint timeInDays) public {
    testNow -= timeInDays * 1 days;
  }

  function destroy() public onlyAdmin{
    selfdestruct(owner); // send funds to organizers
  }

  function contributeToContract() public payable {}

  function getContractBalance() public view returns (uint){
    return address(this).balance;
  }

  function getAvailableCourses(address _adr) public view returns (uint[] ){
    //uint[] memory _resArr = new uint[](coursesCount);
    uint[] _resArr;
    for(uint i = 1; i <= coursesCount; i++)
      if(studentCourseRegistrations[_adr][i] == true)
        //_resArr[j] = i;
        _resArr.push(i);
    return _resArr;
  }

  function getMaxAnswerForQuestionWrapper(uint _cId, uint _qId) public view returns (uint){
    return QuestionsLib.getMaxVal(registeredCourses[_cId].questionsToEvaluate[_qId]);
  }

  function getRatingTextForValWrapper(uint _cId, uint _qId, uint _ansId) public view returns (string){
    return QuestionsLib.getRatingTextForVal(registeredCourses[_cId].questionsToEvaluate[_qId], _ansId);
  }

}
