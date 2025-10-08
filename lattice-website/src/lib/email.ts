/**
 * Email notification utilities for the support ticket system
 *
 * Note: This is an optional enhancement. The ticket system will work without
 * email notifications. Users can manually check ticket status via the tracking page.
 *
 * To enable email notifications, install nodemailer and configure SMTP settings:
 * npm install nodemailer @types/nodemailer
 */

interface EmailConfig {
  host: string
  port: number
  user: string
  password: string
  from: string
}

interface TicketEmailData {
  ticketNumber: string
  subject: string
  userEmail: string
  userName?: string
  category: string
  priority: string
  description?: string
}

interface MessageEmailData {
  ticketNumber: string
  subject: string
  userEmail: string
  userName?: string
  messageContent: string
  authorName: string
  isStaffReply: boolean
}

interface StatusUpdateEmailData {
  ticketNumber: string
  subject: string
  userEmail: string
  userName?: string
  newStatus: string
  oldStatus?: string
}

// Check if email configuration is available
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM)
}

// Get email configuration
function getEmailConfig(): EmailConfig | null {
  if (!isEmailConfigured()) {
    return null
  }

  return {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.SMTP_FROM!
  }
}

// Create email transporter (if nodemailer is available)
async function createTransporter() {
  try {
    // Dynamic import to avoid build errors if nodemailer is not installed
    const nodemailer = await import('nodemailer')
    const config = getEmailConfig()

    if (!config) {
      throw new Error('Email configuration is missing')
    }

    return nodemailer.createTransporter({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password
      }
    })
  } catch (error) {
    console.error('Failed to create email transporter:', error)
    return null
  }
}

/**
 * Send ticket creation confirmation email
 */
export async function sendTicketCreatedEmail(data: TicketEmailData): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log('Email not configured - skipping ticket creation notification')
    return false
  }

  try {
    const transporter = await createTransporter()
    if (!transporter) return false

    const config = getEmailConfig()!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .ticket-number { background: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Created Successfully</h1>
            <p>Thank you for contacting our support team. Your ticket has been created and we'll respond within 24 hours.</p>
          </div>

          <div class="ticket-number">
            Ticket Number: ${data.ticketNumber}
          </div>

          <h2>Ticket Details</h2>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Priority:</strong> ${data.priority}</p>

          <h2>What's Next?</h2>
          <p>You can track the status of your ticket and view all communication by clicking the button below:</p>

          <a href="${appUrl}/support/tickets/${data.ticketNumber}" class="button">
            Track Your Ticket
          </a>

          <p>If you have any questions or need to provide additional information, please reply to this email or visit the tracking page.</p>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email directly.</p>
            <p>&copy; ${new Date().getFullYear()} Lattice Engine. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: config.from,
      to: data.userEmail,
      subject: `Support Ticket Created: ${data.ticketNumber}`,
      html: htmlContent
    })

    console.log(`Ticket creation email sent to ${data.userEmail}`)
    return true
  } catch (error) {
    console.error('Failed to send ticket creation email:', error)
    return false
  }
}

/**
 * Send ticket status update email
 */
export async function sendTicketStatusUpdateEmail(data: StatusUpdateEmailData): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log('Email not configured - skipping status update notification')
    return false
  }

  try {
    const transporter = await createTransporter()
    if (!transporter) return false

    const config = getEmailConfig()!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .ticket-number { background: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
          .status-update { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Status Update</h1>
            <p>Your support ticket status has been updated.</p>
          </div>

          <div class="ticket-number">
            Ticket Number: ${data.ticketNumber}
          </div>

          <div class="status-update">
            <h2>Status Change</h2>
            ${data.oldStatus ? `<p><strong>Previous Status:</strong> ${data.oldStatus}</p>` : ''}
            <p><strong>New Status:</strong> <strong>${data.newStatus}</strong></p>
          </div>

          <h2>Ticket Details</h2>
          <p><strong>Subject:</strong> ${data.subject}</p>

          <p>You can view the full ticket details and communication history by clicking the button below:</p>

          <a href="${appUrl}/support/tickets/${data.ticketNumber}" class="button">
            View Ticket Details
          </a>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email directly.</p>
            <p>&copy; ${new Date().getFullYear()} Lattice Engine. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: config.from,
      to: data.userEmail,
      subject: `Ticket Status Update: ${data.ticketNumber}`,
      html: htmlContent
    })

    console.log(`Status update email sent to ${data.userEmail}`)
    return true
  } catch (error) {
    console.error('Failed to send status update email:', error)
    return false
  }
}

/**
 * Send new message notification email
 */
export async function sendNewMessageEmail(data: MessageEmailData): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log('Email not configured - skipping message notification')
    return false
  }

  try {
    const transporter = await createTransporter()
    if (!transporter) return false

    const config = getEmailConfig()!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const adminEmail = process.env.ADMIN_EMAIL

    // If this is a staff reply, notify the user
    if (data.isStaffReply) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Reply to Your Support Ticket</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .ticket-number { background: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
            .message { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2; }
            .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Reply to Your Support Ticket</h1>
              <p>A support team member has responded to your ticket.</p>
            </div>

            <div class="ticket-number">
              Ticket Number: ${data.ticketNumber}
            </div>

            <div class="message">
              <h2>Reply from ${data.authorName}</h2>
              <p>${data.messageContent}</p>
            </div>

            <h2>Ticket Details</h2>
            <p><strong>Subject:</strong> ${data.subject}</p>

            <p>View the full conversation and reply by clicking the button below:</p>

            <a href="${appUrl}/support/tickets/${data.ticketNumber}" class="button">
              View Ticket & Reply
            </a>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email directly.</p>
              <p>&copy; ${new Date().getFullYear()} Lattice Engine. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: config.from,
        to: data.userEmail,
        subject: `New Reply: ${data.ticketNumber}`,
        html: htmlContent
      })

      console.log(`Staff reply notification sent to ${data.userEmail}`)
    }

    // If admin email is configured and this is a user message, notify admin
    if (!data.isStaffReply && adminEmail) {
      const adminHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Customer Message</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .ticket-number { background: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
            .message { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 New Customer Message</h1>
              <p>A customer has replied to a support ticket and needs your attention.</p>
            </div>

            <div class="ticket-number">
              Ticket Number: ${data.ticketNumber}
            </div>

            <div class="message">
              <h2>Message from ${data.authorName}</h2>
              <p><strong>Email:</strong> ${data.userEmail}</p>
              <p>${data.messageContent}</p>
            </div>

            <h2>Ticket Details</h2>
            <p><strong>Subject:</strong> ${data.subject}</p>

            <p>Please respond to the customer by clicking the button below:</p>

            <a href="${appUrl}/admin/tickets/${data.ticketNumber}" class="button">
              Respond to Customer
            </a>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email directly.</p>
              <p>&copy; ${new Date().getFullYear()} Lattice Engine. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: config.from,
        to: adminEmail,
        subject: `🚨 New Customer Message: ${data.ticketNumber}`,
        html: adminHtmlContent
      })

      console.log(`Admin notification sent to ${adminEmail}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send message notification email:', error)
    return false
  }
}

/**
 * Send admin notification for new ticket creation
 */
export async function sendAdminNotificationEmail(data: TicketEmailData): Promise<boolean> {
  if (!isEmailConfigured() || !process.env.ADMIN_EMAIL) {
    console.log('Email not configured or admin email missing - skipping admin notification')
    return false
  }

  try {
    const transporter = await createTransporter()
    if (!transporter) return false

    const config = getEmailConfig()!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>🎫 New Support Ticket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .ticket-number { background: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 4px; font-family: monospace; font-weight: bold; }
          .priority-high { background: #f8d7da; color: #721c24; padding: 8px; border-radius: 4px; display: inline-block; }
          .priority-medium { background: #fff3cd; color: #856404; padding: 8px; border-radius: 4px; display: inline-block; }
          .priority-low { background: #d1ecf1; color: #0c5460; padding: 8px; border-radius: 4px; display: inline-block; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 New Support Ticket Created</h1>
            <p>A customer has submitted a new support ticket that needs your attention.</p>
          </div>

          <div class="ticket-number">
            Ticket Number: ${data.ticketNumber}
          </div>

          <h2>Customer Information</h2>
          <p><strong>Name:</strong> ${data.userName || 'Not provided'}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>

          <h2>Ticket Details</h2>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Priority:</strong>
            <span class="priority-${data.priority.toLowerCase()}">${data.priority.toUpperCase()}</span>
          </p>

          ${data.description ? `
          <h2>Description</h2>
          <p>${data.description}</p>
          ` : ''}

          <p>Please review and respond to this ticket by clicking the button below:</p>

          <a href="${appUrl}/admin/tickets/${data.ticketNumber}" class="button">
            View & Respond to Ticket
          </a>

          <div class="footer">
            <p>This is an automated message. Please do not reply to this email directly.</p>
            <p>&copy; ${new Date().getFullYear()} Lattice Engine. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: config.from,
      to: process.env.ADMIN_EMAIL!,
      subject: `🎫 New Support Ticket: ${data.ticketNumber}`,
      html: htmlContent
    })

    console.log(`Admin notification sent to ${process.env.ADMIN_EMAIL}`)
    return true
  } catch (error) {
    console.error('Failed to send admin notification email:', error)
    return false
  }
}