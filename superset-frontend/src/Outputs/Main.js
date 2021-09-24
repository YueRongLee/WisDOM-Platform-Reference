/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import setupApp from '../setup/setupApp';
import { ExcelTable } from './components';
import './MainStyle.less';

const { TabPane } = Tabs;

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => {
  const [tabs, setTabs] = useState('excel');
  useEffect(() => {}, []);

  return (
    <div className="outputs-management">
      <div className="ManaTitle">My Outputs</div>
      <Tabs value={tabs} onChange={setTabs}>
        <TabPane tab="Excel files" key="excel" />
      </Tabs>
      {tabs === 'excel' ? <ExcelTable user={bootstrap.user} /> : null}
    </div>
  );
};

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
