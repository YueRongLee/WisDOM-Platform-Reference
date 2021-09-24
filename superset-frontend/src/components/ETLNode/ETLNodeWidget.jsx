import * as React from 'react';
import { Modal } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { PortWidget } from '@projectstorm/react-diagrams';
import './ETLNodeStyle.less';

export class ETLNodeWidget extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    modalVisible: false,
    modalData: undefined,
  };

  openModal = data => {
    this.setState({ modalVisible: true, modalData: data });
  };

  closeModal = () => {
    this.setState({ modalVisible: false, modalData: undefined });
  };

  generatePort = port => {
    const portCom = (
      <PortWidget engine={this.props.engine} port={port} key={port.getID()}>
        <div className="etl-port" />
      </PortWidget>
    );
    const label = <div className="etl-port-label" />;

    return (
      <div className="etl-port-label-container">
        {port.getOptions().in ? portCom : label}
        {port.getOptions().in ? label : portCom}
      </div>
    );
  };

  render() {
    return (
      <div
        className="etl-node"
        style={{
          backgroundColor: this.props.node.getOptions().color || '#20a7c9',
          border: `solid 2px ${
            this.props.node.isSelected() ? 'rgb(0,192,255)' : 'black'
          }`,
        }}
      >
        <div className="etl-title">
          <div className="etl-title-name">
            {this.props.node.getOptions().name}
          </div>
          {!this.props.node.isLocked() && (
            <DeleteFilled onClick={() => this.props.node.remove()} />
          )}
        </div>
        <div className="etl-port-container">
          {this.props.node.getInPorts().map(port => this.generatePort(port))}
          {this.props.node.getOutPorts().map(port => this.generatePort(port))}
        </div>
        <Modal
          visible={this.state.modalVisible}
          onCancel={this.closeModal}
          onOk={this.closeModal}
        >
          {JSON.stringify(this.state.modalData)}
        </Modal>
      </div>
    );
  }
}
