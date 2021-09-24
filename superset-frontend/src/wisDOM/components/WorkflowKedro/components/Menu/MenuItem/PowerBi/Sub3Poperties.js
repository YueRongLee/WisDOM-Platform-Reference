/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { Select, Form, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { onChange } from 'src/dashboard/actions/dashboardState';
import { WorkFlowApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from './style';

// Email Group
const Sub3PowerBiPoperties = ({ nodeData, data }) => {
  const [loading, setLoading] = useState(false);
  const [optionList, setOptionList] = useState([]);
  //   const [selectOption, setSelectOption] = useState([]);
  const [form] = Form.useForm();

  const getSearchList = async searchKey => {
    try {
      setLoading(true);
      const result = await WorkFlowApi.getEmailSearchList(searchKey);
      const option = result.map(e => (
        <Select.Option key={e.emailAddress} value={e.emailAddress}>
          {e.emailAddress}
        </Select.Option>
      ));
      setOptionList(option);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = value => {
    // 三個字才搜尋
    if (value && value.length > 2) {
      getSearchList(value);
    } else {
      setOptionList([]);
    }
  };

  const initSet = () => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0].args;

      if (setNewArg && setNewArg.receivers) {
        form.setFieldsValue({ emailList: setNewArg.receivers });
      } else {
        form.setFieldsValue({ emailList: [] });
      }

      if (setNewArg && setNewArg.powerBiReportSubject) {
        form.setFieldsValue({
          powerBiReportSubject: setNewArg.powerBiReportSubject,
        });
      } else {
        form.setFieldsValue({ powerBiReportSubject: null });
      }
    }
  };

  useEffect(() => {
    initSet();
  }, []);

  useEffect(() => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      initSet();
    }
  }, [nodeData]);

  const handleSelectChange = changeValue => {
    setOptionList([]);
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0] && nodeFilter[0].args;
      if (setNewArg) {
        setNewArg.receivers = changeValue;
      }
    }
  };

  const onChangeInput = changeValue => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0] && nodeFilter[0].args;
      if (setNewArg) {
        setNewArg.powerBiReportSubject = changeValue;
      }
    }
  };

  return (
    <Style.PowerBiScroll>
      {/* <Spin spinning={loading}> */}
      <Form form={form} name="group" scrollToFirstError>
        <Style.FormItem
          name="emailList"
          label="Recipient List"
          rules={[
            {
              required: true,
              message: 'Please add a Member',
            },
          ]}
          style={{ display: 'block' }}
        >
          <Select
            data-test="select_Email"
            disabled={!nodeData.edit}
            loading={loading}
            onSearch={handleSearch}
            mode="multiple"
            placeholder="Input a Member Name"
            showSearch
            defaultActiveFirstOption={false}
            showArrow={false}
            onChange={handleSelectChange}
            allowClear
          >
            {optionList}
          </Select>
        </Style.FormItem>
        <Style.FormItem
          name="powerBiReportSubject"
          label="Power BI Report Subject (limited to 50 characters): "
          rules={[
            {
              required: true,
              message: 'Please input a subject',
            },
          ]}
          style={{ display: 'block' }}
        >
          <Input
            placeholder="Input a subject"
            disabled={!nodeData.edit}
            maxLength={50}
            onChange={e => onChangeInput(e.target.value)}
          />
        </Style.FormItem>
      </Form>
      {/* </Spin> */}
    </Style.PowerBiScroll>
  );
};

export default Sub3PowerBiPoperties;
