import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, Divider } from 'antd';
import './ConnectionPopover.less';

const ConnectionPopover = ({
  visible,
  children,
  onVisibleChange,
  onEdit,
  onDeselect,
}) => {
  const renderContent = () => (
    <>
      <Button type="text" onClick={onEdit}>
        Edit
      </Button>
      <Divider />
      <Button type="text" onClick={onDeselect}>
        Deselect
      </Button>
    </>
  );

  return (
    <Popover
      overlayClassName="connection-popover"
      visible={visible}
      trigger="click"
      onVisibleChange={onVisibleChange}
      content={renderContent()}
      placement="right"
    >
      {children}
    </Popover>
  );
};

ConnectionPopover.propTypes = {
  visible: PropTypes.bool,
  onVisibleChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDeselect: PropTypes.func,
};

ConnectionPopover.defaultProps = {
  visible: false,
  onVisibleChange: () => null,
  onEdit: () => null,
  onDeselect: () => null,
};

export default ConnectionPopover;
