import React, { useState, useEffect } from 'react';

// --- MOVE MODAL OUTSIDE THE MAIN COMPONENT TO FIX FOCUS ISSUE ---
const ReviewModal = ({ req, adminRemarks, setAdminRemarks, onUpdate, onClose }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #cc0000', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#cc0000' }}>Review Travel Request</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <p style={{ margin: '5px 0' }}><strong>SENDER OFFICE:</strong> {req.profiles?.office_name}</p>
          <p style={{ margin: '5px 0' }}><strong>DESTINATION:</strong> {req.destination}</p>
          <p style={{ margin: '5px 0' }}><strong>TRAVEL TYPE:</strong> {req.travel_type}</p>
        </div>
        <div>
          <p style={{ margin: '5px 0' }}><strong>DEPARTURE:</strong> {req.departure_date} @ {req.time_departure}</p>
          <p style={{ margin: '5px 0' }}><strong>RETURN:</strong> {req.return_date} @ {req.time_return_est}</p>
          <p style={{ margin: '5px 0' }}><strong>CURRENT STATUS:</strong> {req.status}</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', borderLeft: '5px solid #cc0000' }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>PURPOSE / DESCRIPTION:</strong>
        <p style={{ margin: 0, lineHeight: '1.5' }}>{req.description}</p>
      </div>

      <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Personnel Authorized</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px' }}>
        <thead>
          <tr style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Position / Office</th>
          </tr>
        </thead>
        <tbody>
          {req.personnel?.map((p, i) => (
            <tr key={i}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.name.toUpperCase()}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.position} ({p.office})</td>
            </tr>
          ))}
        </tbody>
      </table>

      {req.file_url && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
           <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold' }}>Supporting Document Attached:</p>
           <a href={req.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 25px', backgroundColor: '#cc0000', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
             VIEW / DOWNLOAD FILE
           </a>
        </div>
      )}

      <div style={{ marginTop: '25px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>ADMIN REMARKS (Optional)</label>
        <textarea 
          placeholder="Add notes for the office regarding this decision..." 
          style={{ width: '100%', height: '80px', marginTop: '5px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'inherit' }}
          value={adminRemarks}
          onChange={(e) => setAdminRemarks(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {req.status !== 'Approved' && (
          <button onClick={() => onUpdate(req.id, 'Approved')} style={{ flex: 1, padding: '15px', backgroundColor: '#0E9F6E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>APPROVE REQUEST</button>
        )}
        {req.status !== 'Denied' && (
          <button onClick={() => onUpdate(req.id, 'Denied')} style={{ flex: 1, padding: '15px', backgroundColor: '#F05252', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>DENY REQUEST</button>
        )}
      </div>
    </div>
  </div>
);

export default function AdminPortal({ supabase }) {
  const [dataList, setDataList] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, denied, office_approvals
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let query;
      
      if (activeTab === 'office_approvals') {
        query = supabase.from('profiles').select('*').eq('is_approved', false).eq('is_admin', false);
        if (searchTerm) {
          query = query.ilike('office_name', `%${searchTerm}%`);
        }
      } else {
        query = supabase.from('travel_requests').select('*, profiles:user_id(office_name, office_head)');
        if (activeTab === 'pending') query = query.eq('status', 'Pending');
        else if (activeTab === 'approved') query = query.eq('status', 'Approved');
        else if (activeTab === 'denied') query = query.eq('status', 'Denied');

        if (searchTerm) {
          // Note: Searching across joined tables with or() requires careful syntax in Supabase
          // For simplicity, we search destination and description
          query = query.or(`destination.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: sortOrder === 'asc' });
      if (error) throw error;
      setDataList(data || []);
    } catch (err) { 
      console.error(err.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [activeTab, sortOrder, searchTerm]);

  const updateRequestStatus = async (requestId, status) => {
    const { error } = await supabase.from('travel_requests').update({ 
      status, 
      admin_remarks: adminRemarks 
    }).eq('id', requestId);
    
    if (!error) { 
      setSelectedReq(null); 
      setAdminRemarks(''); 
      fetchData(); 
    } else {
      alert("Error updating request: " + error.message);
    }
  };

  const handleOfficeAction = async (officeId) => {
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', officeId);
    if (!error) {
        alert("Office Approved Successfully!");
        fetchData();
    } else {
        alert("Error approving office: " + error.message);
    }
  };

  const tabBtn = (tabName) => ({
    padding: '12px 25px', cursor: 'pointer', border: 'none', fontWeight: 'bold',
    backgroundColor: activeTab === tabName ? '#cc0000' : '#ddd', 
    color: activeTab === tabName ? 'white' : '#333',
    borderRadius: '8px 8px 0 0', marginRight: '5px'
  });

  return (
    <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {selectedReq && (
        <ReviewModal 
          req={selectedReq} 
          adminRemarks={adminRemarks}
          setAdminRemarks={setAdminRemarks}
          onUpdate={updateRequestStatus}
          onClose={() => { setSelectedReq(null); setAdminRemarks(''); }}
        />
      )}

      <div style={{ backgroundColor: '#cc0000', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div>
          <h2 style={{ margin: 0 }}>LGU PILILLA | ADMINISTRATOR</h2>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Government Travel Authority System</p>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: 'white', color: '#cc0000', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
      </div>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex' }}>
            <button style={tabBtn('pending')} onClick={() => setActiveTab('pending')}>Pending Requests</button>
            <button style={tabBtn('approved')} onClick={() => setActiveTab('approved')}>Approved Requests</button>
            <button style={tabBtn('denied')} onClick={() => setActiveTab('denied')}>Denied Requests</button>
            <button style={tabBtn('office_approvals')} onClick={() => setActiveTab('office_approvals')}>Office Registration</button>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
            />
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>SORT:</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '0 12px 12px 12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          {loading ? <p>Loading data...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', fontSize: '13px', color: '#666' }}>
                  <th style={{ padding: '15px' }}>{activeTab === 'office_approvals' ? 'OFFICE NAME' : 'SENDER / OFFICE'}</th>
                  <th style={{ padding: '15px' }}>{activeTab === 'office_approvals' ? 'OFFICE HEAD' : 'DETAILS'}</th>
                  <th style={{ padding: '15px' }}>SUBMITTED</th>
                  <th style={{ padding: '15px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {dataList.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>No records found matching your search.</td></tr>
                ) : dataList.map(item => (
                  <tr 
                    key={item.id} 
                    onClick={activeTab !== 'office_approvals' ? () => setSelectedReq(item) : undefined} 
                    style={{ borderBottom: '1px solid #f9f9f9', cursor: activeTab !== 'office_approvals' ? 'pointer' : 'default' }} 
                    onMouseOver={(e) => activeTab !== 'office_approvals' && (e.currentTarget.style.backgroundColor = '#fff5f5')} 
                    onMouseOut={(e) => activeTab !== 'office_approvals' && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>
                      {activeTab === 'office_approvals' ? item.office_name : (item.profiles?.office_name || "Unknown Office")}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {activeTab === 'office_approvals' ? item.office_head : (
                        <div>
                          <div style={{ fontWeight: '500' }}>To: {item.destination}</div>
                          <div style={{ fontSize: '11px', color: '#777' }}>{item.travel_type}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {activeTab === 'office_approvals' ? (
                        <button 
                          onClick={() => handleOfficeAction(item.id)} 
                          style={{ backgroundColor: '#0E9F6E', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          APPROVE OFFICE
                        </button>
                      ) : (
                        <span style={{ color: '#cc0000', fontWeight: 'bold', fontSize: '12px' }}>VIEW DETAILS</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}