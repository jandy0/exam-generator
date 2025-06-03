import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState("Sample Exam");
  const [questions, setQuestions] = useState([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

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

  const downloadPDF = () => {
    // PDF generation logic will be implemented later
    console.log("Generating PDF...");
  };
  
   if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Exam Generator</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiUser className="text-gray-600" />
              <span className="text-gray-600">{currentUser.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Title */}
        <div className="mb-6">
          {isEditingTitle ? (
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              className="text-3xl font-bold border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              className="text-3xl font-bold cursor-pointer hover:text-blue-600"
              onClick={() => setIsEditingTitle(true)}
            >
              {examTitle}
            </h2>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => addQuestion('multiple')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Multiple Choice
          </button>
          <button
            onClick={() => addQuestion('true-false')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add True/False
          </button>
          <button
            onClick={() => addQuestion('identification')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Identification
          </button>
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-auto"
          >
            Download PDF
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onUpdate={updateQuestion}
              onDelete={deleteQuestion}
            />
          ))}
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
    <div className="bg-white rounded-lg shadow p-6">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editedQuestion.question}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Enter your question"
          />
          
          {question.type === 'multiple' && (
            <div className="space-y-2">
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options];
                      newOptions[index] = e.target.value;
                      setEditedQuestion({ ...editedQuestion, options: newOptions });
                    }}
                    className="flex-1 p-2 border rounded"
                    placeholder={`Option ${['A', 'B', 'C', 'D'][index]}`}
                  />
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={editedQuestion.correctAnswer === option}
                    onChange={() => setEditedQuestion({ ...editedQuestion, correctAnswer: option })}
                  />
                </div>
              ))}
            </div>
          )}

          {question.type === 'true-false' && (
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  value="true"
                  checked={editedQuestion.correctAnswer === 'true'}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                />
                <span>True</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`tf-${question.id}`}
                  value="false"
                  checked={editedQuestion.correctAnswer === 'false'}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                />
                <span>False</span>
              </label>
            </div>
          )}

          {question.type === 'identification' && (
            <input
              type="text"
              value={editedQuestion.correctAnswer}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Correct answer"
            />
          )}

          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={editedQuestion.points}
              onChange={(e) => setEditedQuestion({ ...editedQuestion, points: parseInt(e.target.value) })}
              className="w-20 p-2 border rounded"
              min="1"
            />
            <span>points</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{question.question || 'New Question'}</h3>
              <p className="text-sm text-gray-500">
                {question.type === 'multiple' ? 'Multiple Choice' : 
                 question.type === 'true-false' ? 'True/False' : 'Identification'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
          
          {question.type === 'multiple' && question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <span className="font-semibold">{['A', 'B', 'C', 'D'][index]}.</span>
              <span>{option}</span>
              {option === question.correctAnswer && (
                <span className="text-green-600 text-sm">(Correct)</span>
              )}
            </div>
          ))}

          {question.type === 'true-false' && (
            <p>Correct Answer: {question.correctAnswer}</p>
          )}

          {question.type === 'identification' && (
            <p>Correct Answer: {question.correctAnswer}</p>
          )}

          <p className="text-sm text-gray-600 mt-2">Points: {question.points}</p>
        </div>
      )}
    </div>
  );
}