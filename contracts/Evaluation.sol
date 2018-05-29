pragma solidity ^0.4.23;

import { QuestionsLib } from "./QuestionsLib.sol";
import { HSKALib } from "./HSKALib.sol";

contract Evaluation {

  mapping (uint => Course) public coursesForValidation;
  address public owner;
  uint public coursesCount;
  uint public evalStart;
  uint public evalEnd;

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
    QuestionsLib.QuestionArchetype qarch;
    uint value;
  }

  constructor(uint _durationInDays) public {
    owner = msg.sender;
    evalStart = now;
    evalEnd = evalStart + (_durationInDays * 1 days);

    //Register courses and assign questions
    registerCourseForEvaluation(HSKALib.Courses.course1, HSKALib.Lecturers.prof1);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q1);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q2);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q3);

    registerCourseForEvaluation(HSKALib.Courses.course2, HSKALib.Lecturers.prof1);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q3);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q10);

    registerCourseForEvaluation(HSKALib.Courses.course3, HSKALib.Lecturers.prof2);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q5);

    registerCourseForEvaluation(HSKALib.Courses.course4, HSKALib.Lecturers.prof3);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q4);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q5);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q7);
    assignQuestionToCourse(coursesForValidation[coursesCount], QuestionsLib.QuestionArchetype.q9);

  }

  function registerCourseForEvaluation(HSKALib.Courses _courseKey, HSKALib.Lecturers _lecturerKey) private returns (bool) {
    coursesCount++;
    coursesForValidation[coursesCount] = Course ({
       id: coursesCount,
       title: HSKALib.getCourseName(_courseKey),
       numberOfLecturers: 0,
       numberOfQuestions: 0,
       courseLecturer: HSKALib.getLecturerName(_lecturerKey)});
    return true;
  }

  function assignQuestionToCourse(Course storage _course, QuestionsLib.QuestionArchetype _qarch) private returns (bool) {
    _course.numberOfQuestions++;
    _course.questionsToEvaluate[_course.numberOfQuestions] = Question ({
      id: _course.numberOfQuestions,
      qarch: _qarch,
      value: 0 });
    return true;
  }

  //TODO
  function evaluateCourse(uint _courseId) pure public {

  }
}
