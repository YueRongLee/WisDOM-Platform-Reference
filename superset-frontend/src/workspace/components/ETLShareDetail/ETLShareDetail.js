/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Space, Button, Spin, message, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ReactGA from 'react-ga';
import SqlDiagram from 'src/wisDOM/components/SqlDiagram/SqlDiagram';
import { ETLApi } from '~~apis';
import { useQuery, useModal } from '~~hooks/';
import { INPUT_RULES, TABLE_NAME_RULES } from '~~constants/index';
import { isObject } from '~~utils/common';
import CustomCronModal from '../../../wisDOM/components/CronModal/CustomCronModal';
import './ETLShareDetail.less';

const INIT_VALUE = {
  blockchainInfo: undefined,
  enabled: undefined,
  etlSql: undefined,
  eventId: undefined,
  lastJobMessage: undefined,
  lastJobStatus: undefined,
  outputCDM: undefined,
  outputDB: undefined,
  outputHive: undefined,
  outputWl: undefined,
  piplineRequest: undefined,
  projectName: undefined,
  pyPath: undefined,
  schedule: undefined,
  seqId: undefined,
  userId: undefined,
  diagram: undefined,
  referenced: undefined,
};

const ETLShareDetail = ({
  curr,
  forceUpdate,
  setCurr,
  user,
  groupList,
  selfGroupObject,
}) => {
  const [form] = Form.useForm();
  const [model, setModel] = useState();
  const [edit, setEdit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(
    selfGroupObject && selfGroupObject.groupId,
  );
  const [cronValue, setCronValue] = useState(''); // for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  const [detailData, setDetailData] = useState({ ...INIT_VALUE });
  const [resetDeserializeVal, setResetDeserializeVal] = useState(0);
  const cronPopupModal = useModal();

  const getShareETLDetailQuery = useQuery(ETLApi.getShareETLDetail);
  const saveETL = useQuery(ETLApi.saveETL);
  const getAllSqlQuery = useQuery(ETLApi.getAllSql);
  const { trackEvent } = useMatomo();

  const resetDeserialize = () => {
    ReactGA.event({
      category: 'ETLShare',
      action: 'ETLShare reload',
    });
    trackEvent({
      category: 'ETLShare',
      action: 'ETLShare reload',
    });
    let nextVal = resetDeserializeVal;
    setResetDeserializeVal((nextVal += 1));
  };

  const resetAll = () => {
    setDetailData({ ...INIT_VALUE });
    resetDeserialize();
  };

  const getETLDetail = async () => {
    try {
      const result = await getShareETLDetailQuery.exec({ id: curr });
      setDetailData(result);
    } catch (e) {
      console.log(e);
    }
  };

  const OpenCornModel = () => {
    cronPopupModal.openModal();
  };

  const clearAllData = () => {
    form.resetFields();
  };

  const checkSql = async serialize => {
    let error = [];
    try {
      const result = await getAllSqlQuery.exec(serialize);
      error = model
        .getNodes()
        .filter(
          node =>
            node.getOptions().type === 'OutputSettingNode' &&
            result[node.getID()] !== 'SELECT ' &&
            result[node.getID()] !== node.getModalData().sql,
        );
      error.forEach(node => {
        node.cleanNode();
        node.error(['Sql not equal to preview data']);
      });
    } catch (e) {
      console.log(e);
    }
    return error;
  };

  const submitShareData = async () => {
    setSubmitLoading(true);
    const errorMessages = model.getNodes().filter(node => {
      if (node.validate) {
        return node.validate() !== undefined;
      }
      setSubmitLoading(false);
      return false;
    });

    if (errorMessages.length) {
      setSubmitLoading(false);
      return;
    }

    const serialize = model.serialize();
    const error = await checkSql(serialize);
    if (error.length) {
      setSubmitLoading(false);
      return;
    }

    setSubmitLoading(false);
    OpenCornModel();
  };

  const handleOK = async () => {
    ReactGA.event({
      category: 'ETLShare',
      action: 'ETLShare save',
    });
    trackEvent({
      category: 'ETLShare',
      action: 'ETLShare save',
    });

    if (cronValue === '' || cronValue === undefined) {
      message.error('Check your select !');
    } else {
      cronPopupModal.closeModal();
      // send cron
      setCronLoading(true);
      const serialize = model.serialize();
      const req = {
        diagramMap: {
          ...serialize,
          domain: user.emplId,
          folderName: form.getFieldValue('projectname'),
          permission: form.getFieldValue('permission'),
          schedule: cronValue,
        },
        groupId: selectedGroupId,
      };
      try {
        await saveETL.exec(req);
        message.success('your request has been submitted successfully!');
        clearAllData();
        forceUpdate();
        setCurr();
      } catch (e) {
        // 後端驗證entity name重複
        if (isObject(e.message)) {
          const error = JSON.parse(e.message);
          if (error.errorData.result) {
            Object.keys(error.errorData.result).forEach(nodeId => {
              model.getNode(nodeId).error(['Entity Name is duplicated']);
            });
            cronPopupModal.closeModal();
          }
        } else {
          console.log(e.message);
        }
      } finally {
        setCronLoading(false);
      }
    }
  };

  useEffect(() => {
    resetAll();
    if (curr) {
      getETLDetail();
      if (!selfGroupObject.groupName) {
        setEdit(true);
      }
      form.resetFields();
      form.setFieldsValue({ Group: selfGroupObject.groupName });
    }
  }, [curr]);

  return (
    <div className="etlShareDetail">
      <Spin spinning={getShareETLDetailQuery.isLoading}>
        <Form
          className="share-info-area"
          form={form}
          name="share"
          scrollToFirstError
          // initialValues={{
          //   permission: user.email,
          // }}
          onFinish={submitShareData}
        >
          <Form.Item
            label="Project Name"
            name="projectname"
            style={{ paddingRight: 10 }}
            rules={[
              { required: true, message: 'Please input project name!' },
              {
                pattern: TABLE_NAME_RULES.pattern,
                message:
                  'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
              },
            ]}
          >
            <Input maxLength={INPUT_RULES.PROJECT_NAME.value} />
          </Form.Item>

          <Form.Item
            label="Permission"
            name="permission"
            style={{ paddingRight: 10 }}
            rules={[{ required: true }]}
          >
            {/* permission長度不限 */}
            <Input />
          </Form.Item>

          <Form.Item label="Group" name="Group" rules={[{ required: true }]}>
            <Select
              placeholder="Select a group"
              onChange={value => {
                setSelectedGroupId(value);
              }}
              defaultValue={selfGroupObject && selfGroupObject.groupName}
            >
              {groupList.groupListData.map(item => (
                <Select.Option value={item.groupId} key={item.groupId}>
                  {item.groupName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <div className="toolbutton">
          <Space align="end">
            <Button
              type="text"
              shape="circle"
              icon={<ReloadOutlined />}
              onClick={resetDeserialize}
            />
          </Space>
        </div>
        {detailData.diagram && (
          <>
            <SqlDiagram
              deserialize={detailData.diagram}
              getModel={setModel}
              reset={resetDeserializeVal}
              disabled={edit}
              deserializeEdit={false}
              groupId={selectedGroupId}
            />
            <div className="footer-submit">
              <Button
                type="primary"
                onClick={form.submit}
                loading={submitLoading}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </Spin>
      <CustomCronModal
        modal={cronPopupModal}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
        handleOK={handleOK}
        loading={cronLoading}
      />
    </div>
  );
};

ETLShareDetail.propTypes = {
  curr: PropTypes.number,
  setCurr: PropTypes.func,
  forceUpdate: PropTypes.func,
  user: PropTypes.shape({}),
  groupList: PropTypes.array,
};

ETLShareDetail.defaultProps = {
  curr: undefined,
  setCurr: () => null,
  forceUpdate: () => null,
  user: {},
  groupList: [],
};

export default ETLShareDetail;
