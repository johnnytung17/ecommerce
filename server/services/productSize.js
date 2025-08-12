const ProductSize = require('../models/productSize');

class ProductSizeService {
  // Create multiple sizes for a product
  static async createSizes(productId, sizes) {
    try {
      if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return [];
      }

      // Remove existing sizes for the product
      await ProductSize.deleteMany({ product: productId });

      // Create new sizes
      const sizesData = sizes.map(size => ({
        product: productId,
        name: size.name,
        quantity: size.quantity || 0,
        isActive: size.isActive !== undefined ? size.isActive : true
      }));

      const createdSizes = await ProductSize.create(sizesData);
      return createdSizes;
    } catch (error) {
      throw new Error(`Error creating product sizes: ${error.message}`);
    }
  }

  // Get all sizes for a product
  static async getSizesByProduct(productId) {
    try {
      const sizes = await ProductSize.find({ 
        product: productId 
      }).sort({ name: 1 });
      
      return sizes;
    } catch (error) {
      throw new Error(`Error fetching product sizes: ${error.message}`);
    }
  }

  // Get active sizes for a product
  static async getActiveSizesByProduct(productId) {
    try {
      const sizes = await ProductSize.find({ 
        product: productId,
        isActive: true 
      }).sort({ name: 1 });
      
      return sizes;
    } catch (error) {
      throw new Error(`Error fetching active product sizes: ${error.message}`);
    }
  }

  // Update sizes for a product
  static async updateSizes(productId, sizes) {
    try {
      if (!sizes || !Array.isArray(sizes)) {
        return [];
      }

      // Remove existing sizes
      await ProductSize.deleteMany({ product: productId });

      // Create new sizes if provided
      if (sizes.length > 0) {
        return await this.createSizes(productId, sizes);
      }

      return [];
    } catch (error) {
      throw new Error(`Error updating product sizes: ${error.message}`);
    }
  }

  // Delete all sizes for a product
  static async deleteSizesByProduct(productId) {
    try {
      const result = await ProductSize.deleteMany({ product: productId });
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Error deleting product sizes: ${error.message}`);
    }
  }

  // Get size by ID
  static async getSizeById(sizeId) {
    try {
      const size = await ProductSize.findById(sizeId).populate('product', 'name sku');
      return size;
    } catch (error) {
      throw new Error(`Error fetching size: ${error.message}`);
    }
  }

  // Update single size
  static async updateSize(sizeId, updateData) {
    try {
      const updatedSize = await ProductSize.findByIdAndUpdate(
        sizeId, 
        { ...updateData, updated: Date.now() },
        { new: true, runValidators: true }
      );
      return updatedSize;
    } catch (error) {
      throw new Error(`Error updating size: ${error.message}`);
    }
  }

  // Get total quantity for a product across all sizes
  static async getTotalQuantityByProduct(productId) {
    try {
      const result = await ProductSize.aggregate([
        {
          $match: { 
            product: productId,
            isActive: true 
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      return result.length > 0 ? result[0].totalQuantity : 0;
    } catch (error) {
      throw new Error(`Error calculating total quantity: ${error.message}`);
    }
  }

  // Get products with their sizes
  static async getProductsWithSizes(productIds = []) {
    try {
      const pipeline = [];

      if (productIds.length > 0) {
        pipeline.push({
          $match: { product: { $in: productIds } }
        });
      }

      pipeline.push(
        {
          $group: {
            _id: '$product',
            sizes: {
              $push: {
                _id: '$_id',
                name: '$name',
                quantity: '$quantity',
                isActive: '$isActive',
                created: '$created',
                updated: '$updated'
              }
            }
          }
        }
      );

      const result = await ProductSize.aggregate(pipeline);
      
      // Convert to a map for easier lookup
      const sizesMap = {};
      result.forEach(item => {
        sizesMap[item._id.toString()] = item.sizes;
      });

      return sizesMap;
    } catch (error) {
      throw new Error(`Error fetching products with sizes: ${error.message}`);
    }
  }
}

module.exports = ProductSizeService;
