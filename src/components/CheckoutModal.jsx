import React, { useState, useEffect } from 'react';
import { 
  CreditCard, X, ShieldCheck, Loader2, CheckCircle2, 
  Smartphone, Mail, ArrowRight, ArrowLeft, Landmark, Wallet, QrCode
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, plan, onPaymentSuccess }) {
  const [step, setStep] = useState('contact'); // 'contact', 'methods', 'loading', 'receipt'
  const [activeMethod, setActiveMethod] = useState('card'); // 'card', 'upi', 'netbanking', 'wallet'
  
  // Contact details
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Card details state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // UPI details state
  const [upiId, setUpiId] = useState('');
  
  // Bank state
  const [selectedBank, setSelectedBank] = useState('');
  
  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('');

  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Initializing secure sandbox...');
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('contact');
      setActiveMethod('card');
      setPhone('9876543210');
      setEmail('scholar@example.com');
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setUpiId('');
      setSelectedBank('');
      setSelectedWallet('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted.substring(0, 19));
  };

  // Format Expiry (adds slash after 2 digits)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardExpiry(value.substring(0, 5));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.substring(0, 3));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setStep('methods');
  };

  const startPaymentProcessing = (methodName) => {
    setError('');
    setStep('loading');
    
    // Custom messages representing Razorpay gateway stages
    const messages = [
      { delay: 0, text: `Connecting to Razorpay gateway for ${methodName.toUpperCase()}...` },
      { delay: 1000, text: "Routing transaction securely through bank partner..." },
      { delay: 2000, text: "Authenticating payment authorization request..." },
      { delay: 3200, text: "Payment status: CAPTURED. Allocating premium tier..." },
      { delay: 4200, text: "Success! Order finalized." }
    ];

    messages.forEach((msg) => {
      setTimeout(() => {
        setLoadingMessage(msg.text);
      }, msg.delay);
    });

    // Complete transaction
    setTimeout(() => {
      const transactionId = "pay_" + Math.random().toString(36).substr(2, 14).toUpperCase();
      const newReceipt = {
        id: transactionId,
        date: new Date().toLocaleString(),
        planName: plan.name,
        price: plan.price,
        method: methodName.toUpperCase(),
        email: email,
        phone: phone,
        status: "SUCCESS"
      };
      setReceiptData(newReceipt);
      setStep('receipt');
      onPaymentSuccess(); // Trigger state upgrade in main App
    }, 4500);
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (activeMethod === 'card') {
      if (cardNumber.length < 19) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter a valid 3-digit CVV.');
        return;
      }
      startPaymentProcessing('Credit/Debit Card');
    } else if (activeMethod === 'upi') {
      if (!upiId) {
        window.open('https://razorpay.me/@hanualjoshuadsouza1400', '_blank');
        startPaymentProcessing('Razorpay Page Link');
      } else {
        if (!upiId.includes('@')) {
          setError('Please enter a valid UPI ID (e.g. user@okhdfc) or scan the QR code.');
          return;
        }
        startPaymentProcessing(`UPI (${upiId})`);
      }
    } else if (activeMethod === 'netbanking') {
      if (!selectedBank) {
        setError('Please select a bank to proceed.');
        return;
      }
      startPaymentProcessing(`Netbanking (${selectedBank})`);
    } else if (activeMethod === 'wallet') {
      if (!selectedWallet) {
        setError('Please select a wallet provider.');
        return;
      }
      startPaymentProcessing(`Wallet (${selectedWallet})`);
    }
  };

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
      {/* Razorpay Styled Modal Container */}
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#ffffff',
        color: '#1e293b',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Modal Close Icon */}
        {step !== 'loading' && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              color: step === 'contact' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Header - Razorpay Branding Accents */}
        <div style={{
          background: 'linear-gradient(135deg, #132646 0%, #0963FF 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>LearnFlow AI</h3>
              <p style={{ fontSize: '0.85rem', color: '#93c5fd', margin: '0.2rem 0 0 0' }}>Subscription plan: {plan.name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#93c5fd', display: 'block', fontWeight: 600 }}>Amount to Pay</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{plan.price}</span>
            </div>
          </div>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div style={{
            background: '#fef2f2',
            borderBottom: '1px solid #fee2e2',
            color: '#b91c1c',
            padding: '0.75rem 1.5rem',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Body Contents */}
        <div style={{ padding: '1.5rem 2rem' }}>
          
          {/* Step 1: Contact Screen */}
          {step === 'contact' && (
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Provide Contact Information</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Required by the payment gateway to send updates and invoices.</p>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Smartphone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="tel" 
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      color: '#1e293b'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="email" 
                    placeholder="scholar@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      color: '#1e293b'
                    }}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={{
                  background: '#0963FF',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(9, 99, 255, 0.2)'
                }}
              >
                Proceed to Payment <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Step 2: Tabbed Methods Selection */}
          {step === 'methods' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Back to Contact link */}
              <button 
                onClick={() => setStep('contact')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0,
                  width: 'fit-content'
                }}
              >
                <ArrowLeft size={14} /> Back to contact info
              </button>

              {/* Grid of Methods */}
              <div style={{ display: 'flex', minHeight: '260px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                
                {/* Method selector sidebar */}
                <div style={{ width: '40%', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <button 
                    onClick={() => setActiveMethod('card')}
                    style={{
                      padding: '1rem',
                      background: activeMethod === 'card' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      textAlign: 'left',
                      fontWeight: activeMethod === 'card' ? 700 : 500,
                      color: activeMethod === 'card' ? '#0963FF' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <CreditCard size={16} /> Cards
                  </button>
                  <button 
                    onClick={() => setActiveMethod('upi')}
                    style={{
                      padding: '1rem',
                      background: activeMethod === 'upi' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      textAlign: 'left',
                      fontWeight: activeMethod === 'upi' ? 700 : 500,
                      color: activeMethod === 'upi' ? '#0963FF' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <QrCode size={16} /> UPI / QR
                  </button>
                  <button 
                    onClick={() => setActiveMethod('netbanking')}
                    style={{
                      padding: '1rem',
                      background: activeMethod === 'netbanking' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      textAlign: 'left',
                      fontWeight: activeMethod === 'netbanking' ? 700 : 500,
                      color: activeMethod === 'netbanking' ? '#0963FF' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Landmark size={16} /> Netbanking
                  </button>
                  <button 
                    onClick={() => setActiveMethod('wallet')}
                    style={{
                      padding: '1rem',
                      background: activeMethod === 'wallet' ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      textAlign: 'left',
                      fontWeight: activeMethod === 'wallet' ? 700 : 500,
                      color: activeMethod === 'wallet' ? '#0963FF' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Wallet size={16} /> Wallets
                  </button>
                </div>

                {/* Method specifics details page */}
                <div style={{ width: '60%', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  
                  {/* Card Section */}
                  {activeMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <input 
                          type="text" 
                          placeholder="Cardholder Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
                          required
                        />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <CreditCard size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                          type="text" 
                          placeholder="Card Number"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          style={{ width: '50%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none', textAlign: 'center' }}
                          required
                        />
                        <input 
                          type="password" 
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          style={{ width: '50%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', outline: 'none', textAlign: 'center' }}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI / QR Section */}
                  {activeMethod === 'upi' && (() => {
                    const payeeLink = 'https://razorpay.me/@hanualjoshuadsouza1400';
                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(payeeLink)}`;
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Interactive Scannable QR Code Image pointing to Razorpay Me Link */}
                        <div 
                          onClick={() => {
                            window.open(payeeLink, '_blank');
                            startPaymentProcessing('Razorpay Page Link');
                          }}
                          title="Scan with phone or click to open Razorpay payment page"
                          style={{ 
                            padding: '0.75rem', 
                            background: '#ffffff', 
                            border: '2px dashed #0963FF', 
                            borderRadius: '12px', 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(9, 99, 255, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                          }}
                        >
                          <img 
                            src={qrImageUrl} 
                            alt="UPI QR Code" 
                            style={{ display: 'block', width: '120px', height: '120px', margin: '0 auto' }}
                          />
                          <span style={{ fontSize: '0.65rem', color: '#0963FF', fontWeight: 700, display: 'block', marginTop: '0.4rem' }}>
                            📸 Scan to Open Razorpay Link
                          </span>
                          <span style={{ fontSize: '0.55rem', color: '#94a3b8', display: 'block', marginTop: '0.1rem' }}>
                            Or click here to open in new tab
                          </span>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', margin: '0.25rem 0' }}>
                          <div>Payee: <strong style={{ color: '#132646' }}>razorpay.me/@hanualjoshuadsouza1400</strong></div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            window.open(payeeLink, '_blank');
                            startPaymentProcessing('Razorpay Page Link');
                          }}
                          style={{
                            background: '#0963FF',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '0.25rem',
                            width: '100%',
                            boxShadow: '0 2px 4px rgba(9, 99, 255, 0.15)'
                          }}
                        >
                          Open Pay Page (razorpay.me) 🔗
                        </button>
                      </div>
                    );
                  })()}

                  {/* Netbanking Section */}
                  {activeMethod === 'netbanking' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Select Your Bank:</span>
                      {['SBI', 'HDFC', 'ICICI', 'Axis'].map((bank) => (
                        <label 
                          key={bank}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid',
                            borderColor: selectedBank === bank ? '#0963FF' : '#cbd5e1',
                            borderRadius: '6px',
                            background: selectedBank === bank ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: selectedBank === bank ? 700 : 500
                          }}
                        >
                          <input 
                            type="radio" 
                            name="bank" 
                            value={bank} 
                            checked={selectedBank === bank}
                            onChange={() => setSelectedBank(bank)}
                            style={{ display: 'none' }}
                          />
                          <Landmark size={14} style={{ color: selectedBank === bank ? '#0963FF' : '#64748b' }} />
                          {bank === 'SBI' ? 'State Bank of India' : bank === 'HDFC' ? 'HDFC Bank' : bank === 'ICICI' ? 'ICICI Bank' : 'Axis Bank'}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Wallets Section */}
                  {activeMethod === 'wallet' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Select Wallet:</span>
                      {['Paytm', 'PhonePe', 'Amazon Pay'].map((walletName) => (
                        <label 
                          key={walletName}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem 0.75rem',
                            border: '1px solid',
                            borderColor: selectedWallet === walletName ? '#0963FF' : '#cbd5e1',
                            borderRadius: '6px',
                            background: selectedWallet === walletName ? '#eff6ff' : 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: selectedWallet === walletName ? 700 : 500
                          }}
                        >
                          <input 
                            type="radio" 
                            name="wallet" 
                            value={walletName} 
                            checked={selectedWallet === walletName}
                            onChange={() => setSelectedWallet(walletName)}
                            style={{ display: 'none' }}
                          />
                          <Wallet size={14} style={{ color: selectedWallet === walletName ? '#0963FF' : '#64748b' }} />
                          {walletName}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Dynamic pay action button */}
                  <button 
                    onClick={handlePay}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.65rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    Pay {plan.price}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Loading / Authenticating */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Loader2 className="animate-spin" size={48} style={{ color: '#0963FF', margin: '0 auto 1.5rem' }} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Processing via Razorpay</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', height: '24px', margin: 0 }}>
                {loadingMessage}
              </p>
            </div>
          )}

          {/* Step 4: Approved Receipt */}
          {step === 'receipt' && receiptData && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  border: '1px solid #bbf7d0'
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Payment Approved</h4>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Receipt sent to {receiptData.email}</p>
              </div>

              {/* Invoice Breakdown */}
              <div style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Razorpay Payment ID</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{receiptData.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Date & Time</span>
                  <span>{receiptData.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode</span>
                  <span style={{ fontWeight: 600 }}>{receiptData.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                  <span style={{ fontWeight: 700 }}>Amount Charged</span>
                  <span style={{ fontWeight: 800, color: '#16a34a' }}>{receiptData.price}</span>
                </div>
              </div>

              <button 
                style={{
                  background: '#0963FF',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
                onClick={onClose}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Razorpay Secured Footer Banner */}
        <div style={{
          background: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          padding: '0.75rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          color: '#64748b',
          fontWeight: 600
        }}>
          <ShieldCheck size={14} style={{ color: '#10b981' }} /> Secured by <span style={{ color: '#0963FF', fontWeight: 800 }}>Razorpay</span>
        </div>
      </div>
    </div>
  );
}
