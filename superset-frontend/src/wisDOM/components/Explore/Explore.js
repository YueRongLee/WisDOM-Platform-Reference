/* eslint-disable no-param-reassign */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Form, message } from 'antd';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useQuery, useModal } from '~~hooks/';
import { ETLApi } from '~~apis/';
import { INPUT_RULES } from '~~constants/index';
import { AppContext } from '~~store/appStore';
import { isObject } from '~~utils/common';
import '../../MainStyle.less';
import './ExploreStyle.less';
import SqlDiagram from '../SqlDiagram/SqlDiagram';
import CustomCronModal from '../CronModal/CustomCronModal';

const Explore = ({
  back,
  selectedColumns,
  setSelectedColumns,
  selectGroupObject,
}) => {
  const appStore = useContext(AppContext);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronValue, setCronValue] = useState(''); // for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  // const [selectedGroupName, setSelectedGroupName] = useState(undefined);
  const [model, setModel] = useState();
  const [form] = Form.useForm();
  const cronPopupModal = useModal();
  const { trackEvent } = useMatomo();
  const saveETL = useQuery(ETLApi.saveETL);
  const getAllSqlQuery = useQuery(ETLApi.getAllSql);

  const clearAllData = () => {
    setSelectedColumns([]);
    form.resetFields();
    cronPopupModal.closeModal();
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

  const handleOK = async () => {
    if (cronValue === '' || cronValue === undefined) {
      message.error('Check your select !');
    } else {
      // send cron
      setCronLoading(true);
      const serialize = model.serialize();
      const req = {
        // groupid
        diagramMap: {
          ...serialize,
          domain: appStore.userInfo.emplId,
          folderName: form.getFieldValue('folderName'),
          permission: form.getFieldValue('permission'),
          schedule: cronValue,
        },
        groupId: selectGroupObject.groupId,
      };
      try {
        await saveETL.exec(req);
        message.success('your request has been submitted successfully!');
        clearAllData();
        back();
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

  const OpenCornModel = () => {
    cronPopupModal.openModal();
  };

  const onSubmit = async () => {
    ReactGA.event({
      category: 'ETL',
      action: 'Explore ETL table',
    });
    trackEvent({
      category: 'ETL',
      action: 'Explore ETL table',
    });
    const errorMessages = model.getNodes().filter(node => {
      if (node.validate) {
        return node.validate() !== undefined;
      }
      return false;
    });

    if (errorMessages.length) {
      return;
    }

    const serialize = model.serialize();
    const error = await checkSql(serialize);
    if (error.length) {
      return;
    }
    OpenCornModel();
  };

  return (
    <>
      <div className="exploreContainer">
        <div className="tableListContainer">
          {/* <div className="title">Explore</div>
          <Divider /> */}
          <div className="subTitle">Information</div>
          <Form
            name="basic"
            initialValues={{
              permission: appStore.userInfo.email,
              groupName: selectGroupObject.groupName,
            }}
            layout="vertical"
            onFinish={onSubmit}
            form={form}
          >
            <Form.Item
              label="Project Name"
              name="folderName"
              rules={[
                { required: true, message: 'Please input project name!' },
              ]}
            >
              <Input
                className="folderName"
                placeholder="Project Name"
                maxLength={INPUT_RULES.PROJECT_NAME.value}
              />
            </Form.Item>

            <Form.Item
              label="Permission"
              name="permission"
              rules={[
                { required: true, message: "Please input users' emails!" },
              ]}
            >
              {/* permission長度不限 */}
              <Input
                className="permission"
                placeholder="Please input users' emails split by ','"
              />
            </Form.Item>

            <Form.Item label="Group Name" name="groupName">
              <Input disabled />
            </Form.Item>
          </Form>
        </div>
        <div className="sqlContainer">
          <SqlDiagram
            oEntity={selectedColumns}
            getModel={setModel}
            groupId={selectGroupObject.groupId}
          />
        </div>
      </div>
      <div className="footerAction">
        <Button
          data-test="submit"
          type="primary"
          htmlType="submit"
          onClick={form.submit} // form.submit
        >
          Submit
        </Button>
      </div>
      <CustomCronModal
        modal={cronPopupModal}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
        handleOK={handleOK}
        loading={cronLoading}
      />
    </>
  );
};

Explore.propTypes = {
  selectedColumns: PropTypes.arrayOf(PropTypes.shape({})),
  setSelectedColumns: PropTypes.func,
};

Explore.defaultProps = {
  selectedColumns: [],
  setSelectedColumns: () => null,
};

export default Explore;
