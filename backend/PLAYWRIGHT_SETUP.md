# Playwright PDF Generator Setup

This project uses **Playwright** for generating professional PDF quotations. Playwright is a modern, reliable alternative to Puppeteer with better browser support and more stable PDF generation.

## Installation

After installing npm dependencies, you need to install Playwright browsers:

```bash
# Install npm dependencies first
npm install

# Then install Playwright browsers
npx playwright install chromium

# Or install all browsers (optional)
npx playwright install
```

## Why Playwright?

- ✅ **More Reliable**: Better error handling and stability
- ✅ **Modern API**: Cleaner, more intuitive API
- ✅ **Better PDF Quality**: Superior HTML to PDF rendering
- ✅ **Active Development**: Regularly updated and maintained
- ✅ **Cross-platform**: Works consistently across Windows, Linux, and macOS

## Usage

The PDF generator is automatically used when:

1. **Generating PDF via API**: `GET /api/quotes/:id/pdf`
2. **Sending quotation emails**: PDFs are automatically attached

## API Endpoint

```
GET /api/quotes/:id/pdf
```

**Headers Required:**
- `Authorization: Bearer <token>`

**Response:**
- Content-Type: `application/pdf`
- Returns PDF file directly

## Troubleshooting

### Browser Not Found Error

If you see an error about browser not being installed:

```bash
npx playwright install chromium
```

### Memory Issues

If you encounter memory issues, you can:

1. Increase Node.js memory limit:
```bash
node --max-old-space-size=4096 server.js
```

2. Or set in environment:
```bash
NODE_OPTIONS="--max-old-space-size=4096"
```

### Image Loading Issues

If images in PDFs don't load:

1. Ensure image URLs are accessible
2. Check CORS settings for external images
3. Use base64 encoded images for local files

## Development

To test PDF generation locally:

```bash
# Start the server
npm run dev

# Test PDF generation
curl -H "Authorization: Bearer <your-token>" \
     http://localhost:5000/api/quotes/<quotation-id>/pdf \
     --output quotation.pdf
```

## Production Deployment

For production, ensure:

1. Playwright browsers are installed on the server
2. Sufficient memory is available (recommended: 2GB+)
3. Node.js version 16+ is installed

### Docker

If using Docker, add to your Dockerfile:

```dockerfile
# Install Playwright browsers
RUN npx playwright install chromium
RUN npx playwright install-deps chromium
```

## Design

The PDF template matches the professional ACE ALUMINIUM quotation format with:

- Company header with logo and Arabic text
- Service badges (Innovative, High Quality, Safe, etc.)
- Customer and quotation details in two columns
- Itemized table with product images
- Professional totals section with amount in words
- Footer with certifications and contact information

All styling is done via CSS for easy customization.

