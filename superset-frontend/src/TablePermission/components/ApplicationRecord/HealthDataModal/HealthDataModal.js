/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
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
} from 'antd';
import {
  TableOutlined,
  EditOutlined,
  // CloseOutlined,
  // CheckOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { TableApi, UserApi } from '~~apis/';
import { useModal, useQuery } from '~~hooks/';
import { SYSTEM_TYPE, ROLE_TYPE, ROLEPERMISSION } from '~~constants/index';
// import { SYSTEM_TYPE } from '~~constants/index';
import './MainStyle.less';
import EditDescriptModal from './EditDescriptModal';
import EditCategoryModal from './EditCategoryModal';

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
    filtered: undefined,
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

const HealthDataModal = ({ modal }) => {
  const [form] = Form.useForm();
  const [healthResult, setHealthResult] = useState({ ...INIT_VALUE });
  const [resultIsLoading, setResultIsLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);

  const editDescriptModal = useModal();
  const editCategoryModal = useModal();

  const container = document.getElementById('app');
  const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));

  const getEnableTagListQuery = useQuery(UserApi.getEnableTags);
  // const saveChangeCategory = useQuery(TableApi.changeCategory);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  // const handleSelect = value => {
  //   setSelect(value);
  // };

  const handleBeforeLeave = () => {
    setSelectLoading(false);
    setCategoryList([]);
    // setCategoryEdit(false);
    modal.closeModal();
    form.resetFields();
    setHealthResult({ ...INIT_VALUE });
  };

  const getHealthData = async (type, tableNAme) => {
    setResultIsLoading(true);
    try {
      const result = await TableApi.getApplicationHealthTable(type, tableNAme);
      setHealthResult(result);
    } catch (e) {
      console.log(e.message.errorMessage);
      handleBeforeLeave();
    } finally {
      setResultIsLoading(false);
    }
  };

  const getCategoryList = async () => {
    setSelectLoading(true);
    try {
      const result = await getEnableTagListQuery.exec();
      setCategoryList(result);
    } catch (e) {
      console.log(e);
    } finally {
      setSelectLoading(false);
    }
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

  const showEditButton = data => {
    if (
      data.consumeType !== '' &&
      data.consumeType.substring(0, 2) !== 'IT' &&
      !healthResult.underApplying
    ) {
      if (
        data.table.filtered === false &&
        localStorage.getItem('role').length !== 0 &&
        localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER)
      ) {
        return (
          <>
            {ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.edit
                .value,
            ) ? (
              <Button
                style={{ float: 'right' }}
                type="link"
                onClick={() => editDescriptModal.openModal()}
                disabled={
                  modal.modalData.filtered && modal.modalData.filtered === true
                }
              >
                <EditOutlined />
                <span style={{ fontSize: '10px' }}>Edit Description</span>
              </Button>
            ) : null}
          </>
        );
      }
      if (
        data.table.filtered === false &&
        data.owner.toLowerCase() === bootstrap.user.emplId.toLowerCase() &&
        data.table.categories.length === 0
      ) {
        return (
          <>
            {ROLEPERMISSION.checkPermission(
              SYSTEMLIST,
              ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.edit
                .value,
            ) ? (
              <Button
                style={{ float: 'right' }}
                type="link"
                onClick={() => editDescriptModal.openModal()}
                disabled={
                  modal.modalData.filtered && modal.modalData.filtered === true
                }
              >
                <EditOutlined />
                <span style={{ fontSize: '10px' }}>Edit Description</span>
              </Button>
            ) : null}
          </>
        );
      }
      return null;
    }
    return null;
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getHealthData(modal.modalData.type, modal.modalData.tableName);

      getCategoryList();
    }
  }, [modal.visible, modal.modalData]);

  const refresh = () => {
    getHealthData(modal.modalData.type, modal.modalData.tableName);
  };

  const showCatory = () => {
    if (
      healthResult.table.filtered === false &&
      localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) &&
      healthResult.table.systemType === SYSTEM_TYPE.props.WisDOM.key &&
      !healthResult.underApplying
    ) {
      return (
        <>
          {healthResult.table.categories &&
            healthResult.table.categories.map(c => (
              <Tag className="listTag2">{c}</Tag>
            ))}
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.tablePremission.applicationRecord.edit
              .value,
          ) ? (
            <Button
              type="link"
              size="small"
              onClick={() => editCategoryModal.openModal()}
              disabled={
                modal.modalData.filtered && modal.modalData.filtered === true
              }
              icon={<EditOutlined />}
              loading={selectLoading}
            />
          ) : null}
        </>
      );
    }

    if (
      healthResult.table.filtered === false &&
      healthResult.owner?.toLowerCase() ===
        bootstrap.user.emplId.toLowerCase() &&
      healthResult.table.categories.length === 0 &&
      !healthResult.underApplying
    ) {
      return (
        <>
          {healthResult.table.categories &&
            healthResult.table.categories.map(c => (
              <Tag className="listTag2">{c}</Tag>
            ))}
          <Button
            type="link"
            size="small"
            onClick={() => editCategoryModal.openModal()}
            disabled={
              modal.modalData.filtered && modal.modalData.filtered === true
            }
            icon={<EditOutlined />}
            loading={selectLoading}
          />
        </>
      );
    }

    if (
      healthResult.table.categories &&
      healthResult.table.categories.length &&
      !healthResult.underApplying
    ) {
      return healthResult.table.categories.map(c => (
        <>
          <Tag className="listTag2">{c}</Tag>
        </>
      ));
    }

    if (healthResult.underApplying && healthResult.applyingCategory.length) {
      return (
        <>
          {healthResult.applyingCategory.map(c => (
            <>
              <Tag className="listTag2">{c}</Tag>
            </>
          ))}
          Applying
        </>
      );
    }

    return null;
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
            Data Healthy - {healthResult.table.name}
            {healthResult.table.filtered === true ? (
              <DatabaseOutlined style={{ marginLeft: 10 }} />
            ) : null}
          </div>
        }
        visible={modal.visible}
        destroyOnClose
        onCancel={handleBeforeLeave}
        footer={
          <Button data-test="leave" type="primary" onClick={handleBeforeLeave}>
            Ok
          </Button>
        }
      >
        <Spin spinning={resultIsLoading}>
          <Form
            {...formItemLayout}
            form={form}
            name="healthData"
            scrollToFirstError
            destroyOnClose
          >
            <div style={{ width: '100%', display: 'flex' }}>
              <div
                style={{ width: '45%', paddingRight: 10 }}
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

                <Form.Item label="Data Domain">
                  {showCatory(healthResult)}
                </Form.Item>

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
                  {healthResult.table.systemType ===
                    SYSTEM_TYPE.props.WisDOM.key ||
                  healthResult.table.systemType === SYSTEM_TYPE.props.WDL.key ||
                  healthResult.table.systemType === SYSTEM_TYPE.props.WDC.key
                    ? showEditButton(healthResult)
                    : null}
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
          </Form>
        </Spin>
      </Modal>
      <EditDescriptModal
        modal={editDescriptModal}
        sourceData={healthResult}
        refresh={refresh}
      />
      <EditCategoryModal
        modal={editCategoryModal}
        sourceData={healthResult}
        categoryList={categoryList}
        refresh={refresh}
      />
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
