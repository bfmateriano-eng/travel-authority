import React, { useState, useEffect } from 'react';
import TravelOrderPreview from './TravelOrderPreview';

export default function UserDashboard({ supabase, user }) {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTimeEst, setReturnTimeEst] = useState('');
  const [travelType, setTravelType] = useState('Meeting');
  const [description, setDescription] = useState('');
  const [personnel, setPersonnel] = useState([{ name: '', position: '', office: '' }]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileError) setProfile(profileData);

      fetchMyRequests();
    };

    fetchInitialData();
  }, [user.id, supabase]);

  const fetchMyRequests = async () => {
    const { data, error } = await supabase
      .from('travel_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setRequests(data);
  };

  const addRow = () => setPersonnel([...personnel, { name: '', position: '', office: '' }]);
  
  const removeRow = (index) => {
    if (personnel.length > 1) {
      setPersonnel(personnel.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index, field, value) => {
    const newPersonnel = [...personnel];
    newPersonnel[index][field] = value;
    setPersonnel(newPersonnel);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let uploadedFileUrl = null;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('travel-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('travel-attachments').getPublicUrl(filePath);
        uploadedFileUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('travel_requests').insert([
        { 
          user_id: user.id, destination, departure_date: departureDate, return_date: returnDate,
          time_departure: departureTime, time_return_est: returnTimeEst, travel_type: travelType,
          description, personnel: personnel, file_url: uploadedFileUrl 
        }
      ]);

      if (error) throw error;
      alert('Travel Authority Request Submitted!');
      setDestination(''); setDepartureDate(''); setReturnDate(''); setDepartureTime('');
      setReturnTimeEst(''); setDescription(''); setPersonnel([{ name: '', position: '', office: '' }]);
      setFile(null); fetchMyRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: 'white', padding: '30px', borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', fontFamily: 'sans-serif'
  };

  const inputStyle = {
    padding: '10px', border: '1px solid #ddd', borderRadius: '4px',
    width: '100%', boxSizing: 'border-box', marginTop: '5px'
  };

  if (selectedRequest) {
    return (
      <TravelOrderPreview 
        request={selectedRequest} 
        profile={profile} 
        onBack={() => setSelectedRequest(null)} 
      />
    );
  }

  if (profile && !profile.is_approved) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', textAlign: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '500px', borderTop: '8px solid #ffcc00' }}>
          <img src="/lgu-logo.png" alt="Logo" style={{ width: '100px', marginBottom: '20px' }} />
          <h2 style={{ color: '#333', fontFamily: 'sans-serif' }}>Account Pending Approval</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            Registration for <strong>{profile.office_name}</strong> received. 
            Waiting for Administrator approval.
          </p>
          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px', color: '#cc0000', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '4px solid #cc0000', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/lgu-logo.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#cc0000' }}>{profile?.office_name || "Office"}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Head: {profile?.office_head || "Head"}</div>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: '1px solid #cc0000', color: '#cc0000', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>LOGOUT</button>
      </div>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', borderBottom: '2px solid #cc0000', paddingBottom: '10px' }}>Request Travel Authority</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>DESTINATION</label>
                <input required style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>TYPE OF TRAVEL</label>
                <select style={inputStyle} value={travelType} onChange={e => setTravelType(e.target.value)}>
                  <option>Training</option><option>Meeting</option><option>Administrative</option><option>Field Work</option><option>Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>DATE OF DEPARTURE</label>
                <input required type="date" style={inputStyle} value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>TIME OF DEPARTURE</label>
                <input required type="time" style={inputStyle} value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>DATE OF RETURN</label>
                <input required type="date" style={inputStyle} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>EST. TIME OF RETURN</label>
                <input required type="time" style={inputStyle} value={returnTimeEst} onChange={e => setReturnTimeEst(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>ATTACHMENT (Invitation/Order)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={inputStyle} onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>DESCRIPTION OF TRAVEL</label>
                <textarea required style={{ ...inputStyle, height: '40px', resize: 'none' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Purpose..." />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#555' }}>PERSONNEL INVOLVED</label>
                <button type="button" onClick={addRow} style={{ color: '#cc0000', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>+ ADD PERSON</button>
              </div>
              {personnel.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input placeholder="Name" style={inputStyle} value={p.name} onChange={e => updateRow(i, 'name', e.target.value)} />
                  <input placeholder="Position" style={inputStyle} value={p.position} onChange={e => updateRow(i, 'position', e.target.value)} />
                  <input placeholder="Office" style={inputStyle} value={p.office} onChange={e => updateRow(i, 'office', e.target.value)} />
                  {personnel.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} style={{ padding: '0 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#cc0000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }} disabled={loading}>
              {loading ? 'UPLOADING & SUBMITTING...' : 'SUBMIT TRAVEL AUTHORITY'}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0' }}>Request History (Click row to preview/download)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #eee' }}>Destination</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #eee' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #eee' }}>Admin Remarks</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No travel requests found.</td></tr>
              ) : requests.map(req => (
                <tr key={req.id} 
                    onClick={() => setSelectedRequest(req)} 
                    style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'} 
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#cc0000' }}>{req.destination}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                      backgroundColor: req.status === 'Approved' ? '#e6fffa' : req.status === 'Denied' ? '#fee2e2' : '#fffbe6',
                      color: req.status === 'Approved' ? '#065f46' : req.status === 'Denied' ? '#991b1b' : '#92400e'
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                    {req.admin_remarks || "Waiting for review..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}