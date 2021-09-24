/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'antd';
import { Cron } from 'react-js-cron';
import { InfoCircleOutlined } from '@ant-design/icons';
import '../../MainStyle.less';
import './CronJobStyle.less';

const CronModal = ({ value, setValue }) => {
  const inputRef = useRef(null);
  const customSetValue = useCallback(
    newValue => {
      setValue(newValue);
      if (inputRef.current === true) setValue(newValue);
    },
    [inputRef],
  );

  const [error, onError] = useState();

  const handleClick = () => {
    alert(value);
  };
  return (
    <div className="cronModal">
      <Input
        style={{ display: 'none' }}
        ref={inputRef}
        onBlur={event => {
          setValue(event.target.value);
        }}
        onPressEnter={() => {
          setValue(inputRef.current?.input.value || '');
        }}
      />
      <Cron
        value={value}
        setValue={customSetValue}
        onError={onError}
        leadingZero
        allowEmpty="always"
        clearButtonProps={{
          type: 'default',
          style: { backgroundColor: '#20a7c9', border: 'none', color: 'white' },
        }}
      />
      <Button type="primary" onClick={handleClick}>
        OK
      </Button>
      <div>
        <InfoCircleOutlined style={{ marginRight: 5 }} />
        <span style={{ fontSize: 12 }}>
          Double click on a dropdown option to automatically select / unselect a
          periodicity
        </span>
      </div>

      <p style={{ marginTop: 20 }}>
        Error: {error ? error.description : 'undefined'}
      </p>
    </div>
  );
};

CronModal.propTypes = {
  value: PropTypes.string,
};

CronModal.defaultProps = {};

export default CronModal;
