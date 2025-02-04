import React, { useState, useContext,useEffect,useCallback } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun} from "docx";
import MCQ from "./Mcq";
import MSQ from "./Msq";
import NIT from "./Nit";
import True from "./True";
import Assertion from "./Assertion.jsx";
import "./Questions.css";
import ParagraphCreation from "./ParagraphCreation.jsx";
import Instruction from './Instruction.jsx';
import { QuestionsContext } from './QuestionsContext.jsx';
import PreviewModal from './PreviewModal.jsx';
const Management = () => {
  useEffect(() => {
    const checkScreenWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 768 && screenWidth <= 1024) {
        alert('This website is not available on tablet view due to the size of the images decreasing.');
        return
      }
    };  checkScreenWidth();
window.addEventListener('resize', checkScreenWidth);
    return () => {
      window.removeEventListener('resize', checkScreenWidth);
    };
  }, []);

  const [hasParagraphAdded, setHasParagraphAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentContent, setDocumentContent] = useState([]);
  const [hasAddedQuestionAgain, setHasAddedQuestionAgain] = useState(false);

  
  const {
    mcqQuestions, setMcqQuestions,
    msqQuestions, setMsqQuestions,
    nitQuestions, setNitQuestions,
    trueQuestions, setTrueQuestions,
    assertionQuestions, setAssertionQuestions,
    Questions, setQuestions,
    positiveMarks, negativeMarks, setPositiveMarks, setNegativeMarks,
    selectedQuestionType, setSelectedQuestionType,
    addOptionE, setAddOptionE, Paragraphs,indexCount,incrementCounter,setParagraphs
  } = useContext(QuestionsContext);
  const [isInstructionsPage, setIsInstructionsPage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [includeParagraph, setIncludeParagraph] = useState(false);
  const [includeSolution, setIncludeSolution] = useState(true);
  const [components, setComponents] = useState(new Set());
  const toggleInstructionsPage = () => {
    setIsInstructionsPage(!isInstructionsPage);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };
  const addComponent = (type) => {
    if (!components.has(type)) {
      setComponents((prev) => {
        prev.add(type);
        return prev;
      });
    }
  }; 
  const handlePositiveChange = (e) => {
    setPositiveMarks(e.target.value);
  };

  const handleNegativeChange = (e) => {
    setNegativeMarks(e.target.value);
  };

  const handleQuestionClick = (e) => {
    const newQuestionType = e.target.value;
    if (newQuestionType !== selectedQuestionType) {
      switch (newQuestionType) {
        case 'Mcq':
          setMcqQuestions([]);
          break;
        case 'Msq':
          setMsqQuestions([]);
          break;
        case 'Nit':
          setNitQuestions([]);
          break;
        case 'True':
          setTrueQuestions([]);
          break;
        case 'Assertion':
          setAssertionQuestions([]);
          break;
        case 'Paragraph':
          setParagraphs([])
        default:
          break;
      }
    }
    setSelectedQuestionType(newQuestionType);
    console.log(Paragraphs)
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
   
    if (name === "solution") setIncludeSolution(checked);
    if (name === "optionE") {
      setAddOptionE(checked);
      const updateQuestions = (questions, setQuestions) => {
        setQuestions(questions.map(q => ({
          ...q,
          options: checked ? [...q.options, { text: "", image: null }] : q.options.slice(0, 4),
        })));
      };
      
      updateQuestions(mcqQuestions, setMcqQuestions);
      updateQuestions(msqQuestions, setMsqQuestions);
      updateQuestions(assertionQuestions, setAssertionQuestions);
      updateQuestions(trueQuestions, setTrueQuestions);
      updateQuestions(nitQuestions, setNitQuestions);
      updateQuestions(Paragraphs, setParagraphs);
    }
  };
  const addQuestion = () => {
    const newQuestion = {
      assertionImage: null,
      reasonImage: null,
      questionImage: null,
      answer: "",
      solutionImage: null,
      options: [
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        ...(addOptionE ? [{ text: "", image: null }] : []),
      ],
      type: selectedQuestionType,
      questionNumber: indexCount,
    };
  
    if (selectedQuestionType === 'Paragraph') {
      const newParagraph = {
        numQuestions: 1,
        paraOptions: Array(4).fill({ isCorrect: false, image: null }),
        paraanswers: '',
        paraquestionImage: '',
        paragraphImage: '',
        paragraphSolutionImage: '',
        questionTypes: Array(1).fill('mcq'), // Initialize question types
        questionNumber: indexCount,
        type: 'Paragraph',
      };
      setParagraphs((prev) => [...prev, newParagraph]); // Add to paragraphs
  
      // Add the paragraph to the Questions array at the last index
      setQuestions((prevQuestions) => [...prevQuestions, newParagraph]);
    } else {
      // Add the new question to the specific question type array
      switch (selectedQuestionType) {
        case 'Mcq':
          setMcqQuestions((prev) => [...prev, newQuestion]);
          break;
        case 'Msq':
          setMsqQuestions((prev) => [...prev, newQuestion]);
          break;
        case 'Nit':
          setNitQuestions((prev) => [...prev, newQuestion]);
          break;
        case 'True':
          setTrueQuestions((prev) => [...prev, newQuestion]);
          break;
        case 'Assertion':
          setAssertionQuestions((prev) => [...prev, newQuestion]);
          break;
        default:
          break;
      }
  
      // Add the new question to the Questions array at the last index
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    }
  
    // Add the new question type to the components state
    addComponent(selectedQuestionType);
    incrementCounter();
  };

  const processImage = (imageData, maxWidth, maxHeight) => {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve) => {
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        let width = naturalWidth;
        let height = naturalHeight;

        if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
          if (naturalWidth / maxWidth > naturalHeight / maxHeight) {
            width = maxWidth;
            height = Math.round((naturalHeight / naturalWidth) * maxWidth);
          } else {
            height = maxHeight;
            width = Math.round((naturalWidth / naturalHeight) * maxHeight);
          }
        }

        resolve({ width, height });
      };
    });
  };

  const handleRemoveImage = (index, type, questionIndex = null) => {
    const updatedQuestions = [...Questions];
  
    switch (type) {
      case "paragraph":
        updatedQuestions[index].paragraphImage = null;
        break;
      case "paragraph-question":
        if (questionIndex !== null) {
          updatedQuestions[index].paraquestions[questionIndex].paraquestionImage = null;
        }
        break;
      case "question":
        updatedQuestions[index].questionImage = null;
        break;
      case "solution":
        updatedQuestions[index].solutionImage = null;
        break;
      default:
        if (type === "option" && questionIndex !== null) {
          updatedQuestions[index].options[questionIndex].image = null;
        }
        break;
    }
  
    setQuestions(updatedQuestions);
  };

 const removeQuestion = (index) => {
  setQuestions(prevQuestions => {
    const updatedQuestions = [...prevQuestions];
    updatedQuestions.splice(index, 1);

    // Reassign question numbers to be sequential
    updatedQuestions.forEach((question, i) => {
      question.questionNumber = i + 1;
    });

    return updatedQuestions;
  });
};

  const handlePaste = (e, index) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].solutionImage = reader.result;
          setQuestions(updatedQuestions);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

 
  const handleOptionPaste = (e, index, optionIndex) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].options[optionIndex].image = reader.result;
          updatedQuestions[index].options[optionIndex].text = "";
          setQuestions(updatedQuestions);
        };
        reader.readAsDataURL(file);
        break;
      } else if (clipboardItems[i].type === "text/plain") {
        const text = e.clipboardData.getData("text");
        const updatedQuestions = [...Questions];
        updatedQuestions[index].options[optionIndex].text = text;
        updatedQuestions[index].options[optionIndex].image = null;
        setQuestions(updatedQuestions);
        break;
      }
    }
  };
  const handleSave = async () => {
    let sortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;

    const docSections = [];

    // Clone questions to avoid direct mutation and potential cyclic references
    const clonedQuestions = JSON.parse(JSON.stringify(Questions));

    for (let index = 0; index < clonedQuestions.length; index++) {
        const question = clonedQuestions[index];

        // Check if the question type is Paragraph
        if (question.type === 'Paragraph') {
            // Process paragraph-specific properties
            const paragraphImageTransform = question.paragraphImage
                ? await processImage(question.paragraphImage, questionMaxWidth, questionMaxHeight)
                : null;

            const paragraphSolutionImageTransform = question.paragraphSolutionImage
                ? await processImage(question.paragraphSolutionImage, questionMaxWidth, questionMaxHeight)
                : null;

            const paragraphQuestionImageTransform = question.paragraphQuestionImage
                ? await processImage(question.paragraphQuestionImage, questionMaxWidth, questionMaxHeight)
                : null;

            const paragraphTextRun = question.paraanswers
                ? new TextRun(question.paraanswers)
                : new TextRun("No paragraph text provided.");

            const paragraphSection = {
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[Paragraph] ", bold: true }),
                            paragraphTextRun,
                        ],
                    }),
                ],
            };

            // Add paragraph image if it exists
            if (question.paragraphImage) {
                const paragraphImageRun = new ImageRun({
                    data: question.paragraphImage.split(",")[1],
                    transformation: paragraphImageTransform,
                });

                paragraphSection.children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[Paragraph Image] ", bold: true }),
                            paragraphImageRun,
                        ],
                    })
                );
            }

            // Add paragraph solution image if it exists
            if (question.paragraphSolutionImage) {
                const solutionImageRun = new ImageRun({
                    data: question.paragraphSolutionImage.split(",")[1],
                    transformation: paragraphSolutionImageTransform,
                });

                paragraphSection.children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[Paragraph Solution Image] ", bold: true }),
                            solutionImageRun,
                        ],
                    })
                );
            }

            // Add paragraph question image if it exists
            if (question.paragraphQuestionImage) {
                const questionImageRun = new ImageRun({
                    data: question.paragraphQuestionImage.split(",")[1],
                    transformation: paragraphQuestionImageTransform,
                });

                paragraphSection.children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[Paragraph Question Image] ", bold: true }),
                            questionImageRun,
                        ],
                    })
                );
            }

            // Add question types
            const questionTypes = Array.isArray(question.questionTypes) ? question.questionTypes.join(", ") : "No question types available";
            paragraphSection.children.push(new Paragraph({ text: `[Question Types: ${questionTypes}]`, bold: true }));

            // Add sortid for the paragraph
            paragraphSection.children.push(new Paragraph({ text: `[sortid] ${sortid++}`, bold: true }));

            // Add answer for the paragraph
            paragraphSection.children.push(new Paragraph({ text: `[ans] ${question.answer || "No answer provided"}`, bold: true }));

            // Add marks for the paragraph
            paragraphSection.children.push(new Paragraph({ text: `[Marks] ${positiveMarks || 0}, ${negativeMarks || 0}`, bold: true }));

            // Add paragraph options
            if (Array.isArray(question.paraOptions)) {
                for (let i = 0; i < question.paraOptions.length; i++) {
                    const option = question.paraOptions[i];
                    const optionTransform = option.image
                        ? await processImage(option.image, optionMaxWidth, optionMaxHeight)
                        : null;

                    paragraphSection.children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Option ${i + 1}: `, bold: true }),
                                option.image
                                    ? new ImageRun({
                                          data: option.image.split(",")[1],
                                          transformation: optionTransform,
                                      })
                                    : new TextRun(option.text || "No text provided"),
                            ],
                        })
                    );
                }
            } else {
                console.warn("paraOptions is not defined or is not an array");
            }

            // Add the paragraph part to document sections
            docSections.push(paragraphSection);
        } else {
            // Handle other question types (MCQ, MSQ, etc.)
            // Existing logic for other types remains unchanged
        }
    }

    // Final section marker
    docSections.push({
        children: [new Paragraph({ text: "[QQ]", bold: true })],
    });

    const doc = new Document({
        sections: docSections,
    });

    try {
        const blob = await Packer.toBlob(doc);
        setDocumentContent(blob);
        setShowModal(true);
        alert("Document has been created successfully!");
    } catch (error) {
        console.error("Error creating the document:", error);
    }
};

;const handleEdit = () => {
    setShowModal(false);
};
const combinedHandler = (e) => {
  const type = e.target.value;
  if (type) {
    // Remove the previous question type component from the components set
    setComponents((prev) => {
      prev.delete(type);
      return prev;
    });

    // Add the new question type component to the components set
    setComponents((prev) => {
      prev.add(type);
      return prev;
    });

    setSelectedQuestionType(type);
    handleQuestionClick(e);
  }
};
const componentsMap = {
  Mcq: MCQ,
  Msq: MSQ,
  Nit: NIT,
  True: True,
  Assertion: Assertion,
  Paragraph: ParagraphCreation,
};
const memoizedRenderComponent = useCallback((component, index) => {
    const Component = componentsMap[component];
    
    if (Component) {
        return (
            <div key={index}>
                <Component
                    indexCount={indexCount}
                    handlePaste={handlePaste}
                    processImage={processImage}
                    handleOptionPaste={handleOptionPaste}
                    handleRemoveImage={handleRemoveImage}
                    removeQuestion={removeQuestion}
                    includeParagraph={includeParagraph}
                    includeSolution={includeSolution}
                    addOptionE={addOptionE}
                    handleSave={handleSave}
                />
            </div>
        );
    }
    
    return null;
}, [
    indexCount,

]);
  return (
    <div className="container">
      <button onClick={toggleSidebar} className="sidebar-toggle">
        ☰ {/* Menu Icon */}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <h3>Type of Question:</h3>
        <button onClick={toggleInstructionsPage} className="instructions-btn">
          {isInstructionsPage ? 'Close Instructions' : 'Instructions'}
        </button>
        <select  onChange={combinedHandler} value={selectedQuestionType}>
          <option value="Mcq">MCQ</option>
          <option value="Msq">MSQ</option>
          <option value="Nit">NIT</option>
          <option value="True">True/False</option>
          <option value="Assertion">Assertion</option>
          <option value="Paragraph">Paragraph</option>
        </select>
        
        <div className="marks-container">
          <label>Marks:</label>
          <input type="number" placeholder="+ve" onChange={handlePositiveChange} />
          <input type="number" placeholder="-ve" onChange={handleNegativeChange} />
        </div>
        <label>
            Total Questions:
          </label>
          <input className='total-questions' value={Questions.length}/>
        <div className="checkbox-group">

          <label>
            <input
              type="checkbox"
              name="solution"
              checked={includeSolution}
              onChange={handleCheckboxChange}
              />{" "}
            Have Solution
          </label>
          <label>
            <input
              type="checkbox"
              name="optionE"
              checked={addOptionE}
              onChange={handleCheckboxChange}
              />{" "}
            Add Option E
          </label>
        </div>
      </div>
      <div className="main-content" >
        
        {isInstructionsPage ? (
          <Instruction />
        ) : (
          <>
            <div>
              
            {Array.from(components).map((component, index) => memoizedRenderComponent(component, index))}
            

            </div>
            <button
              style={{ display: "block" }}
              onClick={addQuestion}
              className="save-button mcq-container"
            >
              Add Question
            </button>
            { Questions.length > 0 && (
              <div>
                 <div>
             <button  style={{ display: "block" }}  className="save-button mcq-container" onClick={handleSave}>Preview</button>
              <PreviewModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                documentContent={documentContent}
                handleEdit={handleEdit}
              />
            </div>
            <button
            style={{ display: "block" }}
            onClick={(data) => handleSave(data)}
            className="save-button mcq-container"
          >
            Save Document
          </button>
              </div>
           
            
            )}
        
            
            
          </>
        )}
      </div>
    </div>
  );
};

export default Management;