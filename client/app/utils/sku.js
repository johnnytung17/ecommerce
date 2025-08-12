/**
 * SKU Generation Utilities
 */

/**
 * Generate SKU from product name
 * @param {string} name - Product name
 * @param {string} brand - Brand name (optional)
 * @returns {string} Generated SKU
 */
export const generateSKU = (name, brand = '') => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove Vietnamese accents and special characters
  const removeAccents = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  // Clean and format name
  const cleanName = removeAccents(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters except spaces
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .slice(0, 20); // Limit to 20 characters

  // Clean and format brand if provided
  let brandCode = '';
  if (brand && typeof brand === 'string') {
    brandCode = removeAccents(brand)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4); // Limit brand to 4 characters
  }

  // Generate random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();

  // Combine parts
  const skuParts = [];
  if (brandCode) {
    skuParts.push(brandCode);
  }
  skuParts.push(cleanName);
  skuParts.push(randomSuffix);

  return skuParts.join('-');
};

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {boolean} True if valid
 */
export const validateSKU = (sku) => {
  if (!sku || typeof sku !== 'string') {
    return false;
  }

  // SKU should be alphanumeric with hyphens, 3-50 characters
  const skuPattern = /^[A-Z0-9-]{3,50}$/;
  return skuPattern.test(sku);
};

/**
 * Format existing SKU
 * @param {string} sku - SKU to format
 * @returns {string} Formatted SKU
 */
export const formatSKU = (sku) => {
  if (!sku) return '';
  
  return sku
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 50);
};
