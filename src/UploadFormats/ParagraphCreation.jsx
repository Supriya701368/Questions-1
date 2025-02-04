import React, { useState, useContext } from 'react';
import { QuestionsContext } from './QuestionsContext';
import './Questions.css';

const ParagraphCreation = ({ includeSolution }) => {
    const { Paragraphs, setParagraphs } = useContext(QuestionsContext);
    const [clickedBox, setClickedBox] = useState(null);

    const handleImagePaste = (e, questionIndex, optionIndex = null, isSolution = false, isParagraph = false) => {
        const clipboardItems = e.clipboardData.items;
    
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.startsWith('image/')) {
                const file = clipboardItems[i].getAsFile();
                const reader = new FileReader();
    
                reader.onload = () => {
                    const updatedParagraphs = [...Paragraphs];
                    const currentQuestion = updatedParagraphs[questionIndex] || {
                        numQuestions: 1,
                        paraOptions: Array(4).fill({ isCorrect: false, image: null }),
                        paraanswers: '',
                        paraquestionImage: '',
                        paragraphImage: '',
                        paragraphSolutionImage: '',
                        questionTypes: ['mcq'],
                    };
    
                    if (isParagraph) {
                        currentQuestion[isSolution ? 'paragraphSolutionImage' : 'paragraphImage'] = reader.result;
                    } else if (optionIndex !== null) {
                        // Update only the specific option that is being pasted into
                        currentQuestion.paraOptions[optionIndex] = {
                            ...currentQuestion.paraOptions[optionIndex],
                            image: reader.result,
                        };
                    } else {
                        currentQuestion.paraquestionImage = reader.result;
                    }
    
                    updatedParagraphs[questionIndex] = currentQuestion;
                    setParagraphs(updatedParagraphs);
                };
    
                reader.readAsDataURL(file);
                break;
            }
        }
    };

    const removeImage = (questionIndex, optionIndex = null, isSolution = false, isParagraph = false) => {
        const updatedParagraphs = [...Paragraphs];
        const currentQuestion = updatedParagraphs[questionIndex];

        if (isParagraph) {
            currentQuestion[isSolution ? 'paragraphSolutionImage' : 'paragraphImage'] = '';
        } else if (optionIndex !== null) {
            currentQuestion.paraOptions[optionIndex].image = '';
        } else {
            currentQuestion.paraquestionImage = '';
        }

        setParagraphs(updatedParagraphs);
    };

    const handleNumQuestionsChange = (index, value) => {
        const updatedParagraphs = [...Paragraphs];
        const numQuestions = Math.max(1, parseInt(value) || 1);
        updatedParagraphs[index].numQuestions = numQuestions;

        while (updatedParagraphs[index].questionTypes.length < numQuestions) {
            updatedParagraphs[index].questionTypes.push('mcq');
        }

        while (updatedParagraphs[index].questionTypes.length > numQuestions) {
            updatedParagraphs[index].questionTypes.pop();
        }

        setParagraphs(updatedParagraphs);
    };

    const handleQuestionTypeChange = (paragraphIndex, questionIndex, type) => {
        const updatedParagraphs = [...Paragraphs];
        updatedParagraphs[paragraphIndex].questionTypes[questionIndex] = type;
        setParagraphs(updatedParagraphs);
    };

    const handleAnswerChange = (questionIndex, newAnswer, optionIndex = null) => {
        const updatedParagraphs = [...Paragraphs];
        const question = updatedParagraphs[questionIndex];
        const questionType = question.questionTypes[0];

        if (questionType === 'mcq') {
            question.paraanswers = newAnswer;
            question.paraOptions = question.paraOptions.map((option, idx) => ({
                ...option,
                isCorrect: idx === optionIndex,
            }));
        } else if (questionType === 'msq') {
            question.paraOptions[optionIndex].isCorrect = !question.paraOptions[optionIndex].isCorrect;
            const selectedOptions = question.paraOptions
                .map((option, idx) => (option.isCorrect ? String.fromCharCode(65 + idx) : null))
                .filter(Boolean);
            question.paraanswers = selectedOptions;

            if (selectedOptions.length > 2) {
                question.paraOptions[optionIndex].isCorrect = false;
                alert('You can only select up to 2 options for MSQ questions.');
            }
        } else if (questionType === 'truefalse') {
            question.paraanswers = newAnswer;
            question.paraOptions = question.paraOptions.map(option => ({
                ...option,
                isCorrect: option.text === newAnswer,
            }));
        } else if (questionType === 'nit') {
            if (/\D/.test(newAnswer)) {
                alert('Only numbers allowed for numeric input type (NIT)');
                return;
            }
            question.paraanswers = newAnswer;
        }

        setParagraphs(updatedParagraphs);
    };

    return (
        <div className="mcq-container">
            <div className="question-wrapper">
                {Paragraphs.map((paragraph, index) => (
                    <div key={index} className="paragraph-section">
                        <h3>Paragraph {index + 1}</h3>
                        <input
                            className="input-field"
                            type="number"
                            min={1}
                            value={paragraph.numQuestions}
                            onChange={(e) => handleNumQuestionsChange(index, e.target.value)}
                            placeholder="Number of Questions"
                        />

                        <div className="paragraph-image-container">
                            <h3>Paste Image for Paragraph</h3>
                            <div
                                className={`option box ${clickedBox === `paragraph-image-${index}` ? 'clicked' : ''}`}
                                onClick={() => setClickedBox(`paragraph-image-${index}`)}
                                onPaste={(e) => handleImagePaste(e, index, null, false, true)}
                            >
                                {paragraph.paragraphImage ? (
                                    <>
                                        <img src={paragraph.paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                                        <button onClick={() => removeImage(index, null, false, true)} className="remove-button">Remove Image</button>
                                    </>
                                ) : (
                                    'Paste your paragraph image here (ctrl+v)'
                                )}
                            </div>
                        </div>

                        {includeSolution && (
                            <div className="solution-image-container">
                                <h3>Paste Image for Solution</h3>
                                <div
                                    className={`option box ${clickedBox === `solution-image-${index}` ? 'clicked' : ''}`}
                                    onClick={() => setClickedBox(`solution-image-${index}`)}
                                    onPaste={(e) => handleImagePaste(e, index, null, true, true)}
                                >
                                    {paragraph.paragraphSolutionImage ? (
                                        <>
                                            <img src={paragraph.paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                                            <button onClick={() => removeImage(index, null, true, true)} className="remove-button">Remove Image</button>
                                        </>
                                    ) : (
                                        'Paste your solution image here (ctrl+v)'
                                    )}
                                </div>
                            </div>
                        )}

                        {[...Array(paragraph.numQuestions)].map((_, questionIndex) => (
                            <div key={questionIndex} className="question-section">
                                <h4>Question {questionIndex + 1}</h4>
                                <div className="question-image-container">
                                    <h3>Paste Image for Question</h3>
                                    <div
                                        className={`option box ${clickedBox === `question-${index}-${questionIndex}` ? 'clicked' : ''}`}
                                        onClick={() => setClickedBox(`question-${index}-${questionIndex}`)}
                                        onPaste={(e) => handleImagePaste(e, index)}
                                    >
                                        {paragraph.paraquestionImage ? (
                                            <>
                                                <img src={paragraph.paraquestionImage} alt={`Question ${index + 1}`} style={{ maxWidth: '100%' }} />
                                                <button onClick={() => removeImage(index)} className="remove-button">Remove Image</button>
                                            </>
                                        ) : (
                                            'Paste your question image here (ctrl+v)'
                                        )}
                                    </div>
                                </div>

                                <label>Select Question Type:</label>
                                <select
                                    value={paragraph.questionTypes[questionIndex]}
                                    onChange={(e) => handleQuestionTypeChange(index, questionIndex, e.target.value)}
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="msq">MSQ</option>
                                    <option value="nit">NIT</option>
                                    <option value="truefalse">True/False</option>
                                </select>

                                <h4>Options</h4>
                                {paragraph.questionTypes[questionIndex] === 'truefalse' ? (
                                    <div className="truefalse-options">
                                        <label>
                                            <input
                                                type="radio"
                                                name={`option-${index}-${questionIndex}`}
                                                value="True"
                                                onChange={() => handleAnswerChange(index, 'True')}
                                            />
                                            True
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`option-${index}-${questionIndex}`}
                                                value="False"
                                                onChange={() => handleAnswerChange(index, 'False')}
                                            />
                                            False
                                        </label>
                                        <div className="selected-answer-box">
                                            Selected Answer: {paragraph.paraanswers}
                                        </div>
                                    </div>
                                ) : paragraph.questionTypes[questionIndex] === 'nit' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={paragraph.paraanswers}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder="Enter numeric answer"
                                        />
                                        <div className="selected-answer-box">
                                            Entered Answer: {paragraph.paraanswers || 'Enter numeric answer'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {paragraph.paraOptions.map((option, optionIndex) => (
                                            <div key={optionIndex} className="option-item">
                                                <label>
                                                    <input
                                                        name={`option-${index}-${questionIndex}`}
                                                        type={paragraph.questionTypes[questionIndex] === 'msq' ? 'checkbox' : 'radio'}
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
                                                            <button onClick={() => removeImage(index, optionIndex)} className="remove-button">Remove Image</button>
                                                        </>
                                                    ) : (
                                                        'Paste your option image here (ctrl+v)'
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="selected-answer-box">
                                            Selected Answer: {Array.isArray(paragraph.paraanswers) ? paragraph.paraanswers.join(', ') : paragraph.paraanswers}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParagraphCreation;
