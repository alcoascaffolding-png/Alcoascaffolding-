/**
 * Script to Add Dummy Images to Quotation Items
 * This script updates all quotation items with sample image URLs for testing
 * 
 * Usage: node scripts/addDummyImagesToQuotations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Quotation = require('../models/Quotation');

// Dummy image URLs - using placeholder image services
const dummyImages = [
  'https://via.placeholder.com/150/0066cc/FFFFFF?text=Scaffold',
  'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Ladder',
  'https://via.placeholder.com/150/FF9800/FFFFFF?text=Coupler',
  'https://via.placeholder.com/150/9C27B0/FFFFFF?text=Pipe',
  'https://via.placeholder.com/150/F44336/FFFFFF?text=Board',
  'https://via.placeholder.com/150/00BCD4/FFFFFF?text=Frame',
  'https://via.placeholder.com/150/E91E63/FFFFFF?text=Tower',
  'https://via.placeholder.com/150/8BC34A/FFFFFF?text=Clamp'
];

// Alternative: Use public scaffolding product images
const productImageUrls = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop', // Construction/scaffolding
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop', // Metal structure
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=150&h=150&fit=crop', // Industrial
  'https://images.unsplash.com/photo-1581091877018-dac6a371d50f?w=150&h=150&fit=crop', // Construction equipment
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=150&h=150&fit=crop', // Scaffolding
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop', // Construction
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alcoa-scaffolding', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const addDummyImages = async () => {
  try {
    await connectDB();

    // Get all quotations
    const quotations = await Quotation.find({});
    console.log(`\n📋 Found ${quotations.length} quotations\n`);

    if (quotations.length === 0) {
      console.log('⚠️  No quotations found in database.');
      console.log('💡 Please create some quotations first, then run this script again.');
      process.exit(0);
    }

    let updatedCount = 0;
    let itemCount = 0;

    for (const quotation of quotations) {
      let quotationUpdated = false;

      // Update each item in the quotation
      if (quotation.items && quotation.items.length > 0) {
        for (let i = 0; i < quotation.items.length; i++) {
          const item = quotation.items[i];
          
          // Only add image if it doesn't already have one
          if (!item.itemImage || item.itemImage.trim() === '') {
            // Assign image based on equipment type or random
            const imageIndex = i % dummyImages.length;
            const imageUrl = dummyImages[imageIndex];
            
            item.itemImage = imageUrl;
            quotationUpdated = true;
            itemCount++;
          }
        }

        if (quotationUpdated) {
          await quotation.save();
          updatedCount++;
          console.log(`✅ Updated quotation: ${quotation.quoteNumber} (${quotation.items.length} items)`);
        } else {
          console.log(`ℹ️  Quotation ${quotation.quoteNumber} already has images`);
        }
      }
    }

    console.log(`\n✨ Summary:`);
    console.log(`   - Quotations updated: ${updatedCount}`);
    console.log(`   - Items with images added: ${itemCount}`);
    console.log(`\n🎉 Done! You can now test the PDF generation with images.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
addDummyImages();

