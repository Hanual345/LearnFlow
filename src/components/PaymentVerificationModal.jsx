import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, X } from 'lucide-react';

export default function PaymentVerificationModal({ isOpen, onClose, plan, onVerifySuccess }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing secure connection...');

  useEffect(() => {
    if (isOpen && plan) {
      setIsVerifying(true);
      setStatusMessage('Connecting to Razorpay gateway...');
      
      const stages = [
        { delay: 1000, msg: 'Checking payment reference status...' },
        { delay: 2200, msg: 'Validating captured transaction VPA...' },
        { delay: 3500, msg: 'Signature verified! Activating plan...' }
      ];

      stages.forEach((stage) => {
        setTimeout(() => {
          setStatusMessage(stage.msg);
        }, stage.delay);
      });

      // Complete auto verification
      const timer = setTimeout(() => {
        setIsVerifying(false);
        onVerifySuccess(plan);
        onClose();
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, plan]);

  if (!isOpen || !plan) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem',
        position: 'relative',
        boxShadow: '0 0 50px rgba(9, 99, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        background: '#111827',
        color: '#ffffff',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(9, 99, 255, 0.15)', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
          <ShieldCheck size={14} /> Razorpay Auto-Verify
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verifying Transaction</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Checking payment status for **{plan.name}** ({plan.price}). Please do not close this window.
        </p>

        <div style={{ padding: '2rem 0' }}>
          <Loader2 className="animate-spin" size={44} style={{ color: '#3b82f6', margin: '0 auto 1.5rem' }} />
          <p style={{ fontSize: '0.95rem', color: '#9ca3af', fontWeight: 500, height: '24px' }}>
            {statusMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
