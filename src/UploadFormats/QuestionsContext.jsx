import React, { createContext, useState, useEffect } from 'react';

export const QuestionsContext = createContext();

export const QuestionsProvider = ({ children }) => {
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [msqQuestions, setMsqQuestions] = useState([]);
  const [nitQuestions, setNitQuestions] = useState([]);
  const [trueQuestions, setTrueQuestions] = useState([]);
  const [assertionQuestions, setAssertionQuestions] = useState([]);
  const [Questions, setQuestions] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState(0);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [selectedQuestionType, setSelectedQuestionType] = useState("Mcq");
  const [addOptionE, setAddOptionE] = useState(false);
  const [Paragraphs, setParagraphs] = useState([]);
  const [indexCount,setindexCount]=useState(1)
  const incrementCounter = () => {
    setindexCount(prev => prev + 1);
  };
  
  return (
    <QuestionsContext.Provider value={{
      Paragraphs, setParagraphs,
      mcqQuestions, setMcqQuestions,
      msqQuestions, setMsqQuestions,
      nitQuestions, setNitQuestions,
      trueQuestions, setTrueQuestions,
      assertionQuestions, setAssertionQuestions,
      Questions, setQuestions,
      positiveMarks, setPositiveMarks,
      negativeMarks, setNegativeMarks,
      selectedQuestionType, setSelectedQuestionType,
      addOptionE, setAddOptionE,indexCount,incrementCounter,setindexCount
    }}>
      {children}
    </QuestionsContext.Provider>
  );
};