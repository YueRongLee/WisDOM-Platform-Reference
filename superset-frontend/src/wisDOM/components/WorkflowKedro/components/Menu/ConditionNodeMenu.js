/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

const ConditionNodeMenu = () => (
  <Menu mode="horizontal" selectedKeys={['node']}>
    <Menu.Item key="node">Node Properties</Menu.Item>
  </Menu>
);

export default ConditionNodeMenu;
