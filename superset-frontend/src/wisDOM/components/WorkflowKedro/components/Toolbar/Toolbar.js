/* eslint-disable no-restricted-imports */
/* eslint-disable no-debugger */
import React from 'react';
import { Button, Modal } from 'antd';
import moment from 'moment';
import {
  PlusOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CloseOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useModal } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import './ToolbarStyle.css';

// const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const Toolbar = ({
  nodeClickStatus,
  orgData,
  data,
  setData,
  zoomSize,
  setZoomSize,
  selectNode,
  setFocusNode,
  focusNode,
  setSelectFinish,
  setResetShowData,
}) => {
  const resumeConfirmModal = useModal();

  const handleAdd = () => {
    // const newID = getRandomInt(1000000).toString();
    setSelectFinish(false);
    // const typeFilter = data.nodes.filter(e => e.type === 'Empty');
    // const typeCount = Object.values(typeFilter).length;
    // const str =
    //   typeCount === 0
    //     ? ''
    //     : String(Object.values(typeFilter)[typeCount - 1].id);
    // const number =
    //   typeCount === 0 ? 1 : parseInt(str.substring(5, str.length), 10) + 1;
    // const newID = `Empty${number}`;
    const newID = `Empty${moment().format('x')}`;

    if (selectNode !== undefined && selectNode !== null) {
      const newEdge = {
        source: selectNode,
        target: newID,
      };

      setData({
        edges: [...data.edges, newEdge],
        nodes: [
          ...data.nodes,
          {
            full_name: 'new_Node',
            name: 'New_Node',
            id: newID,
            type: 'Empty',
            args: {
              name: 'new_Node',
              type: 'empty',
            },
          },
        ],
      });

      setFocusNode({
        full_name: 'new_Node',
        name: 'New_Node',
        id: newID,
        type: 'Empty',
      });
    } else if (focusNode !== undefined) {
      const newEdge = {
        source: focusNode.id,
        target: newID,
      };

      setData({
        edges: [...data.edges, newEdge],
        nodes: [
          ...data.nodes,
          {
            full_name: 'new_Node',
            name: 'New_Node',
            id: newID,
            type: 'Empty',
            args: {
              name: 'new_Node',
              type: 'empty',
            },
          },
        ],
      });

      setFocusNode({
        full_name: 'new_Node',
        name: 'New_Node',
        id: newID,
        type: 'Empty',
      });
    } else {
      setData({
        edges: [...data.edges],
        nodes: [
          ...data.nodes,
          {
            full_name: 'new_Node',
            name: 'New_Node',
            id: newID,
            type: 'Empty',
            args: {
              name: 'new_Node',
              type: 'empty',
            },
          },
        ],
      });
    }
  };

  const normalDelete = () => {
    const deleteID =
      selectNode !== undefined && selectNode !== null
        ? selectNode
        : focusNode.id;
    const newEdge = data.edges.filter(
      e => e.target !== deleteID && e.source !== deleteID,
    );
    setData({
      edges: newEdge,
      nodes: data.nodes.filter(e => e.id !== deleteID),
    });

    setFocusNode(undefined); // focus的刪除只能刪一次
  };
  // 找出 condition 下的子節點
  const findChildNode = (length, list) => {
    const tempList = [];
    data.edges.forEach(edge => {
      list.forEach(node => {
        if (node === edge.source) {
          tempList.push(edge.source);
          tempList.push(edge.target);
        }
      });
    });
    const newList = tempList.filter(
      (element, index, arr) => arr.indexOf(element) === index,
    );
    if (length === newList.length) {
      return list;
    }
    return findChildNode(newList.length, newList);
  };

  const conditionDelete = async node => {
    const list = [node[0].id, node[0].args.ifyes, node[0].args.ifno];
    const childList = findChildNode(list.length, list);
    let tempEdges = data.edges;
    let tempNodes = data.nodes;
    const result = await Promise.all(
      childList.map(async deleteID => {
        const newEdge = tempEdges.filter(
          e => e.target !== deleteID && e.source !== deleteID,
        );
        const newNode = tempNodes.filter(e => e.id !== deleteID);
        tempEdges = newEdge;
        tempNodes = newNode;
        return { newEdge: tempEdges, nodes: tempNodes };
      }),
    );
    setData({
      edges: result[result.length - 1].newEdge,
      nodes: result[result.length - 1].nodes,
    });

    setFocusNode(undefined); // focus的刪除只能刪一次
  };

  const handleDelete = () => {
    // const deleteID = data.edges.length!==0?data.edges[data.edges.length - 1].target:"";
    if (focusNode) {
      if (focusNode.type === 'Action') {
        const findNode = FUNCTIONS.GET_NODE_DETAIL(data, focusNode.id);
        if (
          findNode[0].args &&
          findNode[0].args.classification === 'condition'
        ) {
          conditionDelete(findNode);
        }
        normalDelete();
      }
      normalDelete();
    }
  };

  const handleZoomIn = () => {
    const size = (zoomSize * 10 + 1 * 10) / 10;
    setZoomSize(size);
  };

  const handleZoomOut = () => {
    const size = (zoomSize * 10 - 1 * 10) / 10;
    setZoomSize(size);
  };

  const handResume = () => {
    setSelectFinish(false);
    setResetShowData(true);
    setData(orgData);
    resumeConfirmModal.closeModal();
  };

  const disableAddConditionNode = node => {
    if (node) {
      if (node.type === 'Action') {
        const findNode = FUNCTIONS.GET_NODE_DETAIL(data, node.id);
        if (findNode.length > 0) {
          if (findNode[0].args) {
            return findNode[0].args.classification === 'condition';
          }
          return false;
        }
        return false;
      }
      return false;
    }

    return false;
  };

  const disableSelectNode = nodeId => {
    if (nodeId) {
      if (nodeId.indexOf('Trigger') > -1) {
        return true;
      }
      return false;
    }
    return false;
  };

  const disableFocusNode = node => {
    if (node) {
      if (node.id.indexOf('Trigger') > -1) {
        return true;
      }
      if (node.type === 'YES' || node.type === 'NO') {
        return true;
      }
      return false;
    }
    return true;
  };

  return (
    <>
      <Button
        className="bar-btn"
        type="text"
        shape="circle"
        title="Zoom In"
        onClick={() => handleZoomIn()}
      >
        <ZoomInOutlined />
      </Button>
      <Button
        className="bar-btn"
        type="text"
        shape="circle"
        title="Zoom Out"
        onClick={() => handleZoomOut()}
      >
        <ZoomOutOutlined />
      </Button>
      <Button
        data-test="resume"
        className="bar-btn"
        type="text"
        shape="circle"
        title="Resume"
        // onClick={() => handResume()}
        onClick={resumeConfirmModal.openModal}
      >
        <UndoOutlined />
      </Button>
      <Button
        data-test="addNode"
        className="bar-btn-add"
        type="text"
        shape="circle"
        title="Add Node"
        onClick={() => handleAdd()}
        disabled={!nodeClickStatus || disableAddConditionNode(focusNode)}
      >
        <PlusOutlined />
      </Button>
      <Button
        data-test="deleteNode"
        className="bar-btn-delete"
        type="text"
        shape="circle"
        title="Delete Node"
        onClick={() => handleDelete()}
        disabled={disableFocusNode(focusNode) || disableSelectNode(selectNode)}
      >
        <CloseOutlined />
      </Button>
      <Modal
        title="Confirm Resume"
        visible={resumeConfirmModal.visible}
        onOk={handResume}
        onCancel={resumeConfirmModal.closeModal}
      >
        <p>The data will missing , Are you sure you want to resume?</p>
      </Modal>
    </>
  );
};

export default Toolbar;
