/**
 * Email Templates
 * HTML email templates for different email types
 */

const config = require('../config/app.config');

/**
 * Base email template wrapper
 */
const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content { 
      background: #f9fafb; 
      padding: 30px; 
    }
    .field { 
      margin-bottom: 20px; 
      background: white;
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }
    .label { 
      font-weight: bold; 
      color: #4b5563; 
      margin-bottom: 5px; 
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .value { 
      color: #1f2937;
      font-size: 15px;
      margin-top: 5px;
    }
    .footer { 
      background: #1f2937; 
      color: white; 
      padding: 20px; 
      text-align: center; 
    }
    .footer p {
      margin: 5px 0;
      font-size: 13px;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .contact-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .contact-info h3 {
      margin: 0 0 15px 0;
      color: #1f2937;
      font-size: 18px;
    }
    .contact-info p {
      margin: 8px 0;
      color: #4b5563;
    }
    .highlight {
      background: #fef3c7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;

/**
 * Contact Form - Company Notification Template
 */
const contactCompanyTemplate = (data) => {
  const { name, email, phone, company, projectType, message } = data;
  const timestamp = new Date().toLocaleString('en-AE', { timeZone: config.email.timezone });
  
  const content = `
    <div class="container">
      <div class="header">
        <h1>🔔 New Customer Inquiry</h1>
        <p style="font-size: 16px; margin-top: 10px;">You have received a new contact form submission</p>
      </div>
      <div class="content">
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <strong style="color: #856404;">⚡ Action Required:</strong>
          <span style="color: #856404;"> Please respond to this inquiry within 2 hours</span>
        </div>

        <h2 style="color: #1f2937; margin: 20px 0 15px 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">👤 Customer Information</h2>
        
        <div class="field">
          <div class="label">Full Name</div>
          <div class="value">${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email Address</div>
          <div class="value">
            <a href="mailto:${email}" style="color: #667eea; font-weight: bold;">${email}</a>
          </div>
        </div>
        
        <div class="field">
          <div class="label">Phone Number</div>
          <div class="value">
            <a href="tel:${phone}" style="color: #667eea; font-weight: bold;">${phone}</a>
          </div>
        </div>
        
        ${company ? `
        <div class="field">
          <div class="label">Company Name</div>
          <div class="value">${company}</div>
        </div>
        ` : '<div class="field"><div class="label">Company Name</div><div class="value" style="color: #999;">Not provided</div></div>'}
        
        ${projectType ? `
        <div class="field">
          <div class="label">Project Type</div>
          <div class="value" style="text-transform: capitalize; font-weight: bold;">
            ${projectType === 'residential' ? '🏠 Residential' : 
              projectType === 'commercial' ? '🏢 Commercial' : 
              projectType === 'industrial' ? '🏭 Industrial' : 
              projectType === 'emergency' ? '🚨 Emergency Service' : 
              projectType === 'rental' ? '📦 Equipment Rental' : 
              projectType === 'consultation' ? '💡 Consultation' : 
              projectType}
          </div>
        </div>
        ` : '<div class="field"><div class="label">Project Type</div><div class="value" style="color: #999;">Not specified</div></div>'}

        <h2 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">💬 Customer Message</h2>
        
        <div class="field">
          <div class="value" style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; line-height: 1.8;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <h2 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 8px;">📊 Submission Details</h2>
        
        <div class="field">
          <div class="label">Submission Date & Time</div>
          <div class="value">${timestamp} (UAE Time)</div>
        </div>
        
        <div class="field">
          <div class="label">Source</div>
          <div class="value">Website Contact Form</div>
        </div>

        <div style="background: #f0f9ff; border: 2px solid #0284c7; padding: 20px; margin-top: 30px; border-radius: 8px; text-align: center;">
          <h3 style="color: #0369a1; margin: 0 0 10px 0;">Quick Actions</h3>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:${email}" style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">📧 Reply by Email</a>
            <a href="tel:${phone}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">📞 Call Customer</a>
          </div>
        </div>
      </div>
      <div class="footer">
        <p><strong>${config.email.companyName}</strong></p>
        <p style="font-size: 12px; margin-top: 5px;">This is an automated notification from your website contact form</p>
        <p style="font-size: 12px; color: #94a3b8;">⏰ Response Time Target: Within 2 Hours</p>
      </div>
    </div>
  `;
  
  return baseTemplate(content, 'New Customer Inquiry - Action Required');
};

/**
 * Contact Form - Customer Auto-Reply Template
 */
const contactCustomerTemplate = (data) => {
  const { name, email, phone, company, projectType, message } = data;
  const timestamp = new Date().toLocaleString('en-AE', { timeZone: config.email.timezone });
  
  const content = `
    <div class="container">
      <div class="header">
        <h1>✅ Thank You for Reaching Out!</h1>
        <p style="font-size: 16px; margin-top: 10px;">Your message has been received successfully</p>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 1.8;">Dear <strong style="color: #667eea;">${name}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.8; color: #4b5563;">
          Thank you for contacting <strong style="color: #1f2937;">${config.email.companyName}</strong>. 
          We have successfully received your inquiry and truly appreciate you taking the time to reach out to us.
        </p>

        <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✅ What happens next?</strong><br>
            Our dedicated team is reviewing your message and will respond to you within <strong style="color: #059669;">${config.email.responseTime}</strong>. 
            We're committed to providing you with the best scaffolding solutions tailored to your needs.
          </p>
        </div>

        <h3 style="color: #1f2937; margin: 25px 0 15px 0; font-size: 17px;">📋 Summary of Your Inquiry</h3>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${phone}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Company:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${company}</td>
            </tr>
            ` : ''}
            ${projectType ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Project Type:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-transform: capitalize;">${projectType}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Submitted:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${timestamp}</td>
            </tr>
          </table>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <div style="color: #6b7280; font-size: 13px; font-weight: bold; margin-bottom: 8px;">YOUR MESSAGE:</div>
          <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="contact-info" style="margin-top: 30px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">📞 Need Immediate Assistance?</h3>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📱 Phone:</strong> 
            <a href="tel:${config.email.emergencyHotline}" style="color: #667eea; text-decoration: none;">${config.email.emergencyHotline}</a>
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📧 Email:</strong> 
            <a href="mailto:${config.email.supportEmail}" style="color: #667eea; text-decoration: none;">${config.email.supportEmail}</a>
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📍 Address:</strong> ${config.email.companyAddress}
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>⏰ Business Hours:</strong> Mon-Fri 7AM-6PM, Sat 8AM-4PM
          </p>
          <p style="margin: 8px 0; font-size: 14px; color: #dc2626; font-weight: bold;">
            <strong>🚨 Emergency Hotline:</strong> 24/7 Available
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin-top: 30px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: white;">Why Choose Alcoa Scaffolding?</h3>
          <p style="margin: 5px 0; font-size: 14px;">✓ Professional & Certified Team</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ High-Quality Equipment</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ Safety Compliant Solutions</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ Fast Response & Delivery</p>
        </div>
      </div>
      <div class="footer">
        <p style="font-size: 16px; margin: 0;"><strong>Best Regards,</strong></p>
        <p style="font-size: 15px; margin: 5px 0; font-weight: bold;">${config.email.companyName} Team</p>
        <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
          This is an automated confirmation email. We will respond to you personally within ${config.email.responseTime}.
        </p>
      </div>
    </div>
  `;
  
  return baseTemplate(content, `Thank You for Contacting ${config.email.companyName}`);
};

/**
 * Quote Request - Company Notification Template
 */
const quoteCompanyTemplate = (data) => {
  const { name, email, phone, company, projectType, message, projectHeight, coverageArea, duration, startDate } = data;
  const timestamp = new Date().toLocaleString('en-AE', { timeZone: config.email.timezone });
  
  const content = `
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1>💰 New Quote Request</h1>
        <p style="font-size: 16px; margin-top: 10px;">High Priority - Customer requesting quotation</p>
      </div>
      <div class="content">
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <strong style="color: #92400e;">⚡ Priority Action:</strong>
          <span style="color: #92400e;"> Please provide detailed quote within 24 hours</span>
        </div>

        <h2 style="color: #1f2937; margin: 20px 0 15px 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">📋 Project Specifications</h2>
        
        ${projectHeight ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">📏 Project Height</div>
          <div class="value" style="font-size: 16px; font-weight: bold; color: #059669;">${projectHeight} meters</div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">📏 Project Height</div><div class="value" style="color: #999;">Not specified</div></div>'}
        
        ${coverageArea ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">📐 Coverage Area</div>
          <div class="value" style="font-size: 16px; font-weight: bold; color: #059669;">${coverageArea} square meters</div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">📐 Coverage Area</div><div class="value" style="color: #999;">Not specified</div></div>'}
        
        ${duration ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">⏱️ Project Duration</div>
          <div class="value" style="font-weight: bold;">${duration}</div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">⏱️ Project Duration</div><div class="value" style="color: #999;">Not specified</div></div>'}
        
        ${startDate ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">📅 Preferred Start Date</div>
          <div class="value" style="font-weight: bold; color: #059669;">${new Date(startDate).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">📅 Preferred Start Date</div><div class="value" style="color: #999;">Not specified</div></div>'}

        <h2 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">👤 Customer Contact Details</h2>
        
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Full Name</div>
          <div class="value">${name}</div>
        </div>
        
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Email Address</div>
          <div class="value">
            <a href="mailto:${email}" style="color: #10b981; font-weight: bold;">${email}</a>
          </div>
        </div>
        
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Phone Number</div>
          <div class="value">
            <a href="tel:${phone}" style="color: #10b981; font-weight: bold;">${phone}</a>
          </div>
        </div>
        
        ${company ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Company Name</div>
          <div class="value">${company}</div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">Company Name</div><div class="value" style="color: #999;">Not provided</div></div>'}
        
        ${projectType ? `
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Project Type</div>
          <div class="value" style="text-transform: capitalize; font-weight: bold;">
            ${projectType === 'residential' ? '🏠 Residential' : 
              projectType === 'commercial' ? '🏢 Commercial' : 
              projectType === 'industrial' ? '🏭 Industrial' : 
              projectType === 'emergency' ? '🚨 Emergency Service' : 
              projectType === 'rental' ? '📦 Equipment Rental' : 
              projectType === 'consultation' ? '💡 Consultation' : 
              projectType}
          </div>
        </div>
        ` : '<div class="field" style="border-left-color: #10b981;"><div class="label">Project Type</div><div class="value" style="color: #999;">Not specified</div></div>'}

        ${message ? `
        <h2 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">💬 Additional Requirements / Notes</h2>
        <div class="field" style="border-left-color: #10b981;">
          <div class="value" style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; line-height: 1.8;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}

        <h2 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">📊 Request Information</h2>
        
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Request Date & Time</div>
          <div class="value">${timestamp} (UAE Time)</div>
        </div>
        
        <div class="field" style="border-left-color: #10b981;">
          <div class="label">Source</div>
          <div class="value">Website Quote Form</div>
        </div>

        <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 20px; margin-top: 30px; border-radius: 8px; text-align: center;">
          <h3 style="color: #065f46; margin: 0 0 10px 0;">Quick Actions</h3>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="mailto:${email}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">📧 Send Quote by Email</a>
            <a href="tel:${phone}" style="background: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">📞 Discuss Requirements</a>
          </div>
        </div>
      </div>
      <div class="footer">
        <p><strong>${config.email.companyName}</strong></p>
        <p style="font-size: 12px; margin-top: 5px;">Quote request from your website</p>
        <p style="font-size: 12px; color: #94a3b8;">⏰ Quote Delivery Target: Within 24 Hours</p>
      </div>
    </div>
  `;
  
  return baseTemplate(content, 'New Quote Request - Priority');
};

/**
 * Quote Request - Customer Auto-Reply Template
 */
const quoteCustomerTemplate = (data) => {
  const { name, email, phone, company, projectType, message, projectHeight, coverageArea, duration, startDate } = data;
  const timestamp = new Date().toLocaleString('en-AE', { timeZone: config.email.timezone });
  
  const content = `
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1>✅ Quote Request Received Successfully!</h1>
        <p style="font-size: 16px; margin-top: 10px;">We're preparing your customized quotation</p>
      </div>
      <div class="content">
        <p style="font-size: 16px; line-height: 1.8;">Dear <strong style="color: #10b981;">${name}</strong>,</p>
        
        <p style="font-size: 15px; line-height: 1.8; color: #4b5563;">
          Thank you for requesting a quote from <strong style="color: #1f2937;">${config.email.companyName}</strong>. 
          We have successfully received your project details and our expert team is already working on preparing a comprehensive quotation tailored to your specific requirements.
        </p>

        <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #065f46;">
            <strong>✅ What happens next?</strong><br>
            Our team is analyzing your project specifications and will send you a detailed, competitive quotation within <strong style="color: #059669;">24 hours</strong>. 
            The quote will include pricing, equipment details, delivery timeline, and all necessary project information.
          </p>
        </div>

        <h3 style="color: #1f2937; margin: 25px 0 15px 0; font-size: 17px;">📋 Your Quote Request Summary</h3>
        
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${phone}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Company:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${company}</td>
            </tr>
            ` : ''}
            ${projectType ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Project Type:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; text-transform: capitalize;">${projectType}</td>
            </tr>
            ` : ''}
            ${projectHeight ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Project Height:</strong></td>
              <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: bold;">${projectHeight} meters</td>
            </tr>
            ` : ''}
            ${coverageArea ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Coverage Area:</strong></td>
              <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: bold;">${coverageArea} sqm</td>
            </tr>
            ` : ''}
            ${duration ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Duration:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${duration}</td>
            </tr>
            ` : ''}
            ${startDate ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Start Date:</strong></td>
              <td style="padding: 8px 0; color: #10b981; font-size: 14px; font-weight: bold;">${new Date(startDate).toLocaleDateString('en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Requested:</strong></td>
              <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${timestamp}</td>
            </tr>
          </table>
        </div>

        ${message ? `
        <div style="background: white; border: 2px solid #e5e7eb; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <div style="color: #6b7280; font-size: 13px; font-weight: bold; margin-bottom: 8px;">YOUR ADDITIONAL NOTES:</div>
          <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">💡 What's Included in Your Quote:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li style="margin: 5px 0;">Detailed pricing breakdown</li>
            <li style="margin: 5px 0;">Equipment specifications & quantities</li>
            <li style="margin: 5px 0;">Delivery and setup timeline</li>
            <li style="margin: 5px 0;">Safety compliance information</li>
            <li style="margin: 5px 0;">Terms and conditions</li>
          </ul>
        </div>

        <div class="contact-info" style="margin-top: 30px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">📞 Need Immediate Assistance?</h3>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📱 Phone:</strong> 
            <a href="tel:${config.email.emergencyHotline}" style="color: #10b981; text-decoration: none;">${config.email.emergencyHotline}</a>
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📧 Email:</strong> 
            <a href="mailto:${config.email.supportEmail}" style="color: #10b981; text-decoration: none;">${config.email.supportEmail}</a>
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>📍 Address:</strong> ${config.email.companyAddress}
          </p>
          <p style="margin: 8px 0; font-size: 14px;">
            <strong>⏰ Business Hours:</strong> Mon-Fri 7AM-6PM, Sat 8AM-4PM
          </p>
          <p style="margin: 8px 0; font-size: 14px; color: #dc2626; font-weight: bold;">
            <strong>🚨 Emergency Service:</strong> 24/7 Available
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; margin-top: 30px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: white;">Why Choose Alcoa Scaffolding?</h3>
          <p style="margin: 5px 0; font-size: 14px;">✓ Competitive & Transparent Pricing</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ Premium Quality Equipment</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ Professional Installation Team</p>
          <p style="margin: 5px 0; font-size: 14px;">✓ Fast Delivery Across UAE</p>
        </div>
      </div>
      <div class="footer">
        <p style="font-size: 16px; margin: 0;"><strong>Best Regards,</strong></p>
        <p style="font-size: 15px; margin: 5px 0; font-weight: bold;">${config.email.companyName} Team</p>
        <p style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
          This is an automated confirmation. Your personalized quote will be sent within 24 hours.
        </p>
      </div>
    </div>
  `;
  
  return baseTemplate(content, `Your Quote Request - ${config.email.companyName}`);
};

module.exports = {
  contactCompanyTemplate,
  contactCustomerTemplate,
  quoteCompanyTemplate,
  quoteCustomerTemplate
};

