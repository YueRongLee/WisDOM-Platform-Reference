/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Spin, Button, Select, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DATAFLOW_TYPE, checkErrorInput, FUNCTIONS } from '~~constants/index';
import { TableApi } from '~~apis/';
import '../Menu.less';
import * as Style from './style';

const { Option } = Select;

const ReNameFiled = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  setNodeChange,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState({ columns: [] });
  const [reSetFieldInfo, setReSetFieldInfo] = useState([
    { oldName: '', newName: '' },
  ]);

  const setFieldData = tempInfo => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const thisNode = data.nodes[index];
      thisNode.args.classification =
        DATAFLOW_TYPE.TRANSFORM.props.RENAMEFIELDS.value;
      thisNode.args.reSetDataField = tempInfo;

      let checkCols = false;
      if (tempInfo) {
        tempInfo.forEach(e => {
          if (e && e.newName !== '' && e.oldName !== '') {
            checkCols = true;
          } else {
            checkCols = false;
          }
        });
      }

      let change = false;
      if (thisNode) {
        if (thisNode && !checkCols && thisNode.check !== 'error') {
          thisNode.check = 'error';
          change = true;
        } else if (thisNode && checkCols) {
          if (thisNode.check !== undefined) {
            thisNode.check = undefined;
            change = true;
          }
        }
      }

      if (change && thisNode) {
        setNodeChange(thisNode);
      } else {
        setSelectFinish(false);
        setData({
          edges: [...data.edges],
          nodes: [...data.nodes],
        });
        setFocusNode({
          full_name: nodeData.name,
          name: FUNCTIONS.NODE_NAME(nodeData.name),
          id: nodeData.id,
          type: nodeData.type,
        });
      }
    }
  };

  const deleteFeild = index => {
    const tempReSetFieldInfo = [...reSetFieldInfo].filter(
      (item, idx) => idx !== index,
    );
    setReSetFieldInfo(tempReSetFieldInfo);
    setFieldData(tempReSetFieldInfo);
  };

  const onChange = (value, index) => {
    const tempReSetFieldInfo = [...reSetFieldInfo].map((item, idx) => {
      if (idx === index) {
        return { ...item, oldName: value };
      }
      return item;
    });
    setReSetFieldInfo(tempReSetFieldInfo);
  };

  const onChangeInput = (e, index) => {
    const tempReSetFieldInfo = [...reSetFieldInfo].map((item, idx) => {
      if (idx === index) {
        return { ...item, newName: e.target.value };
      }
      return item;
    });
    setReSetFieldInfo(tempReSetFieldInfo);
  };

  const onBlurInput = () => {
    setFieldData(reSetFieldInfo);
  };

  const getReSetFieldInfo = id => {
    const index = data.nodes.findIndex(e => e.id === id);
    if (data.nodes[index].args.reSetDataField) {
      if (data.nodes[index].args.reSetDataField.length > 0) {
        setReSetFieldInfo(data.nodes[index].args.reSetDataField);
      }
    } else {
      setReSetFieldInfo([{ oldName: '', newName: '' }]);
    }
  };

  const getSchema = id => {
    const index = data.nodes.findIndex(e => e.id === id);
    setTableInfo({
      columns: data.nodes[index].schema || [],
    });
    getReSetFieldInfo(nodeData.id);
  };

  const getTableColumns = async tableName => {
    setLoading(true);
    try {
      const result = await TableApi.getAllowedTableColumns(tableName);
      setTableInfo({
        tableName: result && result.table ? result.table.name : '',
        columns: result && result.table ? result.table.columns : [],
        lastUpdateTime: result && result.lastUpdateTime,
      });
      getReSetFieldInfo(nodeData.id);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const addFilled = () => {
    const tempReSetFieldInfo = [
      ...reSetFieldInfo,
      { oldName: '', newName: '' },
    ];
    setReSetFieldInfo(tempReSetFieldInfo);
  };

  useEffect(() => {
    if (nodeParents) {
      if (
        nodeParents.type === undefined ||
        nodeParents.type === DATAFLOW_TYPE.DATASET.value
      ) {
        getTableColumns(
          nodeParents.args && nodeParents.args.table_name !== undefined
            ? nodeParents.args.table_name
            : nodeParents.name,
        );
      } else {
        getSchema(nodeParents.id);
      }
    }
  }, [nodeParents]);

  return (
    <Spin
      wrapperClassName="schema-list-wrapper"
      spinning={isLoading || schemaLoading}
    >
      <Style.SqlKedroBlock>
        <div style={{ color: '#00000099', margin: '10px 0 10px 10px' }}>
          Rename the selected columns
        </div>
        <Button
          data-test="addField"
          style={{ width: 210, margin: '10px' }}
          onClick={() => addFilled()}
          disabled={!nodeData.edit}
          block
        >
          Add
        </Button>
        <Style.BlockContainer>
          <div style={{ width: '40%', marginRight: 15 }}>Source Column</div>
          <div style={{ width: '40%' }}>New Column Name</div>
          <div style={{ width: '20%' }} />
        </Style.BlockContainer>
        {reSetFieldInfo.map((item, idx) => (
          <>
            <Style.BlockContainer>
              <div style={{ width: '40%', marginRight: 15 }}>
                <Select
                  showSearch
                  value={item.oldName}
                  style={{ width: '100%' }}
                  placeholder="Select a column"
                  optionFilterProp="children"
                  onChange={value => onChange(value, idx)}
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onBlur={() => onBlurInput()}
                  disabled={!nodeData.edit}
                >
                  {tableInfo.columns
                    .filter(
                      item =>
                        !reSetFieldInfo
                          .map(item => item.oldName)
                          .includes(item.name),
                    )
                    .map(filed => (
                      <Option
                        value={filed.name}
                      >{`${filed.name}(${filed.type})`}</Option>
                    ))}
                </Select>
              </div>
              <div style={{ width: '40%' }}>
                <Input
                  data-test="newName"
                  style={{
                    width: '100%',
                    border: `1px solid ${
                      checkErrorInput(item.newName) ? '#d9d9d9' : 'red'
                    }`,
                  }}
                  value={item.newName}
                  onChange={e => onChangeInput(e, idx)}
                  onBlur={() => onBlurInput()}
                  disabled={!nodeData.edit}
                />
              </div>
              <div style={{ width: '20%' }}>
                <DeleteOutlined
                  style={{ fontSize: 20, marginLeft: 10 }}
                  onClick={!nodeData.edit ? () => {} : () => deleteFeild(idx)}
                />
              </div>
            </Style.BlockContainer>
            {checkErrorInput(item.newName) ? null : (
              <p style={{ color: 'red', marginLeft: 10 }}>
                Only letters(A-Z,a-z), numbers(0-9) and underline(_,-)
              </p>
            )}
          </>
        ))}
      </Style.SqlKedroBlock>
    </Spin>
  );
};

export default ReNameFiled;
