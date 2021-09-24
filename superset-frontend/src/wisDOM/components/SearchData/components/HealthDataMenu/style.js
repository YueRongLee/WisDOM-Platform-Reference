/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Form, List } from 'antd';

export const WKCColumnList = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const WKCForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 5px;
  }
`;

export const WKCListWapper = styled(List)`
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: auto;
  padding: 8px 24px;
  height: 30vh;
`;
