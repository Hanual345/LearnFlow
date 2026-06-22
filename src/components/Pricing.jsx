import React, { useState, useEffect } from 'react';
import { Check, X, ShieldAlert, Sparkles, Gift, GraduationCap } from 'lucide-react';

export default function Pricing({ onUpgrade, premiumTier, onRedeemCode }) {
  const [code, setCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  
  // Coupon / Pre-authorized discount states
  const [activeDiscount, setActiveDiscount] = useState(0); // 0 or 50
  const [discountedTier, setDiscountedTier] = useState(''); // 'pro' or 'group'

  // Student application form states
  const [studentSchool, setStudentSchool] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentIdCard, setStudentIdCard] = useState('');
  const [studentTierSelect, setStudentTierSelect] = useState('pro');
  const [studentSuccess, setStudentSuccess] = useState('');

  // Check for pre-authorized student discounts on load
  useEffect(() => {
    const savedUser = localStorage.getItem("learnflow_mock_user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    if (currentUser) {
      const email = currentUser.email.toLowerCase();
      const proDiscount = localStorage.getItem(`learnflow_discount_${email}_pro`);
      const groupDiscount = localStorage.getItem(`learnflow_discount_${email}_group`);
      if (proDiscount === '50') {
        setActiveDiscount(50);
        setDiscountedTier('pro');
      } else if (groupDiscount === '50') {
        setActiveDiscount(50);
        setDiscountedTier('group');
      }
    }
  }, []);

  const handleRedeem = (e) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemSuccess('');

    if (!code.trim()) {
      setRedeemError('Please enter a code.');
      return;
    }

    const savedCodes = JSON.parse(localStorage.getItem('learnflow_redeem_codes') || '[]');
    const foundIdx = savedCodes.findIndex(c => c.code.toLowerCase() === code.trim().toLowerCase());

    if (foundIdx === -1) {
      setRedeemError('Invalid or expired code.');
      return;
    }

    const codeObj = savedCodes[foundIdx];
    if (codeObj.status === 'redeemed') {
      setRedeemError('This code has already been redeemed.');
      return;
    }

    const discountPct = codeObj.discount !== undefined ? codeObj.discount : 100;

    if (discountPct === 100) {
      // Mark as redeemed
      codeObj.status = 'redeemed';
      savedCodes[foundIdx] = codeObj;
      localStorage.setItem('learnflow_redeem_codes', JSON.stringify(savedCodes));

      if (onRedeemCode) {
        onRedeemCode(codeObj.tier);
      }
      setRedeemSuccess(`Successfully redeemed! Upgraded to ${codeObj.tier.toUpperCase()} tier.`);
    } else if (discountPct === 50) {
      // Mark as redeemed so it can't be reused by others (or keep it active locally)
      codeObj.status = 'redeemed';
      savedCodes[foundIdx] = codeObj;
      localStorage.setItem('learnflow_redeem_codes', JSON.stringify(savedCodes));

      setActiveDiscount(50);
      setDiscountedTier(codeObj.tier);
      setRedeemSuccess(`🎟️ 50% discount coupon applied successfully for ${codeObj.tier.toUpperCase()}! The plan price is now halved.`);
    } else {
      // 0% discount
      codeObj.status = 'redeemed';
      savedCodes[foundIdx] = codeObj;
      localStorage.setItem('learnflow_redeem_codes', JSON.stringify(savedCodes));
      setRedeemSuccess(`Code verified! Complete checkout at standard pricing.`);
    }

    setCode('');
    setTimeout(() => setRedeemSuccess(''), 5000);
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const savedUser = localStorage.getItem("learnflow_mock_user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    
    const emailToUse = studentEmail || (currentUser ? currentUser.email : '');
    
    if (!emailToUse) {
      alert("Please sign in or enter a valid email to submit the request.");
      return;
    }

    const newRequest = {
      id: 'req-' + Math.random().toString(36).substr(2, 9),
      email: emailToUse,
      school: studentSchool,
      studentIdCard: studentIdCard || 'ID-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      tier: studentTierSelect,
      status: 'pending',
      createdAt: new Date().toLocaleDateString()
    };

    const savedReqs = JSON.parse(localStorage.getItem('learnflow_student_requests') || '[]');
    savedReqs.push(newRequest);
    localStorage.setItem('learnflow_student_requests', JSON.stringify(savedReqs));

    setStudentSchool('');
    setStudentIdCard('');
    setStudentSuccess('Application submitted! Our system administrator will verify your student status manually. You will receive an upgrade or discount email once approved.');
    setTimeout(() => setStudentSuccess(''), 6000);
  };
  const plans = [
    {
      name: "Starter",
      key: "starter",
      desc: "For casual studying and quick reviews",
      price: "₹0",
      period: "forever",
      cta: "Current Plan",
      primary: false,
      features: [
        { name: "3 Documents max", enabled: true },
        { name: "Basic AI Chat Assistant", enabled: true },
        { name: "Standard Flashcards", enabled: true },
        { name: "3 Quiz Questions max", enabled: true },
        { name: "Shared Group Library", enabled: false },
        { name: "Custom Branding / Logo", enabled: false },
      ]
    },
    {
      name: "Scholar Pro",
      key: "pro",
      desc: "Everything you need to ace your examinations",
      price: "₹699",
      period: "per month",
      cta: "Upgrade to Pro",
      primary: true,
      popular: true,
      features: [
        { name: "30 Document Uploads", enabled: true },
        { name: "Limited AI Chat (Gemini 2.5)", enabled: true },
        { name: "30 Adaptive Flashcards", enabled: true },
        { name: "30 Custom Quizzes", enabled: true },
        { name: "Shared Group Library", enabled: false },
        { name: "Custom Branding / Logo", enabled: false },
      ]
    },
    {
      name: "Study Group",
      key: "group",
      desc: "Perfect for roommates and project groups",
      price: "₹999",
      period: "per month",
      cta: "Upgrade Group",
      primary: false,
      features: [
        { name: "Everything in Scholar Pro", enabled: true },
        { name: "Up to 5 Group Members", enabled: true },
        { name: "Shared Group Libraries", enabled: true },
        { name: "Collaborative Study Rooms", enabled: true },
        { name: "Group Leaderboards", enabled: true },
        { name: "Custom Branding / Logo", enabled: false },
      ]
    },
    {
      name: "Tutoring Center",
      key: "institution",
      desc: "For academies and tutoring departments",
      price: "₹10,000",
      period: "per month",
      cta: "Get Institution Plan",
      primary: false,
      features: [
        { name: "Everything in Study Group", enabled: true },
        { name: "Unlimited Tutors & Students", enabled: true },
        { name: "Admin Dashboard & Control", enabled: true },
        { name: "Usage analytics & reports", enabled: true },
        { name: "Custom Branding & Portal", enabled: true },
        { name: "API Access & Integration", enabled: true },
      ]
    }
  ];

  const getPlanPrice = (plan) => {
    if (activeDiscount === 50 && plan.key === discountedTier) {
      const origPrice = parseInt(plan.price.replace('₹', '').replace(',', ''));
      return `₹${origPrice / 2}`;
    }
    return plan.price;
  };

  return (
    <div>
      <div className="pricing-header">
        <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>SaaS Pricing Engine</span>
        <h1 className="pricing-title">Simple, Student-Friendly Pricing</h1>
        <p className="pricing-desc">Unlock full AI capabilities and master your courses for the price of a single coffee.</p>
        
        {activeDiscount === 50 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '30px', padding: '0.4rem 1.25rem', color: '#34d399', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 600 }}>
            <span>🎟️ Special Student 50% discount active for {discountedTier.toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="pricing-grid">
        {plans.map((plan, idx) => (
          <div key={idx} className={`glass-panel pricing-card ${plan.primary ? 'premium' : ''}`}>
            {plan.popular && (
              <span className="premium-tag">
                <Sparkles size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Most Popular
              </span>
            )}
            
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-desc">{plan.desc}</p>
            
            <div className="plan-price-row">
              {activeDiscount === 50 && plan.key === discountedTier ? (
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span className="plan-price" style={{ color: '#34d399' }}>{getPlanPrice(plan)}</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem', marginLeft: '0.5rem' }}>{plan.price}</span>
                </div>
              ) : (
                <span className="plan-price">{plan.price}</span>
              )}
              <span className="plan-period">/{plan.period}</span>
            </div>

            <ul className="features-list">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className={`feature-item ${!feature.enabled ? 'disabled' : ''}`}>
                  {feature.enabled ? (
                    <Check size={16} className="feature-icon" />
                  ) : (
                    <X size={16} className="feature-icon disabled" />
                  )}
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`btn ${plan.primary ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => {
                if (plan.price === "₹0") {
                  alert("You are on the free Starter plan.");
                } else {
                  if (onUpgrade) {
                    const appliedDiscount = (activeDiscount === 50 && plan.key === discountedTier) ? 50 : 0;
                    onUpgrade(plan, appliedDiscount);
                  }
                }
              }}
            >
              {((plan.key === "starter" && (!premiumTier || premiumTier === "starter")) ||
                (plan.key === "pro" && premiumTier === "pro") ||
                (plan.key === "group" && premiumTier === "group") ||
                (plan.key === "institution" && premiumTier === "institution")) 
                ? "Active Plan" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Redeem Promo Code Section */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', maxWidth: '480px', padding: '2rem', border: '1px dashed rgba(168, 85, 247, 0.4)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-secondary)' }}>
            <Gift size={18} /> Redeem Access Code
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Enter your 12-character code below to unlock premium plans or claim special price cuts.
          </p>

          {redeemError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#f87171', padding: '0.6rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
              {redeemError}
            </div>
          )}

          {redeemSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#34d399', padding: '0.6rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
              {redeemSuccess}
            </div>
          )}

          <form onSubmit={handleRedeem} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="e.g. LF-PRO-1A2B3C"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Redeem
            </button>
          </form>
        </div>

        {/* Student Benefit Application Form */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', maxWidth: '520px', padding: '2rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#34d399' }}>
            <GraduationCap size={20} /> Student Discount & Scholarship
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Get premium Scholar Pro or Study Group for **Half Price** or **100% Free** via manual verification.
          </p>

          {studentSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#34d399', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              {studentSuccess}
            </div>
          )}

          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Student Email</label>
                <input 
                  type="email" 
                  placeholder="student@school.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target Plan</label>
                <select 
                  value={studentTierSelect}
                  onChange={(e) => setStudentTierSelect(e.target.value)}
                  style={{ width: '100%', background: '#1f2937', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="pro">Scholar Pro (₹699)</option>
                  <option value="group">Study Group (₹999)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>School/College Name</label>
              <input 
                type="text" 
                placeholder="e.g. Stanford University"
                value={studentSchool}
                onChange={(e) => setStudentSchool(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Student ID Card / Enrollment Certificate ID</label>
              <input 
                type="text" 
                placeholder="e.g. Card No. ST-981723"
                value={studentIdCard}
                onChange={(e) => setStudentIdCard(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', background: '#10b981', borderColor: '#10b981', color: 'white', fontWeight: 600 }}>
              Apply for Scholarship
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
