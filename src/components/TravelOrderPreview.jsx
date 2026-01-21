import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TravelOrderPreview({ request, profile, onBack }) {
  
  const downloadPDF = () => {
    const input = document.getElementById('printable-page');
    // Set for 8.5 x 13 inches (Long/Legal)
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [215.9, 330.2]); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Travel_Order_${request.destination}.pdf`);
    });
  };

  const TravelOrderCopy = ({ label }) => (
    <div style={{ 
      height: '48%', 
      border: '1px dashed #eee', 
      padding: '25px', 
      position: 'relative', 
      backgroundColor: 'white',
      fontFamily: 'serif',
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px', fontWeight: 'bold', color: '#aaa' }}>
        {label}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid black', paddingBottom: '8px', marginBottom: '15px' }}>
        <img src="/lgu-logo.png" style={{ width: '60px', position: 'absolute', left: '40px', top: '25px' }} alt="logo" />
        <h4 style={{ margin: 0 }}>Republic of the Philippines</h4>
        <h3 style={{ margin: 0 }}>Municipality of Pililla</h3>
        <p style={{ margin: 0 }}>Province of Rizal</p>
      </div>

      <h2 style={{ textAlign: 'center', textDecoration: 'underline', margin: '10px 0' }}>TRAVEL ORDER</h2>
      
      <div style={{ fontSize: '14px', marginBottom: '10px' }}>
        <p style={{ margin: '2px 0' }}><strong>DATE:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
        <p style={{ margin: '2px 0' }}><strong>PURPOSE:</strong> {request.description}</p>
        <p style={{ margin: '2px 0' }}><strong>DESTINATION:</strong> {request.destination}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
            <p style={{ margin: '2px 0' }}><strong>DEPARTURE:</strong> {request.departure_date} @ {request.time_departure}</p>
            <p style={{ margin: '2px 0' }}><strong>RETURN:</strong> {request.return_date} @ {request.time_return_est}</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left', width: '65%' }}>Personnel Authorized</th>
            <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center', width: '35%' }}>Signature</th>
          </tr>
        </thead>
        <tbody>
          {request.personnel.map((p, idx) => (
            <tr key={idx}>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <div style={{ fontWeight: 'bold' }}>{p.name.toUpperCase()}</div>
                <div style={{ fontSize: '11px', color: '#444' }}>({p.position}, {p.office})</div>
              </td>
              <td style={{ border: '1px solid black', padding: '8px' }}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Commitment Phrase */}
      <p style={{ marginTop: '10px', fontSize: '12px', fontStyle: 'italic', fontWeight: 'bold' }}>
        "I/We commit to submit relevant report after the activity."
      </p>

      {/* NEW APPROVING AUTHORITY: MAYOR */}
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'center', width: '50%' }}>
          <p style={{ margin: 0, fontSize: '12px' }}>Approved by:</p>
          <div style={{ marginTop: '25px', fontWeight: 'bold', borderBottom: '1px solid black', display: 'inline-block', minWidth: '220px' }}>
            JOHN V. MASINSIN
          </div>
          <p style={{ fontSize: '11px', margin: 0, fontWeight: 'bold' }}>Municipal Mayor</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '10px', left: '30px', fontSize: '9px', color: '#999' }}>
        Status: {request.status} | Tracking ID: {request.id.substring(0,8).toUpperCase()}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>← BACK</button>
          <button onClick={downloadPDF} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>DOWNLOAD PDF (8.5 x 13)</button>
        </div>

        <div id="printable-page" style={{ 
            width: '215.9mm', 
            height: '330.2mm', 
            backgroundColor: 'white', 
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10mm',
            boxSizing: 'border-box'
        }}>
          <TravelOrderCopy label="PERSONNEL COPY" />
          <div style={{ borderTop: '1px dashed #000', width: '100%', margin: '5px 0' }}></div>
          <TravelOrderCopy label="OFFICE/HR COPY" />
        </div>
      </div>
    </div>
  );
}