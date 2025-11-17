# Scripts Directory

## Add Dummy Images to Quotations

This script adds dummy image URLs to all quotation items so you can test the PDF image column functionality.

### Usage

```bash
cd backend
node scripts/addDummyImagesToQuotations.js
```

### What it does

- Finds all quotations in the database
- Updates each item in each quotation with a sample image URL
- Only updates items that don't already have an `itemImage` field
- Uses placeholder image URLs from via.placeholder.com

### After running

1. Restart your backend server
2. Open any quotation in the admin panel
3. Click "Download PDF" or "Email"
4. The PDF should now show an "Image" column with product images (or placeholder boxes)

### Note

- The script only adds images to items that don't have one already
- It won't overwrite existing images
- You can run it multiple times safely

