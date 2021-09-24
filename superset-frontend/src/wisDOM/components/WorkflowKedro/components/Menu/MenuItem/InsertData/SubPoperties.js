/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Select, Form, message, Input, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { WorkFlowApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import {
  INPUT_RULES,
  DB_TYPE,
  FUNCTIONS,
  NUMBER_RULES,
} from '~~constants/index';
import './InsertStyle.less';
import * as Style from './style';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const SubPoperties = ({
  data,
  nodeData,
  setSelectFinish,
  setData,
  setFocusNode,
}) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(true); // change Edit or Test 預設是edit mode
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [onBlurStatus, setOnBlurStatus] = useState(false);
  const dbOptions = DB_TYPE.getOptionList().map(type => ({
    value: type.value,
  }));
  const testConnect = useQuery(WorkFlowApi.testConnection);

  useEffect(() => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined && nodeFilter[0] !== undefined) {
      if (
        nodeFilter[0].args !== undefined &&
        nodeFilter[0].args.dbInfo !== undefined
      ) {
        form.setFieldsValue({
          host: nodeFilter[0].args.dbInfo.host,
          port: nodeFilter[0].args.dbInfo.port,
          dbType: nodeFilter[0].args.dbInfo.dbType,
          database: nodeFilter[0].args.dbInfo.database,
          userName: nodeFilter[0].args.dbInfo.userName,
          // password: nodeFilter[0].args.dbInfo.password,
          password:
            nodeFilter[0].args.frontend !== undefined
              ? nodeFilter[0].args.frontend.showPwd
              : nodeFilter[0].args.dbInfo.password,
        });
      }
      if (nodeFilter[0].args.frontend !== undefined) {
        setTestResult(nodeFilter[0].args.frontend.testConnect);
      }
    }
  }, []);

  const handleSetDataArg = setNewArg => {
    // const otherNode = data.nodes.filter(e => e.id !== nodeData.id);
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    setSelectFinish(false);

    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    const newData = FUNCTIONS.SET_DATA(
      data,
      nodeData,
      index,
      nodeData.id,
      getArgNode[0],
      setNewArg,
      data.edges,
    );

    setData(newData);

    // setData({
    //   edges: [...data.edges],
    //   nodes: [
    //     ...otherNode,
    //     {
    //       full_name: nodeData.name,
    //       name: FUNCTIONS.NODE_NAME(nodeData.name),
    //       id: nodeData.id,
    //       type: nodeData.type,
    //       args: setNewArg,
    //     },
    //   ],
    // });
    setFocusNode({
      full_name: nodeData.name,
      name: FUNCTIONS.NODE_NAME(nodeData.name),
      id: nodeData.id,
      type: nodeData.type,
    });
  };

  const setResultInArg = result => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      if (nodeFilter[0].args.frontend === undefined) {
        nodeFilter[0].args.frontend = {
          testConnect: '',
          password: '',
          showPwd: '',
        };
      }

      const setFront = nodeFilter[0].args.frontend;
      setFront.testConnect = result;
      setFront.password = form.getFieldValue('password');

      handleSetDataArg(nodeFilter[0].args);
    }
  };

  const handleFinish = async () => {
    // form check
    // test connect
    setEditMode(false);
    setTestLoading(true);

    const sendData = {
      host: form.getFieldValue('host'),
      port: form.getFieldValue('port'),
      dbType: form.getFieldValue('dbType'),
      database: form.getFieldValue('database'),
      userName: form.getFieldValue('userName'),
      password: form.getFieldValue('password'),
    };
    try {
      const result = await testConnect.exec(sendData);
      setTestResult(result);
      setResultInArg(result);
      if (result === true) {
        message.success('Test Connect Successful');
      } else {
        message.error('Test Connect Fail, Please Click Edit.');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setTestLoading(false);
    }
  };

  const handleTest = () => {
    form.submit();
  };

  const handleEdit = () => {
    setEditMode(true);
    setTestResult('');
    // 有更新資料要重新test connect
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter[0] && nodeFilter[0].args !== undefined) {
      nodeFilter[0].args.frontend.testConnect = false;
    }
  };

  const handleOnBlur = () => {
    setOnBlurStatus(true);
  };

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined && nodeFilter[0] !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      if (nodeFilter[0].args.dbInfo === undefined) {
        nodeFilter[0].args.dbInfo = {
          host: '',
          port: '',
          dbType: '',
          database: '',
          userName: '',
          password: '',
        };
      }

      const setNewArg = nodeFilter[0].args.dbInfo;
      const setFront = nodeFilter[0].args.frontend;

      switch (changeKey) {
        case 'host':
          setNewArg.host = changeValues;
          break;
        case 'port':
          setNewArg.port = changeValues;
          break;
        case 'dbType':
          setNewArg.dbType = changeValues;
          break;
        case 'database':
          setNewArg.database = changeValues;
          break;
        case 'userName':
          setNewArg.userName = changeValues;
          break;
        case 'password':
          setNewArg.password = btoa(changeValues);
          setFront.showPwd = changeValues;
          break;
        default:
          break;
      }

      if (onBlurStatus === true) {
        handleSetDataArg(nodeFilter[0].args);
        setOnBlurStatus(false);
      }
    }
  };

  return (
    <Style.InsertScroll>
      <Form
        data-test="import"
        {...formItemLayout}
        className="node-wrapper"
        form={form}
        name="import"
        onFinish={handleFinish}
        scrollToFirstError
        onValuesChange={hangeValueChange}
        style={{ height: '70vh' }}
      >
        {() => (
          <>
            <Form.Item
              name="host"
              label="Host"
              rules={[{ required: true, message: 'Please input a IP' }]}
            >
              <Input
                data-test="host"
                placeholder="10.10.1.5"
                // style={{ width: '55%' }}
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                maxLength={INPUT_RULES.HOST.value}
                onBlur={() => handleOnBlur()}
              />
            </Form.Item>
            <Form.Item
              name="port"
              label="Port"
              rules={[
                { required: true, message: 'Please Input a number' },
                {
                  pattern: NUMBER_RULES.pattern,
                  message: 'Accept number(0-9) only',
                },
              ]}
            >
              <Input
                placeholder="Input a number"
                // style={{ width: '55%' }}
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                maxLength={INPUT_RULES.PORT.value}
                onBlur={() => handleOnBlur()}
              />
            </Form.Item>
            <Form.Item
              name="dbType"
              label="DB Type"
              rules={[{ required: true, message: 'Please Select a type' }]}
            >
              <Select
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                placeholder="Select a type"
                // style={{ width: '55%' }}
                options={dbOptions}
              />
            </Form.Item>
            <Form.Item
              name="database"
              label="DB Source"
              rules={[{ required: true, message: 'Please Enter a Source' }]}
            >
              <Input
                placeholder="Wisdom_ssot"
                maxLength={INPUT_RULES.DB_NAME.value}
                // style={{ width: '55%' }}
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                onBlur={() => handleOnBlur()}
              />
            </Form.Item>
            <Form.Item
              name="userName"
              label="User Name"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ float: 'right' }} />}
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                placeholder="Username"
                maxLength={INPUT_RULES.USER_NAME.value}
                onBlur={() => handleOnBlur()}
                // style={{ width: '55%' }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input a password',
                },
              ]}
            >
              <Input.Password
                // style={{ width: '55%' }}
                placeholder="Input a password"
                disabled={
                  testLoading ||
                  (testResult && testResult.length !== 0) ||
                  !nodeData.edit
                }
                prefix={<LockOutlined style={{ float: 'right' }} />}
                maxLength={INPUT_RULES.USER_PW.value}
                onBlur={() => handleOnBlur()}
              />
            </Form.Item>
            <div style={{ float: 'right', margin: '5px' }}>
              {testResult !== '' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {testResult ? (
                    <div style={{ color: '#20a7c9', marginRight: '5px' }}>
                      Connect Success
                    </div>
                  ) : (
                    <div style={{ color: '#e04355', marginRight: '5px' }}>
                      Connect Fail
                    </div>
                  )}
                  <Button
                    data-test="edit"
                    onClick={() => handleEdit()}
                    danger={!testResult}
                    disabled={!nodeData.edit}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <Button
                  data-test="testConnect"
                  onClick={() => handleTest()}
                  loading={testLoading}
                  danger={!editMode}
                  disabled={!nodeData.edit}
                >
                  Test Connect
                </Button>
              )}
            </div>
          </>
        )}
      </Form>
    </Style.InsertScroll>
  );
};

export default SubPoperties;
