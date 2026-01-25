import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const EMAIL_TEMPLATES = {
  'consulting-onboarding': {
    subject: 'Welcome to Bickford AI Compliance Consulting',
    html: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; max-width: 600px; margin: 0 auto; }
    .cta { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; display: inline-block; border-radius: 4px; margin: 20px 0; }
    .steps { background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header"><h1>🎉 Welcome to Bickford</h1></div>
  <div class="content">
    <p>Hi ${data.customerName},</p>
    <p>Thank you for your purchase of <strong>AI Compliance Consulting</strong> ($${data.amount}).</p>
    <div class="steps">
      <p><strong>Next Steps:</strong></p>
      ${data.nextSteps.split('\n').map((step: string) => `<p>${step}</p>`).join('')}
    </div>
    <a href="${data.schedulingLink}" class="cta">Schedule Your Audit</a>
    <p>Best,<br>Derek Bickford</p>
  </div>
</body>
</html>`,
  },
  'beta-onboarding': {
    subject: 'Bickford Beta Access - Setup Instructions',
    html: (data: any) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h1>🚀 Welcome to Bickford Beta!</h1>
  <p>Hi ${data.customerName},</p>
  <p>Your <strong>${data.tier}</strong> tier access is now active.</p>
  <p><strong>API Key:</strong> <code>${data.apiKey}</code></p>
  <p><strong>Next Steps:</strong></p>
  ${data.nextSteps.split('\n').map((step: string) => `<p>${step}</p>`).join('')}
  <p>Best,<br>Derek</p>
</body>
</html>`,
  },
  'audit-instructions': {
    subject: 'Compliance Audit - Upload Your Data',
    html: (data: any) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h2>Ready to Generate Your Compliance Certificate</h2>
  <p>Hi ${data.customerName},</p>
  <p>Upload your data: <a href="${data.uploadLink}">Click here</a></p>
  ${data.nextSteps.split('\n').map((step: string) => `<p>${step}</p>`).join('')}
  <p>Best,<br>Derek</p>
</body>
</html>`,
  },
  'generic-confirmation': {
    subject: 'Payment Received - Thank You!',
    html: (data: any) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h2>Thank You!</h2>
  <p>Hi ${data.customerName},</p>
  <p>Payment received for <strong>${data.productName}</strong> ($${data.amount}).</p>
  <p>${data.nextSteps}</p>
  <p>Best,<br>Derek</p>
</body>
</html>`,
  },
};

export async function sendOnboardingEmail(options: {
  to: string;
  subject: string;
  template: keyof typeof EMAIL_TEMPLATES;
  data: Record<string, any>;
}) {
  const template = EMAIL_TEMPLATES[options.template];
  if (!template) {
    console.error('Unknown email template:', options.template);
    return;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: process.env.NOTIFICATION_EMAIL || 'derek@bickford.tech',
      subject: template.subject,
      html: template.html(options.data),
    });
    console.log('Email sent to:', options.to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function notifyAdmin(options: {
  subject: string;
  message: string;
}) {
  try {
    await sgMail.send({
      to: process.env.NOTIFICATION_EMAIL || 'derek@bickford.tech',
      from: process.env.NOTIFICATION_EMAIL || 'derek@bickford.tech',
      subject: `[Bickford] ${options.subject}`,
      text: options.message,
    });
    console.log('Admin notification sent');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}
