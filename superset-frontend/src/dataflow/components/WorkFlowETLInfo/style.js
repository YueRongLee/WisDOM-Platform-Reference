/* eslint-disable no-restricted-imports */
import styled from 'styled-components';
import { Card, Tabs, Collapse } from 'antd';

const { Panel } = Collapse;

export const PanelBlock = styled(Panel)`
  transition: all 0.1s 0.1s ease-in;
  border-radius: 10px !important;
  box-shadow: 0px 0px 6px 6px rgb(160 161 167 / 15%);
  margin-bottom: 20px;
  span {
    margin-left: 10px;
  }
`;

export const ProjectTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: inline-block;
  .ant-progress {
    display: inline-flex;
    margin-left: 5px;
  }
`;

export const EtlContentTabs = styled(Tabs)`
  height: 68vh;
`;

export const EtlContentTabPane = styled(Tabs.TabPane)`
  height: 62vh;
`;

export const StatusBox = styled(Card)`
  transition: all 0.1s 0.1s ease-in;
  border-radius: 10px;
  box-shadow: 0px 0px 6px 6px rgb(160 161 167 / 15%);
  margin: 14px;
  /* span {
    margin-left: 10px;
  } */
`;

export const StatusBoxTitle = styled.div`
  display: flex;
  align-items: center;
  border: 1px #cfd8dc solid;
  border-radius: 5px;
  padding: 10px;
  margin: 14px;
  font-weight: bold;
  font-size: 16px;
`;

export const StatusBoxContainer = styled.div`
  height: 50vh;
  overflow: auto;
  padding: 10px;
  /* margin-bottom: 15px; */
`;

export const StatusBoxContent = styled.div`
  padding-top: 24px;
  margin-top: 10px;
  border-top: 1px #cfd8dc solid;
  /* > div:nth-child(2) {
    margin: 8px 0 0 46px;
  } */
  span {
    color: rgba(0, 0, 0, 0.85);
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 36px;
`;
