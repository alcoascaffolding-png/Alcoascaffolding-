# Playwright PDF Generator - Usage Guide

## Overview

The Playwright PDF generator creates professional quotation PDFs matching the ACE ALUMINIUM design. It's fully integrated into your backend and frontend.

## Backend Usage

### API Endpoint

```
GET /api/quotes/:id/pdf
```

**Headers Required:**
- `Authorization: Bearer <your-jwt-token>`

**Response:**
- Content-Type: `application/pdf`
- Returns PDF file directly

### Example (cURL)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/quotes/QUOTATION_ID/pdf \
     --output quotation.pdf
```

### In Code (Node.js)

```javascript
const { generateQuotationPDFBuffer } = require('./utils/playwrightPDFGenerator');

// Generate PDF buffer
const pdfBuffer = await generateQuotationPDFBuffer(quotationData);

// Use the buffer (send as response, save to file, attach to email, etc.)
```

## Frontend Usage

### Using the Quotation Service

```javascript
import quotationService from '@/services/api/quotationService';

// Download PDF directly
const handleDownloadPDF = async (quotationId) => {
  try {
    await quotationService.downloadPDF(quotationId);
    console.log('PDF downloaded successfully');
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

// Get PDF as blob (for preview)
const handlePreviewPDF = async (quotationId) => {
  try {
    const blob = await quotationService.getPDFBlob(quotationId);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
};
```

### React Component Example

```jsx
import { useState } from 'react';
import quotationService from '@/services/api/quotationService';
import toast from 'react-hot-toast';

const QuotationActions = ({ quotationId }) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      await quotationService.downloadPDF(quotationId);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? 'Generating...' : '📄 Download PDF'}
    </button>
  );
};
```

## Design Features

The PDF template includes:

✅ **Professional Header**
- Company name with red/blue color scheme
- Arabic company name (ايس للالومينيوم ذ.م.م)
- Service badges in horizontal bar
- TRN number

✅ **Customer & Quotation Details**
- Two-column layout
- All quotation metadata

✅ **Items Table**
- Product images in description column
- All pricing and VAT calculations
- Professional styling

✅ **Totals Section**
- Amount in words (e.g., "UAE Dirham Five Thousand...")
- VAT breakdown
- Net total

✅ **Certifications**
- TUV Certified Product info
- QRS/ISO certifications

✅ **Footer**
- Contact information
- Services list
- Company address

## Troubleshooting

### PDF Generation Fails

1. **Check Playwright installation:**
   ```bash
   npx playwright install chromium
   ```

2. **Check Node.js version:**
   - Requires Node.js 16+

3. **Memory issues:**
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm start
   ```

### Images Not Loading

- Ensure image URLs are accessible
- Check CORS settings for external images
- Use base64 encoded images for local files

### PDF Layout Issues

- Check browser console for CSS errors
- Ensure all fonts are available
- Verify A4 page size settings

## Customization

To customize the PDF design, edit:
- `backend/utils/playwrightPDFGenerator.js`
- Modify the `generateQuotationHTML()` function
- Update CSS styles in the `<style>` section

## Performance

- PDF generation typically takes 1-3 seconds
- First generation may be slower (browser initialization)
- Subsequent generations are faster (browser reuse)

## Production Deployment

1. Install Playwright browsers on server:
   ```bash
   npx playwright install chromium
   ```

2. Ensure sufficient memory (2GB+ recommended)

3. Set environment variables if needed:
   ```env
   NODE_ENV=production
   NODE_OPTIONS="--max-old-space-size=4096"
   ```

