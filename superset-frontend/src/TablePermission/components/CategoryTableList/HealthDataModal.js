/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  List,
  Tag,
  Tooltip,
  Spin,
  // Select,
  // message,
  Radio,
  Input,
  Space,
} from 'antd';
import {
  TableOutlined,
  // CloseOutlined,
  // CheckOutlined,
} from '@ant-design/icons';
// import { getCategoryList } from 'src/apis/SyncDataApi';
import moment from 'moment';
import { TableApi } from '~~apis/';
import { SYSTEM_TYPE, PREVIEW_STATUS, INPUT_RULES } from '~~constants/index';
import './MainStyle.less';

const INIT_VALUE = {
  table: {
    name: undefined,
    comment: undefined,
    frequency: undefined,
    lastUpdateTime: undefined,
    tags: [],
    systemType: undefined,
    columns: [],
    categories: [],
  },
  ownerEnName: undefined,
  owner: undefined,
  consumeType: undefined,
};

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const COLORS = ['#20a7c9'];

const GetColor = () => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return color;
};

// 時間轉換
function timestampToTime(timestamp) {
  if (timestamp !== '' && timestamp !== null) {
    return moment(timestamp).format('YYYY/MM/DD HH:mm:ss');
  }
  return null;
}

const HealthDataModal = ({ modal, refresh }) => {
  const [form] = Form.useForm();
  const [healthResult, setHealthResult] = useState({ ...INIT_VALUE });
  const [resultIsLoading, setResultIsLoading] = useState(false);

  const [allowed, setAllowed] = useState(1);

  const handleBeforeLeave = () => {
    modal.closeModal();
    form.resetFields();
    setHealthResult({ ...INIT_VALUE });
  };

  const showReference = _project => (
    <Form.Item
      label="reference by"
      className="reference-table"
      style={{
        display: 'block',
        boderRadius: '4px',
        maxWidth: '97%',
        height: 330,
        overflow: 'auto',
      }}
    >
      {_project.referenceDataflow.length !== 0 && (
        <List
          header={<div style={{ fontWeight: 'bold' }}>Dataflow</div>}
          style={{ marginBottom: 20 }}
          bordered
          className="refrence-by-list-container"
          dataSource={_project.referenceDataflow}
          renderItem={item => (
            <List.Item key={item} style={{ padding: '20px!important' }}>
              <Tooltip title={item}>
                <div>{item}</div>
              </Tooltip>
            </List.Item>
          )}
        />
      )}
      {_project.referenceProject.length !== 0 && (
        <List
          header={<div style={{ fontWeight: 'bold' }}>Data Pipeline</div>}
          bordered
          className="refrence-by-list-container"
          dataSource={_project.referenceProject}
          renderItem={item => (
            <List.Item key={item} style={{ padding: '20px!important' }}>
              <Tooltip title={item}>
                <div>{item}</div>
              </Tooltip>
            </List.Item>
          )}
        />
      )}
    </Form.Item>
  );

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      setHealthResult(modal.modalData.healthData);
    }
  }, [modal.visible, modal.modalData]);

  const handleChange = async data => {
    try {
      setResultIsLoading(true);
      const payload = {
        applicationId: modal.modalData.applicationId,
        rejectReason: data.rejectReason,
        status: data.allowed,
      };
      await TableApi.approveCategory(payload);
      handleBeforeLeave();
      refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setResultIsLoading(false);
    }
  };

  const showCatory = () => {
    if (healthResult.applyingCategory && healthResult.applyingCategory.length) {
      return healthResult.applyingCategory.map(c => (
        <>
          <Tag className="listTag2">{c}</Tag>
        </>
      ));
    }
    return null;
  };

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    if (changeKey === 'allowed') {
      setAllowed(changeValues);
    }
  };

  return (
    <div className="HealthDataModal">
      <Modal
        width={900}
        bodyStyle={{
          maxHeight: '75vh',
          minHeight: '50vh',
          overflow: 'auto',
        }} // 高度自動,超過螢幕的75％就scroll
        title={
          <div style={{ fontSize: '20px' }}>
            Data Healthy-{healthResult && healthResult.table.name}
          </div>
        }
        visible={modal.visible}
        destroyOnClose
        onCancel={handleBeforeLeave}
        footer={
          <Space align="end">
            <Button onClick={handleBeforeLeave}>Cancel</Button>
            <Button type="primary" onClick={form.submit}>
              Confirm
            </Button>
          </Space>
        }
      >
        <Spin spinning={resultIsLoading}>
          <Form
            {...formItemLayout}
            form={form}
            name="healthData"
            onFinish={handleChange}
            scrollToFirstError
            destroyOnClose
            initialValues={{
              allowed: null,
              rejectReason: '',
            }}
            onValuesChange={hangeValueChange}
          >
            <div style={{ width: '100%', display: 'flex' }}>
              <div
                style={{ width: '45%' }}
                className="healthy-left-form-container"
              >
                <Form.Item label="Table Name">
                  {healthResult.table.name}
                </Form.Item>

                <Form.Item label="Description">
                  {healthResult.table.comment}
                </Form.Item>

                <Form.Item label="Frequency">
                  {healthResult.frequency}
                </Form.Item>

                <Form.Item label="Update Time">
                  {timestampToTime(healthResult.lastUpdateTime)}
                </Form.Item>

                <Form.Item label="Tags">
                  {(healthResult.table.tags && healthResult.table.tags.length
                    ? healthResult.table.tags
                    : []
                  ).map(tag => (
                    <Tag className="listTag2">{tag}</Tag>
                  ))}
                </Form.Item>

                <Form.Item label="Data Domain">{showCatory()}</Form.Item>

                <Form.Item label="Owners">
                  {healthResult.ownerEnName && (
                    <div
                      className="health-owner"
                      style={{ backgroundColor: GetColor() }}
                    >
                      {healthResult.ownerEnName.substring(0, 1)}
                    </div>
                  )}
                  {healthResult.ownerEnName !== ''
                    ? `${healthResult.ownerEnName} (${healthResult.owner})`
                    : ''}
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="allowed"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Radio.Group
                    options={[
                      {
                        label: 'Approve',
                        value: PREVIEW_STATUS.ALLOWED.value,
                      },
                      {
                        label: 'Reject',
                        value: PREVIEW_STATUS.REJECT.value, // 依後端需求調整
                      },
                    ]}
                  />
                </Form.Item>
                {allowed === PREVIEW_STATUS.REJECT.value ? (
                  <Form.Item
                    label="Reject Reason"
                    name="rejectReason"
                    rules={[
                      {
                        required: true,
                        message: 'Please input reject reason!',
                      },
                    ]}
                    shouldUpdate
                  >
                    <Input.TextArea
                      style={{ marginRight: 10 }}
                      rows={4}
                      maxLength={INPUT_RULES.REASON.value}
                    />
                  </Form.Item>
                ) : null}
                {healthResult.table.systemType ===
                  SYSTEM_TYPE.props.WisDOM.key ||
                healthResult.table.systemType === SYSTEM_TYPE.props.WDC.key ||
                healthResult.table.systemType === SYSTEM_TYPE.props.WDL.key
                  ? showReference(healthResult)
                  : null}
              </div>
              <div style={{ width: '55%' }}>
                <p style={{ fontSize: '18px' }}>
                  <TableOutlined style={{ color: '#20a7c994' }} /> Column
                  Information
                </p>
                <List
                  className="health-list-container"
                  grid={{ gutter: 4, column: 1 }}
                  size="large"
                  dataSource={healthResult.table.columns}
                  pagination={false}
                  renderItem={item => (
                    <List.Item key={item.guid}>
                      <div className="healthlistWrapper">
                        <div>
                          <b style={{ fontSize: '16px', color: '#8d8d8d' }}>
                            {item.name}
                          </b>
                          <p style={{ fontSize: '14px', color: '#8d8d8d' }}>
                            {item.comment}
                          </p>
                        </div>
                        <div style={{ fontSize: '14px', color: '#8d8d8d' }}>
                          {item.type}
                        </div>
                      </div>
                      <hr />
                    </List.Item>
                  )}
                />
              </div>
            </div>
            {/* <div style={{ display: 'flex' }}> */}

            {/* </div> */}
            {/* <div style={{ display: 'flex' }}> */}

            {/* </div> */}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

HealthDataModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

HealthDataModal.defaultProps = {};

export default HealthDataModal;
