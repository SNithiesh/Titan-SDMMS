import { 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../repositories/notification.repository.js';
import { successResponse } from '../utils/responseFormatter.js';

export async function listUnreadNotifications(req, res, next) {
  try {
    const notifications = await getUnreadNotifications();
    return successResponse(res, { notifications });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await markNotificationAsRead(id, req.user.employeeId);
    
    // Broadcast to all supervisors that a notification was read
    req.app.get('io')?.to('supervisors').emit('notification_read', { id });
    
    return successResponse(res, { id }, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await markAllNotificationsAsRead(req.user.employeeId);
    
    req.app.get('io')?.to('supervisors').emit('all_notifications_read');
    
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}
