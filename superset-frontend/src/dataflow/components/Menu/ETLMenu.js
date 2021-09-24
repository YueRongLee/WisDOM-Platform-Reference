/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';
// import './DataflowETLDetailStyle.less';

const ETLMenu = ({ tab, setTab }) => {
  // const [curr, setCurr] = useState();

  const updateTab = e => {
    setTab(e.key);
  };

  return (
    <Menu
      mode="horizontal"
      onClick={updateTab}
      selectedKeys={[tab]}
      style={{ overflowY: 'hidden' }}
    >
      <Menu.Item key="dataflow">Dataflow</Menu.Item>
      <Menu.Item key="workflow">Workflow</Menu.Item>
    </Menu>
  );
};

ETLMenu.propTypes = {};

ETLMenu.defaultProps = {};

export default ETLMenu;
