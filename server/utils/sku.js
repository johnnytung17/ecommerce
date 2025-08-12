/**
 * SKU Generation Utilities - Server Side
 */

/**
 * Remove Vietnamese accents and special characters
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
const removeAccents = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

/**
 * Generate SKU from product name and brand
 * @param {string} name - Product name
 * @param {string} brand - Brand name (optional)
 * @returns {string} Generated SKU
 */
const generateSKU = (name, brand = '') => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Clean and format name
  const cleanName = removeAccents(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters except spaces
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .slice(0, 15); // Limit to 15 characters

  // Clean and format brand if provided
  let brandCode = '';
  if (brand && typeof brand === 'string') {
    brandCode = removeAccents(brand)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4); // Limit brand to 4 characters
  }

  // Generate timestamp-based suffix for uniqueness
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase();

  // Combine parts
  const skuParts = [];
  if (brandCode) {
    skuParts.push(brandCode);
  }
  skuParts.push(cleanName);
  skuParts.push(timestamp + randomSuffix);

  return skuParts.join('-');
};

/**
 * Generate unique SKU by checking database
 * @param {string} name - Product name
 * @param {string} brand - Brand name (optional)
 * @param {Object} ProductModel - Mongoose Product model
 * @param {number} maxAttempts - Maximum attempts to generate unique SKU
 * @returns {Promise<string>} Unique SKU
 */
const generateUniqueSKU = async (name, brand = '', ProductModel, maxAttempts = 10) => {
  let attempts = 0;
  let sku = '';

  while (attempts < maxAttempts) {
    sku = generateSKU(name, brand);
    
    // Check if SKU already exists
    const existingProduct = await ProductModel.findOne({ sku });
    
    if (!existingProduct) {
      return sku; // SKU is unique
    }
    
    attempts++;
  }

  // If we couldn't generate a unique SKU, add timestamp
  const timestamp = Date.now();
  const fallbackSKU = generateSKU(name, brand) + '-' + timestamp;
  
  return fallbackSKU;
};

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {boolean} True if valid
 */
const validateSKU = (sku) => {
  if (!sku || typeof sku !== 'string') {
    return false;
  }

  // SKU should be alphanumeric with hyphens, 3-100 characters
  const skuPattern = /^[A-Z0-9-]{3,100}$/;
  return skuPattern.test(sku);
};

/**
 * Format existing SKU
 * @param {string} sku - SKU to format
 * @returns {string} Formatted SKU
 */
const formatSKU = (sku) => {
  if (!sku) return '';
  
  return sku
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 100);
};

module.exports = {
  generateSKU,
  generateUniqueSKU,
  validateSKU,
  formatSKU,
  removeAccents
};
