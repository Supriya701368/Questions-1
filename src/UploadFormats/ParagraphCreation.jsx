import React, { useState, useEffect, useContext } from 'react';
import { QuestionsContext } from './QuestionsContext';
import './Questions.css';

const ParagraphCreation = ({ includeSolution }) => {
    const { Paragraphs, setParagraphs} = useContext(QuestionsContext);
    const [numberOfQuestions, setNumberOfQuestions] = useState('');
    const [clickedBox, setClickedBox] = useState(null);
    const handleImagePaste = (e, questionIndex, optionIndex = null, isSolution = false, isParagraph = false) => {
        const clipboardItems = e.clipboardData.items;

        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.startsWith('image/')) {
                const file = clipboardItems[i].getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    const updatedParagraphs = [...Paragraphs];
                    updatedParagraphs[questionIndex] = updatedParagraphs[questionIndex] || {
                        paraOptions: Array(4).fill({ isCorrect: false, image: null }),
                        paraquestionImage: '',
                        paragraphImage: '',
                        paragraphSolutionImage: ''
                    };

                    if (isParagraph) {
                        if (isSolution) {
                            updatedParagraphs[questionIndex].paragraphSolutionImage = reader.result;
                        } else {
                            updatedParagraphs[questionIndex].paragraphImage = reader.result;
                        }
                    } else {
                        if (isSolution) {
                            if (optionIndex !== null && updatedParagraphs[questionIndex].paraOptions[optionIndex]) {
                                updatedParagraphs[questionIndex].paraOptions[optionIndex].image = reader.result;
                            } else {
                                updatedParagraphs[questionIndex].paraquestionImage = reader.result;
                            }
                        } else {
                            if (optionIndex !== undefined && updatedParagraphs[questionIndex].paraOptions[optionIndex]) {
                                updatedParagraphs[questionIndex].paraOptions[optionIndex].image = reader.result;
                            } else {
                                updatedParagraphs[questionIndex].paraquestionImage = reader.result;
                            }
                        }
                    }

                    setParagraphs(updatedParagraphs);
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    };

    // Function to remove images
    const removeImage = (questionIndex, optionIndex = null, isSolution = false, isParagraph = false) => {
        const updatedParagraphs = [...Paragraphs];
        if (isParagraph) {
            if (isSolution) {
                updatedParagraphs[questionIndex].paragraphSolutionImage = '';
            } else {
                updatedParagraphs[questionIndex].paragraphImage = '';
            }
        } else {
            if (isSolution) {
                if (optionIndex !== null) {
                    updatedParagraphs[questionIndex].paraOptions[optionIndex].image = '';
                } else {
                    updatedParagraphs[questionIndex].paraquestionImage = '';
                }
            } else {
                if (optionIndex !== null) {
                    updatedParagraphs[questionIndex].paraOptions[optionIndex].image = '';
                } else {
                    updatedParagraphs[questionIndex].paraquestionImage = '';
                }
            }
        }
        setParagraphs(updatedParagraphs);
    };

    // Update the number of questions and generate default structure
    const updateQuestions = (numQuestions) => {
        const parsedNum = parseInt(numQuestions);
        if (isNaN(parsedNum) || parsedNum < 0) return;

        const newQuestions = Array.from({ length: parsedNum }, () => ({
            questionType: 'mcq',
            paraOptions: [
                { isCorrect: false, image: null },
                { isCorrect: false, image: null },
                { isCorrect: false, image: null },
                { isCorrect: false, image: null },
            ],
            paraanswers: '',
            paraquestionImage: '',
            paragraphImage: '',
            paragraphSolutionImage: '',
        }));
        setParagraphs(newQuestions);
    };

    // Handle the question type change
    const handleQuestionTypeChange = (index, type) => {
        const updatedParagraphs = [...Paragraphs];
        updatedParagraphs[index].questionType = type;
        setParagraphs(updatedParagraphs);
    };

    // Handle the answer change
    const handleAnswerChange = (questionIndex, newAnswer, optionIndex = null) => {
        const updatedParagraphs = [...Paragraphs];
        const question = updatedParagraphs[questionIndex];
    
        if (question.questionType === 'nit') {
            const validAnswer = newAnswer.replace(/[A-Za-z]/g, '');  // This removes alphabets
    
            if (newAnswer !== validAnswer) {
                console.error('Invalid input: Alphabets are not allowed for "Nit" question type');
                alert('Invalid input: Alphabets are not allowed for "Nit" question type');
                return; // Exit early if the input is invalid
            }
    
            updatedParagraphs[questionIndex].paraanswers = validAnswer;
        } else if (question.questionType === 'mcq') {
            // Single correct answer
            updatedParagraphs[questionIndex].paraanswers = newAnswer;
            updatedParagraphs[questionIndex].paraOptions.forEach((option, idx) => {
                option.isCorrect = idx === optionIndex;
            });
        } else if (question.questionType === 'msq') {
            // Multiple correct answers
            const updatedOptions = [...question.paraOptions];
            updatedOptions[optionIndex].isCorrect = !updatedOptions[optionIndex].isCorrect; // Toggle selection
    
            if (updatedOptions.filter(option => option.isCorrect).length > 2) {
                updatedOptions[optionIndex].isCorrect = false;
                alert('You can only select up to 2 options for MSQ questions.');
            }
    
            updatedParagraphs[questionIndex].paraOptions = updatedOptions;
            
            // Fix: Store only selected option letters in paraanswers
            updatedParagraphs[questionIndex].paraanswers = updatedOptions
                .map((option, idx) => option.isCorrect ? String.fromCharCode(65 + idx) : null)
                .filter(Boolean); // Remove null values
    
            console.log("Updated Answers:", updatedParagraphs[questionIndex].paraanswers);
        } else {
            updatedParagraphs[questionIndex].paraanswers = newAnswer;
        }
    
        setParagraphs(updatedParagraphs);
    };
    

    useEffect(() => {
        updateQuestions(numberOfQuestions);
    }, [numberOfQuestions]);

    return (
        <div>
            <div className="mcq-container">
                <div className="question-wrapper">
                    {/* Paragraph Image Section */}
                    <h3>Paragraph 1</h3>
                    {numberOfQuestions > 0 && (
                        <div className="paragraph-image-container">
                            
                            <h3>Paste Image for Paragraph</h3>
                            <div
                                className={`option box ${clickedBox === 'paragraph-image' ? 'clicked' : ''}`}
                                onClick={() => setClickedBox('paragraph-image')}
                                onPaste={(e) => handleImagePaste(e, 0, null, false, true)}
                            >
                                {Paragraphs[0]?.paragraphImage ? (
                                    <>
                                        <img src={Paragraphs[0].paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                                        <button onClick={() => removeImage(0, null, false, true)} className="remove-button">
                                            Remove Image
                                        </button>
                                    </>
                                ) : (
                                    'Paste your paragraph image here (ctrl+v)'
                                )}
                            </div>
                        </div>
                    )}
                    {/* Optional Solution Image Section */}
                    {includeSolution && (
                        <div className="solution-image-container">
                            <h3>Paste Image for Solution</h3>
                            <div
                                className={`option box ${clickedBox === 'solution-image' ? 'clicked' : ''}`}
                                onClick={() => setClickedBox('solution-image')}
                                onPaste={(e) => handleImagePaste(e, 0, null, true, true)}
                            >
                                {Paragraphs[0]?.paragraphSolutionImage ? (
                                    <>
                                        <img src={Paragraphs[0].paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                                        <button onClick={() => removeImage(0, null, true, true)} className="remove-button">
                                            Remove Image
                                        </button>
                                    </>
                                ) : (
                                    'Paste your solution image here (ctrl+v)'
                                )}
                            </div>
                        </div>
                    )}

                    {/* Number of Questions Input */}
                    <div>
                        <input
                            className="input-field"
                            type="number"
                            min={1}
                            max={100}
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(e.target.value)}
                            placeholder="Enter number of questions"
                        />
                    </div>

                    {/* Questions Section */}
                    {numberOfQuestions > 0 && Paragraphs.map((question, index) => (
                        <div key={index} className="question-section">
                            <h3>Paragraph Question {index + 1}</h3>

                            {/* Question Type Dropdown */}
                            <div>
                                <label>Select Question Type:</label>
                                <select
                                    style={{ padding: '5px', border: '1px solid', borderRadius: '17px', margin: '12px' }}
                                    value={question.questionType}
                                    onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="msq">MSQ</option>
                                    <option value="nit">NIT</option>
                                    <option value="truefalse">True/False</option>
                                </select>
                            </div>

                             {/* Question Image */}
                             <div className="question-image-container">
                                <h3>Paste Image for Question</h3>
                                <div
                                    className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                                    onClick={() => setClickedBox(`question-${index}`)}
                                    onPaste={(e) => handleImagePaste(e, index)}
                                >
                                    {question.paraquestionImage ? (
                                        <>
                                            <img
                                                src={question.paraquestionImage}
                                                alt={`Question ${index + 1}`}
                                                style={{ maxWidth: '100%' }}
                                            />
                                            <button onClick={() => removeImage(index)} className="remove-button">
                                                Remove Image
                                            </button>
                                        </>
                                    ) : (
                                        'Paste your question image here (ctrl+v)'
                                    )}
                                </div>
                            </div>

                            {/* Options Section */}
                            <h4>Options</h4>
                            {question.questionType === 'truefalse' ? (
                                <div className="truefalse-options">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`option-${index}`}
                                            value="True"
                                            onChange={() => handleAnswerChange(index, 'True')}
                                        />
                                        True
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`option-${index}`}
                                            value="False"
                                            onChange={() => handleAnswerChange(index, 'False')}
                                        />
                                        False
                                    </label>
                                </div>
                            ) : question.questionType === 'nit' ? (
                                <div className="nit-option">
                                    <input
                                        className="answer-input"
                                        type="text"
                                        value={question.paraanswers}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Enter numeric answer"
                                    />
                                </div>
                            ) : (
                                question.paraOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-item">
                                        <div>
                                            <label>
                                                <input
                                                    name={`option-${index}`}
                                                    type={question.questionType === 'msq' ? 'checkbox' : 'radio'}
                                                    checked={option.isCorrect} 
                                                    onChange={() => handleAnswerChange(index, String.fromCharCode(65 + optionIndex), optionIndex)}
                                                />
                                                Option {String.fromCharCode(65 + optionIndex)}
                                            </label>
                                            <div
                                                className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                                                onClick={() => setClickedBox(`option-${index}-${optionIndex}`)}
                                                onPaste={(e) => handleImagePaste(e, index, optionIndex)}
                                            >
                                                {option.image ? (
                                                    <>
                                                        <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                                                        <button onClick={() => removeImage(index, optionIndex)} className="remove-button">
                                                            Remove Image
                                                        </button>
                                                    </>
                                                ) : (
                                                    'Paste your option image here (ctrl+v)'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParagraphCreation;