import React from 'react';
import PropTypes from 'prop-types';
import './TrayItemWidgetStyle.less';

const TrayItemWidget = ({ model }) => (
  <div
    title={model.name}
    color={model.color}
    draggable
    onDragStart={event => {
      event.dataTransfer.setData('diagram-node', JSON.stringify(model));
    }}
    className="tray-item"
    style={{
      backgroundColor: model.color,
    }}
  >
    {model.name}
  </div>
);

TrayItemWidget.propTypes = {
  model: PropTypes.shape({
    color: PropTypes.string,
    name: PropTypes.string,
    key: PropTypes.string,
  }),
};

TrayItemWidget.defaultProps = {
  model: {
    color: undefined,
    name: '',
    key: undefined,
  },
};

export default TrayItemWidget;
