/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Spin, Button, message } from 'antd';
import { GenericSQL } from 'dt-sql-parser';
// import MonacoEditor from 'react-monaco-editor';
import SqlEditor, { Kind } from '@baic/sql-editor';
import { useQuery } from '~~hooks/';
import { PreviewApi, DataFlowApi, TableApi } from '~~apis/';
import { FUNCTIONS } from '~~constants/index';
// const { TextArea } = Input;
import * as Style from './style';
import './Customize.less';

const Customize = ({
  nodeData,
  data,
  setData,
  setSelectFinish,
  setFocusNode,
  sqlID,
  groupId,
  setSchemaLoading,
  setNodeChange,
  schemaLoading,
}) => {
  const [inputClick, setInputClick] = useState(false); // 避免input編輯時重畫
  const [inputChange, setInputChange] = useState(undefined); // 先把input正在改的存起來
  const [sql, setSql] = useState('');
  const [sqlLoading, setSqlLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sqlParserErrorMsg, setSqlParserErrorMsg] = useState('');
  const [hintData, setHintData] = useState([]);
  const options = {
    selectOnLineNumbers: true,
  };
  const previewSql = useQuery(PreviewApi.previewETL);
  const getOutputSchemaQuery = useQuery(DataFlowApi.getOutputSchema);

  const tempHintData = {
    // databases: [
    //   {
    //     content: 'bigdata',
    //     kind: Kind.Struct,
    //     tables: [
    //       {
    //         content: 'auth',
    //         fields: [
    //           {
    //             content: 'id',
    //             kind: Kind.Field,
    //           },
    //         ],
    //         kind: Kind.Folder,
    //       },
    //       {
    //         content: 'role',
    //         fields: [
    //           {
    //             content: 'id',
    //             kind: Kind.Field,
    //           },
    //         ],
    //         kind: Kind.Folder,
    //       },
    //     ],
    //   },
    // ],
    keywords: [
      {
        content: 'SELECT',
        kind: Kind.Keyword,
      },
      {
        content: 'from',
        kind: Kind.Keyword,
      },
    ],
  };

  const insertSQL = newValue => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const nodeArg = data.nodes[index].args;
      nodeArg.classification = 'Customize';
      nodeArg.sql = newValue;
      setSql(newValue);
      setInputChange({
        edges: [...data.edges],
        nodes: [...data.nodes],
      });
    }
  };

  const defaultSQL = () => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (data.nodes[index] !== undefined) {
      if (data.nodes[index].args.sql !== undefined) {
        return data.nodes[index].args.sql;
      }
      return '';
    }
    return '';
  };

  const getTableColumns = async tableName => {
    setLoading(true);
    try {
      const result = await TableApi.getAllowedTableColumns(tableName);
      // setTableInfo({
      //   tableName: result && result.table ? result.table.name : '',
      //   columns: result && result.table ? result.table.columns : [],
      //   lastUpdateTime: result && result.lastUpdateTime,
      // });
      const resColumnsName = result.table.columns.map(i => i.name);
      resColumnsName.map(e =>
        tempHintData.keywords.push({
          content: e,
          kind: Kind.Keyword,
        }),
      );
      setHintData(tempHintData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const outputSchemaApi = async (thisNode, parentSchema) => {
    setSchemaLoading(true);
    try {
      const sendData = {
        node: thisNode,
        parent: parentSchema,
      };

      const result = await getOutputSchemaQuery.exec(sendData);
      const schema = result.outputSchema.map(item => ({
        name: item.name,
        type: item.type,
      }));
      return schema;
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      setSchemaLoading(false);
    }
  };

  const getParentSource = thisId => {
    const getSource = data.edges.filter(e => e.target === thisId);
    const idAry = getSource.map(e => e.source);
    const getNode = data.nodes.filter(e => idAry.includes(e.id));
    return getNode;
  };

  const getNodebyId = nodeId => {
    const index = data.nodes.findIndex(e => e.id === nodeId);
    return data.nodes[index];
  };

  const handleSetVerify = async result => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (index !== -1) {
      const node = data.nodes[index];
      if (node.args.frontend === undefined) {
        node.args.frontend = {
          sqlVerify: result,
        };
      } else {
        node.args.frontend.sqlVerify = result;
      }
      if (result === true) {
        // call getSchema
        const parentList = getParentSource(nodeData.id);
        const parentsSchemaList = [];
        parentList.forEach(e => {
          parentsSchemaList.push(getNodebyId(e.id).schema);
        });
        const result = await outputSchemaApi(node, parentsSchemaList[0]);
        node.schema = result;

        // 狀態切換,verify OK
        if (node.check !== undefined) {
          node.check = undefined;
          setNodeChange(node);
        }
      }
    }
  };

  useEffect(() => {
    if (sql === '') {
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      if (index !== -1) {
        const nodeArg = data.nodes[index].args;
        nodeArg.classification = 'Customize';
        setInputClick(false);
        setInputChange({
          edges: [...data.edges],
          nodes: [...data.nodes],
        });
      }
    } else {
      setInputClick(true);
    }
  }, [sql]);

  useEffect(() => {
    if (inputClick === false && inputChange !== undefined) {
      // input change要存的
      setSelectFinish(false);
      setData(inputChange);

      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });

      setInputChange(undefined); // 判斷完清空
      handleSetVerify(false);
    }
  }, [inputClick]);

  useEffect(() => {
    const index = data.nodes.findIndex(e => e.id === nodeData.id);
    if (data.nodes[index] && data.nodes[index].args.sql) {
      setSql(data.nodes[index].args.sql);
    }
    const datasetNodes = data.nodes.filter(e => e.type === 'Dataset');
    datasetNodes.map(e =>
      tempHintData.keywords.push({
        content: e.args.table_name,
        kind: Kind.Keyword,
      }),
    );
    const tableNames = datasetNodes.map(e => e.args.table_name);
    setHintData(tempHintData);
    // getTargetSchema(sqlID);
    tableNames.map(i => getTableColumns(i));
  }, []);

  const handleVerify = async () => {
    // Ian要求暫時關掉前端sql Validate 直接call後端
    // const parser = new GenericSQL();
    // const errors = parser.validate(sql);

    // Ian要求暫時關掉前端sql Validate 直接call後端
    // if (errors.length > 0) {
    //   setSqlParserErrorMsg(errors);
    // } else {
    setSqlParserErrorMsg('');
    try {
      setSqlLoading(true);
      const response = await previewSql.exec({ sql, groupId });
      if (response.message !== undefined) {
        message.error(response.message);
      } else {
        message.success('SQL Verify Successful');
        handleSetVerify(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSqlLoading(false);
    }
    // }
  };

  const editorDidMount = editor => {
    editor.focus();
  };

  return (
    <Style.InsertScroll>
      <Spin spinning={sqlLoading || schemaLoading}>
        <Style.CustomizeWrapper>
          <p className="Customize">Code block</p>

          {/* <MonacoEditor
          // width="800"
          height="200"
          language="javascript"
          theme="vs-dark"
          onChange={insertSQL}
          defaultValue={defaultSQL()}
          onFocus={() => setInputClick(true)}
          onBlur={() => setInputClick(false)}
          value={sql}
          options={options}
          editorDidMount={editorDidMount}
        /> */}
          {nodeData.edit ? (
            <>
              <p>Enter a custom SQL script to add to your job.</p>
              <SqlEditor
                hintData={hintData}
                language="javascript"
                theme="vs-dark"
                onChange={insertSQL}
                defaultValue={defaultSQL()}
                onFocus={() => setInputClick(true)}
                onBlur={() => setInputClick(false)}
                value={sql}
                options={options}
                editorDidMount={editorDidMount}
              />
              <Button
                style={{ margin: '5px', float: 'right' }}
                type="primary"
                onClick={handleVerify}
                // loading={sqlLoading}
                // disabled={!nodeData.edit}
              >
                SQL Verify
                {/* {sqlCheck ? 'Verify Success' : 'SQL Verify'} */}
              </Button>
            </>
          ) : (
            <div
              style={{
                backgroundColor: 'rgb(22,22,22)',
                color: 'whitesmoke',
                padding: '12px 30px',
                height: 276,
                overflow: 'auto',
              }}
            >
              {defaultSQL()}
            </div>
          )}
        </Style.CustomizeWrapper>
        {sqlParserErrorMsg.length > 0 ? (
          <div
            style={{
              padding: '0 15px',
              color: 'red',
              height: '180px',
              overflow: 'auto',
              margin: '10px 0',
            }}
          >
            <div style={{ marginBottom: '9px' }}>Error Message :</div>
            {sqlParserErrorMsg.map(i => (
              <div
                style={{
                  maxHeight: '150px',
                  overflow: 'auto',
                  margin: '10px 0',
                }}
              >
                {i.message}
              </div>
            ))}
          </div>
        ) : null}
      </Spin>
    </Style.InsertScroll>
  );
};

export default Customize;
