import React, { useState } from 'react';
import { UploadCloud, BookOpen, Flame, FileText, ChevronRight, Trash2, GraduationCap } from 'lucide-react';

export default function Dashboard({ documents, setDocuments, setActiveDoc, setActiveTab, handleAddDocument, handleDeleteDocument }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  // Mock document contents based on common subjects to give the user immediate value
  const mockStudyContents = {
    "introduction_to_ai.txt": {
      name: "Introduction to AI & Neural Networks.txt",
      size: "12 KB",
      content: `Artificial Intelligence (AI) is the intelligence exhibited by machines. A subfield of AI is Machine Learning (ML), which focuses on algorithms that learn from data.

Neural Networks are computing systems inspired by the biological neural networks that constitute animal brains. An artificial neural network consists of connected units called artificial neurons (nodes).

Key Concepts:
1. Supervised Learning: The model is trained on labeled training data.
2. Unsupervised Learning: The model searches for patterns in unlabeled data.
3. Deep Learning: Uses multi-layered neural networks (deep networks) to model complex patterns.
4. Backpropagation: The primary algorithm used to train neural networks by calculating gradients of the loss function.
5. Overfitting: When a model learns noise in the training data, leading to poor generalization on new data.`,
      flashcards: [
        { id: 1, question: "What is Supervised Learning?", answer: "A machine learning paradigm where the model is trained on labeled data.", category: "Machine Learning" },
        { id: 2, question: "What is Overfitting?", answer: "When a model learns the training data's noise too well, reducing its accuracy on new, unseen data.", category: "Model Evaluation" },
        { id: 3, question: "What is Deep Learning?", answer: "A subset of ML that uses multi-layer neural networks to extract high-level features from raw data.", category: "Neural Networks" },
        { id: 4, question: "What algorithm trains neural networks?", answer: "Backpropagation, which calculates gradients of the loss function to update weights.", category: "Neural Networks" }
      ],
      quiz: [
        {
          id: 1,
          question: "Which of the following is trained on labeled training data?",
          options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Clustering"],
          answer: "Supervised Learning",
          explanation: "Supervised learning uses input-output pairs (labeled data) to train models."
        },
        {
          id: 2,
          question: "What is a main cause of overfitting in machine learning?",
          options: [
            "Model is too simple",
            "Model is too complex and fits noise in the training data",
            "Not enough training epochs",
            "Using correct regularization parameters"
          ],
          answer: "Model is too complex and fits noise in the training data",
          explanation: "Overfitting happens when a model learns the noise and details of the training set to the point where it negatively impacts performance on new data."
        },
        {
          id: 3,
          question: "Neural networks are computational models loosely inspired by which biological structure?",
          options: ["The circulatory system", "The animal brain", "Plant cells", "DNA chains"],
          answer: "The animal brain",
          explanation: "Artificial Neural Networks are loosely inspired by the interconnected structures of biological neurons in human/animal brains."
        }
      ]
    },
    
    "photosynthesis_basics.pdf": {
      name: "Photosynthesis and Cell Biology.pdf",
      size: "45 KB",
      content: `Photosynthesis is the chemical process by which green plants, algae, and some bacteria convert light energy (usually from the sun) into chemical energy (glucose), using carbon dioxide and water.

The overall chemical equation is:
6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2

Stages of Photosynthesis:
1. Light-Dependent Reactions: Take place in the thylakoid membranes of chloroplasts. Chlorophyll absorbs solar energy and produces ATP and NADPH, releasing oxygen.
2. Light-Independent Reactions (Calvin Cycle): Occurs in the stroma of chloroplasts. Uses ATP and NADPH to convert carbon dioxide into glucose.

Important Structures:
- Chloroplast: The organelle where photosynthesis takes place.
- Chlorophyll: The green pigment that captures light.
- Stomata: Microscopic pores on leaves that regulate gas exchange (CO2 in, O2 and water vapor out).`,
      flashcards: [
        { id: 1, question: "Where do Light-Dependent reactions take place?", answer: "In the thylakoid membranes of chloroplasts.", category: "Plant Biology" },
        { id: 2, question: "What is the primary green pigment in plants?", answer: "Chlorophyll.", category: "Pigments" },
        { id: 3, question: "What are Stomata?", answer: "Microscopic pores on the leaf surface that regulate gas exchange (CO2, O2, water vapor).", category: "Plant Structures" },
        { id: 4, question: "What are the inputs of the Calvin Cycle?", answer: "Carbon dioxide, ATP, and NADPH.", category: "Calvin Cycle" }
      ],
      quiz: [
        {
          id: 1,
          question: "Which organelle is the site of photosynthesis in plant cells?",
          options: ["Mitochondria", "Ribosome", "Chloroplast", "Golgi Apparatus"],
          answer: "Chloroplast",
          explanation: "Chloroplasts contain chlorophyll and the machinery required to convert solar energy into chemical energy."
        },
        {
          id: 2,
          question: "What are the primary outputs of the Light-Dependent reactions?",
          options: ["Glucose and Water", "ATP, NADPH, and Oxygen", "Carbon Dioxide and ATP", "Glucose and Oxygen"],
          answer: "ATP, NADPH, and Oxygen",
          explanation: "During light-dependent reactions, water is split, producing oxygen gas, while solar energy is captured to form chemical energy carriers ATP and NADPH."
        },
        {
          id: 3,
          question: "In what part of the chloroplast does the Calvin Cycle occur?",
          options: ["Thylakoid Membrane", "Stroma", "Outer Membrane", "Lumen"],
          answer: "Stroma",
          explanation: "The light-independent reactions (Calvin Cycle) happen in the fluid stroma surrounding the thylakoid stacks."
        }
      ]
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const textContent = e.target.result || "";
      const fileSizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      const fileName = file.name.toLowerCase();

      let fileInfo;
      // Default fallback mock contents if they upload random files
      if (fileName.includes("ai") || fileName.includes("neural") || fileName.includes("learn")) {
        fileInfo = mockStudyContents["introduction_to_ai.txt"];
      } else if (fileName.includes("photo") || fileName.includes("plant") || fileName.includes("bio") || fileName.includes("cell")) {
        fileInfo = mockStudyContents["photosynthesis_basics.pdf"];
      } else {
        fileInfo = {
          name: file.name,
          size: fileSizeStr,
          content: textContent || `Uploaded file: ${file.name}. Content parsed successfully.`,
          flashcards: [
            { id: 1, question: `What is the main topic of ${file.name}?`, answer: "The user-uploaded document content.", category: "General" },
            { id: 2, question: "How can I study this document?", answer: "Use LearnFlow's AI chat, interactive flashcards, or self-scoring quizzes.", category: "Navigation" }
          ],
          quiz: [
            {
              id: 1,
              question: `What file was successfully uploaded to LearnFlow in this session?`,
              options: [file.name, "An empty text template", "A database backup", "System configuration"],
              answer: file.name,
              explanation: "The active document name matches the file you uploaded."
            },
            {
              id: 2,
              question: "Which feature of LearnFlow helps test your active knowledge retention?",
              options: ["Profile Settings", "Quiz Mode", "File Storage Size", "Account Upgrade Link"],
              answer: "Quiz Mode",
              explanation: "Quiz Mode tests your understanding of concepts using interactive multiple-choice questions."
            }
          ]
        };
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && textContent.trim().length > 10) {
        try {
          const prompt = `You are a study helper. Parse the following document text and output a JSON object containing:
1. "summary": A brief 3-4 sentence summary of the key takeaways.
2. "flashcards": An array of 4 objects, each with "id" (number), "question" (string), "answer" (string), and "category" (string).
3. "quiz": An array of 3 objects, each with "id" (number), "question" (string), "options" (array of 4 strings), "answer" (string matching exactly one of the options), and "explanation" (string).

Output ONLY valid JSON. No markdown formatting block, no other text.

Document Content:
---
${textContent.slice(0, 5000)}
---`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });

          if (response.ok) {
            const resData = await response.json();
            const rawJsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const cleanedJson = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedJson);
            
            if (parsed.flashcards && parsed.quiz) {
              fileInfo.content = parsed.summary || fileInfo.content;
              fileInfo.flashcards = parsed.flashcards;
              fileInfo.quiz = parsed.quiz;
            }
          }
        } catch (err) {
          console.error("Gemini failed to generate study materials, using default mock:", err);
        }
      }

      const newDoc = {
        name: fileInfo.name || file.name,
        size: fileInfo.size || fileSizeStr,
        content: fileInfo.content,
        flashcards: fileInfo.flashcards,
        quiz: fileInfo.quiz
      };

      if (handleAddDocument) {
        handleAddDocument(newDoc);
      } else {
        const localDoc = {
          id: Date.now(),
          ...newDoc,
          uploadedAt: new Date().toLocaleDateString()
        };
        setDocuments([localDoc, ...documents]);
      }
    };

    reader.readAsText(file);
  };

  const deleteDocument = (id, e) => {
    e.stopPropagation();
    if (handleDeleteDocument) {
      handleDeleteDocument(id);
    } else {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const startStudying = (doc, tab) => {
    setActiveDoc(doc);
    setActiveTab(tab);
  };

  // Add default demo materials if document list is completely empty
  const loadDemoMaterials = () => {
    const docs = [
      {
        name: "Introduction to AI & Neural Networks.txt",
        size: "12 KB",
        content: mockStudyContents["introduction_to_ai.txt"].content,
        flashcards: mockStudyContents["introduction_to_ai.txt"].flashcards,
        quiz: mockStudyContents["introduction_to_ai.txt"].quiz
      },
      {
        name: "Photosynthesis and Cell Biology.pdf",
        size: "45 KB",
        content: mockStudyContents["photosynthesis_basics.pdf"].content,
        flashcards: mockStudyContents["photosynthesis_basics.pdf"].flashcards,
        quiz: mockStudyContents["photosynthesis_basics.pdf"].quiz
      }
    ];

    if (handleAddDocument) {
      docs.forEach(doc => handleAddDocument(doc));
    } else {
      const localDocs = docs.map((doc, idx) => ({
        id: idx + 1,
        ...doc,
        uploadedAt: "Today"
      }));
      setDocuments(localDocs);
    }
  };

  return (
    <div>
      <div className="header-row">
        <div>
          <h1>Welcome back, Scholar</h1>
          <p className="header-desc">Upload study materials to generate instant AI learning aids.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadDemoMaterials} style={{ display: documents.length === 0 ? 'inline-flex' : 'none' }}>
          Load Sample Materials
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <p>Documents</p>
            <h3>{documents.length}</h3>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon orange">
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <p>Study Streak</p>
            <h3>5 Days</h3>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon purple">
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <p>Mastered Cards</p>
            <h3>14 / 20</h3>
          </div>
        </div>
      </div>

      {/* File Upload Box */}
      <div 
        className={`glass-panel upload-container ${isDragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="upload-input" 
          onChange={handleFileInput}
          accept=".txt,.pdf,.doc,.docx"
        />
        <div className="upload-icon">
          <UploadCloud size={32} />
        </div>
        <h3>Upload Study Material</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Drag & drop your PDF, TXT, or DOCX files here, or click to browse
        </p>
        <span className="badge badge-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          AI Processing Ready
        </span>
      </div>

      {/* Uploaded Documents List */}
      <div className="glass-panel">
        <h3 className="doc-section-title">
          <FileText size={20} className="doc-icon" />
          My Materials
        </h3>
        
        {documents.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} className="empty-state-icon" />
            <h3>No study materials uploaded</h3>
            <p>Upload a file above, or click "Load Sample Materials" to get started instantly with sample AI flashcards and quizzes.</p>
            <button className="btn btn-primary" onClick={loadDemoMaterials}>
              Load Sample Materials
            </button>
          </div>
        ) : (
          <div className="doc-list">
            {documents.map((doc) => (
              <div key={doc.id} className="doc-item">
                <div className="doc-info">
                  <FileText size={20} className="doc-icon" />
                  <div>
                    <div className="doc-name">{doc.name}</div>
                    <div className="doc-meta">{doc.size} • Uploaded {doc.uploadedAt}</div>
                  </div>
                </div>
                <div className="doc-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => startStudying(doc, 'chat')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    AI Chat <ChevronRight size={14} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => startStudying(doc, 'cards')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Flashcards <ChevronRight size={14} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => startStudying(doc, 'quiz')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    Quiz <ChevronRight size={14} />
                  </button>
                  <button className="action-btn delete" onClick={(e) => deleteDocument(doc.id, e)} title="Delete Document">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
