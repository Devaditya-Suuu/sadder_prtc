import React, { useState, useRef } from 'react';
import { login, startTrip, sendLocation, endTrip, health, apiBase } from './api';

const sendIntervalMs = 5500;

export default function App() {
  const [busNumber, setBusNumber] = useState('KA-01-HB-2001');
  const [password, setPassword] = useState('pass123');
  const [auth, setAuth] = useState(null); // { token, busId }
  const [direction, setDirection] = useState('forward');
  const [trip, setTrip] = useState(null); // { id, direction }
  const [lastSent, setLastSent] = useState(null);
  const [count, setCount] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);
  const sending = useRef(false);
  const watchId = useRef(null);

  async function handleLogin(e){
    e.preventDefault();
    try {
      const data = await login(busNumber.trim(), password);
      if(!data.token) throw new Error('No token returned');
      setAuth({ token: data.token, busId: data.busId, busNumber: busNumber.trim() });
    } catch (e) {
      alert('Login failed: ' + e.message + '\nAPI: ' + apiBase());
    }
  }

  async function handleStart(){
    try {
      const res = await startTrip(auth.token, { direction });
      const tripId = res?.data?._id || res?.data?.id || res?.data?.tripId || res.tripId;
      if(!tripId) throw new Error('Trip ID missing');
      setTrip({ id: tripId, direction });
      beginWatch(tripId);
    } catch(e){
      alert('Start trip failed: ' + e.message);
    }
  }

  function beginWatch(tripId){
    if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
    if(watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(pos => {
      const { latitude: lat, longitude: lng, speed, heading } = pos.coords;
      queueSend(tripId, { lat, lng, speed, heading });
    }, err => {
      console.warn('Geo error', err);
    }, { enableHighAccuracy: true, maximumAge: 4000, timeout: 15000 });
  }

  function queueSend(tripId, loc){
    if(sending.current) return;
    sending.current = true;
    sendLocation(auth.token, tripId, loc)
      .then(()=>{
        setLastSent({ ...loc, at: new Date().toISOString() });
        setCount(c=>c+1);
      })
      .catch(err=> console.warn('Send failed', err.message))
      .finally(()=> setTimeout(()=>{ sending.current = false; }, sendIntervalMs));
  }

  async function handleEnd(){
    try { await endTrip(auth.token, trip.id); } catch(e){ /* ignore */ }
    if(watchId.current){ navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
    setTrip(null); setLastSent(null); setCount(0);
  }

  function logout(){ handleEnd(); setAuth(null); }

  return (
    <div style={styles.root}>
      <h2>Driver Dashboard (Web)</h2>
      {!auth && (
        <form onSubmit={handleLogin} style={styles.card}>
          <h3>Login</h3>
          <div style={{fontSize:12, opacity:0.7}}>API Base: {apiBase()}</div>
          <button type="button" onClick={async()=>{ try { const h = await health(); setApiStatus('OK ' + h.status); } catch(e){ setApiStatus('FAIL ' + e.message);} }} style={{marginTop:4}}>Health Check</button>
          <div style={{fontSize:12}}>Health: {apiStatus || '—'}</div>
          <input value={busNumber} onChange={e=>setBusNumber(e.target.value)} placeholder='Bus Number' />
          <input value={password} type='password' onChange={e=>setPassword(e.target.value)} placeholder='Password' />
          <button type='submit'>Login</button>
        </form>
      )}

      {auth && !trip && (
        <div style={styles.card}>
          <h3>Start Trip</h3>
          <p>Bus: {auth.busNumber}</p>
          <div style={{display:'flex', gap:8}}>
            {['forward','reverse'].map(d => (
              <button key={d} onClick={()=>setDirection(d)} style={d===direction? styles.selBtn:undefined}>{d}</button>
            ))}
          </div>
          <button style={{marginTop:12}} onClick={handleStart}>Start Trip</button>
          <button style={{marginTop:8}} onClick={logout}>Logout</button>
        </div>
      )}

      {auth && trip && (
        <div style={styles.card}>
          <h3>Trip Active</h3>
          <p>ID: {trip.id}</p>
          <p>Direction: {trip.direction}</p>
          <p>Sent: {count}</p>
          <p>Last: {lastSent? `${lastSent.lat.toFixed(5)}, ${lastSent.lng.toFixed(5)} @ ${new Date(lastSent.at).toLocaleTimeString()}`: '—'}</p>
          <button onClick={handleEnd}>End Trip</button>
          <button onClick={logout} style={{marginLeft:8}}>Logout</button>
        </div>
      )}

      <footer style={styles.ft}>API: {apiBase()}</footer>
    </div>
  );
}

function API_BASE(){ return import.meta.env.VITE_API_URL || 'http://10.84.2.139:3001/api'; }

const styles = {
  root:{ fontFamily:'system-ui, sans-serif', maxWidth:520, margin:'0 auto', padding:20 },
  card:{ border:'1px solid #ccc', padding:16, borderRadius:8, display:'flex', flexDirection:'column', gap:10 },
  selBtn:{ background:'#2563eb', color:'#fff', fontWeight:600 },
  ft:{ marginTop:40, fontSize:12, opacity:0.6 }
};
