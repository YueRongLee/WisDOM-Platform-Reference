import * as React from 'react';
import PropTypes from 'prop-types';
import './SelectableButtonStyle.less';

const SelectableButton = ({
  value,
  darkColor,
  lightColor,
  selected,
  onClick,
  children,
  disabled,
}) => (
  <div
    role="button"
    tabIndex="0"
    className="selectableButton"
    onClick={() => !disabled && onClick(value)}
    style={
      selected
        ? {
            color: lightColor,
            backgroundColor: darkColor,
          }
        : {
            color: darkColor,
            backgroundColor: lightColor,
          }
    }
  >
    {children}
  </div>
);

SelectableButton.propTypes = {
  id: PropTypes.string,
  darkColor: PropTypes.string,
  lightColor: PropTypes.string,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

SelectableButton.defaultProps = {
  id: undefined,
  darkColor: undefined,
  lightColor: undefined,
  selected: false,
  onClick: () => null,
  disabled: false,
};

export default SelectableButton;
