import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import { QuestionsContext } from './QuestionsContext';

const TRUE = ({
  handleRemoveImage,
  removeQuestion,
  includeSolution,
}) => {
  const { Questions, setQuestions } = useContext(QuestionsContext);
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box

  const handleClickBox = (boxName) => {
    // Only update clickedBox if a different box is clicked
    if (clickedBox !== boxName) {
      setClickedBox(boxName);
    }
  };

  const handleAnswerChange = (index, newAnswer) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].answer = newAnswer === "true" ? "True" : "False";
      return updated;
    });
  };

  const handlePasteImage = (e, type, index) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          setQuestions(prev => {
            const updated = [...prev];
            if (type === "question") {
              updated[index].questionImage = reader.result;
            } else if (type === "solution") {
              updated[index].solutionImage = reader.result;
            }
            return updated;
          });
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const renderQuestions = () => {
    return Questions.filter(q => q.type === "True").map((question, index) => (
      <div key={index} className="question-item">
        <h3>TRUE Question {question.questionNumber}</h3>

        {/* Question Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Question</h3>
          <div
            className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`question-${index}`)}
            onPaste={(e) => handlePasteImage(e, "question", index)}
            aria-label="Paste your question image here"
          >
            {question.questionImage ? (
              <>
                <img 
                  src={question.questionImage} 
                  alt={`Question ${index + 1}`} 
                  style={{ maxWidth: "100%", border: '2px solid #ccc', padding: '5px' }} 
                />
                <button 
                  onClick={() => handleRemoveImage(index, "question")} 
                  className="remove-button" 
                  aria-label="Remove question image"
                >
                  Remove
                </button>
              </>
            ) : "Paste your question image here (Ctrl+V)"}
          </div>
        </div>

        {/* True/False Options */}
        <div className="true-false-options">
          <label style={{ display: "block" }}>
            <input
              type="radio"
              name={`answer-${index}`}
              value="true"
              checked={question.answer === "True"}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
            True
          </label>
          <label>
            <input
              type="radio"
              name={`answer-${index}`}
              value="false"
              checked={question.answer === "False"}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
            False
          </label>
        </div>

        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-${index}`)}
              onPaste={(e) => handlePasteImage(e, "solution", index)}
              aria-label="Paste your solution image here"
            >
              {question.solutionImage ? (
                <>
                  <img 
                    src={question.solutionImage} 
                    alt={`Solution ${index + 1}`} 
                    style={{ maxWidth: '100%', border: '2px solid #ccc', padding: '5px' }} 
                  />
                  <button 
                    onClick={() => handleRemoveImage(index, "solution")} 
                    className="remove-button" 
                    aria-label="Remove solution image"
                  >
                    Remove
                  </button>
                </>
              ) : "Paste your solution image here (Ctrl+V)"}
            </div>
          </div>
        )}

        {/* Answer Section */}
        <div className="answer-container">
          <h3>Selected Answers</h3>
          <input
            readOnly
            type="text"
            value={question.answer}
            className="answer-input"
          />
          <button 
            onClick={() => removeQuestion(index)} 
            className="remove-button" 
            aria-label="Remove previous question"
          >
            Remove Previous Question
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="true-container">
      <div className="question-wrapper">
        {Questions.filter(q => q.type === "True").length > 0 ? renderQuestions() : <p>Loading questions...</p>}
      </div>
    </div>
  );
};

export default TRUE;