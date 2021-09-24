import * as React from 'react';
import { Tooltip } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { PortWidget } from '@projectstorm/react-diagrams';
import { getTablesFromNodeId } from '~~utils/sqlDiagramHelper';
import GroupNodeModal from './GroupNodeModal';
import './GroupNodeStyle.less';

export class GroupNodeWidget extends React.Component {
  // eslint-disable-next-line react/sort-comp
  formRef = undefined;

  // eslint-disable-next-line react/state-in-constructor
  state = {
    modalVisible: false,
    payload: undefined,
    isLoading: false,
    errorMessage: undefined,
    lastTables: [],
  };

  componentDidMount() {
    this.props.node.setValidate(this.validate);
  }

  setPayload = payload => {
    this.setState({ payload });
  };

  openModal = data => {
    this.setState({
      modalVisible: true,
      payload: data,
    });
  };

  closeModal = () => {
    this.formRef.resetFields();
    this.setState({
      modalVisible: false,
      payload: this.props.node.getModalData(),
    });
  };

  handleOk = data => {
    this.props.node.setModalData(data.payload);
  };

  getFormRef = ref => {
    this.formRef = ref;
  };

  handleDoubleClick = () => {
    const tables = getTablesFromNodeId(
      this.props.engine,
      this.props.node.getID(),
    );
    if (tables && tables.length) {
      // deserialize recover
      if (
        !this.state.lastTables.length &&
        this.props.node.getModalData().length
      ) {
        // Do not reset modal data
      }
      // connect to new tables
      else if (
        !tables.every(table =>
          this.state.lastTables.map(t => t.guid).includes(table.guid),
        )
      ) {
        this.props.node.resetModalData();
      }
      this.setState({ lastTables: tables });
      this.openModal(this.props.node.getModalData());
    }
  };

  validate = () => {
    const check =
      this.props.node.getModalData() &&
      this.props.node.getModalData().length &&
      Object.keys(this.props.node.getModalData()[0]).length
        ? undefined
        : 'Add at least one row';
    this.setState({ errorMessage: check });
    return check;
  };

  generatePort = port => {
    const portCom = (
      <PortWidget engine={this.props.engine} port={port} key={port.getID()}>
        <div className="group-port" />
      </PortWidget>
    );
    const label = <div className="group-port-label" />;

    return (
      <div className="group-port-label-container">
        {port.getOptions().in ? portCom : label}
        {port.getOptions().in ? label : portCom}
      </div>
    );
  };

  render() {
    return (
      <Tooltip
        className={this.state.modalVisible ? 'hidden' : ''}
        title={this.state.errorMessage}
        color="#e04355"
      >
        <div
          className={`
          group-node 
          ${this.state.errorMessage ? 'error' : ''}
          ${this.props.node.isSelected() ? 'selected' : ''}
          `}
          onDoubleClick={this.handleDoubleClick}
        >
          <div className="group-title">
            <div className="group-title-name">
              {this.props.node.getOptions().name || 'Output Setting'}
            </div>
            {!this.props.node.isLocked() && (
              <DeleteFilled onClick={() => this.props.node.remove()} />
            )}
          </div>
          <div className="group-port-container">
            {this.props.node.getInPorts().map(port => this.generatePort(port))}
            {this.props.node.getOutPorts().map(port => this.generatePort(port))}
          </div>
          <GroupNodeModal
            payload={this.state.payload}
            setPayload={this.setPayload}
            modalProps={{
              visible: this.state.modalVisible,
              onCancel: this.closeModal,
              onOk: this.handleOk,
              maskClosable: !this.state.isLoading,
            }}
            tables={this.state.lastTables}
            formRef={this.getFormRef}
            disabled={this.props.node.isLocked()}
          />
        </div>
      </Tooltip>
    );
  }
}
