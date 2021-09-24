/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Divider, List, Modal } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useQuery, useModal } from '~~hooks/';
import { ROLEPERMISSION } from '~~constants/index';
import { WorkFlowApi } from '~~apis/';
import './WorkflowETLListStyle.less';
import * as Style from './style';

const WorkflowETLList = ({ setCurr, curr, update, setCreateNewWork, edit }) => {
  const [searchText, setSearchText] = useState('');
  const getWorkFlowListQuery = useQuery(WorkFlowApi.getWorkFlowList);
  const resumeConfirmModal = useModal();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  useEffect(() => {
    getWorkFlowListQuery.exec();
  }, [update]);

  const handleResume = () => {
    setCreateNewWork(true);
    resumeConfirmModal.closeModal();
  };

  const handleCloseEditClick = async (seqId, newSeqId) => {
    if (seqId && seqId !== 'new') {
      try {
        if (edit) {
          await WorkFlowApi.cancelEditStatus(seqId);
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
    <div className="workflowEtlList">
      <Style.ListTitle>
        <Style.ListTitleBlock>
          <div style={{ marginBottom: 10 }}>Workflow List</div>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myFlows.workflow.create.value,
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
        loading={getWorkFlowListQuery.isLoading}
        dataSource={
          ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myFlows.workflow.pageView.value,
          )
            ? getWorkFlowListQuery.data.workflowJobs &&
              getWorkFlowListQuery.data.workflowJobs.filter(
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
            onClick={() => {
              handleCloseEditClick(curr, item.seqId);
            }}
            role="button"
            className={`listItem ${curr === item.seqId ? 'curr' : ''}`}
            tabIndex="0"
            title={item.projectName}
          >
            <p>{item.projectName}</p>
            <span>{item.groupName}</span>
          </div>
        )}
        locale={{
          emptyText: <div>You have no project. Please create one.</div>,
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
    </div>
  );
};

export default WorkflowETLList;
