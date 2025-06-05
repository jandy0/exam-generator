import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiPlus, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState("Sample Exam");
  const [questions, setQuestions] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const pdfContentRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      question: "",
      points: 1,
      options: type === 'multiple' ? ['', '', '', ''] : [],
      correctAnswer: type === 'true-false' ? 'true' : '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, updatedQuestion) => {
    setQuestions(questions.map(q => q.id === id ? updatedQuestion : q));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const downloadPDF = async () => {
    try {
      // Create a temporary div for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.padding = '20px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.color = 'black';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';

      // Add exam title and metadata
      const titleSection = document.createElement('div');
      titleSection.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 10px; text-align: center;">${examTitle}</h1>
        <div style="margin-bottom: 20px; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Name: ________________________________</p>
          <p>Total Questions: ${questions.length}</p>
          <p>Total Points: ${questions.reduce((sum, q) => sum + (q.points || 0), 0)}</p>
        </div>
        <div style="margin-bottom: 10px; font-size: 14px;">
          <p>Instructions: Answer all questions. Write your answers clearly and legibly.</p>
        </div>
      `;
      pdfContainer.appendChild(titleSection);

      // Add questions
      questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.style.marginBottom = '20px';
        
        let questionContent = `
          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; margin-bottom: 8px;">
              ${index + 1}. ${question.question} (${question.points} ${question.points === 1 ? 'point' : 'points'})
            </p>
        `;

        if (question.type === 'multiple') {
          questionContent += `<div style="margin-left: 20px;">`;
          question.options.forEach((option, i) => {
            questionContent += `
              <div style="margin-top: 5px;">
                ○ ${String.fromCharCode(65 + i)}. ${option}
              </div>
            `;
          });
          questionContent += `</div>`;
        } else if (question.type === 'true-false') {
          questionContent += `
            <div style="margin-left: 20px;">
              ○ True
              <br>
              ○ False
            </div>
          `;
        } else if (question.type === 'identification') {
          questionContent += `
            <div style="margin-left: 20px; margin-top: 10px;">
              Answer: _________________________________
            </div>
          `;
        }

        questionContent += '</div>';
        questionDiv.innerHTML = questionContent;
        pdfContainer.appendChild(questionDiv);
      });

      // Temporarily add to document for conversion
      document.body.appendChild(pdfContainer);

      // Convert to PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert HTML to canvas
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(pdfContainer);

      // Calculate dimensions
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pdfHeight;
      
      // Add subsequent pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
      }

      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
      pdf.save(`${examTitle.replace(/\s+/g, '_')}_${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-white">Exam Generator</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800 rounded-lg">
                <FiUser className="text-gray-400" />
                <span className="text-gray-300 text-sm">{currentUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-400 bg-red-900/20 hover:bg-red-900/40 rounded-lg transition-colors"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Title */}
        <div className="mb-8">
          {isEditingTitle ? (
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              className="text-3xl font-bold bg-transparent text-white border-b-2 border-indigo-500 focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <h2 className="text-3xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                {examTitle}
              </h2>
              <FiEdit2 className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => addQuestion('multiple')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Multiple Choice</span>
          </button>
          <button
            onClick={() => addQuestion('true-false')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FiPlus />
            <span>True/False</span>
          </button>
          <button
            onClick={() => addQuestion('identification')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Identification</span>
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors ml-auto"
          >
            <FiDownload />
            <span>Export PDF</span>
          </button>
        </div>

        {/* Questions List */}
        <div ref={pdfContentRef} className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
              <p className="text-gray-400">No questions added yet. Click one of the buttons above to add a question.</p>
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function QuestionCard({ question, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);

  const handleSave = () => {
    onUpdate(question.id, editedQuestion);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {isEditing ? (
        <div className="p-6 space-y-4">
          <input
            type="text"
            value={editedQuestion.question}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            placeholder="Enter your question"
          />
          
          {question.type === 'multiple' && (
            <div className="space-y-3">
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditedQuestion({ ...editedQuestion, options: newOptions });
                    }}
                    className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                    placeholder={`Option ${['A', 'B', 'C', 'D'][index]}`}
                  />
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      checked={editedQuestion.correctAnswer === option}
                      onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: option })}
                      className="text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                    />
                    <span>Correct</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {question.type === 'true-false' && (
            <div className="flex space-x-4">
              {['true', 'false'].map((value) => (
                <label key={value} className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="radio"
                    name={`tf-${question.id}`}
                    value={value}
                    checked={editedQuestion.correctAnswer === value}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                    className="text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                  />
                  <span className="capitalize">{value}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'identification' && (
            <input
              type="text"
              value={editedQuestion.correctAnswer || ''}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              placeholder="Correct answer"
            />
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={editedQuestion.points}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) || 1 })}
                className="w-20 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                min="1"
              />
              <span className="text-gray-400">points</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedQuestion(question); // Reset to original
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{question.question || 'New Question'}</h3>
              <p className="text-sm text-gray-400">
                {question.type === 'multiple' ? 'Multiple Choice' : 
                 question.type === 'true-false' ? 'True/False' : 'Identification'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiEdit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
              >
                <FiTrash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
          
          {question.type === 'multiple' && question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1 text-gray-300">
              <span className="font-semibold">{['A', 'B', 'C', 'D'][index]}.</span>
              <span>{option}</span>
              {option === question.correctAnswer && (
                <span className="text-green-400 text-sm">(Correct)</span>
              )}
            </div>
          ))}

          {question.type === 'true-false' && (
            <p className="text-gray-300">
              Correct Answer: <span className="text-green-400">{question.correctAnswer}</span>
            </p>
          )}

          {question.type === 'identification' && (
            <p className="text-gray-300">
              Correct Answer: <span className="text-green-400">{question.correctAnswer}</span>
            </p>
          )}

          <p className="text-sm text-gray-400 mt-2">Points: {question.points}</p>
        </div>
      )}
    </div>
  );
}