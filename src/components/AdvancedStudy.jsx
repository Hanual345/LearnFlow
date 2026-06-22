import React, { useState } from 'react';
import { Brain, Calendar, Compass, Lock, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function AdvancedStudy({ activeDoc, premiumTier, setActiveTab }) {
  const isUnlocked = premiumTier === 'pro' || premiumTier === 'group' || premiumTier === 'institution';
  const [activeSubTab, setActiveSubTab] = useState('syllabus'); // 'syllabus', 'mindmap', 'exam'
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!activeDoc) {
    return (
      <div className="glass-panel empty-state" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Brain size={48} className="empty-state-icon" />
        <h3>No active document</h3>
        <p>Please return to the Dashboard and select a study material to unlock Advanced AI Study Desk options.</p>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!isUnlocked) return;
    setLoading(true);
    setOutput('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setTimeout(() => {
        setLoading(false);
        setOutput(`⚠️ **Gemini API Key missing:** Please ensure VITE_GEMINI_API_KEY is configured in your environmental variables.`);
      }, 1000);
      return;
    }

    let prompt = '';
    if (activeSubTab === 'syllabus') {
      prompt = `Create a 5-day personalized study syllabus/schedule for a student studying this material. Group tasks day-by-day.
Material text:
---
${activeDoc.content.slice(0, 4000)}
---`;
    } else if (activeSubTab === 'mindmap') {
      prompt = `Generate a detailed concept map and outline showing key parent topics and subtopics for this material.
Material text:
---
${activeDoc.content.slice(0, 4000)}
---`;
    } else if (activeSubTab === 'exam') {
      prompt = `Generate a mock exam sheet for this material containing 3 conceptual long-answer questions. Include a detailed answer key underneath each question.
Material text:
---
${activeDoc.content.slice(0, 4000)}
---`;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
      const resData = await response.json();
      const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setOutput(reply);
    } catch (err) {
      console.error(err);
      setOutput(`⚠️ **Generation Failed:** ${err.message}. Please retry.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-primary">Advanced Desk</span>
            {isUnlocked ? (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                🔓 Unlocked for {premiumTier.toUpperCase()}
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700 }}>
                🔒 Locked (Requires Scholar Pro+)
              </span>
            )}
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>AI Advanced Study Desk</h1>
        </div>
      </div>

      {!isUnlocked ? (
        // Premium Locked Screen
        <div className="glass-panel" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: 'linear-gradient(rgba(17, 24, 39, 0.95), rgba(17, 24, 39, 0.95))',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          boxShadow: '0 0 50px rgba(168, 85, 247, 0.05)',
          borderRadius: '16px'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(168, 85, 247, 0.15)',
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Premium Study Tools Locked</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Advanced tools such as **Personalized Syllabus Planners**, **Concept Mind Maps**, and **AI Mock Long-Answer Exams** are exclusive to **Scholar Pro** and **Study Group** members.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => setActiveTab('pricing')}
            style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', gap: '0.5rem' }}
          >
            Upgrade Account Now <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        // Unlocked Advanced Tools Workspace
        <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
          
          {/* Sub-tab Selection */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveSubTab('syllabus'); setOutput(''); }}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: activeSubTab === 'syllabus' ? '#0963FF' : 'var(--border-color)',
                background: activeSubTab === 'syllabus' ? 'rgba(9, 99, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                color: activeSubTab === 'syllabus' ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Calendar size={20} style={{ color: activeSubTab === 'syllabus' ? '#3b82f6' : '#9ca3af' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'white' }}>Syllabus Planner</div>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>Day-by-day study tasks</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveSubTab('mindmap'); setOutput(''); }}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: activeSubTab === 'mindmap' ? '#0963FF' : 'var(--border-color)',
                background: activeSubTab === 'mindmap' ? 'rgba(9, 99, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                color: activeSubTab === 'mindmap' ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Compass size={20} style={{ color: activeSubTab === 'mindmap' ? '#3b82f6' : '#9ca3af' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'white' }}>Concept Mind Map</div>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>Structural outlines & nodes</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveSubTab('exam'); setOutput(''); }}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: activeSubTab === 'exam' ? '#0963FF' : 'var(--border-color)',
                background: activeSubTab === 'exam' ? 'rgba(9, 99, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                color: activeSubTab === 'exam' ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Brain size={20} style={{ color: activeSubTab === 'exam' ? '#3b82f6' : '#9ca3af' }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: 'white' }}>AI Mock Exam</div>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>Long answers & keys</span>
              </div>
            </button>
          </div>

          {/* Action Trigger Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  {activeSubTab === 'syllabus' ? 'Generate 5-Day Study Syllabus' : 
                   activeSubTab === 'mindmap' ? 'Generate Concept Structure Map' : 
                   'Generate Conceptual Mock Exam'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', margin: 0 }}>
                  Active context: **{activeDoc.name}**
                </p>
              </div>
              <button 
                onClick={handleGenerate} 
                className="btn btn-primary" 
                disabled={loading}
                style={{ padding: '0.65rem 1.5rem', gap: '0.4rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Desk
                  </>
                )}
              </button>
            </div>

            {/* Response Output console */}
            {(output || loading) && (
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1.5rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'white',
                minHeight: '200px',
                whiteSpace: 'pre-line',
                overflowY: 'auto'
              }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', gap: '1rem', color: '#9ca3af' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: '#3b82f6' }} />
                    <span>Gemini 2.5 Flash is analyzing text and organizing structure...</span>
                  </div>
                ) : (
                  output
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
