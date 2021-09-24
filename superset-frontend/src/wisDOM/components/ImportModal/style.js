/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Form } from 'antd';

export const FormItemTable = styled(Form.Item)`
  .ant-form-item-explain,
  .ant-form-item-extra {
    color: #e04355;
  }
`;

// export const FormItemRed = styled(Form.Item)`
//   background: yellow;
//   &.ant-form-item-explain {
//     color: #e04355;
//   }
//   .ant-form-item {
//     margin-bottom: 0px;
//   }
//   .ant-row ant-form-item {
//     margin-bottom: 0px;
//   }
// `;

export const FormItemBottom = styled(Form.Item)`
  .ant-form-item {
    margin-bottom: 0px;
  }
`;
