/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, message } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DIAGRAM } from '~~constants/index';
import { ETLNodeFactory } from '~~components/ETLNode/ETLNodeFactory';
import { ETLNodeModel } from '~~components/ETLNode/ETLNodeModel';
import { TableNodeFactory } from '~~components/TableNode/TableNodeFactory';
import { TableNodeModel } from '~~components/TableNode/TableNodeModel';
import { OutputNodeFactory } from '~~components/OutputNode/OutputNodeFactory';
import { OutputNodeModel } from '~~components/OutputNode/OutputNodeModel';
import { OutputSettingNodeFactory } from '~~components/OutputSettingNode/OutputSettingNodeFactory';
import { OutputSettingNodeModel } from '~~components/OutputSettingNode/OutputSettingNodeModel';
import { LinkNodeFactory } from '~~components/LinkNode/LinkNodeFactory';
import { JoinNodeFactory } from '~~components/JoinNode/JoinNodeFactory';
import { JoinNodeModel } from '~~components/JoinNode/JoinNodeModel';
import { WhereNodeFactory } from '~~components/WhereNode/WhereNodeFactory';
import { WhereNodeModel } from '~~components/WhereNode/WhereNodeModel';
import { CalculateNodeFactory } from '~~components/CalculateNode/CalculateNodeFactory';
import { CalculateNodeModel } from '~~components/CalculateNode/CalculateNodeModel';
import { GroupNodeFactory } from '~~components/GroupNode/GroupNodeFactory';
import { GroupNodeModel } from '~~components/GroupNode/GroupNodeModel';
import { ETLPortFactory } from '~~components/ETLPort/ETLPortFactory';
import TrayItemWidget from '~~components/TrayItemWidget/TrayItemWidget';
import TrayItemGroupWidget from '~~components/TrayItemGroupWidget/TrayItemGroupWidget';
import {
  getAfterNodesFromLink,
  getAfterNodesFromNode,
} from '~~utils/sqlDiagramHelper';
import { DeleteItemsAction } from './actions/DeleteItemsAction';
import { SqlDiagramState } from './SqlDiagramState';
import './SqlDiagramStyle.less';

const engine = createEngine({
  registerDefaultZoomCanvasAction: false,
  registerDefaultDeleteItemsAction: false,
});
engine.getNodeFactories().registerFactory(new ETLNodeFactory());
engine.getNodeFactories().registerFactory(new TableNodeFactory());
engine.getNodeFactories().registerFactory(new OutputNodeFactory());
engine.getNodeFactories().registerFactory(new OutputSettingNodeFactory());
engine.getLinkFactories().registerFactory(new LinkNodeFactory());
engine.getNodeFactories().registerFactory(new JoinNodeFactory());
engine.getNodeFactories().registerFactory(new WhereNodeFactory());
engine.getNodeFactories().registerFactory(new CalculateNodeFactory());
engine.getNodeFactories().registerFactory(new GroupNodeFactory());
engine.getPortFactories().registerFactory(new ETLPortFactory());
engine.getActionEventBus().registerAction(new DeleteItemsAction());
engine.getStateMachine().pushState(new SqlDiagramState());

const MODEL_MAP = {
  TABLE: TableNodeModel,
  CONFIG: OutputSettingNodeModel,
  OUTPUT: OutputNodeModel,
  JoinNode: JoinNodeModel,
  WhereNode: WhereNodeModel,
  CalculateNode: CalculateNodeModel,
  GroupNode: GroupNodeModel,
};

const SqlDiagram = ({
  oEntity,
  getModel,
  deserialize,
  disabled,
  reset,
  deserializeEdit,
  groupId,
}) => {
  const [model, setModel] = useState(new DiagramModel());
  const [zoomLevel, setZoomLevel] = useState();
  const [tableNodes, setTableNodes] = useState([]);
  const [deserTables, setDerserTables] = useState([]);
  engine.setModel(model);
  model.setLocked(disabled);

  const handleNodesUpdated = e => {
    const currTableNodes = model
      .getNodes()
      .filter(node => node.getOptions().key === 'TABLE')
      .map(node => node.getOptions().name);
    setTableNodes(currTableNodes);
    // 刪除node將此node之後的node資料清除
    if (e && !e.isCreated) {
      const nodes = getAfterNodesFromNode(e.node);
      nodes.forEach(node => node && node.cleanNode && node.cleanNode());
    }
  };

  const handleLinksUpdated = e => {
    // 刪除線將線後的node資料清除
    if (!e.isCreated) {
      const nodes = getAfterNodesFromLink(e.link);
      nodes.forEach(node => node && node.cleanNode && node.cleanNode());
    }
  };

  const refresh = () => {
    engine.setModel(model);
  };

  useEffect(() => {
    getModel(model);
    setZoomLevel(model.getZoomLevel());
  }, []);

  useEffect(() => {
    getModel(model);
  }, [model]);

  const addLink = (port1, port2) => {
    const link = port1.link(port2);
    // 解決新增的NODE線會亂飄的問題
    port1.reportPosition();
    port2.reportPosition();
    model.addAll(link);
  };

  const add = (data = {}, nodeModel = ETLNodeModel) => {
    const node = new nodeModel({ ...data });
    if (node.options.type === 'OutputSettingNode') {
      node.setGroupId(groupId);
    }
    const initPosition = node.options.customized
      ? [
          data.initPosition[0] + Math.floor(Math.random() * 50),
          data.initPosition[1] + Math.floor(Math.random() * 50),
        ]
      : data.initPosition;
    node.setPosition(...(initPosition || []));
    (data.portAction || []).forEach(action => node[action](action));
    model.addAll(node);
    if (data.initLink) {
      const linkNode = model
        .getNodes()
        .find(no => no.getOptions().type === data.initLink);
      if (linkNode) {
        const port1 = node.getPort('addOutPort');
        const port2 = linkNode.getPort('addInPort');
        addLink(port1, port2);
      }
    }
    return node;
  };

  const addNode = (data = {}, nodeModel) =>
    add(data, nodeModel || MODEL_MAP[data.key]);

  useEffect(() => {
    model.registerListener({
      nodesUpdated: handleNodesUpdated,
      linksUpdated: handleLinksUpdated,
    });
    if (deserialize) {
      try {
        const deObj = JSON.parse(deserialize);
        model.deserializeModel(deObj, engine);
        // 紀錄原本的table供使用者還原
        const tableList = model
          .getNodes()
          .filter(node => node.getOptions().key === 'TABLE')
          .map(node => node.getTable());
        setDerserTables(tableList);
        handleNodesUpdated();
        // 分享模式下entity name可編輯，編輯模式下entity name不可編輯
        model
          .getNodes()
          .filter(node => node.getOptions().type === 'OutputSettingNode')
          .forEach(node => {
            node.setEditMode(deserializeEdit);
            node.setGroupId(groupId);
          });
        // 分享模式下customized db連線資訊全部重填
        (
          model
            .getNodes()
            .find(node => node.getOptions().type === 'OutputNode') || {}
        ).setEditMode(deserializeEdit);
      } catch (e) {
        message.error('Deserialize failed');
      }
    } else {
      // 初始化三個OUTPUT(HIVE/DB/CDM)
      Object.values(DIAGRAM.NODE.OUTPUT.list).forEach(output =>
        addNode(
          {
            ...output,
            portAction: DIAGRAM.NODE.OUTPUT.portAction,
            color: DIAGRAM.NODE.OUTPUT.color,
          },
          OutputNodeModel,
        ),
      );
      // 將選擇的table與config圖形化
      if (oEntity.length) {
        oEntity.forEach((col, idx) => {
          // table
          const tableNode = addNode(
            {
              ...DIAGRAM.NODE.DATASET.list.TABLE,
              color: DIAGRAM.NODE.DATASET.color,
              portAction: DIAGRAM.NODE.DATASET.portAction,
              initPosition: [
                DIAGRAM.NODE.DATASET.list.TABLE.initPosition[0],
                DIAGRAM.NODE.DATASET.list.TABLE.initPosition[1] * (idx + 1),
              ],
              name: col.name,
              payload: col,
            },
            TableNodeModel,
          );
          // config
          const configNode = addNode(
            {
              ...DIAGRAM.NODE.SETTING.list.CONFIG,
              color: DIAGRAM.NODE.SETTING.color,
              portAction: DIAGRAM.NODE.SETTING.portAction,
              initPosition: [
                DIAGRAM.NODE.SETTING.list.CONFIG.initPosition[0],
                DIAGRAM.NODE.SETTING.list.CONFIG.initPosition[1] * (idx + 1),
              ],
              groupId,
            },
            OutputSettingNodeModel,
          );
          addLink(
            tableNode.getPort('addOutPort'),
            configNode.getPort('addInPort'),
          );
        });
      }
    }
    refresh();
  }, [model, deserialize, oEntity]);

  useEffect(() => {
    model.setLocked(disabled);
    refresh();
  }, [disabled]);

  useEffect(() => {
    setModel(new DiagramModel());
  }, [reset]);

  const zoomIn = () => {
    const nextLevel = zoomLevel + 10;
    model.setZoomLevel(nextLevel);
    setZoomLevel(nextLevel);
    refresh();
  };

  const zoomOut = () => {
    const nextLevel = zoomLevel - 10;
    model.setZoomLevel(nextLevel);
    setZoomLevel(nextLevel);
    refresh();
  };

  const renderTrayItemList = () => {
    const tableList = deserialize ? deserTables : oEntity;
    return (
      <>
        <TrayItemGroupWidget title="Function">
          {Object.values(DIAGRAM.NODE.FUNCTION.list).map(node => (
            <TrayItemWidget key={node.name} model={{ ...node }} />
          ))}
        </TrayItemGroupWidget>
        <TrayItemGroupWidget title="Table">
          {tableList
            .filter(col => !tableNodes.includes(col.name))
            .map(col => (
              <TrayItemWidget
                key={col.name}
                model={{
                  ...DIAGRAM.NODE.DATASET.list.TABLE,
                  name: col.name,
                }}
              />
            ))}
        </TrayItemGroupWidget>
        <TrayItemGroupWidget title="Extra">
          <TrayItemWidget model={{ ...DIAGRAM.NODE.DATASET.list.CUSTOMIZED }} />
          <TrayItemWidget model={{ ...DIAGRAM.NODE.SETTING.list.CONFIG }} />
        </TrayItemGroupWidget>
      </>
    );
  };

  const handleDrop = event => {
    const tableList = deserialize ? deserTables : oEntity;
    const data = JSON.parse(event.dataTransfer.getData('diagram-node'));
    let newData = { ...data };

    if (data.key === 'TABLE') {
      const col = tableList.find(co => co.name === newData.name);
      if (col) {
        newData = { ...newData, payload: col };
      }
    }
    const point = engine.getRelativeMousePoint(event);
    addNode({ ...newData, initPosition: [point.x, point.y] });
    refresh();
  };

  return (
    <div className={`sqldiagram ${disabled ? 'disabled' : ''}`}>
      <div className="tray">{renderTrayItemList()}</div>
      <div
        className="layer"
        onDrop={handleDrop}
        onDragOver={event => {
          event.preventDefault();
        }}
      >
        <div className="buttonTools">
          <Tooltip title="Zoom In">
            <Button
              icon={<ZoomInOutlined />}
              type="text"
              onClick={zoomIn}
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Zoom Out">
            <Button
              icon={<ZoomOutOutlined />}
              type="text"
              onClick={zoomOut}
              shape="circle"
            />
          </Tooltip>
        </div>
        <CanvasWidget engine={engine} />
      </div>
    </div>
  );
};

SqlDiagram.propTypes = {
  oEntity: PropTypes.arrayOf(PropTypes.shape({})),
  getModel: PropTypes.func,
  deserialize: PropTypes.string,
  disabled: PropTypes.bool,
  reset: PropTypes.number,
  deserializeEdit: PropTypes.bool,
  groupId: PropTypes.number,
};

SqlDiagram.defaultProps = {
  oEntity: [],
  getModel: () => null,
  deserialize: undefined,
  disabled: false,
  reset: undefined,
  deserializeEdit: true, // deserialize有值時:編輯true,分享false
  groupId: 0,
};

export default SqlDiagram;
