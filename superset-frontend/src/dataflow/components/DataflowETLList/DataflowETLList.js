/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { List, Divider, Modal } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useQuery, useModal } from '~~hooks/';
import { ROLEPERMISSION } from '~~constants/index';
import { DataFlowApi } from '~~apis/';
import './DataflowETLListStyle.less';
import * as Style from './style';

// const { Search } = Input;

const DataflowETLList = ({ curr, setCurr, update, edit }) => {
  // const [curr, setCurr] = useState();
  const [searchText, setSearchText] = useState('');
  const resumeConfirmModal = useModal();

  const getDataFlowListQuery = useQuery(DataFlowApi.getDataFlowList);
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  useEffect(() => {
    getDataFlowListQuery.exec();
  }, []);

  useEffect(() => {
    getDataFlowListQuery.exec();
  }, [update]);

  const handleResume = () => {
    resumeConfirmModal.closeModal();
  };

  const handleCloseEditClick = async (seqId, newSeqId) => {
    if (seqId && seqId !== 'new') {
      try {
        if (edit) {
          await DataFlowApi.cancelEditStatus(seqId);
        }
        setCurr(newSeqId);
      } catch (e) {
        console.log(e);
      }
    } else {
      setCurr(newSeqId);
    }
  };

  const onSearch = value => setSearchText(value);

  return (
    <Style.DataflowEtlList>
      <Style.ListTitle>
        {/* <div style={{ marginBottom: 10 }}>Dataflow List</div> */}
        <Style.ListTitleBlock>
          <div style={{ marginBottom: 10 }}>Dataflow List</div>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myFlows.dataflow.create.value,
          ) === true ? (
            <PlusCircleOutlined
              onClick={() => {
                setCurr('new');
                if (curr === 'new') {
                  resumeConfirmModal.openModal();
                }
              }}
              style={{ fontSize: 18 }}
            />
          ) : (
            <PlusCircleOutlined style={{ fontSize: 18 }} />
          )}
        </Style.ListTitleBlock>
        <Style.SearchBlock
          placeholder="input search text"
          onSearch={onSearch}
        />
        <Divider />
      </Style.ListTitle>
      <List
        loading={getDataFlowListQuery.isLoading}
        dataSource={
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myFlows.dataflow.pageView.value,
          )
            ? getDataFlowListQuery.data.dataflowJobs &&
              getDataFlowListQuery.data.dataflowJobs.filter(
                item =>
                  item.projectName
                    .toLowerCase()
                    .indexOf(searchText.toLowerCase()) > -1,
              )
            : []
        }
        renderItem={item => (
          <div
            key={item.seqId}
            title={item.projectName}
            onClick={() => {
              // setCurr(item.seqId);
              handleCloseEditClick(curr, item.seqId);
            }}
            className={`listItem ${curr === item.seqId ? 'curr' : ''}`}
            role="button"
            tabIndex="0"
          >
            <p>{item.projectName}</p>
            <span>{item.groupName}</span>
          </div>
        )}
        locale={{
          emptyText: (
            <div>
              You have no project. Please{' '}
              <a href="/pipeline/create">Click Here</a> to create one.
            </div>
          ),
        }}
      />
      <Modal
        title="Confirm Resume"
        visible={resumeConfirmModal.visible}
        onOk={handleResume}
        onCancel={resumeConfirmModal.closeModal}
      >
        <p>The data will missing , Are you sure you want to create new one?</p>
      </Modal>
    </Style.DataflowEtlList>
  );
};

DataflowETLList.propTypes = {};

DataflowETLList.defaultProps = {};

export default DataflowETLList;
