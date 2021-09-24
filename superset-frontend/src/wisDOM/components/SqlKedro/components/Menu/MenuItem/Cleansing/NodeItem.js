/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  INPUT_RULES,
  FLOW_NAME_RULES,
  DATAFLOW_TYPE,
  FUNCTIONS,
  NODE_INFO_TEXT,
} from '~~constants/index';
import '../Menu.less';
import * as Style from './style';

const { Option } = Select;

const CleansingNodeItem = ({
  data,
  setData,
  selectPage,
  setSelectPage,
  setOptionPage,
  optionPage,
  setNodeChange,
  nodeData,
  nodeParents,
  setEdgeChange,
  setSelectFinish,
  setFocusNode,
}) => {
  const [form] = Form.useForm();
  const [inputClick, setInputClick] = useState(false); // 避免input編輯時重畫
  const [inputChange, setInputChange] = useState(undefined); // 判斷input更新
  const [error, setError] = useState(false);
  const [errorMsg, setMsg] = useState(false);
  const [checkFinish, setCheckFinish] = useState(false); // 避免nodeChange重畫

  const checkError = () => {
    const type = form.getFieldValue('cleansing');
    if (type) {
      const parents = form.getFieldValue('parents');
      const thisNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id)[0];
      let checkParent = false;

      switch (type.toLowerCase()) {
        case DATAFLOW_TYPE.CLEANSING.props.MISSINGVALUE.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('MissingValues select 1 table Only');
          } else if (
            thisNode &&
            (!thisNode.schema || thisNode.schema === null)
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
              checkParent = true;
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        case DATAFLOW_TYPE.CLEANSING.props.CUSTOMVALUE.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('CustomValue select 1 table Only');
          } else if (
            thisNode &&
            (!thisNode.schema || thisNode.schema === null)
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
              checkParent = true;
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        default:
          checkParent = true;
          setError(false);
          setMsg(null);
          break;
      }
      if (checkParent === true) {
        setError(false);
        setMsg(null);
      }
    }
  };

  useEffect(() => {
    checkError();
  }, []);

  const handleSelectNodeType = type => {
    setSelectPage(type.toLowerCase()); // 小寫
  };

  const handleChangeCleansing = cleansing => {
    setOptionPage(cleansing);
  };

  useEffect(() => {
    if (
      nodeData.name !== undefined &&
      nodeData.name !== null &&
      checkFinish === false
    ) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        if (nodeArg.classification !== undefined) {
          handleChangeCleansing(nodeArg.classification);
        }
        form.setFieldsValue({
          name: nodeData.name,
          nodetype: nodeData.type,
          parents: nodeParents.map(e => e.key),
          cleansing:
            nodeArg.classification !== undefined ? nodeArg.classification : '',
        });

        handleSelectNodeType(
          nodeData.type === 'Empty' ? 'dataset' : nodeData.type,
        );

        checkError();
      }
    }
  }, [nodeData]);

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      setNodeChange(inputChange);
      setInputChange(undefined); // 判斷完清空
    }
  }, [inputClick]);

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];
    const index = data.nodes.findIndex(e => e.id === nodeData.id);

    if (changeValue !== undefined && changeKey !== 'parents') {
      const newNode = {
        id: nodeData.id,
        name: changeKey === 'name' ? changeValues : nodeData.name,
        type:
          changeKey === 'nodetype'
            ? changeValues.charAt(0).toUpperCase() + changeValues.slice(1) // 開頭改大寫
            : nodeData.type,
        check:
          changeKey === 'nodetype'
            ? undefined
            : index !== -1 && data.nodes[index].check,
      };
      setInputChange(newNode);
      if (changeKey === 'nodetype') {
        handleSelectNodeType(changeValues);
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      } else if (changeKey === 'cleansing') {
        handleChangeCleansing(changeValues);
        // const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.classification = DATAFLOW_TYPE.CLEANSING.getList().filter(
            e => e.key === changeValues,
          )[0].value;

          if (nodeArg.classification === 'CustomValues') {
            nodeArg.missingValue = undefined;
          } else if (nodeArg.classification === 'MissingValues') {
            nodeArg.customValue = undefined;
          }

          setSelectFinish(false);
          setData({
            edges: [...data.edges],
            nodes: [...data.nodes],
          });
          setFocusNode({
            full_name: data.nodes[index].name,
            name: FUNCTIONS.NODE_NAME(data.nodes[index].name),
            id: data.nodes[index].id,
            type: data.nodes[index].type,
          });
          setNodeChange(newNode);
        }
        checkError();
      } else {
        setInputChange(newNode);
      }
    } else if (changeKey === 'parents') {
      const parentAry = nodeParents.map(e => e.key);

      if (changeValues.length === 0) {
        const { edges } = data;
        const sourceId = edges.findIndex(i => i.target === nodeData.id);

        edges.splice(sourceId, 1);
        setEdgeChange([...edges]);
      } else if (parentAry.length > changeValues.length) {
        const sourceId = parentAry.filter(e => !changeValues.includes(e));

        if (sourceId.length === 1) {
          const newEdge = data.edges.filter(
            e => !(e.source === sourceId[0] && e.target === nodeData.id),
          );

          setEdgeChange(newEdge);
        }
      } else {
        const sourceId = changeValues.filter(e => !parentAry.includes(e));

        if (sourceId.length === 1) {
          setEdgeChange([
            ...data.edges,
            {
              source: sourceId[0],
              target: nodeData.id,
            },
          ]);
        }
      }
      if (changeValues.length > 1 && optionPage === 'selectfields') {
        // setError(true);
        setOptionPage(undefined);
      } else {
        // setError(false);
        setOptionPage('selectfields');
      }
    }

    checkError();
  };

  const getOption = nodes => {
    const nodeFilter = nodes.filter(e => e.id !== nodeData.id);
    return nodeFilter.map(item => (
      <Option key={item.id}>{item.full_name}</Option>
    ));
  };

  const handleValidate = () => {
    form
      .validateFields()
      .then(() => setInputClick(false))
      .catch(info => {
        if (info.values.name !== undefined) {
          form.setFieldsValue({ name: nodeData.name });
        }
      });
  };

  useEffect(() => {
    if (nodeData.id && data.nodes && nodeData.id !== null) {
      const tempNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (tempNode[0] && error) {
        tempNode[0].check = 'error';
        setNodeChange(tempNode[0]);
      } else if (tempNode[0] && !error) {
        if (
          tempNode[0].schema &&
          tempNode[0].schema !== null &&
          tempNode[0].check !== undefined
        ) {
          //   tempNode[0].check = 'success';
          tempNode[0].check = undefined;
          setNodeChange(tempNode[0]);
        }
      }
    }
  }, [error]);

  return (
    <Style.InsertScroll>
      <Form
        data-test="formValueChange"
        form={form}
        className="node-wrapper"
        initialValues={{
          nodetype: selectPage,
          name: nodeData.name,
          parents: nodeParents.map(e => e.key),
        }}
        onValuesChange={hangeValueChange}
      >
        <Style.FormItem
          label="Name"
          name="name"
          rules={[
            { required: true, message: 'Please input a node Name!' },
            {
              pattern: FLOW_NAME_RULES.pattern,
              message:
                'Start with alphabet,only letters, numbers and underline(_)',
            },
          ]}
        >
          <Input
            data-test="nodeNameInput"
            onFocus={() => setInputClick(true)}
            disabled={!nodeData.edit}
            maxLength={INPUT_RULES.TABLE_NAME.value}
            onBlur={() => handleValidate()}
          />
        </Style.FormItem>
        <Style.FormItem label="Node Type" name="nodetype">
          <Select showSearch disabled={!nodeData.edit}>
            <Option key="dataset">Dataset</Option>
            <Option key="cleansing">Cleansing</Option>
            <Option key="transform">Transform</Option>
            <Option key="target">Target</Option>
          </Select>
        </Style.FormItem>
        <Style.FormItem label="Cleansing" name="cleansing">
          <Select showSearch disabled={!nodeData.edit}>
            {DATAFLOW_TYPE.CLEANSING.getList().map(e => (
              <Option value={e.key}>
                <Style.OptionBlock>
                  <div>{e.value}</div>
                  <div>
                    {NODE_INFO_TEXT[e.key] ? (
                      <Tooltip
                        placement="bottomRight"
                        title={NODE_INFO_TEXT[e.key]}
                      >
                        <InfoCircleOutlined />
                      </Tooltip>
                    ) : (
                      <div />
                    )}
                  </div>
                </Style.OptionBlock>
              </Option>
            ))}
          </Select>
        </Style.FormItem>

        <Style.FormItem
          label="Node Parents"
          name="parents"
          validateStatus={error ? 'error' : 'success'}
          help={
            errorMsg || 'Choose which nodes will provide data for this node.'
            // 'Join select 2 tables and selectfield select Only 1 table'
          }
        >
          <Select mode="tags" disabled={!nodeData.edit}>
            {getOption(data.nodes)}
          </Select>
        </Style.FormItem>
      </Form>
    </Style.InsertScroll>
  );
};

export default CleansingNodeItem;
