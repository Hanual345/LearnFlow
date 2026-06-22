import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, Check, CheckCircle2 } from 'lucide-react';

export default function Flashcards({ activeDoc }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});

  if (!activeDoc) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No active document</h3>
        <p>Please return to the Dashboard and click "Flashcards" on any study material to view study cards.</p>
      </div>
    );
  }

  const cards = activeDoc.flashcards || [];

  if (cards.length === 0) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No Flashcards Available</h3>
        <p>This document doesn't have study flashcards yet. Try uploading a text file or choosing a sample document.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMastered = masteredCards[currentCard.id] || false;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleMastered = (e) => {
    e.stopPropagation(); // Avoid flipping when clicking button
    setMasteredCards(prev => ({
      ...prev,
      [currentCard.id]: !isMastered
    }));
  };

  const resetAllCards = () => {
    setMasteredCards({});
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const totalMastered = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-primary">Active Learning</span>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>Flippable Study Cards</h1>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Score: {totalMastered} / {cards.length} Mastered
        </div>
      </div>

      <div className="flashcards-layout">
        {/* Flippable Card Container */}
        <div 
          className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="flashcard-inner">
            {/* Front Side */}
            <div className="flashcard-front">
              <span className="card-category">{currentCard.category || "General"}</span>
              {isMastered && (
                <div className="mastered-badge">
                  <CheckCircle2 size={14} /> Mastered
                </div>
              )}
              <div className="card-text">{currentCard.question}</div>
              <span className="flip-hint">Click Card to Reveal Answer</span>
            </div>

            {/* Back Side */}
            <div className="flashcard-back">
              <span className="card-category">{currentCard.category || "Answer"}</span>
              <div className="card-text" style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                {currentCard.answer}
              </div>
              <button 
                className={`btn btn-sm ${isMastered ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '0.4rem 1rem', 
                  fontSize: '0.85rem',
                  borderColor: isMastered ? 'transparent' : 'var(--color-success)',
                  color: isMastered ? 'white' : '#34d399'
                }}
                onClick={toggleMastered}
              >
                {isMastered ? <Check size={14} /> : null}
                {isMastered ? 'Mastered!' : 'Mark as Mastered'}
              </button>
              <span className="flip-hint" style={{ marginTop: 'auto' }}>Click to Show Question</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flashcard-controls">
          <button className="btn btn-secondary" onClick={handlePrev} style={{ padding: '0.75rem' }}>
            <ArrowLeft size={18} />
          </button>
          
          <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Card {currentIndex + 1} of {cards.length}
          </span>

          <button className="btn btn-secondary" onClick={handleNext} style={{ padding: '0.75rem' }}>
            <ArrowRight size={18} />
          </button>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={resetAllCards} 
          style={{ marginTop: '2rem', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={14} /> Reset Session
        </button>
      </div>
    </div>
  );
}
