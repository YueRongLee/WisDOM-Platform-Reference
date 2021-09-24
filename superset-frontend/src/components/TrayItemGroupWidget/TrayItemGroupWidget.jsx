import React from 'react';
import PropTypes from 'prop-types';
import './TrayItemGroupWidget.less';

const TrayItemGroupWidget = ({ title, children }) => (
  <div className="tray-group">
    <div className="tray-group-title">{title}</div>
    {children && <div className="tray-group-content">{children}</div>}
  </div>
);

TrayItemGroupWidget.propTypes = {
  title: PropTypes.string,
};

TrayItemGroupWidget.defaultProps = {
  title: '',
};

export default TrayItemGroupWidget;
