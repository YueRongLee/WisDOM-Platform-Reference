/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Form } from 'antd';

export const FormItemValidate = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    align-items: center;
  }
`;

export const ExpandContainer = styled.div`
  width: 100%;
  display: flex;
`;

export const InformationContainer = styled.div`
  width: 35%;
`;

export const HistoryContainer = styled.div`
  width: 65%;
  margin-left: 20px;
`;

export const TitleContainer = styled.div`
  width: 100%;
  margin-bottom: 5px;
`;

export const InformationBlock = styled.div`
  padding: 5px;
  background-color: #fafafa;
`;

export const InformationItem = styled.div`
  display: flex;
  margin: 5px;
`;

export const InformationTitle = styled.div`
  min-width: 130px;
  margin-right: 10px;
`;

export const InformationText = styled.div`
  margin-left: 5px;
  word-break: break-all;
  width: 100%;
`;

export const InformationFilter = styled.div`
  margin-left: 5px;
  width: 100%;
`;
