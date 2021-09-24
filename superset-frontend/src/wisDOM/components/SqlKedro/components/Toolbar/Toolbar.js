/* eslint-disable no-restricted-imports */
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
import './ToolbarStyle.css';

// const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

const Toolbar = ({
  //   orgData,
  data,
  setData,
  zoomSize,
  setZoomSize,
  selectNode,
  setFocusNode,
  focusNode,
  setSelectFinish,
  selectPage,
  setResetShowData,
  setMenuLoading,
  historyMode,
  handleResume,
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
            // schema,
            schema: null,
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
            // schema,
            schema: null,
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
            schema: null,
            args: {
              name: 'new_Node',
              type: 'empty',
            },
          },
        ],
      });
    }
  };

  const handleDelete = () => {
    // const deleteID = data.edges.length!==0?data.edges[data.edges.length - 1].target:"";
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

  const handleZoomIn = () => {
    const size = (zoomSize * 10 + 1 * 10) / 10;
    setZoomSize(size);
  };

  const handleZoomOut = () => {
    const size = (zoomSize * 10 - 1 * 10) / 10;
    setZoomSize(size);
  };

  const handResume = () => {
    setMenuLoading(true);
    setSelectFinish(false);
    if (!historyMode) {
      //   setData(orgData);
      setResetShowData(true);
    } else {
      handleResume();
    }
    resumeConfirmModal.closeModal();
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
        disabled={
          (selectPage === 'target' && selectNode !== null) ||
          (selectPage === 'target' && focusNode !== undefined)
        }
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
        disabled={
          (focusNode === undefined && selectNode === undefined) ||
          (focusNode === undefined && selectNode === null) ||
          (data && data.nodes.length <= 1)
        }
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
