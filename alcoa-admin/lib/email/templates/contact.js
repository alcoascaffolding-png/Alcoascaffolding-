const companyName = process.env.NEXT_PUBLIC_APP_NAME || "Alcoa Aluminium Scaffolding";
const companyEmail = process.env.COMPANY_EMAIL || "sales@alcoascaffolding.com";

const baseTemplate = (content, title) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 0; background-color: #f1f5f9; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(15,23,42,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.95; }
    .content { background: #f8fafc; padding: 30px; }
    .field { margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #4f46e5; }
    .label { font-weight: 600; color: #64748b; margin-bottom: 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    .value { color: #0f172a; font-size: 15px; margin-top: 5px; }
    .footer { background: #0f172a; color: white; padding: 20px; text-align: center; }
    .footer p { margin: 5px 0; font-size: 13px; }
    a { color: #4f46e5; text-decoration: none; font-weight: 500; }
    h2 { color: #0f172a; margin: 20px 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
  </style>
</head>
<body>${content}</body>
</html>`;

export function contactCompanyTemplate(data) {
  const { name, email, phone, company, projectType, message } = data;
  const timestamp = new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" });

  const projectLabel = {
    residential: "Residential",
    commercial: "Commercial",
    industrial: "Industrial",
    emergency: "Emergency Service",
    rental: "Equipment Rental",
    consultation: "Consultation",
  }[projectType] || projectType || "Not specified";

  const content = `
  <div class="container">
    <div class="header">
      <h1>New Customer Inquiry</h1>
      <p>You have received a new contact form submission</p>
    </div>
    <div class="content">
      <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin-bottom:20px;border-radius:5px;">
        <strong style="color:#856404;">Action Required:</strong>
        <span style="color:#856404;"> Please respond within 2 hours</span>
      </div>
      <h2>Customer Information</h2>
      <div class="field"><div class="label">Full Name</div><div class="value">${name}</div></div>
      <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${email}">${email}</a></div></div>
      <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${phone}">${phone}</a></div></div>
      <div class="field"><div class="label">Company</div><div class="value">${company || "Not provided"}</div></div>
      <div class="field"><div class="label">Project Type</div><div class="value">${projectLabel}</div></div>
      <h2>Message</h2>
      <div class="field"><div class="value" style="line-height:1.8;">${(message || "").replace(/\n/g, "<br>")}</div></div>
      <h2>Submission Details</h2>
      <div class="field"><div class="label">Date & Time</div><div class="value">${timestamp} (UAE Time)</div></div>
      <div class="field"><div class="label">Source</div><div class="value">Website Contact Form</div></div>
    </div>
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p><a href="mailto:${companyEmail}" style="color:#c7d2fe;">${companyEmail}</a></p>
    </div>
  </div>`;

  return baseTemplate(content, `New Contact Inquiry from ${name}`);
}

export function contactCustomerTemplate(data) {
  const { name } = data;

  const content = `
  <div class="container">
    <div class="header">
      <h1>Thank You, ${name}!</h1>
      <p>We have received your inquiry</p>
    </div>
    <div class="content">
      <p style="font-size:16px;color:#1f2937;">Thank you for contacting <strong>${companyName}</strong>.</p>
      <p style="color:#4b5563;">We have received your message and our team will get back to you within <strong>2 business hours</strong>.</p>
      <div class="field">
        <div class="label">What happens next?</div>
        <div class="value">
          <ul style="margin:5px 0;padding-left:20px;color:#4b5563;">
            <li>Our sales team will review your inquiry</li>
            <li>We will contact you to understand your requirements</li>
            <li>We will provide a competitive quote for your project</li>
          </ul>
        </div>
      </div>
      <p style="color:#4b5563;">For urgent inquiries, please call us directly.</p>
    </div>
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p><a href="mailto:${companyEmail}" style="color:#c7d2fe;">${companyEmail}</a></p>
    </div>
  </div>`;

  return baseTemplate(content, "Thank You for Contacting Us");
}

export function quoteCompanyTemplate(data) {
  const { name, email, phone, company, projectType, projectHeight, coverageArea, duration, startDate, message } = data;
  const timestamp = new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" });

  const content = `
  <div class="container">
    <div class="header">
      <h1>New Quote Request</h1>
      <p>A customer is requesting a scaffolding quotation</p>
    </div>
    <div class="content">
      <div style="background:#d1fae5;border-left:4px solid #10b981;padding:15px;margin-bottom:20px;border-radius:5px;">
        <strong style="color:#065f46;">High Priority:</strong>
        <span style="color:#065f46;"> Quote requests require same-day response</span>
      </div>
      <h2>Customer Details</h2>
      <div class="field"><div class="label">Name</div><div class="value">${name}</div></div>
      <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${email}">${email}</a></div></div>
      <div class="field"><div class="label">Phone</div><div class="value"><a href="tel:${phone}">${phone}</a></div></div>
      <div class="field"><div class="label">Company</div><div class="value">${company || "Not provided"}</div></div>
      <h2>Project Details</h2>
      <div class="field"><div class="label">Project Type</div><div class="value">${projectType || "Not specified"}</div></div>
      ${projectHeight ? `<div class="field"><div class="label">Working Height</div><div class="value">${projectHeight}</div></div>` : ""}
      ${coverageArea ? `<div class="field"><div class="label">Coverage Area</div><div class="value">${coverageArea}</div></div>` : ""}
      ${duration ? `<div class="field"><div class="label">Duration</div><div class="value">${duration}</div></div>` : ""}
      ${startDate ? `<div class="field"><div class="label">Start Date</div><div class="value">${startDate}</div></div>` : ""}
      ${message ? `<h2>Additional Notes</h2><div class="field"><div class="value">${message.replace(/\n/g, "<br>")}</div></div>` : ""}
      <h2>Submission Details</h2>
      <div class="field"><div class="label">Date & Time</div><div class="value">${timestamp} (UAE Time)</div></div>
    </div>
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p><a href="mailto:${companyEmail}" style="color:#c7d2fe;">${companyEmail}</a></p>
    </div>
  </div>`;

  return baseTemplate(content, `New Quote Request from ${name}`);
}

export function quoteCustomerTemplate(data) {
  const { name } = data;

  const content = `
  <div class="container">
    <div class="header">
      <h1>Quote Request Received!</h1>
      <p>We are preparing your scaffolding quotation</p>
    </div>
    <div class="content">
      <p style="font-size:16px;color:#1f2937;">Dear <strong>${name}</strong>,</p>
      <p style="color:#4b5563;">Thank you for requesting a quote from <strong>${companyName}</strong>. We have received your request and our team is working on preparing a detailed quotation.</p>
      <div class="field">
        <div class="label">What to expect</div>
        <div class="value">
          <ul style="margin:5px 0;padding-left:20px;color:#4b5563;">
            <li>Our team will review your project requirements</li>
            <li>We will prepare a detailed quotation with competitive pricing</li>
            <li>You will receive your quote within <strong>4-6 business hours</strong></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p><a href="mailto:${companyEmail}" style="color:#c7d2fe;">${companyEmail}</a></p>
    </div>
  </div>`;

  return baseTemplate(content, "Your Quote Request is Being Processed");
}
