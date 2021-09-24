/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Table } from 'antd';

export const Container = styled.div`
  padding: 10px;
`;

export const DataSetTable = styled(Table)`
  .ant-pagination-options {
    display: none;
  }
`;
