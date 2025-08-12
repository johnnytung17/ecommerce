/**
 *
 * SizeSelector
 *
 */

import React, { useState } from 'react';

const SizeSelector = ({ sizes = [], selectedSize, onSizeChange, error = '' }) => {
  // Show all active sizes, not just ones with quantity > 0
  const activeSizes = sizes.filter(size => size.isActive);

  // If no sizes at all, don't show the component
  if (!sizes || sizes.length === 0) {
    return null;
  }

  // If no active sizes, show a message
  if (activeSizes.length === 0) {
    return (
      <div className='size-selector mb-3'>
        <label className='form-label'>Size</label>
        <p className='text-muted'>No sizes available</p>
      </div>
    );
  }

  return (
    <div className='size-selector mb-3'>
      <label className='form-label'>Size</label>
      <div className='size-options'>
        {activeSizes.map((size, index) => (
          <button
            key={size.id || index}
            type='button'
            className={`size-btn ${selectedSize && (selectedSize.name || selectedSize) === size.name ? 'selected' : ''}`}
            onClick={() => onSizeChange({
              id: size._id || size.id,
              name: size.name,
              quantity: size.quantity
            })}
            disabled={size.quantity <= 0}
          >
            {size.name}
            {size.quantity <= 5 && size.quantity > 0 && (
              <span className='low-stock'>({size.quantity} left)</span>
            )}
          </button>
        ))}
      </div>
      {error && <div className='invalid-feedback d-block'>{error}</div>}
    </div>
  );
};

export default SizeSelector;
