import { db } from '../config/database.js';

export async function getUnreadNotifications() {
  const rows = db.prepare('SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC').all();
  return rows;
}

export async function createNotification(notification) {
  const result = db.prepare(`
    INSERT INTO notifications (complaint_id, title, message, priority)
    VALUES (?, ?, ?, ?)
  `).run(notification.complaint_id, notification.title, notification.message, notification.priority);
  
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
}

export async function markNotificationAsRead(id, employeeId) {
  db.prepare(`
    UPDATE notifications 
    SET is_read = 1, read_by = ? 
    WHERE id = ?
  `).run(employeeId, id);
}

export async function markAllNotificationsAsRead(employeeId) {
  db.prepare(`
    UPDATE notifications 
    SET is_read = 1, read_by = ? 
    WHERE is_read = 0
  `).run(employeeId);
}
