/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
import * as React from 'react';
import { Modal, Spin, Tooltip } from 'antd';
import { DeleteFilled } from '@ant-design/icons';
import { PortWidget } from '@projectstorm/react-diagrams';
import ReactGA from 'react-ga';
import { ETLApi } from '~~apis/';
import { getTablesFromNodeId } from '~~utils/sqlDiagramHelper';
import SqlEditor from '../../wisDOM/components/SqlEditor/SqlEditorForDiagram';
import './OutputSettingNodeStyle.less';

export class OutputSettingNodeWidget extends React.Component {
  // eslint-disable-next-line react/sort-comp
  formRef = undefined;

  // eslint-disable-next-line react/state-in-constructor
  state = {
    modalVisible: false,
    previewInfo: undefined,
    isLoading: false,
    errorMessage: undefined,
    lastSource: [],
  };

  componentDidMount() {
    this.props.node.setValidate(this.validate);
    this.props.node.setError(this.error);
  }

  setPreviewInfo = previewInfo => {
    this.setState({ previewInfo });
  };

  openModal = data => {
    this.setState({
      modalVisible: true,
      previewInfo: data,
    });
  };

  closeModal = () => {
    this.formRef.resetFields();
    this.setState({
      modalVisible: false,
      previewInfo: this.props.node.getModalData(),
    });
  };

  handleOk = async () => {
    ReactGA.event({
      category: 'ETL',
      action: 'Preview table in OutputSettingNode',
    });
    const result = await this.formRef.validateFields();
    this.props.node.setModalData({ ...this.state.previewInfo, ...result });
    this.closeModal();
  };

  getFormRef = ref => {
    this.formRef = ref;
  };

  getSql = async tables => {
    const serialize = this.props.engine.model.serialize();
    try {
      this.setState({ isLoading: true });
      const result = await ETLApi.getSql(serialize);
      let previewData = this.props.node.getModalData().previewData;
      let cdmProperties = this.props.node.getModalData().cdmProperties;
      // 和上次SQL不同的話將preview data和欄位關聯與描述清除
      if (
        this.props.node.getModalData().sql !== result[this.props.node.getID()]
      ) {
        previewData = undefined;
        cdmProperties = [];
      }
      const newPreviewInfo = {
        ...this.props.node.getModalData(),
        sql: result[this.props.node.getID()],
        previewData,
        cdmProperties,
        columns: tables.reduce(
          (preCol, currObj) => preCol.concat(currObj.columns),
          [],
        ),
      };
      this.props.node.setModalData(newPreviewInfo);
      this.setState({ previewInfo: newPreviewInfo });
      this.formRef.resetFields();
    } catch (e) {
      console.log(e);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handleDoubleClick = () => {
    const inPort = this.props.node.getInPorts()[0];
    const link = inPort && Object.values(inPort.getLinks())[0];
    const sourcePort = link && link.getSourcePort();
    const source = sourcePort && sourcePort.getNode();
    const tables = getTablesFromNodeId(
      this.props.engine,
      this.props.node.getID(),
    );
    if (this.state.modalVisible === false) {
      if (source) {
        // deserialize recover
        if (
          (!this.state.lastSource || !this.state.lastSource.length) &&
          (this.props.node.getModalData().entityName ||
            this.props.node.getModalData().name)
        ) {
          this.setState({ lastSource: tables });
        }
        // connect to a new source
        else if (
          !tables.every(table =>
            (this.state.lastSource || []).map(t => t.guid).includes(table.guid),
          )
        ) {
          this.props.node.resetModalData();
          this.setState({ lastSource: tables });
        }
        this.openModal(this.props.node.getModalData());
        if (tables && tables.length) {
          this.getSql(tables);
        }
      }
    }
  };

  getCurrAllEntity = () =>
    this.props.engine.model
      .getNodes()
      .filter(node => node.options.type === 'OutputSettingNode')
      .map(node => node.payload);

  validate = () => {
    let check;
    const requiredFields = ['entityName', 'sql', 'previewData'];
    requiredFields.forEach(field => {
      if (!this.props.node.getModalData()[field]) {
        if (!check) {
          check = [];
        }
        check.push(`${field} is required`);
      }
    });
    this.setState({ errorMessage: check });
    return check;
  };

  generatePort = port => {
    const portCom = (
      <PortWidget engine={this.props.engine} port={port} key={port.getID()}>
        <div className="outputsetting-port" />
      </PortWidget>
    );
    const label = <div className="outputsetting-port-label" />;

    return (
      <div className="outputsetting-port-label-container">
        {port.getOptions().in ? portCom : label}
        {port.getOptions().in ? label : portCom}
      </div>
    );
  };

  error = errorMessage => {
    this.setState({ errorMessage });
  };

  render() {
    return (
      <Tooltip
        className={this.state.modalVisible ? 'hidden' : ''}
        title={
          this.state.errorMessage &&
          this.state.errorMessage.map(msg => <div>{msg}</div>)
        }
        color="#e04355"
      >
        <div
          className={`
          outputsetting-node 
          ${this.state.errorMessage ? 'error' : ''}
          ${this.props.node.isSelected() ? 'selected' : ''}
          `}
          onDoubleClick={this.handleDoubleClick}
        >
          <div className="outputsetting-title">
            <div className="outputsetting-title-name">
              {this.props.node.getOptions().name || 'Output Setting'}
            </div>
            {!this.props.node.isLocked() && (
              <DeleteFilled onClick={() => this.props.node.remove()} />
            )}
          </div>
          <div className="outputsetting-port-container">
            {this.props.node.getInPorts().map(port => this.generatePort(port))}
            {this.props.node.getOutPorts().map(port => this.generatePort(port))}
          </div>
          <Modal
            title="Output Setting"
            visible={this.state.modalVisible}
            onCancel={this.closeModal}
            onOk={this.handleOk}
            destroyOnClose
            maskClosable={!this.state.isLoading}
            width={800}
            bodyStyle={{
              maxHeight: '70vh',
              overflow: 'auto',
            }} // 高度自動,超過螢幕的70％就scroll
          >
            <Spin spinning={this.state.isLoading}>
              <SqlEditor
                readOnly={this.props.node.isLocked()}
                formRef={this.getFormRef}
                visible={this.state.modalVisible}
                previewInfo={this.state.previewInfo}
                setPreviewInfo={this.setPreviewInfo}
                oEntity={this.getCurrAllEntity()}
                customized={
                  !this.state.previewInfo ||
                  !this.state.lastSource ||
                  !this.state.lastSource.length
                }
                editMode={this.props.node.isEditMode()}
                groupId={this.props.node.getGroupId()}
              />
            </Spin>
          </Modal>
        </div>
      </Tooltip>
    );
  }
}
