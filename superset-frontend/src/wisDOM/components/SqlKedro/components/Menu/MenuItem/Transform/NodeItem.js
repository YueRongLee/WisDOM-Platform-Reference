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

const TransformNodeItem = ({
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

  const checkFiler = node => {
    let checkField = false;
    if (node.args && node.args.filter) {
      node.args.filter.forEach(e => {
        if (e.columnName && e.columnType && e.operation && e.value) {
          checkField = true;
        } else {
          checkField = false;
        }
      });
    }
    return checkField;
  };

  const checkChangeName = node => {
    let checkFormat = false;
    if (node.args && node.args.changeFormat) {
      node.args.changeFormat.forEach(e => {
        if (e.columnName && e.formatType && e.value) {
          checkFormat = true;
        } else {
          checkFormat = false;
        }
      });
    }
    return checkFormat;
  };

  const checkMathFields = node => {
    let checkFormat = false;
    if (node.args && node.args.mathOperation) {
      const mathField = node.args.mathOperation;
      if (
        mathField.type &&
        mathField.valueUsing &&
        mathField.constantLeft !== undefined &&
        mathField.columnLeft &&
        mathField.newColumn
      ) {
        if (mathField.type === 'round' && mathField.percise) {
          checkFormat = true;
        } else if (mathField.type !== 'round' && mathField.columnRight) {
          checkFormat = true;
        } else {
          checkFormat = false;
        }
      }
    }

    return checkFormat;
  };

  const checkError = () => {
    const type = form.getFieldValue('transform');
    if (type) {
      const parents = form.getFieldValue('parents');
      const thisNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id)[0];
      let checkParent = false;
      switch (type.toLowerCase()) {
        case DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('Selectfield select 1 table Only');
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
        case DATAFLOW_TYPE.TRANSFORM.props.JOIN.key:
          if (parents.length !== 2) {
            setError(true);
            setMsg('Join need to select 2 tables');
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
        case DATAFLOW_TYPE.TRANSFORM.props.UNION.key:
          if (parents.length !== 2) {
            setError(true);
            setMsg('Union need to select 2 tables');
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
        case DATAFLOW_TYPE.TRANSFORM.props.CUSTOMIZE.key:
          if (parents.length >= 1) {
            setError(false);
            setMsg(null);
          }

          if (thisNode && thisNode.schema && thisNode.schema !== null) {
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

          break;
        case DATAFLOW_TYPE.TRANSFORM.props.RENAMEFIELDS.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('Renamefield select 1 table Only');
          } else if (
            thisNode &&
            (!thisNode.schema || thisNode.schema === null)
            //   !checkRename(thisNode)))
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        case DATAFLOW_TYPE.TRANSFORM.props.FILTER.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('Filter select 1 table Only');
          } else if (
            thisNode &&
            (!thisNode.schema ||
              thisNode.schema === null ||
              !checkFiler(thisNode))
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        case DATAFLOW_TYPE.TRANSFORM.props.CHANGEFORMAT.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('ChangeFormate select 1 table Only');
          } else if (
            (thisNode && (!thisNode.schema || thisNode.schema === null)) ||
            !checkChangeName(thisNode)
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        case DATAFLOW_TYPE.TRANSFORM.props.GROUPBY.key:
          if (parents.length >= 1) {
            setError(false);
            setMsg(null);
          }

          if (thisNode && (!thisNode.schema || thisNode.schema === null)) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
            }
          } else {
            checkParent = true;
          }
          break;
        case DATAFLOW_TYPE.TRANSFORM.props.MATHFUNCTION.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('MathFunction select 1 table Only');
          } else if (
            (thisNode && (!thisNode.schema || thisNode.schema === null)) ||
            !checkMathFields(thisNode)
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
            }
            setError(false);
            setMsg(null);
          } else {
            checkParent = true;
            setError(false);
            setMsg(null);
          }
          break;
        case DATAFLOW_TYPE.TRANSFORM.props.REMOVEDUPLICATES.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('RemoveDuplicates select 1 table Only');
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
        case DATAFLOW_TYPE.TRANSFORM.props.MERGECOLUMN.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('MergeColumn select 1 table Only');
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
        case DATAFLOW_TYPE.TRANSFORM.props.CHANGEDATATYPE.key:
          if (parents.length > 1) {
            setError(true);
            setMsg('ChangeDataType select 1 table Only');
          } else if (
            (thisNode && (!thisNode.schema || thisNode.schema === null)) ||
            !checkChangeName(thisNode)
          ) {
            if (thisNode.check === undefined) {
              thisNode.check = 'error';
              setNodeChange(thisNode);
              setCheckFinish(true);
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

  const handleChangeTransform = transform => {
    setOptionPage(transform);
  };

  const getTransOption = type => {
    if (type === 'innerjoin' || type === 'leftjoin' || type === 'rightjoin') {
      return DATAFLOW_TYPE.TRANSFORM.props.JOIN.value;
    }
    return type;
  };

  const renderTransOption = type => {
    if (type === 'innerjoin' || type === 'leftjoin' || type === 'rightjoin') {
      return DATAFLOW_TYPE.TRANSFORM.props.JOIN.value;
    }

    return DATAFLOW_TYPE.TRANSFORM.getList().filter(e => e.value === type)[0]
      ?.label;
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
          handleChangeTransform(
            getTransOption(nodeArg.classification).toLowerCase(),
          );
        }
        form.setFieldsValue({
          name: nodeData.name,
          nodetype: nodeData.type,
          parents: nodeParents.map(e => e.key),
          transform:
            nodeArg.classification !== undefined
              ? renderTransOption(nodeArg.classification)
              : '',
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
      } else if (changeKey === 'transform') {
        handleChangeTransform(changeValues);
        // const index = data.nodes.findIndex(e => e.id === nodeData.id);
        if (index !== -1) {
          const nodeArg = data.nodes[index].args;
          nodeArg.classification = DATAFLOW_TYPE.TRANSFORM.getList().filter(
            e => e.key === changeValues,
          )[0].value;

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

  const getJoinOption = nodes => {
    const nodeFilter = nodes.filter(
      e =>
        e.type === DATAFLOW_TYPE.DATASET.value ||
        e.args.classification ===
          DATAFLOW_TYPE.TRANSFORM.props.SELECTFIELDS.value,
    );
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

  //   const handleJoinSelect = value => {
  //     if (value.length !== 2) {
  //       setJoinError(true);
  //     } else setJoinError(false);
  //   };

  const checkJoinRenameField = () => {
    const repeat = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (repeat.length > 0 && repeat[0].args) {
      return repeat[0].args.classification === 'JoinRenameFields';
    }
    return false;
  };

  useEffect(() => {
    if (nodeData.id && data.nodes && nodeData.id !== null) {
      const tempNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (tempNode[0] && error === true) {
        tempNode[0].check = 'error';
        setNodeChange(tempNode[0]);
      } else if (tempNode[0] && error === false) {
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
          <Select
            showSearch
            disabled={!nodeData.edit || checkJoinRenameField()}
          >
            <Option key="dataset">Dataset</Option>
            <Option key="cleansing">Cleansing</Option>
            <Option key="transform">Transform</Option>
            <Option key="target">Target</Option>
          </Select>
        </Style.FormItem>
        <Style.FormItem label="Transform" name="transform">
          <Select
            showSearch
            disabled={!nodeData.edit || checkJoinRenameField()}
          >
            {DATAFLOW_TYPE.TRANSFORM.getList()
              .sort((a, b) => a.value.localeCompare(b.value))
              .map(e => (
                <Option value={e.key}>
                  <Style.OptionBlock>
                    <div>{e.label} </div>
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
          {optionPage === 'join' ? (
            <Select
              mode="tags"
              disabled={!nodeData.edit}
              // onChange={handleJoinSelect}
            >
              {getJoinOption(data.nodes)}
            </Select>
          ) : (
            <Select
              mode="tags"
              disabled={!nodeData.edit || checkJoinRenameField()}
            >
              {getOption(data.nodes)}
            </Select>
          )}
        </Style.FormItem>
      </Form>
    </Style.InsertScroll>
  );
};

export default TransformNodeItem;
