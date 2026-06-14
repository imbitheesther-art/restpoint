// Resend Email Service for Rest Point
// Handles password reset codes, verification codes, and notifications
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_K5sw4sCc_2izEeP6oTPR6QNz81jw6sLFt';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@restpoint.co.ke';

let resendInstance = null;

const getResend = () => {
  if (!resendInstance) {
    resendInstance = new Resend(RESEND_API_KEY);
  }
  return resendInstance;
};

/**
 * Generate a random 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send a 6-digit verification code via Resend
 */
const sendVerificationCode = async ({ email, code, type = 'password_reset', userName }) => {
  const resend = getResend();
  
  let subject, html;
  
  if (type === 'password_reset') {
    subject = 'Your Password Reset Code - Rest Point';
    html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F172A; border-radius: 16px; color: #F1F5F9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(166,124,82,0.12); border: 1px solid rgba(166,124,82,0.2); border-radius: 8px; padding: 8px 16px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #A67C52; display: inline-block;"></span>
            <span style="font-size: 14px; font-weight: 700; letter-spacing: 0.16em; color: #A67C52;">REST POINT</span>
          </div>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #F1F5F9;">
          Password Reset Code
        </h1>
        
        <p style="font-size: 14px; color: #94A3B8; text-align: center; margin-bottom: 24px; line-height: 1.6;">
          ${userName ? `Hi ${userName},` : 'Hello,'}<br/>
          You requested to reset your password. Use the code below:
        </p>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 20px 40px; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #A67C52; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>
        
        <p style="font-size: 12px; color: #64748B; text-align: center; margin-bottom: 16px;">
          This code will expire in 10 minutes. Never share this code with anyone.
        </p>
        
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155;">
          <p style="font-size: 11px; color: #475569;">
            Rest Point Mortuary Management System<br/>
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;
  } else if (type === 'verification') {
    subject = 'Verify Your Email - Rest Point';
    html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F172A; border-radius: 16px; color: #F1F5F9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(166,124,82,0.12); border: 1px solid rgba(166,124,82,0.2); border-radius: 8px; padding: 8px 16px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #A67C52; display: inline-block;"></span>
            <span style="font-size: 14px; font-weight: 700; letter-spacing: 0.16em; color: #A67C52;">REST POINT</span>
          </div>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #F1F5F9;">
          Verify Your Email
        </h1>
        
        <p style="font-size: 14px; color: #94A3B8; text-align: center; margin-bottom: 24px; line-height: 1.6;">
          ${userName ? `Hi ${userName},` : 'Hello,'}<br/>
          Welcome to Rest Point. Use the code below to verify your email:
        </p>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 20px 40px; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #A67C52; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>
        
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155;">
          <p style="font-size: 11px; color: #475569;">
            Rest Point Mortuary Management System
          </p>
        </div>
      </div>
    `;
  } else if (type === 'opt_in') {
    subject = 'Your Verification Code - Rest Point';
    html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F172A; border-radius: 16px; color: #F1F5F9;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(166,124,82,0.12); border: 1px solid rgba(166,124,82,0.2); border-radius: 8px; padding: 8px 16px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #A67C52; display: inline-block;"></span>
            <span style="font-size: 14px; font-weight: 700; letter-spacing: 0.16em; color: #A67C52;">REST POINT</span>
          </div>
        </div>
        
        <h1 style="font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; color: #F1F5F9;">
          Verification Code
        </h1>
        
        <p style="font-size: 14px; color: #94A3B8; text-align: center; margin-bottom: 24px; line-height: 1.6;">
          ${userName ? `Hi ${userName},` : 'Hello,'}<br/>
          Your verification code is:
        </p>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 20px 40px; letter-spacing: 12px; font-size: 36px; font-weight: 800; color: #A67C52; font-family: 'Courier New', monospace;">
            ${code}
          </div>
        </div>
        
        <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155;">
          <p style="font-size: 11px; color: #475569;">
            Rest Point Mortuary Management System
          </p>
        </div>
      </div>
    `;
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: `Rest Point <${FROM_EMAIL}>`,
      to: [email],
      subject,
      html,
    });
    
    if (error) {
      console.error('[Resend] Failed to send email:', error);
      return { success: false, error };
    }
    
    console.log('[Resend] Email sent successfully:', data?.id);
    return { success: true, data, code };
  } catch (err) {
    console.error('[Resend] Error sending email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send a support ticket notification to the admin
 */
const sendTicketNotification = async ({ ticketId, subject, message, tenantName, userEmail }) => {
  const resend = getResend();
  
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0F172A; border-radius: 16px; color: #F1F5F9;">
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #A67C52;">
        🎫 New Support Ticket #${ticketId}
      </h1>
      
      <div style="background: #1E293B; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;">From</p>
        <p style="font-size: 14px; color: #F1F5F9; font-weight: 600;">${tenantName}</p>
        <p style="font-size: 12px; color: #94A3B8;">${userEmail}</p>
      </div>
      
      <div style="background: #1E293B; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;">Subject</p>
        <p style="font-size: 14px; color: #F1F5F9; font-weight: 600;">${subject}</p>
      </div>
      
      <div style="background: #1E293B; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 12px; color: #64748B; margin-bottom: 4px;">Message</p>
        <p style="font-size: 14px; color: #F1F5F9; line-height: 1.6;">${message}</p>
      </div>
      
      <div style="text-align: center; padding-top: 16px; border-top: 1px solid #334155;">
        <p style="font-size: 11px; color: #475569;">
          Rest Point Support System
        </p>
      </div>
    </div>
  `;
  
  try {
    const { data, error } = await resend.emails.send({
      from: `Rest Point Support <${FROM_EMAIL}>`,
      to: ['info@restpoint.co.ke'],
      replyTo: userEmail,
      subject: `[Ticket #${ticketId}] ${subject}`,
      html,
    });
    
    if (error) {
      console.error('[Resend] Failed to send ticket notification:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('[Resend] Error sending ticket notification:', err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendVerificationCode,
  sendTicketNotification,
  generateVerificationCode,
};