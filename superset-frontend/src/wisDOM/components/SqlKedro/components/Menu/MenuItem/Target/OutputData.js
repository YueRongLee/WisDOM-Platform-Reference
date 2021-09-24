/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { DataFlowApi } from '~~apis/';
import { useModal } from '~~hooks/';
import LoadingModal from '../../../../../../../components/LoadingModal/LoadingModal';
import '../Menu.less';

const OutputData = ({
  nodeData,
  sqlID,
  projectName,
  groupId,
  diagram,
  schedule,
  focusNode,
}) => {
  const [getData, setGetData] = useState('');
  // const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  // const previewData = useQuery(DataFlowApi.preview);
  const loadingModal = useModal();

  const handleColumn = () => {
    //   const handleColumn = data => {
    // let maxLength = 0;
    // let tmpIdx = 0;
    // data.forEach((element, idx) => {
    //   if (Object.keys(element).length > maxLength) {
    //     tmpIdx = idx;
    //     maxLength = Object.keys(element).length;
    //   }
    // });
    // const getColumnAry = Object.keys(data[tmpIdx]);

    const getschema =
      diagram.nodes.filter(e => e.id === nodeData.id) &&
      diagram.nodes.filter(e => e.id === nodeData.id)[0]?.schema;

    const getColumnAry = getschema.map(e => e.name);

    const colList = getColumnAry.map(sub => ({
      title: sub,
      dataIndex: sub,
      key: sub,
      width: 150,
      render: value =>
        value !== undefined && value !== null && value.toString
          ? value.toString()
          : value,
    }));

    setColumns(colList);
  };

  const handlePreview = async () => {
    const data = {
      dataflow: {
        projectName,
        groupId,
        diagram,
        schedule,
      },
      targetId: nodeData.id || focusNode.id,
    };
    loadingModal.openModal();
    try {
      const response = await DataFlowApi.getImmediateResult(data);
      setGetData(response);
      //   handleColumn(response);
      handleColumn();
    } catch (e) {
      console.log('e', e);
    } finally {
      loadingModal.closeModal();
    }
  };

  const cancelModal = () => {
    loadingModal.closeModal();
  };

  // const handleGetData = async () => {
  //   if (
  //     sqlID !== undefined &&
  //     sqlID !== '' &&
  //     nodeData.id !== null &&
  //     nodeData.type === 'Target'
  //   ) {
  //     const sendData = {
  //       seqId: sqlID,
  //       targetId: nodeData.id,
  //     };
  //     setLoading(true);
  //     try {
  //       const result = await previewData.exec(sendData); // save之後拿到 seqID 之後才能執行run按鈕
  //       setGetData(result);
  //       handleColumn(result);
  //     } catch (e) {
  //       console.log(e);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  const getWidth = () => columns.length * 150;

  useEffect(() => {
    // if (nodeData.edit) { //未編輯也可以看
    // handleGetData();
    handlePreview();
    // }
  }, [nodeData, focusNode, sqlID]);

  return (
    <div className="target-outputdata-wrapper">
      <Table
        columns={columns}
        dataSource={getData}
        pagination={false}
        rowKey="guid"
        // loading={loading}
        scroll={{ x: getWidth(), y: '40vh' }}
      />
      <LoadingModal modal={loadingModal} onCancelLoadingModal={cancelModal} />
    </div>
  );
};

export default OutputData;
