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

  struct Lecturer{
    uint id;
    string fullname;
  }

  struct Course {
    uint id;
    string title;
    uint numberOfLecturers;
    uint numberOfQuestions;
    string courseLecturer;
    mapping (uint => Question) questionsToEvaluate;
  }

  struct Question{
    uint id;
    string body;
  }

  struct EvaluatedCourse{
    uint courseId;
    bool isEvaluated;
    mapping (uint => bytes32) answersToQuestions; //Question id -> value
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

    registerCourseForEvaluation(HSKALib.Courses.course2, HSKALib.Lecturers.prof1);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q3);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q10);

    registerCourseForEvaluation(HSKALib.Courses.course3, HSKALib.Lecturers.prof2);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesCount, QuestionsLib.QuestionArchetype.q5);

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
       title: HSKALib.getCourseName(_courseKey),
       numberOfLecturers: 0,
       numberOfQuestions: 0,
       courseLecturer: HSKALib.getLecturerName(_lecturerKey)
     });
    return true;
  }

  function assignQuestionToCourse(uint _courseId, QuestionsLib.QuestionArchetype _qarch) private inRegistrationInterval returns (bool) {
     Course storage _course = availableCourses[_courseId];
    _course.questionsToEvaluate[_course.numberOfQuestions] = Question ({
        id: _course.numberOfQuestions,
        body: QuestionsLib.getQuestionBody(_qarch)
    });
    _course.numberOfQuestions++;

    return true;
  }

  function getQuestionBodyByCourse(uint _cId, uint _qId) public view returns (string) {
    return availableCourses[_cId].questionsToEvaluate[_qId].body;
  }

  //TODO: M0ar checks
  function evaluateCourse(uint _courseId, bytes32[] _answers) public inEvaluationInterval returns(bool) {
    require(studentCourseRegistrations[msg.sender][_courseId], "Not registered for this course");
    require(!studentEvaluations[msg.sender][_courseId].isEvaluated, "This course is already evaluated");
    require(_answers.length == availableCourses[_courseId].numberOfQuestions,
      "The evaluation for this course is not complete");
   //TODO: Check if all questions are answered:
   // 1. Check values <> 0
    for (uint i=0; i<_answers.length; i++) {
//      if ()
//        require(_answers[i]!="0", "Not all questions were answered");

      studentEvaluations[msg.sender][_courseId].answersToQuestions[i] = _answers[i];
      //TODO:only for uint-type of questions
    }

    studentEvaluations[msg.sender][_courseId].isEvaluated = true;
    amountEvaluated++;
    return true;
  }

  function registerAccountForCourseEval(address _account, uint _courseId ) public inRegistrationInterval onlyAdmin {
    require(!studentCourseRegistrations[_account][_courseId], "Student is already registered");
    require(availableCourses[_courseId].id != 0, "The course is not registered");
    //TODO: give eth to cover up the gas expenses
    studentCourseRegistrations[_account][_courseId] = true;
    amountRegistered++;
  }

  function readEvaluation(address _account, uint _courseId, uint _qId) public view returns(string){
    return Utils.bytes32ToString(studentEvaluations[_account][_courseId].answersToQuestions[_qId]);
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

}
