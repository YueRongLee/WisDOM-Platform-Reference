/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, List, Tag, Tooltip, Spin } from 'antd';
import { TableOutlined, EditOutlined } from '@ant-design/icons';
import { AppContext } from 'src/store/appStore';
// import { getCategoryList } from 'src/apis/SyncDataApi';
import moment from 'moment';
import { TableApi, UserApi } from '~~apis/';
import { useModal, useQuery } from '~~hooks/';
import { SYSTEM_TYPE, ROLE_TYPE, ROLEPERMISSION } from '~~constants/index';
import '../../../MainStyle.less';
import EditDescriptModal from './EditDescriptModal';
import EditCategoryModal from './EditCategoryModal';

import MenuHeader from './HealthDataMenu/MenuHeader';
import WKCHealthData from './HealthDataMenu/WKCHealthData';

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
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
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

  const [selectItem, setSelectItem] = useState('healthData');
  const editDescriptModal = useModal();
  const editCategoryModal = useModal();
  const appStore = useContext(AppContext);
  const getEnableTagListQuery = useQuery(UserApi.getEnableTags);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const handleBeforeLeave = () => {
    setSelectLoading(false);
    setCategoryList([]);
    setSelectItem('healthData');
    modal.closeModal();
    form.resetFields();
    setHealthResult({ ...INIT_VALUE });
  };

  const getHealthData = async id => {
    setResultIsLoading(true);
    try {
      const result = await TableApi.getHealthTable(id);
      setHealthResult(result);
    } catch (e) {
      console.log(e);
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
    // IT及Dataflow publish的不可編輯,舊的 etl output hive table 的部分('Wisdom')不可編輯
    if (
      data.consumeType !== '' &&
      data.consumeType.substring(0, 2) !== 'IT' &&
      data.consumeType !== 'Dataflow' &&
      data.consumeType !== 'WisDOM'
    ) {
      // data.consumeType === 'user_define' 可編輯(不等於也可,所以不加)
      const userId = appStore.userInfo.emplId.toLowerCase();
      const categoryOwner =
        modal.modalData && modal.modalData.categoryOwner.toLowerCase();
      if (
        appStore.userInfo.roles.length !== 0 &&
        appStore.userInfo.roles.includes(ROLE_TYPE.DATA_MASTER)
      ) {
        return true;
      }

      // 如果有categories,只有categories owner可以編輯
      if (data.table.categories && data.table.categories.length > 0) {
        if (categoryOwner === userId) {
          return true;
        }
        return false;
      }
      if (data.owner.toLowerCase() === userId) {
        return true;
      }
      return false;
    }
    return false;
  };
  useEffect(() => {
    if (modal.visible && modal.modalData && modal.modalData.guid) {
      getHealthData(modal.modalData.guid);

      getCategoryList();
    }
  }, [modal.visible, modal.modalData]);

  const showCatory = () => {
    if (
      healthResult &&
      healthResult.table.filtered === false &&
      appStore.userInfo.roles.includes(ROLE_TYPE.DATA_MASTER) &&
      healthResult.table.systemType === SYSTEM_TYPE.props.WisDOM.key
    ) {
      return (
        <>
          {healthResult.table.categories &&
            healthResult.table.categories.map(c => (
              <Tag className="listTag2">{c}</Tag>
            ))}
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.createPipeline.healthData.edit.value,
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
      healthResult &&
      healthResult.table.filtered === false &&
      healthResult.owner?.toLowerCase() ===
        appStore.userInfo.emplId.toLowerCase() &&
      healthResult.table.categories.length === 0
    ) {
      return (
        <>
          {healthResult.table.categories &&
            healthResult.table.categories.map(c => (
              <Tag className="listTag2">{c}</Tag>
            ))}
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.createPipeline.healthData.edit.value,
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
      healthResult &&
      healthResult.table.categories &&
      healthResult.table.categories.length
    ) {
      return healthResult.table.categories.map(c => (
        <>
          <Tag className="listTag2">{c}</Tag>
        </>
      ));
    }
    return null;
  };

  return (
    <div className="HealthDataModal">
      <Modal
        width={1020}
        bodyStyle={{
          maxHeight: '75vh',
          minHeight: '50vh',
          overflow: selectItem === 'healthData' ? 'auto' : 'hidden',
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
          <Button data-test="leave" type="primary" onClick={handleBeforeLeave}>
            Ok
          </Button>
        }
      >
        <MenuHeader selectItem={selectItem} setSelectItem={setSelectItem} />
        {selectItem === 'healthData' ? (
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
                  style={{ width: '50%' }}
                  className="healthy-left-form-container"
                >
                  <Form.Item label="Table Name">
                    {healthResult && healthResult.table.name}
                  </Form.Item>

                  <Form.Item label="Description">
                    {healthResult && healthResult.table.comment}
                  </Form.Item>

                  <Form.Item label="Frequency">
                    {healthResult && healthResult.frequency}
                  </Form.Item>

                  <Form.Item label="Update Time">
                    {timestampToTime(
                      healthResult && healthResult.lastUpdateTime,
                    )}
                  </Form.Item>

                  <Form.Item label="Tags">
                    {(healthResult &&
                    healthResult.table.tags &&
                    healthResult.table.tags.length
                      ? healthResult.table.tags
                      : []
                    ).map(tag => (
                      <Tag className="listTag2">{tag}</Tag>
                    ))}
                  </Form.Item>

                  <Form.Item label="Data Domain">{showCatory()}</Form.Item>

                  <Form.Item label="Owners">
                    {healthResult && healthResult.ownerEnName && (
                      <div
                        className="health-owner"
                        style={{ backgroundColor: GetColor() }}
                      >
                        {healthResult.ownerEnName.substring(0, 1)}
                      </div>
                    )}
                    {healthResult && healthResult.ownerEnName !== ''
                      ? `${healthResult.ownerEnName} (${healthResult.owner})`
                      : ''}
                  </Form.Item>

                  {(healthResult &&
                    healthResult.table.systemType ===
                      SYSTEM_TYPE.props.WisDOM.key) ||
                  healthResult.table.systemType === SYSTEM_TYPE.props.WDC.key ||
                  healthResult.table.systemType === SYSTEM_TYPE.props.WDL.key
                    ? showReference(healthResult)
                    : null}
                </div>
                <div style={{ width: '50%' }}>
                  <p style={{ fontSize: '18px' }}>
                    <TableOutlined style={{ color: '#20a7c994' }} /> Column
                    Information
                    {healthResult &&
                    healthResult.table.filtered === false &&
                    showEditButton(healthResult) &&
                    ROLEPERMISSION.checkPermission(
                      SYSTEMLIST,
                      ROLEPERMISSION.dataPipeline.createPipeline.healthData.edit
                        .value,
                    ) ? (
                      <Button
                        style={{ float: 'right' }}
                        type="link"
                        onClick={() => editDescriptModal.openModal()}
                        disabled={
                          modal.modalData.filtered &&
                          modal.modalData.filtered === true
                        }
                      >
                        <EditOutlined />
                        <span style={{ fontSize: '10px' }}>
                          Edit Description
                        </span>
                      </Button>
                    ) : null}
                    {/* {healthResult.table.systemType ===
                       SYSTEM_TYPE.props.WisDOM.key ||
                     healthResult.table.systemType ===
                       SYSTEM_TYPE.props.WDL.key ||
                     healthResult.table.systemType === SYSTEM_TYPE.props.WDC.key
                       ? showEditButton(healthResult)
                       : null} */}
                  </p>
                  <List
                    className="health-list-container"
                    grid={{ gutter: 4, column: 1 }}
                    size="large"
                    dataSource={healthResult && healthResult.table.columns}
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
        ) : (
          <WKCHealthData data={modal.modalData} />
        )}
      </Modal>
      <EditDescriptModal
        modal={editDescriptModal}
        sourceData={healthResult}
        refresh={getHealthData}
      />
      <EditCategoryModal
        modal={editCategoryModal}
        sourceData={healthResult}
        categoryList={categoryList}
        refresh={getHealthData}
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
