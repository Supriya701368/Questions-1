import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import { QuestionsContext } from './QuestionsContext';

const MSQ = ({
  handleOptionPaste,
  handlePaste,
  handleRemoveImage,
  removeQuestion,
  includeSolution,
  addOptionE,
}) => {
  const { Questions, setQuestions } = useContext(QuestionsContext);
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box

  const handleClickBox = (boxName) => {
    // Only update clickedBox if a different box is clicked
    if (clickedBox !== boxName) {
      setClickedBox(boxName);
    }
  };

  const handleAnswerChange = (index, optionIndex, isChecked) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (isChecked) {
        if (!updated[index].answer.includes(String.fromCharCode(65 + optionIndex))) {
          updated[index].answer += String.fromCharCode(65 + optionIndex);
        }
      } else {
        updated[index].answer = updated[index].answer.replace(String.fromCharCode(65 + optionIndex), '');
      }
      return updated;
    });
  };

  const renderQuestions = () => {
    return Questions.filter(q => q.type === "Msq").map((question, index) => (
      <div key={index} className="question-item">
        <h3>Question {question.questionNumber}</h3>

        {/* Question Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Question</h3>
          <div
            className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`question-${index}`)}
            onPaste={(e) => {
              e.preventDefault();
              const clipboardItems = e.clipboardData.items;
              for (let item of clipboardItems) {
                if (item.type.startsWith("image/")) {
                  const file = item.getAsFile();
                  const reader = new FileReader();
                  reader.onload = () => {
                    setQuestions(prev => {
                      const updated = [...prev];
                      updated[index].questionImage = reader.result;
                      return updated;
                    });
                  };
                  reader.readAsDataURL(file);
                  break;
                }
              }
            }}
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

        {/* Options Section */}
        <h4>Options</h4>
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="option-item">
            <label className="option-label">
              <input
                type="checkbox"
                name={`options-${index}`}
                onChange={(e) => handleAnswerChange(index, optionIndex, e.target.checked)}
                className="option-box"
              />
              <span>Option {String.fromCharCode(65 + optionIndex)}</span>
            </label>
            <div
              className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`option-${index}-${optionIndex}`)}
              onPaste={(e) => handleOptionPaste(e, index, optionIndex)}
              aria-label={`Paste your option ${String.fromCharCode(65 + optionIndex)} image here`}
            >
              {option.image ? (
                <>
                  <img 
                    src={option.image} 
                    alt={`Option ${String.fromCharCode(65 + optionIndex)}`} 
                    style={{ maxWidth: '100%', border: '2px solid #ccc', padding: '5px' }} 
                  />
                  <button 
                    onClick={() => handleRemoveImage(index, "option", optionIndex)} 
                    className="remove-button" 
                    aria-label={`Remove option ${String.fromCharCode(65 + optionIndex)} image`}
                  >
                    Remove
                  </button>
                </>
              ) : "Paste your option image here (Ctrl+V)"}
            </div>
          </div>
        ))}

        {/* Option E Handling */}
        {addOptionE && question.options.length < 5 && (
          <div className="option-item">
            <label>
              <input
                type="checkbox"
                name={`options-${index}`}
                onChange={(e) => handleAnswerChange(index, 4, e.target.checked)}
              />
              Option E
            </label>
            <div 
              className="option-box" 
              onPaste={(e) => handleOptionPaste(e, index, 4)} 
              aria-label="Paste Option E image here"
            >
              {question.options[4]?.image ? (
                <>
                  <img 
                    src={question.options[4].image} 
                    alt="Option E" 
                    style={{ maxWidth: '100%', border: '2px solid #ccc', padding: '5px' }} 
                  />
                  <button 
                    onClick={() => handleRemoveImage(index, "option", 4)} 
                    className="remove-button" 
                    aria-label="Remove Option E image"
                  >
                    Remove
                  </button>
                </>
              ) : "Paste Option E image here (Ctrl+V)"}
            </div>
          </div>
        )}

        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-${index}`)}
              onPaste={(e) => handlePaste(e, index)}
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
    <div className="msq-container">
      <div className="question-wrapper">
        {Questions.filter(q => q.type === "Msq").length > 0 ? renderQuestions() : <p>Loading questions...</p>}
      </div>
    </div>
  );
};

export default MSQ;