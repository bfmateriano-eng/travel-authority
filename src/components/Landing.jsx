import React from 'react';

export default function Landing({ onGetStarted }) {
  // Enhanced Styles
  const pageContainer = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light gray background to show white logos
    fontFamily: 'sans-serif',
    margin: 0,
    padding: 0
  };

  const brandingSection = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '60px',
    padding: '20px',
    width: '100%'
  };

  const mainLogoStyle = {
    width: '280px',
    height: '280px',
    objectFit: 'contain',
    marginBottom: '20px'
  };

  const secondaryBrandingStyle = {
    width: '200px',
    height: 'auto',
    objectFit: 'contain',
    backgroundColor: '#cc0000', // Red background specifically for the white logo
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '30px'
  };

  const textSection = {
    textAlign: 'center',
    maxWidth: '800px',
    padding: '0 20px'
  };

  const titleStyle = {
    fontSize: '48px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0',
    textTransform: 'uppercase',
    letterSpacing: '-1px'
  };

  const buttonStyle = {
    backgroundColor: '#cc0000',
    color: 'white',
    padding: '18px 50px',
    fontSize: '22px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '40px',
    boxShadow: '0 10px 15px -3px rgba(204, 0, 0, 0.3)',
    textTransform: 'uppercase',
    transition: 'transform 0.2s'
  };

  const footerDesignStyle = {
    width: '100%',
    height: '120px',
    marginTop: 'auto', // Pushes footer to the very bottom
    borderTop: '5px solid #cc0000',
    overflow: 'hidden'
  };

  return (
    <div style={pageContainer}>
      {/* 1. Branding Area */}
      <div style={brandingSection}>
        {/* Main centered LGU Logo */}
        <img src="/lgu-logo.png" alt="LGU Logo" style={mainLogoStyle} />
        
        {/* White branding logo on a red background badge */}
        <img src="/better-pililla.png" alt="Better Pililla" style={secondaryBrandingStyle} />
      </div>

      {/* 2. Text Content */}
      <div style={textSection}>
        <h1 style={titleStyle}>
          TRAVEL AUTHORITY <span style={{ color: '#cc0000' }}>SYSTEM</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#4a4a4a', marginTop: '15px', fontWeight: '500', fontStyle: 'italic' }}>
          "Better Pililla: Serving with Integrity and Efficiency"
        </p>
        
        <button 
          onClick={onGetStarted} 
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Enter System
        </button>
      </div>

      {/* 3. Footer Branding Text */}
      <div style={{ padding: '30px 0 10px 0', color: '#888', fontSize: '12px', fontWeight: 'bold' }}>
        MUNICIPALITY OF PILILLA, RIZAL • OFFICIAL GOVERNMENT TOOL • 2026
      </div>

      {/* 4. Footer Image Design (Now at the bottom) */}
      <div style={footerDesignStyle}>
        <img 
          src="/lgu-design.png" 
          alt="Footer Design" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>
    </div>
  );
}