/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Card } from 'antd';

export const CartListTitle = styled.b`
  font-size: 24px;
  color: #000000a6;
  display: flex;
  justify-content: center;
`;

export const ListWrapper = styled(Card)`
  width: 100%;
  box-shadow: 0px 0px 5px 5px rgb(245 245 245);
`;

export const CartListText = styled.div`
  font-size: 22px;
  color: #000000a6;
  width: 95%;
`;

export const CartListIcon = styled.div`
  width: 5%;
  font-size: 15px;
  color: #000000a6;
  display: flex;
`;

export const FooterAction = styled.div`
  text-align: right;
`;
