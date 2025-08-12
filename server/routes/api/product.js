const express = require('express');
const router = express.Router();
const multer = require('multer');
const Mongoose = require('mongoose');

// Bring in Models & Utils
const Product = require('../../models/product');
const ProductSize = require('../../models/productSize');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const ProductSizeService = require('../../services/productSize');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const checkAuth = require('../../utils/auth');
const { s3Upload } = require('../../utils/storage');
const { generateUniqueSKU, validateSKU, formatSKU } = require('../../utils/sku');
const {
  getStoreProductsQuery,
  getStoreProductsWishListQuery
} = require('../../utils/queries');
const { ROLES } = require('../../constants');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// fetch product slug api
router.get('/item/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;

    const productDoc = await Product.findOne({ slug, isActive: true }).populate(
      {
        path: 'brand',
        select: 'name isActive slug'
      }
    );

    const hasNoBrand =
      productDoc?.brand === null || productDoc?.brand?.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    // Get sizes for this product
    const sizes = await ProductSizeService.getActiveSizesByProduct(productDoc._id);
    
    // Add sizes to product response
    const productWithSizes = {
      ...productDoc.toObject(),
      sizes: sizes || []
    };

    res.status(200).json({
      product: productWithSizes
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch product name search api
router.get('/list/search/:name', async (req, res) => {
  try {
    const name = req.params.name;

    const productDoc = await Product.find(
      { name: { $regex: new RegExp(name), $options: 'is' }, isActive: true },
      { name: 1, slug: 1, imageUrl: 1, price: 1, _id: 0 }
    );

    if (productDoc.length < 0) {
      return res.status(404).json({
        message: 'No product found.'
      });
    }

    res.status(200).json({
      products: productDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch store products by advanced filters api
router.get('/list', async (req, res) => {
  try {
    let {
      sortOrder,
      rating,
      max,
      min,
      category,
      brand,
      page = 1,
      limit = 10
    } = req.query;
    sortOrder = JSON.parse(sortOrder);

    const categoryFilter = category ? { category } : {};
    const basicQuery = getStoreProductsQuery(min, max, rating);

    const userDoc = await checkAuth(req);
    const categoryDoc = await Category.findOne({
      slug: categoryFilter.category,
      isActive: true
    });

    if (categoryDoc) {
      basicQuery.push({
        $match: {
          isActive: true,
          _id: {
            $in: Array.from(categoryDoc.products)
          }
        }
      });
    }

    const brandDoc = await Brand.findOne({
      slug: brand,
      isActive: true
    });

    if (brandDoc) {
      basicQuery.push({
        $match: {
          'brand._id': { $eq: brandDoc._id }
        }
      });
    }

    let products = null;
    const productsCount = await Product.aggregate(basicQuery);
    const count = productsCount.length;
    const size = count > limit ? page - 1 : 0;
    const currentPage = count > limit ? Number(page) : 1;

    // paginate query
    const paginateQuery = [
      { $sort: sortOrder },
      { $skip: size * limit },
      { $limit: limit * 1 }
    ];

    if (userDoc) {
      const wishListQuery = getStoreProductsWishListQuery(userDoc.id).concat(
        basicQuery
      );
      products = await Product.aggregate(wishListQuery.concat(paginateQuery));
    } else {
      products = await Product.aggregate(basicQuery.concat(paginateQuery));
    }

    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage,
      count
    });
  } catch (error) {
    console.log('error', error);
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.get('/list/select', auth, async (req, res) => {
  try {
    const products = await Product.find({}, 'name');

    res.status(200).json({
      products
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// add product api
router.post(
  '/add',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  upload.single('image'),
  async (req, res) => {
    try {
      let sku = req.body.sku;
      const name = req.body.name;
      const description = req.body.description;
      const quantity = req.body.quantity;
      const price = req.body.price;
      const taxable = req.body.taxable;
      const isActive = req.body.isActive;
      const brand = req.body.brand;
      const image = req.file;
      let sizes = req.body.sizes;

      // Debug log
      console.log('AddProduct Server - req.body.sizes:', sizes);
      console.log('AddProduct Server - typeof sizes:', typeof sizes);

      // Parse sizes if it's a string (from form data)
      if (typeof sizes === 'string') {
        try {
          sizes = JSON.parse(sizes);
          console.log('AddProduct Server - parsed sizes:', sizes);
        } catch (e) {
          console.log('AddProduct Server - parse error:', e.message);
          sizes = [];
        }
      }
      sizes = sizes || [];
      
      console.log('AddProduct Server - final sizes:', sizes);

      if (!description || !name) {
        return res
          .status(400)
          .json({ error: 'You must enter description & name.' });
      }

      if (!quantity) {
        return res.status(400).json({ error: 'You must enter a quantity.' });
      }

      if (!price) {
        return res.status(400).json({ error: 'You must enter a price.' });
      }

      // Auto-generate SKU if not provided or invalid
      if (!sku || !validateSKU(sku)) {
        // Get brand name for SKU generation
        let brandName = '';
        if (brand) {
          const brandDoc = await Brand.findById(brand);
          brandName = brandDoc ? brandDoc.name : '';
        }
        
        sku = await generateUniqueSKU(name, brandName, Product);
      } else {
        // Format provided SKU
        sku = formatSKU(sku);
        
        // Check if SKU already exists
        const foundProduct = await Product.findOne({ sku });
        if (foundProduct) {
          return res.status(400).json({ error: 'This SKU is already in use.' });
        }
      }

      const { imageUrl, imageKey } = await s3Upload(image);

      const product = new Product({
        sku,
        name,
        description,
        quantity,
        price,
        taxable,
        isActive,
        brand,
        imageUrl,
        imageKey
      });

      const savedProduct = await product.save();

      // Create sizes if provided
      if (sizes && sizes.length > 0) {
        await ProductSizeService.createSizes(savedProduct._id, sizes);
      }

      res.status(200).json({
        success: true,
        message: `Product has been added successfully!`,
        product: savedProduct
      });
    } catch (error) {
      console.error('Product add error:', error);
      return res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch products api
router.get(
  '/',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let products = [];

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant
        }).populate('merchant', '_id');

        const brandId = brands[0]?.['_id'];

        products = await Product.find({})
          .populate({
            path: 'brand',
            populate: {
              path: 'merchant',
              model: 'Merchant'
            }
          })
          .where('brand', brandId);
      } else {
        products = await Product.find({}).populate({
          path: 'brand',
          populate: {
            path: 'merchant',
            model: 'Merchant'
          }
        });
      }

      res.status(200).json({
        products
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

// fetch product api
router.get(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;

      let productDoc = null;

      if (req.user.merchant) {
        const brands = await Brand.find({
          merchant: req.user.merchant
        }).populate('merchant', '_id');

        const brandId = brands[0]['_id'];

        productDoc = await Product.findOne({ _id: productId })
          .populate({
            path: 'brand',
            select: 'name'
          })
          .where('brand', brandId);
      } else {
        productDoc = await Product.findOne({ _id: productId }).populate({
          path: 'brand',
          select: 'name'
        });
      }

      if (!productDoc) {
        return res.status(404).json({
          message: 'No product found.'
        });
      }

      // Get sizes for this product
      const sizes = await ProductSizeService.getSizesByProduct(productDoc._id);
      
      // Add sizes to product response
      const productWithSizes = {
        ...productDoc.toObject(),
        sizes: sizes || []
      };

      res.status(200).json({
        product: productWithSizes
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const update = req.body.product;
      const query = { _id: productId };
      let { sku, slug, sizes } = req.body.product;

      console.log('UpdateProduct Server - req.body.product:', req.body.product);
      console.log('UpdateProduct Server - sizes:', sizes);

      // Parse sizes if it's a string
      if (sizes && typeof sizes === 'string') {
        try {
          sizes = JSON.parse(sizes);
          update.sizes = sizes;
          console.log('UpdateProduct Server - parsed sizes:', sizes);
        } catch (e) {
          update.sizes = [];
        }
      }
      
      console.log('UpdateProduct Server - final update object:', update);

      // Format SKU if provided
      if (sku) {
        sku = formatSKU(sku);
        update.sku = sku;
        
        // Validate SKU format
        if (!validateSKU(sku)) {
          return res.status(400).json({ 
            error: 'Invalid SKU format. SKU should only contain letters, numbers, and hyphens.' 
          });
        }
      }

      const foundProduct = await Product.findOne({
        $or: [{ slug }, { sku }]
      });

      if (foundProduct && foundProduct._id != productId) {
        return res
          .status(400)
          .json({ error: 'SKU or slug is already in use.' });
      }

      // Remove sizes from update object since we'll handle it separately
      delete update.sizes;

      await Product.findOneAndUpdate(query, update, {
        new: true
      });

      // Update sizes separately using ProductSize service
      if (sizes !== undefined) {
        await ProductSizeService.updateSizes(productId, sizes);
      }

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!'
      });
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.put(
  '/:id/active',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const productId = req.params.id;
      const update = req.body.product;
      const query = { _id: productId };

      await Product.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Product has been updated successfully!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.delete(
  '/delete/:id',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      const product = await Product.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: `Product has been deleted successfully!`,
        product
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

module.exports = router;
