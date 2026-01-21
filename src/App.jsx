import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. IMPORTING OUR COMPONENTS
import Landing from './components/Landing';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import AdminPortal from './components/AdminPortal';

// 2. INITIALIZE SUPABASE CLIENT
const supabaseUrl = 'https://ioulrydbxhjxoxdnulbp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdWxyeWRieGhqeG94ZG51bGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDM3MzcsImV4cCI6MjA4NDUxOTczN30.Fc_0l-Frq9vH-Dn4OpVU7C98LFBauPlLX3Mta-39yxA';

// We initialize this outside the component so it's globally available in this file
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [loading, setLoading] = useState(true);

  // 3. SESSION & ROLE HANDLING
  const handleUserSession = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setCurrentPage('landing');
      setLoading(false);
      return;
    }

    setUser(sessionUser);

    try {
      // Fetch the profile to check for is_admin flag
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error.message);
      }
      setProfile(data);
      setCurrentPage('dashboard');
    } catch (err) {
      console.error("Session processing error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user ?? null);
    });

    // Listen for sign-in/sign-out events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      handleUserSession(session?.user ?? null);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // 4. PREVENT FLASHING OF WRONG PAGE
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/lgu-logo.png" style={{ width: '80px', marginBottom: '15px' }} alt="Loading" />
          <p style={{ fontWeight: 'bold', color: '#666' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  // 5. NAVIGATION LOGIC
  const renderPage = () => {
    // Scenario: User is not logged in
    if (!user) {
      if (currentPage === 'landing') {
        return <Landing onGetStarted={() => setCurrentPage('auth')} />;
      }
      if (currentPage === 'auth') {
        return (
          <Auth 
            supabase={supabase} 
            onAuthSuccess={(u) => handleUserSession(u)} 
          />
        );
      }
    }

    // Scenario: User is logged in - Check Role
    if (profile?.is_admin) {
      return <AdminPortal supabase={supabase} />;
    }

    return (
      <UserDashboard 
        supabase={supabase} 
        user={user} 
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
      {renderPage()}
    </div>
  );
}