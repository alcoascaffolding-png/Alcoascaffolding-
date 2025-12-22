/**
 * Quotation Email Template
 * Professional email template for sending quotations to customers
 */

const quotationEmailTemplate = (quotation) => {
  const itemsHTML = quotation.items.map((item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center;">${index + 1}</td>
      <td style="padding: 12px 8px;">
        <strong>${item.equipmentType}</strong><br/>
        <span style="font-size: 12px; color: #6b7280;">${item.description || ''}</span>
        ${item.size ? `<br/><span style="font-size: 12px; color: #3b82f6;">Size: ${item.size}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity} ${item.unit || 'Nos'}</td>
      ${quotation.quoteType === 'rental' && item.rentalDuration ? `
        <td style="padding: 12px 8px; text-align: center;">${item.rentalDuration.value} ${item.rentalDuration.unit}(s)</td>
      ` : ''}
      <td style="padding: 12px 8px; text-align: right;">AED ${item.ratePerUnit.toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">AED ${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quotation.quoteNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ALCOA ALUMINIUM SCAFFOLDING</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 12px;">Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding</p>
              <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 11px;">Sale | Hire | Installation | Maintenance | Safety Inspections | Training</p>
            </td>
          </tr>
          
          <!-- Quotation Title -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <h2 style="margin: 0; color: #dc3545; font-size: 24px; text-align: center;">QUOTATION</h2>
              <p style="margin: 10px 0 0 0; text-align: center; color: #6b7280; font-size: 14px;">Quote #${quotation.quoteNumber}</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                Dear <strong>${quotation.customerName}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Thank you for your interest in Alcoa Aluminium Scaffolding. We are pleased to provide you with the following quotation:
              </p>
            </td>
          </tr>
          
          <!-- Quote Details Box -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 6px; padding: 15px;">
                <tr>
                  <td width="50%" style="padding: 5px;">
                    <strong style="color: #374151;">Quote Date:</strong>
                    <span style="color: #6b7280;">${new Date(quotation.quoteDate).toLocaleDateString()}</span>
                  </td>
                  <td width="50%" style="padding: 5px;">
                    <strong style="color: #374151;">Valid Until:</strong>
                    <span style="color: #6b7280;">${new Date(quotation.validUntil).toLocaleDateString()}</span>
                  </td>
                </tr>
                ${quotation.subject ? `
                <tr>
                  <td colspan="2" style="padding: 10px 5px 5px 5px;">
                    <strong style="color: #374151;">Subject:</strong><br/>
                    <span style="color: #6b7280;">${quotation.subject}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- Items Table -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #0066cc; color: #ffffff;">
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px;">SN</th>
                    <th style="padding: 12px 8px; text-align: left; font-size: 12px;">DESCRIPTION</th>
                    <th style="padding: 12px 8px; text-align: center; font-size: 12px;">QTY</th>
                    ${quotation.quoteType === 'rental' ? '<th style="padding: 12px 8px; text-align: center; font-size: 12px;">DURATION</th>' : ''}
                    <th style="padding: 12px 8px; text-align: right; font-size: 12px;">RATE</th>
                    <th style="padding: 12px 8px; text-align: right; font-size: 12px;">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>
          
          <!-- Financial Summary -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="65%"></td>
                  <td width="35%">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                      <tr>
                        <td style="padding: 5px; color: #6b7280; font-size: 14px;">Subtotal:</td>
                        <td style="padding: 5px; text-align: right; color: #1f2937; font-size: 14px;">AED ${quotation.subtotal.toLocaleString()}</td>
                      </tr>
                      ${quotation.deliveryCharges > 0 ? `
                      <tr>
                        <td style="padding: 5px; color: #6b7280; font-size: 14px;">Delivery:</td>
                        <td style="padding: 5px; text-align: right; color: #1f2937; font-size: 14px;">AED ${quotation.deliveryCharges.toLocaleString()}</td>
                      </tr>
                      ` : ''}
                      ${quotation.installationCharges > 0 ? `
                      <tr>
                        <td style="padding: 5px; color: #6b7280; font-size: 14px;">Installation:</td>
                        <td style="padding: 5px; text-align: right; color: #1f2937; font-size: 14px;">AED ${quotation.installationCharges.toLocaleString()}</td>
                      </tr>
                      ` : ''}
                      ${quotation.discount > 0 ? `
                      <tr>
                        <td style="padding: 5px; color: #10b981; font-size: 14px;">Discount:</td>
                        <td style="padding: 5px; text-align: right; color: #10b981; font-size: 14px;">-AED ${quotation.discount.toLocaleString()}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 5px; color: #6b7280; font-size: 14px;">VAT (${quotation.vatPercentage}%):</td>
                        <td style="padding: 5px; text-align: right; color: #1f2937; font-size: 14px;">AED ${quotation.vatAmount.toLocaleString()}</td>
                      </tr>
                      <tr style="border-top: 2px solid #0066cc;">
                        <td style="padding: 10px 5px 5px 5px; color: #0066cc; font-size: 16px; font-weight: bold;">TOTAL:</td>
                        <td style="padding: 10px 5px 5px 5px; text-align: right; color: #0066cc; font-size: 18px; font-weight: bold;">AED ${quotation.totalAmount.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Terms -->
          ${quotation.notes ? `
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                <strong style="color: #92400e;">Notes:</strong>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 13px; line-height: 1.5;">${quotation.notes}</p>
              </div>
            </td>
          </tr>
          ` : ''}
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                If you have any questions or would like to proceed, please don't hesitate to contact us.
              </p>
              <a href="https://wa.me/${quotation.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I would like to discuss quotation ' + quotation.quoteNumber)}" 
                 style="display: inline-block; background-color: #25d366; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                💬 Reply via WhatsApp
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 25px 40px; color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 15px; border-bottom: 1px solid #374151;">
                    <h3 style="margin: 0; font-size: 16px; color: #ffffff;">Alcoa Aluminium Scaffolding</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6;">
                      📞 Phone: +971 58 137 5601 | +971 50 926 8038<br/>
                      📧 Email: Sales@alcoascaffolding.com<br/>
                      🌐 Website: www.alcoascaffolding.com<br/>
                      📍 Musaffah, Abu Dhabi, UAE
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px; font-size: 11px; color: #6b7280;">
                    TRN: 100123456700003 | Sale & Hire of Aluminium Scaffolding, Ladders, Steel Cuplock
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = { quotationEmailTemplate };

