import Notification from '../models/Notification.js';

export const notify = async ({ organization, recipients = [], type = 'system', title, body = '', link = '', actor }) => {
  try {
    if (!organization || !title) return null;
    return await Notification.create({
      organization,
      recipients,
      type,
      title,
      body,
      link,
      createdBy: actor,
    });
  } catch (err) {
    console.error('[notify] failed:', err.message);
    return null;
  }
};

export default notify;
