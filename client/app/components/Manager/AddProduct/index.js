/**
 *
 * AddProduct
 *
 */

import React from 'react';

import { Row, Col } from 'reactstrap';

import { ROLES } from '../../../constants';
import { generateSKU, validateSKU } from '../../../utils/sku';
import Input from '../../Common/Input';
import Switch from '../../Common/Switch';
import Button from '../../Common/Button';
import SelectOption from '../../Common/SelectOption';
import SizeManager from '../../Common/SizeManager';

const taxableSelect = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' }
];

const AddProduct = props => {
  const {
    user,
    productFormData,
    formErrors,
    productChange,
    addProduct,
    brands,
    image
  } = props;

  const handleSubmit = event => {
    event.preventDefault();
    addProduct();
  };

  // Auto-generate SKU when name changes
  const handleNameChange = (name, value) => {
    productChange(name, value);
    
    if (name === 'name' && value && value.trim()) {
      // Get selected brand name
      const selectedBrand = brands.find(brand => brand.value === productFormData.brand);
      const brandName = selectedBrand ? selectedBrand.label : '';
      
      // Generate SKU automatically
      const generatedSKU = generateSKU(value, brandName);
      productChange('sku', generatedSKU);
    }
  };

  // Handle brand change and regenerate SKU
  const handleBrandChange = (value) => {
    productChange('brand', value);
    
    if (productFormData.name && productFormData.name.trim()) {
      const selectedBrand = brands.find(brand => brand.value === value);
      const brandName = selectedBrand ? selectedBrand.label : '';
      
      // Regenerate SKU with new brand
      const generatedSKU = generateSKU(productFormData.name, brandName);
      productChange('sku', generatedSKU);
    }
  };

  // Generate new SKU manually
  const handleGenerateNewSKU = () => {
    if (productFormData.name && productFormData.name.trim()) {
      const selectedBrand = brands.find(brand => brand.value === productFormData.brand);
      const brandName = selectedBrand ? selectedBrand.label : '';
      
      const generatedSKU = generateSKU(productFormData.name, brandName);
      productChange('sku', generatedSKU);
    }
  };

  // Handle sizes change
  const handleSizesChange = (sizes) => {
    productChange('sizes', sizes);
  };

  return (
    <div className='add-product'>
      <form onSubmit={handleSubmit} noValidate>
        <Row>
          <Col xs='12' lg='6'>
            <Input
              type={'text'}
              error={formErrors['name']}
              label={'Name'}
              name={'name'}
              placeholder={'Product Name'}
              value={productFormData.name}
              onInputChange={handleNameChange}
            />
          </Col>
          <Col xs='12' lg='6'>
            <div className='sku-input-group'>
              <Input
                type={'text'}
                error={formErrors['sku']}
                label={'SKU (Auto-generated)'}
                name={'sku'}
                placeholder={'Product SKU'}
                value={productFormData.sku}
                onInputChange={(name, value) => {
                  productChange(name, value);
                }}
              />
              <Button
                type='button'
                variant='outline-secondary'
                text='Generate New SKU'
                className='mt-2'
                size='sm'
                onClick={handleGenerateNewSKU}
                disabled={!productFormData.name || !productFormData.name.trim()}
              />
            </div>
          </Col>
          <Col xs='12' md='12'>
            <Input
              type={'textarea'}
              error={formErrors['description']}
              label={'Description'}
              name={'description'}
              placeholder={'Product Description'}
              value={productFormData.description}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' lg='6'>
            <Input
              type={'number'}
              error={formErrors['quantity']}
              label={'Quantity'}
              name={'quantity'}
              decimals={false}
              placeholder={'Product Quantity'}
              value={productFormData.quantity}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' lg='6'>
            <Input
              type={'number'}
              error={formErrors['price']}
              label={'Price'}
              name={'price'}
              min={1}
              placeholder={'Product Price'}
              value={productFormData.price}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='12'>
            <SelectOption
              error={formErrors['taxable']}
              label={'Taxable'}
              name={'taxable'}
              options={taxableSelect}
              value={productFormData.taxable}
              handleSelectChange={value => {
                productChange('taxable', value);
              }}
            />
          </Col>
          <Col xs='12' md='12'>
            <SelectOption
              disabled={user.role === ROLES.Merchant}
              error={formErrors['brand']}
              name={'brand'}
              label={'Select Brand'}
              value={
                user.role === ROLES.Merchant ? brands[1] : productFormData.brand
              }
              options={brands}
              handleSelectChange={handleBrandChange}
            />
          </Col>
          <Col xs='12' md='12'>
            <SizeManager
              sizes={productFormData.sizes || []}
              onSizesChange={handleSizesChange}
              error={formErrors['sizes']}
            />
          </Col>
          <Col xs='12' md='12'>
            <Input
              type={'file'}
              error={formErrors['file']}
              name={'image'}
              label={'file'}
              placeholder={'Please Upload Image'}
              value={image}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='12' className='my-2'>
            <Switch
              id={'active-product'}
              name={'isActive'}
              label={'Active?'}
              checked={productFormData.isActive}
              toggleCheckboxChange={value => productChange('isActive', value)}
            />
          </Col>
        </Row>
        <hr />
        <div className='add-product-actions'>
          <Button type='submit' text='Add Product' />
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
