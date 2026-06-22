import React, { useState } from 'react';
import { HelpCircle, Award, RefreshCw, ChevronRight, Check, X } from 'lucide-react';

export default function Quiz({ activeDoc }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  if (!activeDoc) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No active document</h3>
        <p>Please return to the Dashboard and click "Quiz" on any study material to start a self-assessment.</p>
      </div>
    );
  }

  const questions = activeDoc.quiz || [];

  if (questions.length === 0) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No Quiz Available</h3>
        <p>This document doesn't have quiz questions generated. Try uploading another text file or choosing a sample document.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;

  const handleOptionClick = (option) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || isSubmitted) return;
    
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const passed = score >= questions.length / 2;
    return (
      <div className="glass-panel quiz-wrapper" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: passed ? 'var(--color-success)' : 'var(--color-error)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem',
          border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          <Award size={40} />
        </div>
        
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quiz Completed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {passed ? "Excellent job! You have a solid grasp of this material." : "Keep studying! Review the document and try again."}
        </p>

        <div style={{ display: 'inline-flex', gap: '3rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem 3rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Score</p>
            <h3 style={{ fontSize: '2.25rem', color: passed ? 'var(--color-success)' : 'var(--color-primary)' }}>{score} / {questions.length}</h3>
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</p>
            <h3 style={{ fontSize: '2.25rem' }}>{Math.round((score / questions.length) * 100)}%</h3>
          </div>
        </div>

        <div>
          <button className="btn btn-primary" onClick={restartQuiz} style={{ marginRight: '1rem' }}>
            <RefreshCw size={16} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-wrapper">
      <div className="header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="badge badge-primary">Assessment Mode</span>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>Self-Testing Quiz</h1>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="glass-panel">
        <div className="quiz-meta">
          <span>Source: {activeDoc.name}</span>
          <span>Score: {score}</span>
        </div>

        <h3 className="quiz-question">{currentQuestion.question}</h3>

        <div className="options-list">
          {currentQuestion.options.map((option, idx) => {
            let optionClass = "";
            if (selectedOption === option) {
              optionClass = "selected";
            }
            if (isSubmitted) {
              if (option === currentQuestion.answer) {
                optionClass = "correct";
              } else if (selectedOption === option) {
                optionClass = "incorrect";
              }
            }

            return (
              <button 
                key={idx}
                className={`option-btn ${optionClass}`}
                onClick={() => handleOptionClick(option)}
                disabled={isSubmitted}
              >
                <span>{option}</span>
                {isSubmitted && option === currentQuestion.answer && <Check size={18} style={{ color: 'var(--color-success)' }} />}
                {isSubmitted && selectedOption === option && option !== currentQuestion.answer && <X size={18} style={{ color: 'var(--color-error)' }} />}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert */}
        {isSubmitted && (
          <div className={`feedback-alert ${selectedOption === currentQuestion.answer ? 'correct' : 'incorrect'}`}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              {selectedOption === currentQuestion.answer ? 'Correct Answer!' : 'Incorrect'}
            </h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.95 }}>{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Submit or Next Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!isSubmitted ? (
            <button 
              className="btn btn-primary" 
              onClick={handleAnswerSubmit}
              disabled={selectedOption === null}
              style={{ opacity: selectedOption === null ? 0.6 : 1 }}
            >
              Check Answer
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNextQuestion}>
              {currentQuestionIndex + 1 === questions.length ? 'Show Results' : 'Next Question'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
