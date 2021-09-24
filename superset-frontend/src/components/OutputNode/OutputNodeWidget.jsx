/* eslint-disable no-console */
import * as React from 'react';
import { Tooltip, Button } from 'antd';
import { PortWidget } from '@projectstorm/react-diagrams';
import { PlusOutlined } from '@ant-design/icons';
import { OUTPUT_TYPE } from '~~constants/index';
import SelectableButton from '../SelectableButton/SelectableButton';
import ConnectionModal from './ConnectionModal';
import ConnectionPopover from './ConnectionPopover';
import './OutputNodeStyle.less';

export class OutputNodeWidget extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    modalVisible: false,
    popoverVisible: false,
    customDBVisible: false,
    modalData: undefined,
    outputType: this.props.node.getAllOutputType(),
    errorMessage: undefined,
  };

  componentDidMount() {
    this.props.node.setValidate(this.validate);
  }

  openModal = data => {
    this.setState({ modalVisible: true, modalData: data });
  };

  closeModal = () => {
    this.setState({ modalVisible: false, modalData: undefined });
  };

  toggleOutput = (id, selected) => {
    const nextList = [].concat(this.state.outputType);
    const idx = this.state.outputType.findIndex(col => col.value === id);
    if (idx !== -1) {
      const sel = selected !== undefined ? selected : !nextList[idx].selected;
      nextList[idx].selected = sel;
      this.setState({ outputType: nextList });
      this.props.node.setAllOutputType(nextList);
    }
  };

  handleClickOutput = (id, selected) => {
    if (id === OUTPUT_TYPE.props.CUSTOM.value) {
      const idx = this.state.outputType.findIndex(col => col.value === id);
      const sel =
        selected !== undefined || idx === -1
          ? selected
          : !this.state.outputType[idx].selected;
      if (sel) {
        this.openModal(this.state.outputType[idx]);
      } else {
        this.setState({ popoverVisible: true });
      }
    } else {
      this.toggleOutput(id, selected);
    }
  };

  preventDragHandler = e => {
    e.preventDefault();
  };

  validate = () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const check = this.state.outputType.filter(type => type.selected).length
      ? undefined
      : 'Select at least one output type';
    this.setState({ errorMessage: check });
    return check;
  };

  generatePort = port => {
    const portCom = (
      <PortWidget engine={this.props.engine} port={port} key={port.getID()}>
        <div className="output-port" />
      </PortWidget>
    );
    const label = <div className="output-port-label" />;

    return (
      <div className="output-port-label-container">
        {port.getOptions().in ? portCom : label}
        {port.getOptions().in ? label : portCom}
      </div>
    );
  };

  changedbInfoByType = (outputTypeValue, connData) => {
    const nextList = [].concat(this.state.outputType);
    const idx = this.state.outputType.findIndex(
      col => col.value === outputTypeValue,
    );
    if (idx !== -1) {
      nextList[idx].dbInfo = {
        host: connData.host,
        port: connData.port,
        database: connData.database,
        dbType: connData.dbType,
        userName: connData.userName,
        password: connData.password ? btoa(connData.password) : undefined,
      };
      this.props.node.setAllOutputType(nextList);
    } else {
      console.error('cannot find this output type in list');
    }
  };

  handleSaveConnection = connData => {
    this.changedbInfoByType(this.state.modalData.value, connData);
    this.toggleOutput(this.state.modalData.value, true);
    this.closeModal();
  };

  handlePopoverVisibleChange = visible => {
    if (!visible) {
      this.setState({ popoverVisible: visible });
    }
  };

  handleEditConnection = type => {
    this.openModal(type);
    this.setState({ popoverVisible: false });
  };

  handleDeselectConnection = type => {
    this.changedbInfoByType(type.value, { ...OUTPUT_TYPE.props.CUSTOM.dbInfo });
    this.toggleOutput(type.value, false);
    this.setState({ popoverVisible: false });
  };

  handleAddOutput = () => {
    this.setState({ customDBVisible: true });
  };

  hasDBInfo = type => {
    const idx = this.state.outputType.findIndex(
      col => col.value === OUTPUT_TYPE.props.CUSTOM.value,
    );
    const customObj = type || this.state.outputType[idx];
    return !!customObj.dbInfo.host;
  };

  renderOutputButtonList = type => {
    const outputbutton = (
      <SelectableButton
        key={type.key}
        value={type.value}
        selected={type.selected}
        onClick={this.handleClickOutput}
        darkColor="#444e7c"
        lightColor="#b4b8ca"
        disabled={this.props.node.isLocked()}
      >
        {type.showName}
      </SelectableButton>
    );

    let rtnComp;
    if (type.value === OUTPUT_TYPE.props.CUSTOM.value) {
      if (this.hasDBInfo(type) || this.state.customDBVisible) {
        rtnComp = (
          <ConnectionPopover
            className={
              !this.hasDBInfo(type) && !this.state.customDBVisible
                ? 'hidden'
                : ''
            }
            visible={this.state.popoverVisible}
            onVisibleChange={visible =>
              this.handlePopoverVisibleChange(visible, type.value)
            }
            onEdit={() => this.handleEditConnection(type)}
            onDeselect={() => this.handleDeselectConnection(type)}
          >
            {outputbutton}
          </ConnectionPopover>
        );
      }
    } else {
      rtnComp = outputbutton;
    }
    return rtnComp;
  };

  render() {
    return (
      <Tooltip title={this.state.errorMessage} color="#e04355">
        <div
          className={`
          output-node 
          ${this.state.errorMessage ? 'error' : ''}
          ${this.props.node.isSelected() ? 'selected' : ''}
          `}
          onDrop={this.preventDragHandler}
        >
          <div className="output-title">
            <div className="output-title-name">
              {this.props.node.getOptions().name || 'Output'}
            </div>
          </div>
          <div className="output-port-container">
            {this.props.node.getInPorts().map(port => this.generatePort(port))}
            {this.props.node.getOutPorts().map(port => this.generatePort(port))}
          </div>
          <div>
            {this.state.outputType
              .map(this.renderOutputButtonList)
              .filter(type => !!type)}
            {!this.props.node.isLocked() &&
              !this.hasDBInfo() &&
              !this.state.customDBVisible && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={this.handleAddOutput}
                  ghost
                  block
                />
              )}
          </div>
          <ConnectionModal
            visible={this.state.modalVisible}
            onOk={this.handleSaveConnection}
            onCancel={this.closeModal}
            oData={this.state.modalData}
            editMode={this.props.node.isEditMode()}
          />
        </div>
      </Tooltip>
    );
  }
}
