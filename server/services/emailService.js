const nodemailer = require('nodemailer');
const config = require('../lib/config');

// Create transporter (configure based on your email provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(user) {
  if (!process.env.SMTP_USER) {
    console.log('Email service not configured. Skipping welcome email.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"DevConnect" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to DevConnect! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to DevConnect, ${user.name}!</h1>
          <p>We're excited to have you join our developer community.</p>
          <p>Get started by:</p>
          <ul>
            <li>Completing your profile</li>
            <li>Syncing your GitHub repositories</li>
            <li>Exploring job matches tailored to your skills</li>
          </ul>
          <a href="${config.clientUrl}/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Go to Dashboard
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

/**
 * Send job match notification
 */
async function sendJobMatchEmail(user, job, matchScore) {
  if (!process.env.SMTP_USER) {
    console.log('Email service not configured. Skipping job match email.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"DevConnect" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `New Job Match: ${job.title} at ${job.company} (${matchScore}% match)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Great News, ${user.name}!</h1>
          <p>We found a job that matches your profile:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>${job.title}</h2>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location} ${job.remote ? '(Remote)' : ''}</p>
            <p><strong>Match Score:</strong> ${matchScore}%</p>
            ${job.salary ? `<p><strong>Salary:</strong> $${job.salary.toLocaleString()}</p>` : ''}
          </div>
          <a href="${config.clientUrl}/jobs/${job.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            View Job Details
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending job match email:', error);
  }
}

/**
 * Send application confirmation
 */
async function sendApplicationConfirmation(user, job) {
  if (!process.env.SMTP_USER) {
    console.log('Email service not configured. Skipping application confirmation.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"DevConnect" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Application Submitted: ${job.title} at ${job.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Application Submitted!</h1>
          <p>Hi ${user.name},</p>
          <p>Your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been submitted successfully.</p>
          <p>We'll notify you when the company reviews your application.</p>
          <a href="${config.clientUrl}/jobs/${job.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            View Application
          </a>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending application confirmation:', error);
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  if (!process.env.SMTP_USER) {
    console.log('Email service not configured. Skipping password reset email.');
    return;
  }

  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: `"DevConnect" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Reset Your DevConnect Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Password Reset Request</h1>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendJobMatchEmail,
  sendApplicationConfirmation,
  sendPasswordResetEmail
};

