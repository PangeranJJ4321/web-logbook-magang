import { Resend } from 'resend';

// Initialize the Resend client only if API key is provided
// This allows the app to start up and run even before the user puts in their API key
export const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder_key'
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  to: process.env.EMAIL_TO || '',
};
