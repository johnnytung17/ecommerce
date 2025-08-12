const mongoose = require('mongoose');
const Product = require('./models/product');
const ProductSize = require('./models/productSize');

require('dotenv').config();

async function migrateProductSizes() {
  try {
    console.log('🔄 Starting product sizes migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern_ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Find all products that have sizes in the old format
    const productsWithOldSizes = await mongoose.connection.db.collection('products').find({
      sizes: { $exists: true, $ne: [] }
    }).toArray();

    console.log(`📦 Found ${productsWithOldSizes.length} products with old embedded sizes`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const product of productsWithOldSizes) {
      try {
        console.log(`\n🔄 Processing product: ${product.name} (ID: ${product._id})`);
        
        if (product.sizes && product.sizes.length > 0) {
          // Check if sizes already exist in new format
          const existingSizes = await ProductSize.find({ product: product._id });
          
          if (existingSizes.length > 0) {
            console.log(`⚠️  Sizes already exist for product ${product.name}, skipping...`);
            continue;
          }

          // Create new ProductSize documents
          const sizesToCreate = product.sizes.map(size => ({
            product: product._id,
            name: size.name,
            quantity: size.quantity || 0,
            isActive: size.isActive !== undefined ? size.isActive : true
          }));

          await ProductSize.insertMany(sizesToCreate);
          console.log(`✅ Created ${sizesToCreate.length} sizes for product: ${product.name}`);
          
          migratedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing product ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total product sizes created: ${await ProductSize.countDocuments()}`);

    // Optional: Remove old sizes field from products
    console.log('\n🧹 Cleaning up old sizes field from products...');
    const updateResult = await mongoose.connection.db.collection('products').updateMany(
      { sizes: { $exists: true } },
      { $unset: { sizes: "" } }
    );
    console.log(`✅ Cleaned up ${updateResult.modifiedCount} products`);

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProductSizes().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = migrateProductSizes;
