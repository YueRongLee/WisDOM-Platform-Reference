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
export const TimeFormItem = styled(Form.Item)`
  display: flex;
  flex-direction: column;
  .ant-form-item-label {
    text-align: left;
  }
  .ant-form-item-control {
    display: flex;
    flex-direction: column;

    .ant-form-item-control-input-content {
      display: flex;
      flex-direction: row;

      .ant-form-item {
        flex: 1;
        padding: 0;
      }
    }
  }
`;

export const SqlKedroBlock = styled.div`
  overflow: auto;
  height: calc(60vh - 65px);
`;

export const InsertScroll = styled.div`
  /* max-height: 54vh; */
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
`;
