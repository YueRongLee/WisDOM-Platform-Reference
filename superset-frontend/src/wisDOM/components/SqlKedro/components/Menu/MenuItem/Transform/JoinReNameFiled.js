/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Spin, Input, Button } from 'antd';
import { DATAFLOW_TYPE, checkErrorInput, FUNCTIONS } from '~~constants/index';
import { TableApi } from '~~apis/';
import '../Menu.less';
import * as Style from './style';

const JoinReNameFiled = ({
  nodeParents,
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  schemaLoading,
  //   setNodeChange,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [resolve, setResolve] = useState('Right');
  // const [tableInfo, setTableInfo] = useState({ columns: [] });
  const [reSetFieldInfo, setReSetFieldInfo] = useState([]);
  const [repeatList, setRepeatList] = useState([]);

  const checkIsRepeat = name => repeatList.includes(name);

  const setFieldData = tempInfo => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      let isRepeat = false;
      tempInfo.forEach(e => {
        if (e.oldName === e.newName) {
          isRepeat = true;
        } else {
          isRepeat = false;
        }
      });

      //   const nodeArg = data.nodes[index].args;
      const node = data.nodes[index];
      node.check = isRepeat ? 'error' : undefined;
      node.args.classification = 'JoinRenameFields';
      node.args.reSetDataField = tempInfo;
      setSelectFinish(false);
      //   setNodeChange(node);
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

  const getReSetFieldInfo = (id, tempTableInfo) => {
    const index = data.nodes.findIndex(e => e.id === id);
    if (data.nodes[index].args.reSetDataField) {
      if (data.nodes[index].args.reSetDataField.length > 0) {
        setReSetFieldInfo(data.nodes[index].args.reSetDataField);
      }
    } else if (tempTableInfo === undefined) {
      //   const index = data.nodes.findIndex(e => e.id === id);
      const parentId = data.edges.filter(e => e.target === id)[0].source;
      const index = data.nodes.findIndex(e => e.id === parentId);
      const temp = data.nodes[index].schema.map(item => ({
        oldName: item.name,
        newName: item.name,
      }));
      setReSetFieldInfo(temp);
    } else {
      const temp = tempTableInfo.columns.map(item => ({
        oldName: item.name,
        newName: item.name,
      }));
      setReSetFieldInfo(temp);
    }
  };

  const getSchema = id => {
    getReSetFieldInfo(nodeData.id);
    const index = data.nodes.findIndex(e => e.id === id);
    return { columns: data.nodes[index].schema };
  };

  const getTableColumns = async tableName => {
    setLoading(true);
    try {
      const result = await TableApi.getAllowedTableColumns(tableName);
      const tempTableInfo = {
        tableName: result && result.table ? result.table.name : '',
        columns: result && result.table ? result.table.columns : [],
        lastUpdateTime: result && result.lastUpdateTime,
      };
      // setTableInfo(tempTableInfo);
      getReSetFieldInfo(nodeData.id, tempTableInfo);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onClickResolve = () => {
    const tempReSetFieldInfo = [...reSetFieldInfo].map(item => ({
      ...item,
      newName: `${resolve}_${item.oldName}`,
    }));
    setFieldData(tempReSetFieldInfo);
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
    const repeat = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (repeat.length > 0) {
      if (repeat[0].args) {
        if (repeat[0].args.repeat) {
          setRepeatList(repeat[0].args.repeat.map(item => item.name));
        }
      }
    }
  }, [nodeParents, data]);

  return (
    <Style.InsertScroll>
      <Spin
        wrapperClassName="schema-list-wrapper"
        spinning={isLoading || schemaLoading}
      >
        <div style={{ color: '#000000D9' }}>
          <div
            style={{
              margin: '10px',
              padding: '10px',
              border: '1px solid #00b0f5',
              backgroundColor: '#aad8ff',
            }}
          >
            <p>
              The input schemas of this join have conflicting key names, This
              can be resolved using ApplyMapping to rename the keys before
              joining to avoid downstream errors.
            </p>

            <p>Custom prefix</p>
            <Input
              style={{ width: 240, marginRight: 15 }}
              value={resolve}
              onChange={e => setResolve(e.target.value)}
              disabled={!nodeData.edit}
            />
            <Button
              data-test="resolve"
              onClick={() => onClickResolve()}
              disabled={!nodeData.edit}
            >
              Resolve it
            </Button>
          </div>
          <Style.BlockContainer>
            <div style={{ width: '40%', marginRight: 15 }}>Source Column</div>
            <div style={{ width: '40%' }}>New Column Name</div>
            <div style={{ width: '20%' }} />
          </Style.BlockContainer>

          {reSetFieldInfo.map((item, idx) => (
            <>
              <Style.BlockContainer>
                <div style={{ width: '40%', marginRight: 15 }}>
                  <Input
                    style={{ width: '100%' }}
                    value={item.oldName}
                    disabled
                  />
                </div>
                <div style={{ width: '40%' }}>
                  <Input
                    data-test="newName"
                    style={{
                      width: '100%',
                      border: `1px solid ${
                        checkIsRepeat(item.newName) ||
                        !checkErrorInput(item.newName)
                          ? 'red'
                          : '#d9d9d9'
                      }`,
                    }}
                    value={item.newName}
                    onChange={e => onChangeInput(e, idx)}
                    onBlur={() => onBlurInput()}
                    disabled={!nodeData.edit}
                  />
                </div>
                <div style={{ width: '20%' }} />
              </Style.BlockContainer>
              {checkIsRepeat(item.newName) ? (
                <p style={{ color: 'red', marginLeft: 10 }}>Repeat name</p>
              ) : null}
              {checkErrorInput(item.newName) ? null : (
                <p style={{ color: 'red', marginLeft: 10 }}>
                  Only letters(A-Z,a-z), numbers(0-9) and underline(_,-)
                </p>
              )}
            </>
          ))}
        </div>
      </Spin>
    </Style.InsertScroll>
  );
};

export default JoinReNameFiled;
