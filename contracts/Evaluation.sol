pragma solidity ^0.4.23;

import { QuestionsLib } from "./QuestionsLib.sol";
import { HSKALib } from "./HSKALib.sol";

contract Evaluation {
  mapping (address => mapping (uint => EvaluatedCourse)) public studentEvaluations;
  mapping (address => mapping (uint => bool)) public studentCourseRegistrations; //Adress->courseId
  mapping (uint => Course) public availableCourses;

  address public owner;
  uint public coursesCount;
  uint public evalStart;
  uint public evalEnd;
  string public semester;

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
    //bytes32[] answersToQuestions;
  }

  constructor(string _semester, uint _durationInDays) public {
    owner = msg.sender;
    semester = _semester;
    evalStart = now;
    evalEnd = evalStart + (_durationInDays * 1 days);

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

  function registerCourseForEvaluation(HSKALib.Courses _courseKey, HSKALib.Lecturers _lecturerKey) private returns (bool) {
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

  function assignQuestionToCourse(uint _courseId, QuestionsLib.QuestionArchetype _qarch) private returns (bool) {
     Course storage _course = availableCourses[_courseId];
    _course.questionsToEvaluate[_course.numberOfQuestions] = Question ({
        id: _course.numberOfQuestions,
        body: QuestionsLib.getQuestionBody(_qarch)
    });
    _course.numberOfQuestions++;

    return true;
  }

  function getQuestionBodyByCourse(uint _cId, uint _qId) public constant returns (string) {
    return availableCourses[_cId].questionsToEvaluate[_qId].body;
  }

  //TODO
  function evaluateCourse(uint _courseId, bytes32[] _answers) public returns(bool) {
    require(!studentEvaluations[msg.sender][_courseId].isEvaluated);
   //TODO: Check if all questions are answered:
   // 1. Check values <> 0
   // 2. N(answers) = N(course.numberOfQuestions)
    for (uint i=0; i<_answers.length; i++) {
      studentEvaluations[msg.sender][_courseId].answersToQuestions[i] = _answers[i];
    }

    studentEvaluations[msg.sender][_courseId].isEvaluated = true;
    return true;
  }

//  function answerToQuestion(uint _courseId, uint _qId, string _value) public {
    //TODO: check if registered for course
//    EvaluatedCourse storage myCourses = evaluations[msg.sender];
//    require(!myCourses[_courseId].isEvaluated);
//    myCourses[_courseId].answersToQuestions[_qId] = _value;
//  }

  function registerAccountForCourseEval(address _account, uint _courseId ) public {
    require(msg.sender == owner);
    require(!studentCourseRegistrations[_account][_courseId]);
    //TODO: Check if course id valid
    //TODO: give eth to cover up the gas expenses
    studentCourseRegistrations[_account][_courseId] = true;

    //uint[] storage myCIDs = studentCourseRegistrations[_account];
    //myCIDs.push(_courseId);
  }

  function readEvaluation(address _account, uint _courseId, uint _qId) public view returns(bytes32){
    return studentEvaluations[_account][_courseId].answersToQuestions[_qId];
  }
}
