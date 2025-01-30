import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import ParagraphCreation from "./ParagraphCreation";
import { QuestionsContext } from './QuestionsContext';

const Assertion = ({
  handleRemoveImage,
  removeQuestion,
  includeSolution,
}) => {
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box
  const { Questions, setQuestions } = useContext(QuestionsContext);

  const handleClickBox = (boxName) => {
    setClickedBox(boxName);
  };

  const handlePasteImage = (e, type, index, optionIndex = null) => {
    console.log("Paste event triggered");
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          console.log("Image loaded from clipboard");
          setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            if (type === "assertion") {
              updatedQuestions[index].assertionImage = reader.result;
            } else if (type === "reason") {
              updatedQuestions[index].reasonImage = reader.result;
            } else if (type === "option") {
              updatedQuestions[index].options[optionIndex].image = reader.result;
            } else if (type === "solution") {
              updatedQuestions[index].solutionImage = reader.result;
            }
            return updatedQuestions;
          });
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleAnswerChange = (index, newAnswer) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].answer = String.fromCharCode(65 + newAnswer);
      return updated;
    });
  };

  const renderQuestions = () => {
    return Questions.map((question, index) => (
      <div key={index} className="question-item">
        <h3>Assertion Question  {question.questionNumber}</h3>

        {/* Assertion Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Assertion</h3>
          <div
            className={`option box ${clickedBox === `assertion-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`assertion-${index}`)}
            onPaste={(e) => handlePasteImage(e, "assertion", index)}
          >
            {question.assertionImage ? (
              <>
                <img
                  style={{ maxWidth: "100%" }}
                  src={question.assertionImage}
                  alt={`Assertion ${index + 1}`}
                />
                <button
                  onClick={() => handleRemoveImage(index, "assertion")}
                  className="remove-button"
                >
                  Remove
                </button>
              </>
            ) : (
              "Paste your assertion image here (Ctrl+V)"
            )}
          </div>
        </div>

        {/* Reason Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Reason</h3>
          <div
            className={`option box ${clickedBox === `reason-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`reason-${index}`)}
            onPaste={(e) => handlePasteImage(e, "reason", index)}
          >
            {question.reasonImage ? (
              <>
                <img
                  style={{ maxWidth: "100%" }}
                  src={question.reasonImage}
                  alt={`Reason ${index + 1}`}
                />
                <button
                  onClick={() => handleRemoveImage(index, "reason")}
                  className="remove-button"
                >
                  Remove
                </button>
              </>
            ) : (
              "Paste your reason image here (Ctrl+V)"
            )}
          </div>
        </div>

        {/* Option Section */}
        <h4>Options</h4>
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="option-item">
            <div>
              <label className="option-label">
                <input
                  name={`answer-${index}`}
                  type="radio"
                  onChange={() => handleAnswerChange(index, optionIndex)}
                  className="option-box"
                />
                <span>Option {String.fromCharCode(65 + optionIndex)}</span>
              </label>
              <div
                className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                onClick={() => handleClickBox(`option-${index}-${optionIndex}`)}
                onPaste={(e) => handlePasteImage(e, "option", index, optionIndex)}
              >
                {option.image ? (
                  <>
                    <img
                      src={option.image}
                      alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      style={{ maxWidth: '100%' }}
                    />
                    <button
                      onClick={() => handleRemoveImage(index, "option", optionIndex)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  "Paste your option image here (Ctrl+V)"
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-${index}`)}
              onPaste={(e) => handlePasteImage(e, "solution", index)}
            >
              {question.solutionImage ? (
                <>
                  <img
                    src={question.solutionImage}
                    alt={`Solution ${index + 1}`}
                    style={{ maxWidth: '100%' }}
                  />
                  <button
                    onClick={() => handleRemoveImage(index, "solution")}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </>
              ) : (
                "Paste your solution image here (Ctrl+V)"
              )}
            </div>
          </div>
        )}

        {/* Answer Section */}
        <div className="answer-container">
          <h3>Selected Answer</h3>
          <input
            type="text"
            value={question.answer}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            className="answer-input"
          />
        </div>

        <div>
          <button
            onClick={() => removeQuestion(index)}
            className="remove-button"
          >
            Remove Previous Question
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="mcq-container">
      <div className="question-wrapper">
        {Questions.length > 0 ? renderQuestions() : ""}
      </div>
    </div>
  );
};

export default Assertion;
