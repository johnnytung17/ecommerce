/**
 *
 * SizeManager
 *
 */

import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';

import Input from '../Input';
import Button from '../Button';
import Switch from '../Switch';

const SizeManager = ({ sizes = [], onSizesChange, error = '' }) => {
  const [newSize, setNewSize] = useState({ name: '', quantity: 0, isActive: true });

  const handleAddSize = () => {
    if (newSize.name.trim() && newSize.quantity >= 0) {
      const updatedSizes = [...sizes, { ...newSize, id: Date.now() }];
      onSizesChange(updatedSizes);
      setNewSize({ name: '', quantity: 0, isActive: true });
    }
  };

  const handleUpdateSize = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) => 
      i === index ? { ...size, [field]: value } : size
    );
    onSizesChange(updatedSizes);
  };

  const handleRemoveSize = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    onSizesChange(updatedSizes);
  };

  return (
    <div className='size-manager'>
      <label className='form-label'>Product Sizes</label>
      
      {/* Existing sizes */}
      {sizes.length > 0 && (
        <div className='existing-sizes mb-3'>
          {sizes.map((size, index) => (
            <div key={size.id || index} className='size-item mb-2 p-3 border rounded'>
              <Row>
                <Col xs='12' md='4'>
                  <Input
                    type='text'
                    label='Size Name'
                    name={`size-name-${index}`}
                    placeholder='S, M, L, XL, etc.'
                    value={size.name}
                    onInputChange={(_, value) => handleUpdateSize(index, 'name', value)}
                  />
                </Col>
                <Col xs='12' md='3'>
                  <Input
                    type='number'
                    label='Quantity'
                    name={`size-quantity-${index}`}
                    placeholder='0'
                    decimals={false}
                    min={0}
                    value={size.quantity}
                    onInputChange={(_, value) => handleUpdateSize(index, 'quantity', parseInt(value) || 0)}
                  />
                </Col>
                <Col xs='12' md='3' className='d-flex align-items-end'>
                  <Switch
                    id={`size-active-${index}`}
                    name={`size-active-${index}`}
                    label='Active'
                    checked={size.isActive}
                    toggleCheckboxChange={(value) => handleUpdateSize(index, 'isActive', value)}
                  />
                </Col>
                <Col xs='12' md='2' className='d-flex align-items-end'>
                  <Button
                    type='button'
                    variant='danger'
                    size='sm'
                    text='Remove'
                    onClick={() => handleRemoveSize(index)}
                  />
                </Col>
              </Row>
            </div>
          ))}
        </div>
      )}

      {/* Add new size */}
      <div className='add-size-form p-3 border rounded bg-light'>
        <h6>Add New Size</h6>
        <Row>
          <Col xs='12' md='4'>
            <Input
              type='text'
              label='Size Name'
              name='new-size-name'
              placeholder='S, M, L, XL, etc.'
              value={newSize.name}
              onInputChange={(_, value) => setNewSize({ ...newSize, name: value })}
            />
          </Col>
          <Col xs='12' md='3'>
            <Input
              type='number'
              label='Quantity'
              name='new-size-quantity'
              placeholder='0'
              decimals={false}
              min={0}
              value={newSize.quantity}
              onInputChange={(_, value) => setNewSize({ ...newSize, quantity: parseInt(value) || 0 })}
            />
          </Col>
          <Col xs='12' md='3' className='d-flex align-items-end'>
            <Switch
              id='new-size-active'
              name='new-size-active'
              label='Active'
              checked={newSize.isActive}
              toggleCheckboxChange={(value) => setNewSize({ ...newSize, isActive: value })}
            />
          </Col>
          <Col xs='12' md='2' className='d-flex align-items-end'>
            <Button
              type='button'
              variant='primary'
              size='sm'
              text='Add Size'
              onClick={handleAddSize}
              disabled={!newSize.name.trim()}
            />
          </Col>
        </Row>
      </div>

      {error && <div className='invalid-feedback d-block mt-2'>{error}</div>}
    </div>
  );
};

export default SizeManager;
