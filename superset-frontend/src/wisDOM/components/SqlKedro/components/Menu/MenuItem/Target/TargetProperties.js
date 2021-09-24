/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import { FUNCTIONS } from '~~constants/index';
import { DataFlowApi, UserApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import * as Style from './style';

const TargetProperties = ({
  sqlID,
  data,
  nodeData,
  setSelectFinish,
  setData,
  setFocusNode,
  setNodeChange,
}) => {
  const [form] = Form.useForm();
  const [inputClick, setInputClick] = useState(false); // 避免input編輯時重畫
  const [inputChange, setInputChange] = useState(undefined); // 先把input正在改的存起來
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [checkPublish, setCheckPublish] = useState();
  const [checkLoading, setCheckLoading] = useState(false);
  const [error, setError] = useState();
  const [categoryList, setCategoryList] = useState([]);
  const getEnableTagListQuery = useQuery(UserApi.getEnableTags);

  const checkArgData = Args => {
    const check = false;
    if (Args.table_name && Args.tableDescription && Args.categories) {
      return true;
    }
    return check;
  };

  const handleSave = tempData => {
    const inputData = tempData || inputChange;
    if (inputClick === false && inputData !== undefined) {
      const index = inputData.nodes.findIndex(e => e.id === nodeData.id);
      let change = false;
      const thisNode = inputData.nodes[index];
      if (thisNode && thisNode.args && thisNode.args.publish === true) {
        const checkArg = checkArgData(thisNode.args);

        if (
          // thisNode.args.table_name &&
          // thisNode.args.table_name !== '' &&
          checkArg &&
          thisNode.check !== undefined &&
          (error === undefined || error === 'success')
        ) {
          thisNode.check = undefined;
          change = true;
        } else if (
          (!checkArg || (error && error !== 'success')) &&
          thisNode.check === undefined
        ) {
          thisNode.check = 'error';
          change = true;
        }
      }

      if (change && thisNode) {
        setNodeChange(thisNode);
      } else {
        // input change要存的
        setSelectFinish(false);
        setData(inputData);

        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });
      }
      setInputChange(undefined); // 判斷完清空
    }
  };

  useEffect(() => {
    handleSave();
  }, [inputClick]);

  const onBlurDesc = () => {
    // setInputClick(false);
    handleSave();
  };

  const checkTableDuplicate = async value => {
    try {
      setLoading(true);
      const result = await DataFlowApi.getTableDuplicate(value);
      const check = result === false ? 'success' : 'Table Name is Exit';
      setError(check);
      setInputClick(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getArgTableName = () => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const nodeArg = data.nodes[index].args;

      form.setFieldsValue({
        tablename: nodeArg.table_name,
        tableDesc: nodeArg.tableDescription,
        category: nodeArg.categories && nodeArg.categories[0],
      });
    }
  };

  useEffect(() => {
    if (
      data.nodes !== undefined &&
      nodeData.id !== undefined &&
      nodeData.id !== null
    ) {
      getArgTableName();
    }
  }, [nodeData]);

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

  const handleCkeckPublish = async tableName => {
    try {
      setCheckLoading(true);
      const sendData = {
        tableList: [tableName],
      };

      const result = await DataFlowApi.getCheckPublish(sqlID, sendData);
      if (result === true) {
        setError();
        setCheckPublish(true);
      } else {
        setCheckPublish(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setCheckLoading(false);
    }
  };

  const checkTablePublish = () => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1 && data.nodes[index].args) {
      const tempArg = data.nodes[index].args;
      if (tempArg.table_name && sqlID) {
        handleCkeckPublish(tempArg.table_name);
      }
    }
  };

  useEffect(() => {
    getCategoryList();
    checkTablePublish();
  }, []);

  const onBlurCheck = value => {
    // const reg = /^[a-z]+[a-z0-9_]+[a-z0-9]$/i;
    // 起始英文,結尾英文或數字,均小寫
    const reg = /^[a-z]+([a-z0-9_]|)+[a-z0-9]$/i;

    if (value && value !== '') {
      if (!reg.test(value)) {
        setError(
          'Start with alphabet , end with number or alphabet and accept only letters(a-z), numbers(0-9) and underline(_)',
        );
        setInputClick(false);
      } else {
        checkTableDuplicate(value);
      }
    } else {
      setInputClick(false);
    }
  };

  useEffect(() => {
    if (nodeData.edit) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1 && checkPublish === false) {
        const nodeArg = data.nodes[index].args;
        onBlurCheck(nodeArg.table_name);
      }
    }
  }, [nodeData.edit]);

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    let change = false;
    switch (changeKey) {
      case 'tablename':
        setError();
        if (changeValue !== undefined && index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.table_name = changeValues;
          change = true;
        }
        break;
      case 'tableDesc':
        if (changeValue !== undefined && index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.tableDescription = changeValues;
          change = true;
        }
        break;
      case 'category':
        if (changeValue !== undefined && index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.categories = [changeValues];
          change = true;
        }
        break;
      default:
        break;
    }

    if (change === true) {
      setInputChange({
        edges: [...data.edges],
        nodes: [...data.nodes],
      });

      if (changeKey === 'category') {
        const tempData = {
          edges: [...data.edges],
          nodes: [...data.nodes],
        };
        handleSave(tempData);
      }
    }

    // if (changeValue !== undefined && changeKey === 'tablename') {
    //   const index = data.nodes.findIndex(e => e.id === nodeData.id);
    //   if (index !== -1) {
    //     const nodeArg = data.nodes[index].args;
    //     nodeArg.table_name = changeValues;

    //     setInputChange({
    //       edges: [...data.edges],
    //       nodes: [...data.nodes],
    //     });
    //   }
    // }
  };

  const handleStatus = () => {
    if (error && error !== 'success') {
      return 'error';
    }
    if (error === 'success') {
      return 'success';
    }
    return null;
  };

  const handleHelp = () => {
    if (error && error !== 'success') {
      return error;
    }
    return null;
  };

  return (
    <Form
      data-test="testForm"
      form={form}
      className="node-wrapper"
      onValuesChange={hangeValueChange}
    >
      <Style.FormItemTable2
        label="TableName"
        name="tablename"
        style={error && error !== 'success' ? { paddingBottom: '48px' } : null}
        rules={[
          {
            required: true,
            message: 'Please input a Table Name!',
          },
          // {
          //   pattern: TABLE_NAME_RULES.pattern,
          //   message:
          //     'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
          // },
        ]}
        hasFeedback
        validateStatus={handleStatus()}
        help={nodeData.edit ? handleHelp() : null}
        extra={checkPublish ? 'This Table has been published' : null}
      >
        <Input
          key="testInput"
          onFocus={() => setInputClick(true)}
          onBlur={e => onBlurCheck(e.target.value)}
          disabled={!nodeData.edit || loading || checkPublish || checkLoading}
          loading={loading || checkLoading}
        />
      </Style.FormItemTable2>
      <Form.Item
        style={{ paddingBottom: ' 0px' }}
        label={
          <>
            <span
              style={{
                marginRight: 4,
                color: '#e04355',
                fontSize: 14,
                fontFamily: 'SimSun, sans-serif',
                lineHeight: 1,
                content: '*',
              }}
            >
              *
            </span>
            <span>Table Description</span>
          </>
        }
      />
      <Form.Item
        name="tableDesc"
        rules={[
          {
            required: true,
            message: 'Please input a Table Description',
          },
        ]}
        style={{ paddingTop: ' 0px', paddingBottom: ' 0px' }}
      >
        <Input.TextArea
          key="testInputDesc"
          placeholder="Table Description"
          rows={2}
          disabled={!nodeData.edit}
          autoSize={{ minRows: 2, maxRows: 4 }}
          onBlur={() => onBlurDesc()}
        />
      </Form.Item>
      <Style.FormItemTable
        label="Data Domain"
        name="category"
        rules={[
          {
            required: true,
            message: 'Please Select a Data Domain!',
          },
        ]}
      >
        <Select
          showSearch
          // style={{ width: 150 }}
          placeholder="Select a Data Domain"
          disabled={!nodeData.edit || selectLoading}
          loading={selectLoading}
        >
          {categoryList &&
            categoryList.map(e => <Select.Option value={e}>{e}</Select.Option>)}
        </Select>
      </Style.FormItemTable>
    </Form>
  );
};

export default TargetProperties;
