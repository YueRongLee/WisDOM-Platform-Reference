/* eslint-disable no-restricted-imports */
import React from 'react';
import { Menu } from 'antd';

const ScheduleNodeMenu = ({
  setRecordHeader,
  setSelectItem,
  selectItem,
  outputType,
  //   classificationType,
  nodeData,
}) => {
  const handleClick = e => {
    setSelectItem(e.key);
    setRecordHeader(e.key);
  };

  const subMenuName = type => {
    switch (type) {
      case 'OUTPUTCUSTOM':
        return 'DB Setting';

      case 'powerBi':
        return 'Preview';

      case 'dataRobotAutoML':
        return 'AutoML Properties';

      case 'dataRobotAutoTS':
        return 'AutoTS Properties';

      default:
        return null;
    }
  };

  const sub2MenuName = type => {
    switch (type) {
      case 'powerBi':
        return 'Condition';

      default:
        return null;
    }
  };

  const sub3MenuName = type => {
    switch (type) {
      case 'powerBi':
        return 'E-mail Notification';

      default:
        return null;
    }
  };

  return (
    <Menu
      className="node-wrapper"
      mode="horizontal"
      selectedKeys={[selectItem]}
    >
      <Menu.Item key="node" onClick={handleClick}>
        Node Properties
      </Menu.Item>
      {nodeData.type === 'Empty' ? null : (
        <Menu.Item key="poperties" onClick={handleClick}>
          Trigger/Action Properties
        </Menu.Item>
      )}

      {/* powerBi插入第3頁 */}
      {outputType === 'powerBi' ? (
        <Menu.Item key="sub2Poperties" onClick={handleClick}>
          {sub2MenuName(outputType)}
        </Menu.Item>
      ) : null}

      {/* powerBi插入第4頁 */}
      {outputType === 'powerBi' ? (
        <Menu.Item key="sub3Poperties" onClick={handleClick}>
          {sub3MenuName(outputType)}
        </Menu.Item>
      ) : null}

      {/* 第三頁的key都叫SubPoperties */}
      {outputType ? (
        <Menu.Item key="subPoperties" onClick={handleClick}>
          {subMenuName(outputType)}
        </Menu.Item>
      ) : null}
    </Menu>
  );
};

export default ScheduleNodeMenu;
