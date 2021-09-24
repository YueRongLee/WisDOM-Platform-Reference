/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, Divider } from 'antd';
import { useQuery } from '~~hooks';
import { ETLApi } from '~~apis';
import './ETLListStyle.less';

const ETLList = ({ curr, setCurr, update, updateShare, setShareCurr }) => {
  const getETLListQuery = useQuery(ETLApi.getETLList);
  const getShareETLListQuery = useQuery(ETLApi.getShareETLList);

  useEffect(() => {
    getETLListQuery.exec();
    getShareETLListQuery.exec();
  }, []);

  useEffect(() => {
    // 某個ETL被刪除或更新後ETL LIST重新整理
    getETLListQuery.exec();
  }, [update]);

  useEffect(() => {
    getShareETLListQuery.exec();
  }, [updateShare]);

  return (
    <div className="etlList">
      <div className="listTitle">
        ETL List
        <Divider />
      </div>
      <List
        loading={getETLListQuery.isLoading}
        dataSource={getETLListQuery.data.etlJobs}
        renderItem={item => (
          <div
            key={item.seqId}
            title={item.projectName}
            className={`listItem ${curr === item.seqId ? 'curr' : ''}`}
            onClick={() => {
              setCurr(item.seqId);
            }}
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
      <div className="listTitle" style={{ paddingTop: '30px' }}>
        Share With Me
        <Divider />
      </div>
      <List
        loading={getShareETLListQuery.isLoading}
        dataSource={getShareETLListQuery.data.etlShareJobs}
        renderItem={item => (
          <div
            key={item.id}
            onClick={() => {
              setShareCurr(item.id);
            }}
            className={`listItem ${curr === item.id ? 'curr' : ''}`}
            role="button"
            tabIndex="0"
          >
            {item.projectName}
          </div>
        )}
        locale={{
          emptyText: <div>You have no shared project.</div>,
        }}
      />
    </div>
  );
};

ETLList.propTypes = {
  curr: PropTypes.number,
  setCurr: PropTypes.func,
  update: PropTypes.number,
  updateShare: PropTypes.number,
  setShareCurr: PropTypes.func,
};

ETLList.defaultProps = {
  curr: undefined,
  setCurr: () => null,
  update: undefined,
  updateShare: undefined,
  setShareCurr: () => null,
};

export default ETLList;
