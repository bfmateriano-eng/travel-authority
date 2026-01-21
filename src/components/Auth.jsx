import React, { useState } from 'react';

export default function Auth({ supabase, onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [officeHead, setOfficeHead] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            office_name: officeName,
            office_head: officeHead,
          }
        }
      });

      if (error) alert(error.message);
      else alert('Registration successful! Please check your email for a confirmation link.');
      
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else onAuthSuccess(data.user);
    }
    
    setLoading(false);
  };

  // --- BULLETPROOF INLINE STYLES ---
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    fontFamily: 'sans-serif',
    padding: '20px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    borderTop: '8px solid #cc0000',
    textAlign: 'center'
  };

  const logoStyle = {
    width: '120px', // Fixed small size
    height: '120px',
    objectFit: 'contain',
    marginBottom: '15px'
  };

  const inputGroup = {
    textAlign: 'left',
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '5px',
    textTransform: 'uppercase'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '14px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#cc0000',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 6px rgba(204, 0, 0, 0.2)'
  };

  return (
    <div style={pageStyle}>
      {/* Small LGU Logo at the top of the card */}
      <img src="/lgu-logo.png" alt="LGU Logo" style={logoStyle} />

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>
          {isRegistering ? 'Office Registration' : 'Personnel Login'}
        </h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '25px' }}>
          Better Pililla Travel Authority System
        </p>

        <form onSubmit={handleAuth}>
          <div style={inputGroup}>
            <label style={labelStyle}>Official Email</label>
            <input 
              type="email" 
              style={inputStyle} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {isRegistering && (
            <>
              <div style={inputGroup}>
                <label style={labelStyle}>Name of Office</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  placeholder="e.g. Accounting Office"
                  value={officeName} 
                  onChange={(e) => setOfficeName(e.target.value)} 
                  required 
                />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Head of Office</label>
                <input 
                  type="text" 
                  style={inputStyle} 
                  placeholder="Full Name"
                  value={officeHead} 
                  onChange={(e) => setOfficeHead(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          <div style={inputGroup}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              style={inputStyle} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {isRegistering && (
            <div style={inputGroup}>
              <label style={labelStyle}>Re-enter Password</label>
              <input 
                type="password" 
                style={inputStyle} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'PROCESSING...' : (isRegistering ? 'REGISTER OFFICE' : 'LOGIN')}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {isRegistering ? 'Already have an account? Login' : 'Need to register an office? Click here'}
          </button>
        </div>
      </div>

      <footer style={{ marginTop: '30px', fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>
        OFFICIAL GOVERNMENT PORTAL • PILILLA 2026
      </footer>
    </div>
  );
}