const express = require('express');
const router = express.Router();

// Bring in Models & Utils
const Brand = require('../../models/brand');
const Product = require('../../models/product');
const Merchant = require('../../models/merchant');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const store = require('../../utils/store');
const { ROLES, MERCHANT_STATUS } = require('../../constants');

router.post('/add', auth, role.check(ROLES.Admin, ROLES.Merchant), async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;
    const isActive = req.body.isActive;

    if (!description || !name) {
      return res
        .status(400)
        .json({ error: 'You must enter description & name.' });
    }

    // Check if merchant already has a brand
    if (req.user.role === ROLES.Merchant && req.user.merchant) {
      const existingMerchant = await Merchant.findById(req.user.merchant);
      if (existingMerchant && existingMerchant.brand) {
        return res.status(400).json({
          error: 'You already have a brand. Each merchant can only have one brand.'
        });
      }
    }

    const brandData = {
      name,
      description,
      isActive: req.user.role === ROLES.Admin ? isActive : false // Merchant brands need approval
    };

    // If merchant is creating brand, link it to merchant
    if (req.user.role === ROLES.Merchant && req.user.merchant) {
      brandData.merchant = req.user.merchant;
    }

    const brand = new Brand(brandData);
    const brandDoc = await brand.save();

    // Update merchant record with brand reference
    if (req.user.role === ROLES.Merchant && req.user.merchant) {
      await Merchant.findByIdAndUpdate(req.user.merchant, {
        brand: brandDoc._id,
        status: MERCHANT_STATUS.Waiting_Approval
      });
    }

    res.status(200).json({
      success: true,
      message: req.user.role === ROLES.Admin 
        ? `Brand has been added successfully!`
        : `Brand has been submitted for approval!`,
      brand: brandDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch store brands api
router.get('/list', async (req, res) => {
  try {
    const brands = await Brand.find({
      isActive: true
    }).populate('merchant', 'name');

    res.status(200).json({
      brands
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// fetch brands api
router.get(
  '/',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let brands = null;

      if (req.user.merchant) {
        brands = await Brand.find({
          merchant: req.user.merchant
        }).populate('merchant', 'name');
      } else {
        brands = await Brand.find({}).populate('merchant', 'name');
      }

      res.status(200).json({
        brands
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const brandId = req.params.id;

    const brandDoc = await Brand.findOne({ _id: brandId }).populate(
      'merchant',
      '_id'
    );

    if (!brandDoc) {
      return res.status(404).json({
        message: `Cannot find brand with the id: ${brandId}.`
      });
    }

    res.status(200).json({
      brand: brandDoc
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.put(
  '/:id/approve',
  auth,
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const brandId = req.params.id;
      const { isActive } = req.body;

      const brand = await Brand.findById(brandId).populate('merchant');
      if (!brand) {
        return res.status(404).json({
          error: 'Brand not found.'
        });
      }

      // Update brand status
      await Brand.findByIdAndUpdate(brandId, { isActive });

      // Update merchant status if brand is being approved
      if (brand.merchant && isActive) {
        await Merchant.findByIdAndUpdate(brand.merchant._id, {
          status: MERCHANT_STATUS.Approved,
          isActive: true
        });
      } else if (brand.merchant && !isActive) {
        await Merchant.findByIdAndUpdate(brand.merchant._id, {
          status: MERCHANT_STATUS.Rejected,
          isActive: false
        });
      }

      res.status(200).json({
        success: true,
        message: isActive ? 'Brand has been approved!' : 'Brand has been rejected!'
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

router.get(
  '/list/select',
  auth,
  role.check(ROLES.Admin, ROLES.Merchant),
  async (req, res) => {
    try {
      let brands = null;

      if (req.user.merchant) {
        brands = await Brand.find(
          {
            merchant: req.user.merchant
          },
          'name'
        );
      } else {
        brands = await Brand.find({}, 'name');
      }

      res.status(200).json({
        brands
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
      const brandId = req.params.id;
      const update = req.body.brand;
      const query = { _id: brandId };
      const { slug } = req.body.brand;

      const foundBrand = await Brand.findOne({
        $or: [{ slug }]
      });

      if (foundBrand && foundBrand._id != brandId) {
        return res.status(400).json({ error: 'Slug is already in use.' });
      }

      await Brand.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Brand has been updated successfully!'
      });
    } catch (error) {
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
      const brandId = req.params.id;
      const update = req.body.brand;
      const query = { _id: brandId };

      // disable brand(brandId) products
      if (!update.isActive) {
        const products = await Product.find({ brand: brandId });
        store.disableProducts(products);
      }

      await Brand.findOneAndUpdate(query, update, {
        new: true
      });

      res.status(200).json({
        success: true,
        message: 'Brand has been updated successfully!'
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
  role.check(ROLES.Admin),
  async (req, res) => {
    try {
      const brandId = req.params.id;
      await deactivateMerchant(brandId);
      const brand = await Brand.deleteOne({ _id: brandId });

      res.status(200).json({
        success: true,
        message: `Brand has been deleted successfully!`,
        brand
      });
    } catch (error) {
      res.status(400).json({
        error: 'Your request could not be processed. Please try again.'
      });
    }
  }
);

const deactivateMerchant = async brandId => {
  const brandDoc = await Brand.findOne({ _id: brandId }).populate(
    'merchant',
    '_id'
  );
  if (!brandDoc || !brandDoc.merchant) return;
  const merchantId = brandDoc.merchant._id;
  const query = { _id: merchantId };
  const update = {
    status: MERCHANT_STATUS.Waiting_Approval,
    isActive: false,
    brand: null
  };
  return await Merchant.findOneAndUpdate(query, update, {
    new: true
  });
};

module.exports = router;
