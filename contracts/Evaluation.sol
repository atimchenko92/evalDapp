pragma solidity ^0.4.23;

import { QuestionsLib } from "./QuestionsLib.sol";
import { HSKALib } from "./HSKALib.sol";
import { Utils } from "./Utils.sol";

contract Evaluation {
  mapping (address => mapping (uint => EvaluatedCourse)) public studentEvaluations;
  mapping (address => mapping (uint => bool)) public studentCourseRegistrations;
  mapping (uint => Course) public availableCourses;

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
    mapping (uint => bytes32) answersToTxtQuestions; //Question id -> answer value
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

    registerCourseForEvaluation(HSKALib.Courses.course4, HSKALib.Lecturers.prof3);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q5);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q7);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q9);

  }

  function registerCourseForEvaluation(HSKALib.Courses _courseKey, HSKALib.Lecturers _lecturerKey) private inRegistrationInterval returns (bool) {
    coursesCount++;
    availableCourses[coursesCount] = Course ({
       id: coursesCount,
       courseKey: _courseKey,
       lecturerKey: _lecturerKey,
       numberOfQuestions: 0
     });

    return true;
  }

  function assignQuestionToCourse(uint _courseId, QuestionsLib.QuestionArchetype _qarch) private inRegistrationInterval returns (bool) {
     Course storage _course = availableCourses[_courseId];
    _course.questionsToEvaluate[_course.numberOfQuestions] = _qarch;
    _course.numberOfQuestions++;

    return true;
  }

  // _uintAns: all answers for non-txt questions(for frontend: should be ordered)
  // _txtAns: all answers for txt-questions (for frontend: should be ordered)
  //TODO: String[] or bytes32[][] are needed possibly
  function evaluateCourse(uint _courseId, uint[] _uintAns, bytes32[] _txtAns)
   public inEvaluationInterval returns(bool) {
    require(studentCourseRegistrations[msg.sender][_courseId],
      "Not registered for this course");
    require(!studentEvaluations[msg.sender][_courseId].isEvaluated,
      "This course is already evaluated");
    // REDO: check on uint questions and txt questions
    require((_uintAns.length + _txtAns.length) == availableCourses[_courseId].numberOfQuestions,
      "The evaluation for this course is not complete");
    uint currentUintCnt = 0;
    uint currentTxtCnt = 0;
    for(uint i = 0; i < availableCourses[_courseId].numberOfQuestions; i++){
      if (!QuestionsLib.isTextTypedInput(availableCourses[_courseId].questionsToEvaluate[i])){
        require(_uintAns[currentUintCnt] > 0
          && _uintAns[currentUintCnt] <= QuestionsLib.getMaxVal(availableCourses[_courseId].questionsToEvaluate[i]),
        "Incorrect answer" );
        studentEvaluations[msg.sender][_courseId].answersToUIntQuestions[i] = _uintAns[currentUintCnt];
        currentUintCnt++;
      }
      else{
        studentEvaluations[msg.sender][_courseId].answersToTxtQuestions[i] = _txtAns[currentTxtCnt];
        currentTxtCnt++;
      }
    }

    studentEvaluations[msg.sender][_courseId].isEvaluated = true;
    amountEvaluated++;
    return true;
  }

  function registerAccountForCourseEval(address _account, uint _courseId) payable public inRegistrationInterval onlyAdmin {
    require(!studentCourseRegistrations[_account][_courseId], "Student is already registered");
    require(availableCourses[_courseId].id != 0, "The course is not registered");
    _account.transfer(msg.value);
    studentCourseRegistrations[_account][_courseId] = true;
    amountRegistered++;
  }

  function getCourseTitle(uint _cId) public view returns (string) {
    return HSKALib.getCourseName(availableCourses[_cId].courseKey);
  }

  function getCourseLecturerName(uint _cId) public view returns (string) {
    return HSKALib.getLecturerName(availableCourses[_cId].lecturerKey);
  }

  function getQuestionBodyByCourse(uint _cId, uint _qId) public view returns (string) {
    return QuestionsLib.getQuestionBody(availableCourses[_cId].questionsToEvaluate[_qId]);
  }

  function readEvaluation(address _account, uint _courseId, uint _qId) public view returns(string){
    if(QuestionsLib.isTextTypedInput(availableCourses[_courseId].questionsToEvaluate[_qId]))
      return Utils.bytes32ToString(studentEvaluations[_account][_courseId].answersToTxtQuestions[_qId]);
    return Utils.uintToString(studentEvaluations[_account][_courseId].answersToUIntQuestions[_qId]);
  }

  function isCourseEvaluatedByAccount(address _account, uint _courseId) public view returns(bool){
    return studentEvaluations[_account][_courseId].isEvaluated;
  }

  function checkRegistration(address _adr, uint _courseId) public onlyAdmin view returns (bool){
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

}
