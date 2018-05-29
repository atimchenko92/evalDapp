pragma solidity ^0.4.23;

library QuestionsLib {
  enum QuestionArchetype {q1, q2, q3, q4, q5, q6, q7, q8, q9, q10}

  function getMaxValByRatingType(QuestionArchetype _qarch) public pure returns(uint) {
    if(_qarch == QuestionArchetype.q7 || _qarch == QuestionArchetype.q8
        || _qarch == QuestionArchetype.q9 || _qarch == QuestionArchetype.q10)
      return 4;
    else
      return 5;
  }

  function getRatingTextForVal(QuestionArchetype _qarch, uint _val) public pure returns(string) {
    //Check val < Archetype's max val
    if ( _val == 0 ){
      if (_qarch == QuestionArchetype.q1 || _qarch == QuestionArchetype.q2
              || _qarch == QuestionArchetype.q3 || _qarch == QuestionArchetype.q4
              || _qarch == QuestionArchetype.q5 || _qarch == QuestionArchetype.q6
              || _qarch == QuestionArchetype.q7 || _qarch == QuestionArchetype.q8
              || _qarch == QuestionArchetype.q9 )
        return "I completely agree";
      if (_qarch == QuestionArchetype.q10)
        return "very good";
    }

    if ( _val == 4){
      if (_qarch == QuestionArchetype.q1 || _qarch == QuestionArchetype.q2
              || _qarch == QuestionArchetype.q3 || _qarch == QuestionArchetype.q4
              || _qarch == QuestionArchetype.q5 || _qarch == QuestionArchetype.q6
              || _qarch == QuestionArchetype.q7 || _qarch == QuestionArchetype.q8
              || _qarch == QuestionArchetype.q9 )
        return "I strongly disagree";
      if (_qarch == QuestionArchetype.q10)
        return "poor";
    }

    if ( _val == 5 ) {
      if (_qarch == QuestionArchetype.q1 || _qarch == QuestionArchetype.q2
              || _qarch == QuestionArchetype.q3 || _qarch == QuestionArchetype.q4
              || _qarch == QuestionArchetype.q5 || _qarch == QuestionArchetype.q6)
          return "Not specified/ Not applicable";
    }

    return "";
  }

  function getQuestionBody(QuestionArchetype _qp) public pure returns (string){
    if (_qp == QuestionArchetype.q1)
      return "The learning objectives are made clear.";
    if (_qp == QuestionArchetype.q2)
      return "The set tasks to be carried out are clearly understandable.";
    if (_qp == QuestionArchetype.q3)
      return "The introduction given for the experiments / projects are helpful.";
    if (_qp == QuestionArchetype.q4)
      return "The workplace is equipped in an adequate manner in order to carry out the set tasks.";
    if (_qp == QuestionArchetype.q5)
      return "The total time allotted for the internship/laboratory/project is appropriate.";
    if (_qp == QuestionArchetype.q6)
      return "I feel that the internship/laboratory/project is well matched to the content of the related lecture.";
    if (_qp == QuestionArchetype.q7)
      return "I am very interested in the experiments/projects.";
    if (_qp == QuestionArchetype.q8)
      return "I systematically prepare for and follow up on each unit.";
    if (_qp == QuestionArchetype.q9)
      return "This internship/laboratory/project helped me to significantly improve my knowledge.";
    if (_qp == QuestionArchetype.q10)
      return "In total, I would rate this internship/laboratory/project as ...";
    return "dummy";
  }


}
