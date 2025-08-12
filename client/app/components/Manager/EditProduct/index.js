/**
 *
 * EditProduct
 *
 */

import React from 'react';

import { Link } from 'react-router-dom';
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

const EditProduct = props => {
  const {
    user,
    product,
    productChange,
    formErrors,
    brands,
    updateProduct,
    deleteProduct,
    activateProduct
  } = props;

  const handleSubmit = event => {
    event.preventDefault();
    updateProduct();
  };

  // Handle name change and optionally regenerate SKU
  const handleNameChange = (name, value) => {
    productChange(name, value);
  };

  // Generate new SKU manually
  const handleGenerateNewSKU = () => {
    if (product.name && product.name.trim()) {
      const selectedBrand = brands.find(brand => brand.value === (product.brand?._id || product.brand?.value));
      const brandName = selectedBrand ? selectedBrand.label : (product.brand?.name || '');
      
      const generatedSKU = generateSKU(product.name, brandName);
      productChange('sku', generatedSKU);
    }
  };

  // Handle sizes change
  const handleSizesChange = (sizes) => {
    productChange('sizes', sizes);
  };

  return (
    <div className='edit-product'>
      <div className='d-flex flex-row mx-0 mb-3'>
        <label className='mr-1'>Product link </label>
        <Link to={`/product/${product.slug}`} className='default-link'>
          {product.slug}
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Row>
          <Col xs='12'>
            <Input
              type={'text'}
              error={formErrors['name']}
              label={'Name'}
              name={'name'}
              placeholder={'Product Name'}
              value={product.name}
              onInputChange={handleNameChange}
            />
          </Col>
          <Col xs='12'>
            <div className='sku-input-group'>
              <Input
                type={'text'}
                error={formErrors['sku']}
                label={'SKU'}
                name={'sku'}
                placeholder={'Product SKU'}
                value={product.sku}
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
                disabled={!product.name || !product.name.trim()}
              />
            </div>
          </Col>
          <Col xs='12'>
            <Input
              type={'text'}
              error={formErrors['slug']}
              label={'Slug'}
              name={'slug'}
              placeholder={'Product Slug'}
              value={product.slug}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='12'>
            <Input
              type={'textarea'}
              error={formErrors['description']}
              label={'Description'}
              name={'description'}
              placeholder={'Product Description'}
              value={product.description}
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
              value={product.quantity}
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
              value={product.price}
              onInputChange={(name, value) => {
                productChange(name, value);
              }}
            />
          </Col>
          <Col xs='12' md='12'>
            <SelectOption
              error={formErrors['taxable']}
              label={'Taxable'}
              multi={false}
              name={'taxable'}
              value={[product.taxable ? taxableSelect[0] : taxableSelect[1]]}
              options={taxableSelect}
              handleSelectChange={value => {
                productChange('taxable', value.value);
              }}
            />
          </Col>
          {user.role === ROLES.Admin && (
            <Col xs='12' md='12'>
              <SelectOption
                error={formErrors['brand']}
                label={'Select Brand'}
                multi={false}
                value={product.brand}
                options={brands}
                handleSelectChange={value => {
                  productChange('brand', value);
                }}
              />
            </Col>
          )}
          <Col xs='12' md='12'>
            <SizeManager
              sizes={product.sizes || []}
              onSizesChange={handleSizesChange}
              error={formErrors['sizes']}
            />
          </Col>
          <Col xs='12' md='12' className='mt-3 mb-2'>
            <Switch
              id={`enable-product-${product._id}`}
              name={'isActive'}
              label={'Active?'}
              checked={product?.isActive}
              toggleCheckboxChange={value => {
                productChange('isActive', value);
                activateProduct(product._id, value);
              }}
            />
          </Col>
        </Row>
        <hr />
        <div className='d-flex flex-column flex-md-row'>
          <Button
            type='submit'
            text='Save'
            className='mb-3 mb-md-0 mr-0 mr-md-3'
          />
          <Button
            variant='danger'
            text='Delete'
            onClick={() => deleteProduct(product._id)}
          />
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
