# WhatsApp Integration Setup Guide

This guide explains how to set up WhatsApp messaging for sending quotation PDFs using Twilio.

## Prerequisites

1. **Twilio Account**: Sign up at [https://www.twilio.com](https://www.twilio.com)
2. **WhatsApp Business API Access**: Request access to Twilio's WhatsApp Business API
3. **Verified WhatsApp Number**: Get a WhatsApp-enabled phone number from Twilio

## Setup Steps

### 1. Get Twilio Credentials

1. Log in to your Twilio Console
2. Navigate to **Settings** > **General** > **API Credentials**
3. Copy your:
   - **Account SID**
   - **Auth Token**

### 2. Get WhatsApp Number

1. In Twilio Console, go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. You'll see a WhatsApp number in format: `whatsapp:+14155238886`
3. Copy this number

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Base URL for PDF serving (required for WhatsApp)
BASE_URL=https://your-domain.com
# For local development:
# BASE_URL=http://localhost:5000
```

### 4. Install Dependencies

```bash
cd backend
npm install twilio
```

### 5. Test Configuration

You can test your WhatsApp configuration by calling the test endpoint (if implemented) or by sending a test quotation.

## Usage

### Send Quotation via WhatsApp

**Endpoint**: `POST /api/quotes/:id/send-whatsapp`

**Request Body** (optional):
```json
{
  "recipientPhone": "+971501234567",  // Optional, uses customer phone if not provided
  "pdfUrl": "https://example.com/path/to/pdf.pdf",  // Optional, auto-generates if not provided
  "message": "Custom message"  // Optional, uses default message if not provided
}
```

**Response**:
```json
{
  "success": true,
  "message": "Quotation sent via WhatsApp successfully",
  "data": {
    "quotation": { ... },
    "whatsapp": {
      "messageSid": "SM1234567890",
      "status": "sent",
      "sentTo": "+971501234567"
    }
  }
}
```

## How It Works

1. **PDF Generation**: The system generates a PDF using Playwright (same as email)
2. **PDF Storage**: PDF is saved to `backend/public/quotation-pdfs/` directory
3. **Public URL**: A public URL is generated for the PDF
4. **WhatsApp Message**: Twilio sends the message with PDF attachment via WhatsApp Business API
5. **Tracking**: The sending is tracked in the quotation's `whatsappSent` array

## Phone Number Format

- Phone numbers are automatically formatted to include country code
- Format: `whatsapp:+[country_code][number]`
- Example: `+971501234567` becomes `whatsapp:+971501234567`
- UAE numbers default to +971 if country code is missing

## Important Notes

1. **PDF URL Requirement**: Twilio requires a publicly accessible URL for media attachments. The system automatically saves PDFs to a public directory, but ensure your `BASE_URL` is correctly configured.

2. **WhatsApp Business API**: You need to be approved for Twilio's WhatsApp Business API. This may take some time.

3. **Sandbox Mode**: Initially, you'll be in Twilio's WhatsApp sandbox, which only allows messaging to verified numbers. To send to any number, you need to complete business verification.

4. **Rate Limits**: Twilio has rate limits for WhatsApp messages. Check your plan for details.

5. **Cost**: WhatsApp messages via Twilio are charged per message. Check Twilio pricing for current rates.

## Troubleshooting

### Error: "TWILIO_ACCOUNT_SID is not configured"
- Ensure your `.env` file has `TWILIO_ACCOUNT_SID` set

### Error: "TWILIO_WHATSAPP_NUMBER is not configured"
- Ensure your `.env` file has `TWILIO_WHATSAPP_NUMBER` set in format: `whatsapp:+14155238886`

### Error: "Customer phone number is required"
- Ensure the customer has a phone number in their profile
- Or provide `recipientPhone` in the request body

### PDF Not Sending
- Ensure `BASE_URL` is correctly configured and accessible
- Check that the PDF file is being created in `backend/public/quotation-pdfs/`
- Verify the URL is publicly accessible (not localhost in production)

## Production Recommendations

1. **Cloud Storage**: For production, consider uploading PDFs to cloud storage (AWS S3, Cloudinary, etc.) instead of local file system
2. **CDN**: Use a CDN for faster PDF delivery
3. **Cleanup**: Implement a cleanup job to remove old PDFs from the public directory
4. **Monitoring**: Monitor WhatsApp message delivery status and handle failures

## Support

For Twilio-specific issues, refer to:
- [Twilio WhatsApp Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Support](https://support.twilio.com/)

