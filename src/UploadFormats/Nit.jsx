import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import { QuestionsContext } from './QuestionsContext';

const NIT = ({  removeQuestion, includeSolution }) => {
  const { Questions, setQuestions } = useContext(QuestionsContext);
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box

  const handleClickBox = (boxName) => {
    if (clickedBox !== boxName) {
      setClickedBox(boxName);
    }
  };

  // Handle Answer Input (Restrict Alphabets, Allow Numbers with Comma Separation)
  const handleAnswerChange = (index, newAnswer) => {
    const validAnswer = newAnswer.replace(/[^0-9,]/g, ''); // Allow only numbers and commas

    if (newAnswer !== validAnswer) {
      alert('Invalid input: Only numbers and commas are allowed.');
      return;
    }

    setQuestions((prev) => {
      const updated = [...prev];
      updated[index].answer = validAnswer;
      return updated;
    });
  };

  // Handle Image Paste
  const handlePasteImage = (e, type, index, optionIndex = null) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
  
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
  
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const reader = new FileReader();
  
        reader.onload = (event) => {
          setQuestions((prev) => {
            const updated = [...prev];
  
            if (type === 'question') {
              updated[index].questionImage = event.target.result;
            } else if (type === 'solution') {
              updated[index].solutionImage = event.target.result;
            } else if (type === 'option' && optionIndex !== null) {
              updated[index].options[optionIndex] = event.target.result;
            }
  
            return updated;
          });
        };
  
        reader.readAsDataURL(file);
        return; // Exit loop after handling first image
      }
    }
  
    alert("No image found in clipboard. Please copy an image first.");
  };
  

  // Handle Removing Images
  const handleRemoveImage = (index, type, optionIndex = null) => {
    setQuestions((prev) => {
      const updated = [...prev];

      if (type === 'question') {
        updated[index].questionImage = null;
      } else if (type === 'solution') {
        updated[index].solutionImage = null;
      } else if (type === 'option' && optionIndex !== null) {
        updated[index].options[optionIndex] = null;
      }

      return updated;
    });
  };

  // Render Questions
  const renderQuestions = () => {
    return Questions.filter((q) => q.type === 'Nit').map((question, index) => (
      <div key={index} className="question-item">
        <h3>NIT Question {question.questionNumber}</h3>

        {/* Question Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Question</h3>
          <div
            className={`option-box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`question-${index}`)}
            onPaste={(e) => handlePasteImage(e, 'question', index)}
            aria-label="Paste your question image here"
          >
            {question.questionImage ? (
              <>
                <img
                  src={question.questionImage}
                  alt={`Question ${index + 1}`}
                  style={{ maxWidth: '100%', border: '2px solid #ccc', padding: '5px' }}
                />
                <button
                  onClick={() => handleRemoveImage(index, 'question')}
                  className="remove-button"
                >
                  Remove
                </button>
              </>
            ) : (
              'Paste your question image here (Ctrl+V)'
            )}
          </div>
        </div>

        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-${index}`)}
              onPaste={(e) => handlePasteImage(e, 'solution', index)}
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
                    onClick={() => handleRemoveImage(index, 'solution')}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </>
              ) : (
                'Paste your solution image here (Ctrl+V)'
              )}
            </div>
          </div>
        )}

        {/* Answer Section */}
        <div className="answer-container">
          <h3>Selected Answers</h3>
          <input
            type="text"
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            value={question.answer}
            className="answer-input"
            placeholder="Enter answers separated by commas"
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
    <div className="nit-container">
      <div className="question-wrapper">
        {Questions.filter((q) => q.type === 'Nit').length > 0 ? renderQuestions() : <p>Loading questions...</p>}
      </div>
    </div>
  );
};

export default NIT;
