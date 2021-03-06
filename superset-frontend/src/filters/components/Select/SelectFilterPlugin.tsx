/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { styled, Behavior, DataMask, t } from '@superset-ui/core';
import React, { useEffect, useState } from 'react';
import { Select } from 'src/common/components';
import { PluginFilterSelectProps } from './types';
import { PluginFilterStylesProps } from '../types';
import { getSelectExtraFormData } from '../../utils';

const Styles = styled.div<PluginFilterStylesProps>`
  height: ${({ height }) => height};
  width: ${({ width }) => width};
`;

const { Option } = Select;

export default function PluginFilterSelect(props: PluginFilterSelectProps) {
  const { data, formData, height, width, behaviors, setDataMask } = props;
  const {
    defaultValue,
    enableEmptyFilter,
    multiSelect,
    showSearch,
    currentValue,
    inverseSelection,
    inputRef,
  } = formData;

  const [values, setValues] = useState<(string | number)[]>(defaultValue ?? []);

  let { groupby = [] } = formData;
  groupby = Array.isArray(groupby) ? groupby : [groupby];

  const handleChange = (
    value?: (number | string)[] | number | string | null,
  ) => {
    let resultValue: (number | string)[];
    // Works only with arrays even for single select
    if (!Array.isArray(value)) {
      resultValue = value ? [value] : [];
    } else {
      resultValue = value;
    }
    setValues(resultValue);

    const [col] = groupby;
    const emptyFilter =
      enableEmptyFilter && !inverseSelection && resultValue?.length === 0;

    const dataMask = {
      extraFormData: getSelectExtraFormData(
        col,
        resultValue,
        emptyFilter,
        inverseSelection,
      ),
      currentState: {
        value: resultValue.length ? resultValue : null,
      },
    };

    const dataMaskObject: DataMask = {};
    if (behaviors.includes(Behavior.NATIVE_FILTER)) {
      dataMaskObject.nativeFilters = dataMask;
    }

    if (behaviors.includes(Behavior.CROSS_FILTER)) {
      dataMaskObject.crossFilters = dataMask;
    }

    setDataMask(dataMaskObject);
  };

  useEffect(() => {
    handleChange(currentValue ?? []);
  }, [JSON.stringify(currentValue)]);

  useEffect(() => {
    handleChange(defaultValue ?? []);
    // I think after Config Modal update some filter it re-creates default value for all other filters
    // so we can process it like this `JSON.stringify` or start to use `Immer`
  }, [JSON.stringify(defaultValue)]);

  const placeholderText =
    (data || []).length === 0
      ? t('No data')
      : t(`%d option%s`, data.length, data.length === 1 ? '' : 's');
  return (
    <Styles height={height} width={width}>
      <Select
        allowClear
        value={values}
        showSearch={showSearch}
        style={{ width: '100%' }}
        mode={multiSelect ? 'multiple' : undefined}
        placeholder={placeholderText}
        // @ts-ignore
        onChange={handleChange}
        ref={inputRef}
      >
        {(data || []).map(row => {
          const option = `${groupby.map(col => row[col])[0]}`;
          return (
            <Option key={option} value={option}>
              {option}
            </Option>
          );
        })}
      </Select>
    </Styles>
  );
}
