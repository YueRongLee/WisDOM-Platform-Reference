/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Form } from 'antd';

export const FormItem = styled(Form.Item)`
  display: flex;
  flex-direction: column;
  .ant-form-item-label {
    text-align: left;
  }
`;

export const FormItemSwitch = styled(Form.Item)`
  padding: 12px;
  .ant-form-item-control-input-content {
    flex-direction: unset;
  }
  .ant-form-item-label {
    white-space: pre-wrap;
    width: 67%;
    text-align: left;
  }
  .ant-form-item-label > label::after {
    content: '';
    height: 50px;
  }
`;

export const DataRobotScroll = styled.div`
  transition: color 0.3s ease;
  /* overflow-y: scroll; */
  // overflow-y: auto;
  color: rgba(0, 0, 0, 0);
  /* overflow-x: hidden; */
  overflow: auto;
  height: calc(60vh - 100px);
  &:hover {
    color: rgba(0, 0, 0, 0.3);
  }
  &::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 0 10px;
  }
  &::-webkit-scrollbar,
  &::-webkit-scrollbar-thumb {
    width: 26px;
    border-radius: 13px;
    background-clip: padding-box;
    border: 10px solid transparent;
  }
  .ant-form-item-explain {
    color: #e04355;
  }
`;

export const TableBlock = styled.div`
  display: flex;
  .ant-form-item {
    padding: 8px 4px !important;
  }
`;

export const FormItemMapping = styled(Form.Item)`
  padding: 0 15px;
  .menu-content .ant-form-item {
    padding: 10px;
  }
`;
