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

export const CustomizeWrapper = styled.div`
  padding: 15px 15px 40px 15px;
  height: 400px;
  color: black;
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

export const BlockContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

export const OptionBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SqlKedroBlock = styled.div`
  // overflow: auto;
  /* height: calc(60vh - 65px); */
`;

export const BlockDashed = styled.div`
  border: 1px #3333 dashed;
  margin: 0 10px 15px 15px;
  display: flex;
`;
