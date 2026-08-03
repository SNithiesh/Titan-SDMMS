/**
 * TITAN SDMMS - REAL-TIME NOTIFICATION & ALERT ENGINE
 * Handles Browser Native Push Notifications, Web Audio Siren Alarms, and External Webhooks (SMS/WhatsApp)
 */

// Request browser notification permissions on launch
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Play an emergency audio alert chime for plant floor technicians
export function playAlertSound(isCritical = false) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create dual oscillator for industrial alarm tone
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = isCritical ? 'sawtooth' : 'sine';
    osc2.type = 'square';

    const baseFreq = isCritical ? 880 : 660; // A5 vs E5
    osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, audioCtx.currentTime);

    // Beep modulation for emergency alert
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(audioCtx.currentTime + 0.6);
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch (err) {
    console.warn('Audio alert playback restricted by browser policy:', err);
  }
}

/**
 * Trigger real-time browser push notification and audio chime
 */
export function sendAlertNotification({ title, message, priority = 'High', targetRoles = [] }) {
  // 1. Play alert sound chime
  playAlertSound(priority === 'Critical');

  // 2. Trigger native OS / Phone Push Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body: message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: priority === 'Critical' ? [300, 100, 300, 100, 400] : [200, 100, 200],
        tag: 'titan-breakdown-alert',
        requireInteraction: priority === 'Critical'
      };

      new Notification(title, options);
    } catch (e) {
      console.warn('Push notification error:', e);
    }
  }

  // 3. Dispatch external SMS/WhatsApp webhook if configured
  triggerExternalSmsNotification({ title, message, priority });
}

/**
 * Webhook integration template for Twilio / WhatsApp Business API
 */
export async function triggerExternalSmsNotification(payload) {
  const webhookUrl = import.meta.env.VITE_SMS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        department: 'TITAN SDMMS - Back Cover Dept',
        timestamp: new Date().toISOString(),
        ...payload
      })
    });
  } catch (err) {
    console.warn('External SMS Webhook dispatch failed:', err);
  }
}
