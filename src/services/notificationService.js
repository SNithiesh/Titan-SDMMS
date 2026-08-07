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

let audioCtx = null;
let currentOsc1 = null;
let currentOsc2 = null;
let currentGain = null;
let alarmInterval = null;

// Initialize audio context only on first user interaction
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startAlarm(isCritical = false) {
  // Prevent multiple alarms from stacking
  stopAlarm();

  try {
    const ctx = getAudioContext();
    
    const playBeep = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      currentOsc1 = osc1;
      currentOsc2 = osc2;
      currentGain = gain;

      osc1.type = isCritical ? 'sawtooth' : 'sine';
      osc2.type = 'square';

      const baseFreq = isCritical ? 880 : 660;
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    };

    // Play immediately, then loop
    playBeep();
    alarmInterval = setInterval(playBeep, isCritical ? 800 : 1500);

  } catch (err) {
    console.warn('Audio alert playback restricted by browser policy:', err);
  }
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (currentGain) {
    try {
      currentGain.gain.exponentialRampToValueAtTime(0.001, getAudioContext().currentTime + 0.1);
    } catch(e) {}
  }
}

/**
 * Trigger real-time browser push notification and audio chime
 */
export function sendAlertNotification({ title, message, priority = 'High' }) {
  // 1. Play alert sound chime (loops until acknowledged)
  startAlarm(priority === 'Critical');

  // 2. Trigger native OS / Phone Push Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body: message,
        icon: '/titan-logo.jpg',
        badge: '/titan-logo.jpg',
        vibrate: priority === 'Critical' ? [300, 100, 300, 100, 400] : [200, 100, 200],
        tag: `titan-alert-${Date.now()}`, // unique tag so it doesn't overwrite
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
