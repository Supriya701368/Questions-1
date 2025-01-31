import React, { useState, useContext,useEffect,useCallback } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
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
  const [showParagraph, setShowParagraph] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [documentContent, setDocumentContent] = useState([]);
 
  
  const {
    mcqQuestions, setMcqQuestions,
    msqQuestions, setMsqQuestions,
    nitQuestions, setNitQuestions,
    trueQuestions, setTrueQuestions,
    assertionQuestions, setAssertionQuestions,
    Questions, setQuestions,
    positiveMarks, negativeMarks, setPositiveMarks, setNegativeMarks,
    selectedQuestionType, setSelectedQuestionType,
    addOptionE, setAddOptionE, Paragraphs,indexCount,incrementCounter
  } = useContext(QuestionsContext);
  const [isInstructionsPage, setIsInstructionsPage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [includeParagraph, setIncludeParagraph] = useState(false);
  const [includeSolution, setIncludeSolution] = useState(true);
  const[components,setComponents]=useState([]);
  const toggleInstructionsPage = () => {
    setIsInstructionsPage(!isInstructionsPage);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };
  const addComponent = (type) => {
    if (!components.includes(type)) {
      setComponents((prev) => [...prev, type]);
    }
  }; 
  const handlePositiveChange = (e) => {
    setPositiveMarks(e.target.value);
  };

  const handleNegativeChange = (e) => {
    setNegativeMarks(e.target.value);
  };

  const handleQuestionClick = (e) => {
    setSelectedQuestionType(e.target.value);
    console.log(Questions)
    console.log(Paragraphs)
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "paragraph") {
      if (checked) {
        setHasParagraphAdded(true);
        setShowParagraph(true);
      } else {
        setHasParagraphAdded(false);
        setShowParagraph(false);
      }
    }
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
    }
  };
  
 
  const addQuestion = () => {
    setShowParagraph(false);

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
      hasParagraph: includeParagraph, // Add this property

    };
  
    // Update the specific question type based on the selected type
    if (selectedQuestionType === 'Mcq') {
      setMcqQuestions([...mcqQuestions, newQuestion]);
    } else if (selectedQuestionType === 'Msq') {
      setMsqQuestions([...msqQuestions, newQuestion]);
    } else if (selectedQuestionType === 'Nit') {
      setNitQuestions([...nitQuestions, newQuestion]);
    } else if (selectedQuestionType === 'True') {
      setTrueQuestions([...trueQuestions, newQuestion]);
    } else if (selectedQuestionType === 'Assertion') {
      setAssertionQuestions([...assertionQuestions, newQuestion]);
    }
  
    // Add the new question to the combined Questions array
    setQuestions([
      ...mcqQuestions,
      ...msqQuestions,
      ...nitQuestions,
      ...trueQuestions,
      ...assertionQuestions,
      newQuestion
    ]);
  
    // Add the new question type to the components state (if needed for UI purposes)
    addComponent(selectedQuestionType); 
  
    incrementCounter();
  
    console.log(Questions);
    console.log({
      mcqQuestions,
      msqQuestions,
      nitQuestions,
      trueQuestions,
      assertionQuestions
    });
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
    let paragraphSortid = 1;
    let questionSortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;
    const maxImageWidth = 700;
    const assertionMaxWidth = 600;
    const assertionMaxHeight = 900;
    const reasonMaxWidth = 600;
    const reasonMaxHeight = 900;
    const maxImageHeight = 700;
    const docSections = [];
    const SPACING_AFTER_QUESTION = 400;
    const SPACING_AFTER_OPTION = 200;
    const SPACING_BEFORE_IMAGE = 100;
   

    const processImageHelper = async (image, maxWidth, maxHeight) => {
        return image ? await processImage(image, maxWidth, maxHeight) : null;
    };

    const processQuestions = async (questions) => {
        const clonedQuestions = JSON.parse(JSON.stringify(questions));
        for (let index = 0; index < clonedQuestions.length; index++) {
            const question = clonedQuestions[index];
            const questionImageTransform = await processImageHelper(question.questionImage, questionMaxWidth, questionMaxHeight);
            const solutionImageTransform = await processImageHelper(question.solutionImage, questionMaxWidth, questionMaxHeight);
            const assertionImageTransform = await processImageHelper(question.assertionImage, assertionMaxWidth, assertionMaxHeight);
            const reasonImageTransform = await processImageHelper(question.reasonImage, reasonMaxWidth, reasonMaxHeight);

            console.log(`Processing question ${index + 1}`);
            console.log(`Assertion Image: ${question.assertionImage}`);
            console.log(`Reason Image: ${question.reasonImage}`);

            const questionTextRun = question.questionImage
                ? new ImageRun({ data: question.questionImage.split(",")[1], transformation: questionImageTransform })
                : new TextRun(question.questionText || "");

            const questionParagraph = new Paragraph({
                children: [
                    new TextRun({ text: `[Q${index + 1}] `, bold: true }), // Embed question number
                    questionTextRun
                ],
                spacing: { after: SPACING_AFTER_QUESTION },
                keepLines: true,
            });

            const optionParagraphs = [];

            if (question.type === 'True') {
                optionParagraphs.push(
                    new Paragraph({
                        children: [new TextRun({ text: "(a)", bold: true }), new TextRun(" True")],
                        spacing: { after: SPACING_AFTER_OPTION },
                        keepLines: true,
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "(b)", bold: true }), new TextRun(" False")],
                        spacing: { after: SPACING_AFTER_OPTION },
                        keepLines: true,
                    })
                );
            } else if (question.options.length > 0 && question.type !== "Nit") {
                for (let i = 0; i < question.options.length; i++) {
                    const option = question.options[i];
                    const label = `(${String.fromCharCode(97 + i)}) `;
                    const optionTransform = await processImageHelper(option.image, optionMaxWidth, optionMaxHeight);

                    optionParagraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: label, bold: true }),
                                option.image
                                    ? new ImageRun({ data: option.image.split(",")[1], transformation: optionTransform })
                                    : new TextRun(option.text),
                            ],
                            spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_OPTION },
                            keepLines: true,
                        })
                    );
                }
            }

            let solutionParagraph = null;
            if (question.options.length > 0 && question.solutionImage) {
                solutionParagraph = new Paragraph({
                    children: [
                        new TextRun({ text: "[soln] ", bold: true }),
                        new ImageRun({ data: question.solutionImage.split(",")[1], transformation: solutionImageTransform }),
                    ],
                    spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_OPTION },
                    keepLines: true,
                });
            }

            let assertionParagraph = null;
            if (question.assertionImage) {
                assertionParagraph = new Paragraph({
                    children: [
                        new TextRun({ text: "[assertion] ", bold: true }),
                        new ImageRun({ data: question.assertionImage.split(",")[1], transformation: assertionImageTransform }),
                    ],
                    spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_OPTION },
                    keepLines: true,
                });
            }

            let reasonParagraph = null;
            if (question.reasonImage) {
                reasonParagraph = new Paragraph({
                    children: [
                        new TextRun({ text: "[reason] ", bold: true }),
                        new ImageRun({ data: question.reasonImage.split(",")[1], transformation: reasonImageTransform }),
                    ],
                    spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_OPTION },
                    keepLines: true,
                });
            }

            const questionSection = {
                children: [
                    questionParagraph,
                    ...optionParagraphs,
                    new Paragraph(`[qtype] ${question.type.toUpperCase()}`, { keepLines: true }),
                    new Paragraph({ text: `[ans] ${question.answer}`, bold: true, keepLines: true }),
                    new Paragraph(`[Marks] [${positiveMarks || 0}, ${negativeMarks || 0}]`, { keepLines: true }),
                    solutionParagraph,
                    assertionParagraph,
                    reasonParagraph,
                    new Paragraph(`[sortid] ${sortid++}`, { keepLines: true }),
                    new Paragraph({ text: "", spacing: { after: SPACING_AFTER_QUESTION }, keepLines: true }),
                ].filter(Boolean),
                properties: { pageBreakBefore: true },
            };

            docSections.push(questionSection);
        }
    };

    await processQuestions(mcqQuestions);
    await processQuestions(msqQuestions);
    await processQuestions(nitQuestions);
    await processQuestions(trueQuestions);
    await processQuestions(assertionQuestions);

    docSections.push({
        children: [new Paragraph({ text: "[QQ]", pageBreakBefore: true })],
        spacing: { after: SPACING_AFTER_QUESTION },
    });

    // Process Paragraphs
    for (let i = 0; i < Paragraphs.length; i++) {
        const paragraph = Paragraphs[i];
        const paragraphImageTransform = await processImageHelper(paragraph.paragraphImage, maxImageWidth, maxImageHeight);
        const paragraphSolutionImageTransform = await processImageHelper(paragraph.paragraphSolutionImage, maxImageWidth, maxImageHeight);
        const paragraphQuestionImageTransform = await processImageHelper(paragraph.paraquestionImage, maxImageWidth, maxImageHeight);

        const questionOptionsParagraphs = [];
        if (paragraph.questionType === "truefalse") {
            questionOptionsParagraphs.push(
                new Paragraph({
                    children: [new TextRun({ text: "(a) True", bold: true })],
                    spacing: { after: SPACING_AFTER_OPTION },
                    keepLines: true,
                }),
                new Paragraph({
                    children: [new TextRun({ text: "(b) False", bold: true })],
                    spacing: { after: SPACING_AFTER_OPTION },
                    keepLines: true,
                })
            );
        } else if (paragraph.questionType !== "nit") {
            for (let j = 0; j < paragraph.paraOptions.length; j++) {
                const option = paragraph.paraOptions[j];
                const optionTransform = await processImageHelper(option.image, maxImageWidth, maxImageHeight);

                questionOptionsParagraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `(${String.fromCharCode(97 + j)}) `, bold: true }),
                            option.image
                                ? new ImageRun({ data: option.image.split(",")[1], transformation: optionTransform })
                                : new TextRun("No image"),
                        ],
                        spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_OPTION },
                        keepLines: true,
                    })
                );
            }
        }

        const paragraphSection = {
            children: [
                new Paragraph({ children: [new TextRun({ text: `[p sortid]: ${paragraphSortid}`, bold: true })], keepLines: true }),
                new Paragraph({ children: [new TextRun({ text: `[qtype]: ${paragraph.questionType}`, bold: true })], keepLines: true }),
                paragraph.paraquestionImage ? new Paragraph({
                    children: [
                        new TextRun({ text: "[pq image]: ", bold: true }),
                        new ImageRun({ data: paragraph.paraquestionImage.split(",")[1], transformation: paragraphQuestionImageTransform }),
                    ],
                    spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_QUESTION },
                    keepLines: true,
                }) : null,
                paragraph.paragraphImage ? new Paragraph({
                  children: [
                      new TextRun({ text: "[p image]: ", bold: true }),
                      new ImageRun({ data: paragraph.paragraphImage.split(",")[1], transformation: paragraphImageTransform }),
                  ],
                  spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_QUESTION },
                  keepLines: true,
              }) : null,
              paragraph.paragraphSolutionImage ? new Paragraph({
                  children: [
                      new TextRun({ text: "[p soln]: ", bold: true }),
                      new ImageRun({ data: paragraph.paragraphSolutionImage.split(",")[1], transformation: paragraphSolutionImageTransform }),
                  ],
                  spacing: { before: SPACING_BEFORE_IMAGE, after: SPACING_AFTER_QUESTION },
                  keepLines: true,
              }) : null,
              new Paragraph({ children: [new TextRun({ text: "[ans] ", bold: true }), new TextRun(paragraph.paraanswers || "No answer provided")], keepLines: true }),
              ...questionOptionsParagraphs,
              new Paragraph(`[sortid] ${questionSortid++}`, { keepLines: true }),
              new Paragraph({ text: "", spacing: { after: SPACING_AFTER_QUESTION }, keepLines: true }),
          ].filter(Boolean),
          properties: { pageBreakBefore: true },
      };

      docSections.push(paragraphSection);
      paragraphSortid++;
  }

  docSections.push({
      children: [new Paragraph({ text: "[QQ]", pageBreakBefore: true })],
      spacing: { after: SPACING_AFTER_QUESTION },
  });

  const doc = new Document({ sections: docSections });

  try {
      const blob = await Packer.toBlob(doc);
      const arrayBuffer = await blob.arrayBuffer();
      setDocumentContent(arrayBuffer);
      setShowModal(true);
  } catch (error) {
      console.error("Error creating the document:", error);
  }
  console.log(Paragraphs)
}; 
  const handleEdit = () => {
    setShowModal(false);
};
const combinedHandler = (e) => {
  const type = e.target.value;
  if (type) {
    setComponents((prev) => [...prev, type]);

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
      {showParagraph && (
  <ParagraphCreation includeSolution={includeSolution} />
)}
        
        
      </div>
    );
  }
  return null;
}, [
  indexCount,
  handlePaste,
  processImage,
  handleOptionPaste,
  handleRemoveImage,
  removeQuestion,
  includeParagraph,
  includeSolution,
  addOptionE,
  handleSave,
  hasParagraphAdded, // Add hasParagraphAdded to the dependency array

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
        {!hasParagraphAdded && (
  <label>
    <input
      type="checkbox"
      name="paragraph"
      checked={hasParagraphAdded}
      onChange={handleCheckboxChange}
    />{" "}
    Have Paragraph
  </label>
)}
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
            {components.map((component, index) => memoizedRenderComponent(component, index))}
            {hasParagraphAdded && ( // Use the hasParagraphAdded state here
          <ParagraphCreation includeSolution={includeSolution} />
        )}
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