import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Copy, HelpCircle, CreditCard, Sparkles, GraduationCap, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import Pricing from './components/Pricing';
import AuthModal from './components/AuthModal';
import PaymentVerificationModal from './components/PaymentVerificationModal';
import AdvancedStudy from './components/AdvancedStudy';
import AdminPanel from './components/AdminPanel';
import { authActions, dbActions } from './firebase';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [premiumTier, setPremiumTier] = useState(() => {
    return localStorage.getItem('learnflow_premium_tier') || 'starter';
  });
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('pushstate-changed'));
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate-changed', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate-changed', handleLocationChange);
    };
  }, []);

  const isPremium = premiumTier !== 'starter';

  const handleOpenCheckout = (plan, discount = 0) => {
    if (!user) {
      setIsAuthOpen(true);
      alert("⚠️ Sign In Required!\n\nPlease register or sign in to your Scholar Account to complete your upgrade purchase.");
      return;
    }

    let paymentLink = '';
    if (plan.name === 'Scholar Pro') {
      paymentLink = 'https://rzp.io/rzp/9dbO1mp';
    } else if (plan.name === 'Study Group') {
      paymentLink = 'https://rzp.io/rzp/LtW11Bja';
    } else if (plan.name === 'Tutoring Center') {
      paymentLink = 'https://rzp.io/rzp/B2q34HD';
    }
    
    if (paymentLink) {
      window.open(paymentLink, '_blank');
      if (discount === 50) {
        const origNum = parseInt(plan.price.replace('₹', '').replace(',', ''));
        setSelectedPlan({ ...plan, price: `₹${origNum / 2}`, name: `${plan.name} (50% Off)` });
      } else {
        setSelectedPlan(plan);
      }
      setIsVerifyOpen(true);
    }
  };

  const handleVerifySuccess = (plan) => {
    let tier = 'starter';
    if (plan.name.startsWith('Scholar Pro')) {
      tier = 'pro';
    } else if (plan.name.startsWith('Study Group')) {
      tier = 'group';
    } else if (plan.name.startsWith('Tutoring Center')) {
      tier = 'institution';
    }
    setPremiumTier(tier);
    localStorage.setItem('learnflow_premium_tier', tier);
    alert(`Success! Your account has been verified and upgraded to ${plan.name}!`);
  };

  // Monitor Firebase Auth State changes
  useEffect(() => {
    const unsubscribe = authActions.onStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const customTier = localStorage.getItem(`learnflow_tier_${currentUser.email.toLowerCase()}`);
        if (customTier) {
          setPremiumTier(customTier);
          localStorage.setItem('learnflow_premium_tier', customTier);
        } else {
          // Sync with local tier or default
          const currentLocal = localStorage.getItem('learnflow_premium_tier') || 'starter';
          setPremiumTier(currentLocal);
        }
      } else {
        setPremiumTier('starter');
        localStorage.setItem('learnflow_premium_tier', 'starter');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Firebase redirect login outcomes on mount
  useEffect(() => {
    if (authActions.getRedirectResult) {
      authActions.getRedirectResult()
        .then((result) => {
          if (result && result.user) {
            console.log("🔥 Redirect Sign In Success:", result.user);
            setUser(result.user);
          }
        })
        .catch((error) => {
          console.error("⚠️ Redirect Sign In Error:", error);
          alert(`Google Sign-In Error: ${error.message}`);
        });
    }
  }, []);

  // Fetch documents from Firestore when user changes
  useEffect(() => {
    if (user) {
      dbActions.fetchUserDocs(user.uid).then(docs => {
        setDocuments(docs);
      });
    } else {
      // Clear documents when logged out
      setDocuments([]);
      setActiveDoc(null);
    }
  }, [user]);

  const handleAddDocument = async (newDocData) => {
    // Enforce flat document count limits based on tier
    if (premiumTier === 'starter' && documents.length >= 3) {
      alert("⚠️ Document Limit Reached!\n\nFree tier accounts are limited to a maximum of 3 documents. Upgrade to Scholar Pro for more uploads!");
      setActiveTab('pricing');
      return;
    } else if (premiumTier === 'pro' && documents.length >= 30) {
      alert("⚠️ Scholar Pro Limit Reached!\n\nScholar Pro tier accounts are limited to a maximum of 30 documents. Please upgrade to a higher group plan for unlimited uploads!");
      setActiveTab('pricing');
      return;
    }

    if (user) {
      // Save to Firestore
      try {
        const savedDoc = await dbActions.saveDoc(user.uid, newDocData);
        setDocuments(prev => [savedDoc, ...prev]);
      } catch (err) {
        console.error("Error saving document:", err);
      }
    } else {
      // Save locally (temporary state)
      const localDoc = {
        ...newDocData,
        id: Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        uploadedAt: new Date().toLocaleDateString()
      };
      setDocuments(prev => [localDoc, ...prev]);
      alert("Document uploaded in Sandbox session. Sign in to save your documents permanently in the cloud!");
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (user) {
      try {
        await dbActions.deleteDoc(docId);
        setDocuments(prev => prev.filter(d => d.id !== docId));
        if (activeDoc && activeDoc.id === docId) {
          setActiveDoc(null);
        }
      } catch (err) {
        console.error("Error deleting document:", err);
      }
    } else {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (activeDoc && activeDoc.id === docId) {
        setActiveDoc(null);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await authActions.signOutUser();
      localStorage.removeItem("learnflow_mock_user");
      window.dispatchEvent(new Event('mock-auth-change'));
      setPremiumTier('starter');
      localStorage.removeItem('learnflow_premium_tier');
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            documents={documents} 
            setDocuments={setDocuments} 
            setActiveDoc={setActiveDoc} 
            setActiveTab={setActiveTab}
            // Override with Firestore helper methods
            handleAddDocument={handleAddDocument}
            handleDeleteDocument={handleDeleteDocument}
          />
        );
      case 'chat':
        return <AIChat activeDoc={activeDoc} />;
      case 'cards':
        return <Flashcards activeDoc={activeDoc} />;
      case 'quiz':
        return <Quiz activeDoc={activeDoc} />;
      case 'pricing':
        return (
          <Pricing 
            onUpgrade={handleOpenCheckout} 
            premiumTier={premiumTier} 
            onRedeemCode={(tier) => {
              setPremiumTier(tier);
              localStorage.setItem('learnflow_premium_tier', tier);
              if (user) {
                localStorage.setItem(`learnflow_tier_${user.email.toLowerCase()}`, tier);
              }
            }} 
          />
        );
      case 'admin':
        return <AdminPanel />;
      case 'advanced':
        return <AdvancedStudy activeDoc={activeDoc} premiumTier={premiumTier} setActiveTab={setActiveTab} />;
      default:
        return (
          <Dashboard 
            documents={documents} 
            setDocuments={setDocuments} 
            setActiveDoc={setActiveDoc} 
            setActiveTab={setActiveTab} 
          />
        );
    }
  };

  if (currentPath === '/admin') {
    const isAdmin = user && user.email.toLowerCase() === 'hanualjoshua@gmail.com';
    
    if (isAdmin) {
      return (
        <div className="admin-portal-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <GraduationCap size={36} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>LearnFlow AI Admin Portal</h1>
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Logged in as: {user.email}</span>
              </div>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigateTo('/')}
              style={{ padding: '0.65rem 1.25rem', gap: '0.5rem' }}
            >
              Return to Study Desk
            </button>
          </header>
          <main style={{ flex: 1 }}>
            <AdminPanel />
          </main>
        </div>
      );
    }

    return (
      <AdminLoginForm 
        user={user} 
        authActions={authActions} 
        navigateTo={navigateTo} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Background Ambient Glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <GraduationCap size={32} style={{ color: 'var(--color-primary)' }} />
            <span className="logo-text">LearnFlow <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)' }}>AI</span></span>
          </div>

          <nav>
            <ul className="nav-links">
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('dashboard'); }}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('chat'); }}
                >
                  <MessageSquare size={18} />
                  AI Chat
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'cards' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('cards'); }}
                >
                  <Copy size={18} />
                  Flashcards
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('quiz'); }}
                >
                  <HelpCircle size={18} />
                  Practice Quiz
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('advanced'); }}
                  style={{ color: currentPath !== '/admin' && activeTab === 'advanced' ? '' : 'var(--color-secondary)', fontWeight: 600 }}
                >
                  <Sparkles size={18} style={{ color: currentPath !== '/admin' && activeTab === 'advanced' ? '' : 'var(--color-secondary)' }} />
                  Advanced Study
                </button>
              </li>
              {user && user.email.toLowerCase() === 'hanualjoshua@gmail.com' && (
                <li>
                  <button 
                    className={`nav-button ${currentPath === '/admin' ? 'active' : ''}`}
                    onClick={() => navigateTo('/admin')}
                    style={{ color: currentPath === '/admin' ? '' : '#34d399', fontWeight: 600 }}
                  >
                    <ShieldCheck size={18} style={{ color: currentPath === '/admin' ? '' : '#34d399' }} />
                    Admin Panel
                  </button>
                </li>
              )}
              <li>
                <button 
                  className={`nav-button ${currentPath !== '/admin' && activeTab === 'pricing' ? 'active' : ''}`}
                  onClick={() => { navigateTo('/'); setActiveTab('pricing'); }}
                  style={{ border: currentPath !== '/admin' && activeTab === 'pricing' ? '' : '1px dashed rgba(168, 85, 247, 0.3)' }}
                >
                  <CreditCard size={18} style={{ color: currentPath !== '/admin' && activeTab === 'pricing' ? '' : 'var(--color-secondary)' }} />
                  Pricing
                  {currentPath !== '/admin' && activeTab !== 'pricing' && !isPremium && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--color-secondary)', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>
                      UPGRADE
                    </span>
                  )}
                  {currentPath !== '/admin' && activeTab !== 'pricing' && isPremium && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.1rem 0.35rem', borderRadius: '4px', marginLeft: 'auto', fontWeight: 700 }}>
                      ACTIVE
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div className="profile-card" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="profile-avatar">{user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}</div>
                <div className="profile-info">
                  <h4>{user.displayName || 'Scholar User'}</h4>
                  <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px', color: isPremium ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                    {premiumTier === 'pro' ? '★ Scholar Pro' : 
                     premiumTier === 'group' ? '★ Study Group' : 
                     premiumTier === 'institution' ? '★ Tutor Center' : 'Starter Free'}
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', gap: '0.4rem', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}
                onClick={handleSignOut}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          ) : (
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', gap: '0.5rem' }}
                onClick={() => setIsAuthOpen(true)}
              >
                <LogIn size={16} /> Sign In
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Study Desk Area */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal 
        isOpen={isVerifyOpen} 
        onClose={() => setIsVerifyOpen(false)} 
        plan={selectedPlan} 
        onVerifySuccess={handleVerifySuccess} 
      />
    </div>
  );
}

function AdminLoginForm({ user, authActions, navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authActions.signIn(email, password);
      window.dispatchEvent(new Event('mock-auth-change'));
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await authActions.signInWithGoogle();
      window.dispatchEvent(new Event('mock-auth-change'));
    } catch (err) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative'
    }}>
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: '0 0 50px rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            marginBottom: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.025em' }}>Admin Restricted Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Authorized Personnel Only. Please sign in to verify credentials.</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#f87171',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {user && user.email.toLowerCase() !== 'hanualjoshua@gmail.com' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#f87171',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div><strong>Access Denied:</strong> Your account ({user.email}) does not have admin privileges.</div>
            <button 
              onClick={() => {
                authActions.signOut();
                window.dispatchEvent(new Event('mock-auth-change'));
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                alignSelf: 'flex-start',
                padding: 0
              }}
            >
              Sign out to switch accounts
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Administrator Email</label>
            <input 
              type="email"
              placeholder="admin@learnflow.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                background: '#1f2937',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Password</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#1f2937',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Sign In with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => navigateTo('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ← Return to Student Study Desk
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
