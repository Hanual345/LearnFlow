import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Key, Users, Award, BookOpen, GraduationCap, Check, X } from 'lucide-react';

export default function AdminPanel() {
  const [tierSelect, setTierSelect] = useState('pro');
  const [discountSelect, setDiscountSelect] = useState('100'); // '100', '50', '0'
  const [codes, setCodes] = useState([]);
  const [directEmail, setDirectEmail] = useState('');
  const [directTier, setDirectTier] = useState('pro');
  const [studentRequests, setStudentRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing redeem codes and student benefit requests
  useEffect(() => {
    const savedCodes = JSON.parse(localStorage.getItem('learnflow_redeem_codes') || '[]');
    setCodes(savedCodes);
    
    const savedReqs = JSON.parse(localStorage.getItem('learnflow_student_requests') || '[]');
    setStudentRequests(savedReqs);
  }, []);

  const generateCode = () => {
    const randomHex = Math.random().toString(16).substr(2, 6).toUpperCase();
    const newCode = `LF-${tierSelect.toUpperCase()}-${randomHex}`;
    
    const newCodeObj = {
      code: newCode,
      tier: tierSelect,
      discount: parseInt(discountSelect),
      status: 'unused',
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [newCodeObj, ...codes];
    setCodes(updated);
    localStorage.setItem('learnflow_redeem_codes', JSON.stringify(updated));
    
    let desc = discountSelect === '100' ? 'Free Access' : discountSelect === '50' ? '50% Off' : 'No Discount';
    setSuccessMsg(`Generated code successfully: ${newCode} (${desc})`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deleteCode = (codeStr) => {
    const updated = codes.filter(c => c.code !== codeStr);
    setCodes(updated);
    localStorage.setItem('learnflow_redeem_codes', JSON.stringify(updated));
  };

  const handleApproveRequest = (reqId, discountPct) => {
    const savedReqs = JSON.parse(localStorage.getItem('learnflow_student_requests') || '[]');
    const req = savedReqs.find(r => r.id === reqId);
    
    if (req) {
      if (discountPct === 100) {
        // Full free access upgrade
        localStorage.setItem(`learnflow_tier_${req.email.toLowerCase()}`, req.tier);
        
        // Sync active user if they upgraded themselves
        const savedUser = localStorage.getItem("learnflow_mock_user");
        const currentUser = savedUser ? JSON.parse(savedUser) : null;
        if (currentUser && currentUser.email.toLowerCase() === req.email.toLowerCase()) {
          localStorage.setItem('learnflow_premium_tier', req.tier);
        }
        
        setSuccessMsg(`Granted 100% FREE Access to ${req.email} for ${req.tier.toUpperCase()}!`);
      } else if (discountPct === 50) {
        // Save pre-authorized 50% discount
        localStorage.setItem(`learnflow_discount_${req.email.toLowerCase()}_${req.tier.toLowerCase()}`, '50');
        setSuccessMsg(`Authorized 50% DISCOUNT (Half Price) for ${req.email} on ${req.tier.toUpperCase()}!`);
      }
      
      // Update requests
      const updatedReqs = savedReqs.filter(r => r.id !== reqId);
      setStudentRequests(updatedReqs);
      localStorage.setItem('learnflow_student_requests', JSON.stringify(updatedReqs));
      
      // Trigger update event
      window.dispatchEvent(new Event('mock-auth-change'));
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRejectRequest = (reqId) => {
    const savedReqs = JSON.parse(localStorage.getItem('learnflow_student_requests') || '[]');
    const updatedReqs = savedReqs.filter(r => r.id !== reqId);
    setStudentRequests(updatedReqs);
    localStorage.setItem('learnflow_student_requests', JSON.stringify(updatedReqs));
    setSuccessMsg(`Student request rejected and removed.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDirectUpgrade = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!directEmail || !directEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Direct mock database user upgrade simulator
    const registeredUsers = JSON.parse(localStorage.getItem("learnflow_mock_registered_users") || "[]");
    const foundUserIdx = registeredUsers.findIndex(u => u.email.toLowerCase() === directEmail.toLowerCase());

    if (foundUserIdx !== -1) {
      // Direct mock user upgrade
      // Save their tier state
      localStorage.setItem(`learnflow_tier_${directEmail.toLowerCase()}`, directTier);
      setSuccessMsg(`Upgraded user ${directEmail} to ${directTier.toUpperCase()} successfully!`);
    } else {
      // Even if user hasn't registered yet, pre-grant their tier!
      localStorage.setItem(`learnflow_tier_${directEmail.toLowerCase()}`, directTier);
      setSuccessMsg(`Pre-authorized ${directEmail} for ${directTier.toUpperCase()} status on their next login!`);
    }

    // Trigger local updates if admin upgrades themselves
    if (directEmail.toLowerCase() === 'hanualjoshua@gmail.com') {
      localStorage.setItem('learnflow_premium_tier', directTier);
      window.dispatchEvent(new Event('mock-auth-change'));
    }

    setDirectEmail('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Panel */}
      <div className="header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-primary" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              Admin Session
            </span>
            <ShieldCheck size={16} style={{ color: '#34d399' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>System Management Panel</h1>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#34d399', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Left Side: Generator */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Key size={18} style={{ color: 'var(--color-primary)' }} />
            Redeem Code Generator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Generate random redeem keys that users can enter on the Pricing page to unlock premium memberships instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Tier Plan</label>
              <select 
                value={tierSelect} 
                onChange={(e) => setTierSelect(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="pro">Scholar Pro (₹699)</option>
                <option value="group">Study Group (₹999)</option>
                <option value="institution">Tutoring Center (₹10,000)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Discount Benefit</label>
              <select 
                value={discountSelect} 
                onChange={(e) => setDiscountSelect(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="100">Full Free Access (100% off)</option>
                <option value="50">Half Price Discount (50% off)</option>
                <option value="0">No Discount / Verify (0% off)</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={generateCode} 
              style={{ width: '100%', padding: '0.85rem', gap: '0.5rem' }}
            >
              <Plus size={16} /> Generate Redeem Code
            </button>
          </div>
        </div>

        {/* Right Side: Direct Access Control */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            Direct Access Control
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Directly grant or revoke premium tiers for specific student emails. Useful for administrative manual overrides.
          </p>

          <form onSubmit={handleDirectUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>User Email Address</label>
              <input 
                type="email" 
                placeholder="student@example.com"
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tier Plan to Grant</label>
              <select 
                value={directTier} 
                onChange={(e) => setDirectTier(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1f2937',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="starter">Free Starter (Revoke Premium)</option>
                <option value="pro">Scholar Pro</option>
                <option value="group">Study Group</option>
                <option value="institution">Tutoring Center</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Apply Status Update
            </button>
          </form>
        </div>

      </div>

      {/* Pending Student Applications Review */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <GraduationCap size={20} style={{ color: 'var(--color-primary)' }} />
          Pending Student Benefit Applications
        </h3>

        {studentRequests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No pending student benefit applications to verify.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Student Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Institution / College</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Student ID / Document</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Requested Tier</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentRequests.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', color: 'white' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{r.email}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{r.school}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.studentIdCard}</td>
                    <td style={{ padding: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>{r.tier}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleApproveRequest(r.id, 100)}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#10b981', borderColor: '#10b981', color: 'white' }}
                        title="Grant 100% Free Access"
                      >
                        <Check size={14} style={{ marginRight: '3px', display: 'inline', verticalAlign: 'middle' }} /> Free
                      </button>
                      <button 
                        onClick={() => handleApproveRequest(r.id, 50)}
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'white' }}
                        title="Grant 50% Off Coupon"
                      >
                        <Check size={14} style={{ marginRight: '3px', display: 'inline', verticalAlign: 'middle' }} /> 50% Off
                      </button>
                      <button 
                        onClick={() => handleRejectRequest(r.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        title="Reject Application"
                      >
                        <X size={14} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generated Codes List Table */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Award size={18} style={{ color: 'var(--color-primary)' }} />
          Active Redeem Codes Registry
        </h3>

        {codes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No redeem codes generated yet. Use the tool above to generate one.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Redeem Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Plan Tier</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Discount Benefit</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Created</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', color: 'white' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, color: '#60a5fa' }}>{c.code}</td>
                    <td style={{ padding: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>{c.tier}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {c.discount === 100 ? (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>100% Free Access</span>
                      ) : c.discount === 50 ? (
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>50% Off (Half Price)</span>
                      ) : (
                        <span>0% Off (Standard)</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${c.status === 'unused' ? 'badge-primary' : ''}`} style={{ 
                        background: c.status === 'unused' ? 'rgba(9, 99, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: c.status === 'unused' ? '#60a5fa' : '#34d399',
                        fontWeight: 700
                      }}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.createdAt}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => deleteCode(c.code)} 
                        title="Delete Code"
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
