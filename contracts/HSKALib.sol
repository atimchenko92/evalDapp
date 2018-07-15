pragma solidity ^0.4.24;

library HSKALib {
  enum Lecturers {prof1, prof2, prof3}
  enum Courses {course1, course2, course3, course4}

  function getLecturerName(Lecturers _lecturer) public pure returns (string) {
    if(_lecturer == Lecturers.prof1)
      return "Dr. Klein";
    if(_lecturer == Lecturers.prof2)
      return "Prof. Ben Jersie";
    if(_lecturer == Lecturers.prof3)
      return "Dr. Regina Maus";
    return "unknown";
  }

  function getCourseName(Courses _course) public pure returns (string){
    if(_course == Courses.course1)
      return "Software Engineering";
    if(_course == Courses.course2)
      return "Software Engineering Labor";
    if(_course == Courses.course3)
      return "Database 2";
    if(_course == Courses.course4)
      return "Distributed Networks 2";
    return "unknown";
  }
}
