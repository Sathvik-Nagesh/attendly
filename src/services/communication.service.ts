import { supabase } from "@/lib/supabase";

export const communicationService = {
  async enqueueNotification(slug: string, payload: any, recipientId?: string) {
    const { data, error } = await supabase
      .from('notification_queue')
      .insert({
        template_slug: slug,
        payload,
        recipient_id: recipientId,
        status: 'PENDING'
      });
    if (error) throw error;
    return data;
  },

  async broadcastNotification(notification: { title: string; message: string; type: string; recipient_id?: string }) {
    // Save to historical notifications table
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification);
    
    if (error) throw error;

    // Also drop into the transactional queue
    await this.enqueueNotification('security_alert', { 
        title: notification.title, 
        message: notification.message 
    }, notification.recipient_id);

    return data;
  },

  async getNotifications(recipientId?: string) {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (recipientId) {
      query = query.or(`recipient_id.eq.${recipientId},recipient_id.is.null`);
    }
    const { data, error } = await query.limit(10);
    if (error) throw error;
    return data;
  }
};
