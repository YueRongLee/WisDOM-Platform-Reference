/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Checkbox } from 'antd';
import { INPUT_RULES, FLOW_NAME_RULES, FUNCTIONS } from '~~constants/index';
import '../Menu.less';

import * as Style from './style';

const { Option } = Select;

const TargetNodeItem = ({
  data,
  selectPage,
  setSelectPage,
  setNodeChange,
  nodeData,
  nodePublish,
  setNodePublish,
  setFocusNode,
  setPublishChange,
  historyMode,
  usedTargetName,
}) => {
  const [form] = Form.useForm();
  const [inputClick, setInputClick] = useState(false); // 避免input編輯時重畫
  const [inputChange, setInputChange] = useState(undefined);
  const [checkFinish, setCheckFinish] = useState(false); // 避免nodeChange重畫
  const [isWTDTable, setIsWTDTable] = useState(false);

  const handleSelectNodeType = type => {
    setSelectPage(type.toLowerCase()); // 小寫
  };

  const findSource = list => {
    const tempList = [];
    data.edges.forEach(e => {
      list.forEach(l => {
        if (l === e.target) {
          tempList.push(e.source);
        }
      });
    });

    if (tempList.length === 0) {
      return list;
    }
    return findSource(tempList);
  };

  const getAllDatasetParents = targetId => {
    const source = data.edges.filter(e => e.target === targetId);
    if (source && source.length > 0) {
      const targetSource = data.edges.filter(e => e.target === targetId)[0]
        .source;
      const tsList = data.edges
        .filter(e => e.target === targetSource)
        .map(e => e.source);

      const init1 =
        targetSource.substring(0, 7) === 'Dataset' ? [targetSource] : []; // 同層
      const init2 = tsList.filter(f => f.substring(0, 7) === 'Dataset'); // 上一層
      const sourceList = findSource(tsList);
      const finialList = [...new Set([...init1, ...init2, ...sourceList])];
      return finialList;
    }
    return [];
  };

  const checkIsWTD = () => {
    let check = false;
    if (nodeData && nodeData.id) {
      const sourceList = getAllDatasetParents(nodeData.id);
      sourceList.forEach(e => {
        const node = data.nodes.filter(n => n.id === e);
        if (node.length > 0 && node[0].args.table_type === 'WTD') {
          check = true;
        }
      });
    }
    setIsWTDTable(check);
  };

  const checkError = () => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const thisNode = data.nodes[index];
      if (thisNode.type === 'Target') {
        let isOK = false;

        if (thisNode.schema && thisNode.schema !== null) {
          isOK = true;
          if (
            thisNode.args &&
            thisNode.args.publish === true &&
            (!thisNode.args.table_name || thisNode.check === 'error')
          ) {
            isOK = false;
          }
        }

        if (isOK === true) {
          if (thisNode.check !== undefined) {
            thisNode.check = undefined;
            setNodeChange(thisNode);
            setCheckFinish(true);
          }
        } else if (thisNode.check === undefined) {
          thisNode.check = 'error';
          setNodeChange(thisNode);
          setCheckFinish(true);
        }
      }
    }
  };

  useEffect(() => {
    checkError();
    checkIsWTD();
  }, []);

  useEffect(() => {
    if (
      nodeData.name !== undefined &&
      nodeData.name !== null &&
      checkFinish === false
    ) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        form.setFieldsValue({
          name: nodeData.name,
          nodetype: nodeData.type,
        });
        if (nodeArg !== undefined) {
          setNodePublish(nodeArg.publish);
        }
      }
      handleSelectNodeType(
        nodeData.type === 'Empty' ? 'new_node' : nodeData.type,
      );
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

    if (changeValue !== undefined && changeKey !== 'parents') {
      const newNode = {
        id: nodeData.id,
        name: changeKey === 'name' ? changeValues : nodeData.name,
        type:
          changeKey === 'nodetype'
            ? changeValues.charAt(0).toUpperCase() + changeValues.slice(1) // 開頭改大寫
            : nodeData.type,
      };
      setInputChange(newNode);

      if (changeKey === 'nodetype') {
        handleSelectNodeType(changeValues);
        setInputChange(undefined); // type可以直接改
        setNodeChange(newNode);
      } else {
        setInputChange(newNode);
      }
    }
  };

  const handlePublish = check => {
    if (selectPage === 'target' && nodeData.id !== undefined) {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        nodeArg.publish = check;

        if (nodeArg.publish === false) {
          nodeArg.columnDescription = undefined;
        } else {
          const tempDes = data.nodes[index].schema.map(e => ({
            name: e.name,
            type: e.type,
            description: e.description || e.name,
          }));
          nodeArg.columnDescription = tempDes;
        }

        if (historyMode) {
          setPublishChange(true);
        }

        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });

        checkError();
      }
    }
    return setNodePublish(check);
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

  return (
    <Style.InsertScroll>
      <Form
        form={form}
        className="node-wrapper"
        initialValues={{
          nodetype: selectPage,
          name: nodeData.name,
        }}
        onValuesChange={hangeValueChange}
      >
        <Style.FormItem
          label="Name"
          name="name"
          // className="node-form-item"
          rules={[
            { required: true, message: 'Please input a node Name!' },
            {
              pattern: FLOW_NAME_RULES.pattern,
              message:
                'Start with alphabet,only letters, numbers and underline(_)',
            },
          ]}
          extra={
            usedTargetName &&
            usedTargetName.includes(form.getFieldValue('name'))
              ? 'This target is being used by workflow'
              : null
          }
        >
          <Input
            onFocus={() => setInputClick(true)}
            disabled={
              !nodeData.edit ||
              (usedTargetName &&
                usedTargetName.includes(form.getFieldValue('name')))
            }
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
        <Style.FormItem
          className="publish-checkbox"
          help={isWTDTable ? 'Datasource contains WisDOM Temp Dataset' : null}
        >
          <Checkbox
            checked={nodePublish}
            onChange={e => {
              handlePublish(e.target.checked);
            }}
            disabled={!nodeData.edit || isWTDTable}
          >
            Publish
          </Checkbox>
        </Style.FormItem>
      </Form>
    </Style.InsertScroll>
  );
};

export default TargetNodeItem;
