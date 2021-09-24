/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Select, Button, Input } from 'antd';
import Highlighter from 'react-highlight-words';
import { PREVIEW_STATUS, GROUP_TYPE, ROLEPERMISSION } from '~~constants/index';
// import { useModal } from '~~hooks/';
import { useQuery } from '~~hooks/';
import { UserApi, OutputDataApi } from '~~apis/';
import * as Style from './style';

const { Option } = Select;

// const defaultPagination = {
//   current: 1,
//   pageSize: 10,
//   total: 0,
// };

const ExcelTable = ({ user }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isGroupOwner, setIsGroupOwner] = useState(true); // check group owner by select
  const [groupList, setGroupList] = useState([]);
  const [project, setProject] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [orginTableList, setOrginTableList] = useState([]);
  const [tableList, setTableList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  // const [pagination, setPagination] = useState(defaultPagination);
  const [selectedKeys, setSelectedKeys] = useState('');
  // const [status, setStatus] = useState(false);
  const getGroupsQuery = useQuery(UserApi.getGroups);
  const { Search } = Input;
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));
  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const onSearch = () => {
    setSelectedKeys(keyword);
    setTableList(
      orginTableList.filter(item =>
        item.fileName.toLowerCase().includes(keyword.toLocaleLowerCase()),
      ),
    );
  };

  const compareString = (a, b) => {
    // 使用 toUpperCase() 忽略字元大小寫
    const bandA = a.fileName.toUpperCase();
    const bandB = b.fileName.toUpperCase();

    let comparison = 0;
    if (bandA > bandB) {
      comparison = -1;
    } else if (bandA < bandB) {
      comparison = 1;
    }
    return comparison;
  };

  const getDataSetList = async value => {
    try {
      setLoading(true);
      const payload = {
        groupId: selectedGroup,
        workflowSeqId: value,
      };

      const result = await OutputDataApi.getFileList(payload);
      setTableList(result.sort(compareString));
      setOrginTableList(result.sort(compareString));
      // setPagination({
      //   ...pagination,
      //   total: result.pageInfo.total,
      //   current: page || pagination.current,
      // });
    } catch (e) {
      console.log(e);
    } finally {
      // setChangeList([]);
      setLoading(false);
    }
  };

  const downloadFile = async fileName => {
    try {
      setLoading(true);
      const payload = {
        groupId: selectedGroup,
        workflowSeqId: project,
        fileName,
      };

      const result = await OutputDataApi.downloadExcelFile(payload);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = result;
      link.click();
    } catch (e) {
      console.log(e);
    } finally {
      // setChangeList([]);
      setLoading(false);
    }
  };

  const deleteFile = async fileName => {
    try {
      setLoading(true);
      const payload = {
        groupId: selectedGroup,
        workflowSeqId: project,
        fileName,
      };

      await OutputDataApi.deleteExcelFile(payload);

      getDataSetList(project);
    } catch (e) {
      console.log(e);
    } finally {
      // setChangeList([]);
      setLoading(false);
    }
  };

  const getColumnSearchProps = () => ({
    render: text => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[selectedKeys]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    ),
  });

  const columns = (downloadFile, deleteFile) => [
    {
      title: 'Excel Files',
      dataIndex: 'fileName',
      width: '70%',
      render: value => <>{value}</>,
      ...getColumnSearchProps('fileName'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: '30%',
      render: (value, record) => (
        <>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myOutput.download.value,
          ) ? (
            <Button
              type="primary"
              shape="circle"
              style={{
                marginRight: 10,
              }}
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record.fileName)}
            />
          ) : null}
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.myOutput.delete.value,
          ) ? (
            <Button
              style={{
                background: 'tomato',
                color: 'white',
                border: 'none',
              }}
              disabled={!isGroupOwner}
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => deleteFile(record.fileName)}
            />
          ) : null}
        </>
      ),
    },
  ];

  const getWorkflow = async groupId => {
    try {
      const result = await OutputDataApi.getWorkflowList(groupId);

      setProjectList(result);
    } catch (e) {
      console.log(e);
    }
  };

  const getGroups = async () => {
    try {
      const result = await getGroupsQuery.exec({
        page: 1,
        pageSize: 9999,
        status: PREVIEW_STATUS.ALLOWED.value,
      });

      setGroupList(result.groupListData);
      const selfDefaultGroup = result.groupListData.find(
        group =>
          group.groupType === GROUP_TYPE.DEFAULT &&
          group.owner.toLowerCase() === user.emplId.toLowerCase(),
      );
      if (selfDefaultGroup && !selectedGroup) {
        setSelectedGroup(selfDefaultGroup.groupId);
        getWorkflow(selfDefaultGroup.groupId);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const initial = () => {
    setKeyword('');
    setSelectedKeys('');
    setTableList([]);
    setOrginTableList([]);
  };

  const onChangeGroup = (value, option) => {
    setIsGroupOwner(option.owner && option.owner === user.emplId.toLowerCase());
    setSelectedGroup(value);
    setProject('');
    initial();
    getWorkflow(value);
  };

  const onChangeProject = value => {
    setProject(value);
    initial();
    getDataSetList(value);
  };

  // const onChangePage = page => {
  //   setPagination({
  //     ...pagination,
  //     current: page,
  //   });
  //   getDataSetList(page);
  // };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <Style.Container>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            marginRight: 10,
            width: 70,
          }}
        >
          Group:{' '}
        </span>
        <Select
          showSearch
          value={selectedGroup}
          style={{ marginRight: 10, width: 200 }}
          placeholder="Select a group"
          optionFilterProp="children"
          onChange={onChangeGroup}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={groupList.length === 0}
        >
          {groupList.map(group => (
            <Option value={group.groupId} owner={group.owner}>
              {group.groupName}
            </Option>
          ))}
        </Select>
        <span
          style={{
            marginRight: 10,
            width: 70,
          }}
        >
          Workflow:{' '}
        </span>
        <Select
          showSearch
          value={project}
          style={{ marginRight: 10, width: 200 }}
          placeholder="Select a workflow"
          optionFilterProp="children"
          onChange={onChangeProject}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={projectList.length === 0}
        >
          {projectList.map(workflow => (
            <Option value={workflow.workflowSeqId}>
              {workflow.workflowProjectName}
            </Option>
          ))}
        </Select>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            marginRight: 10,
            width: 70,
          }}
        >
          Keyword:{' '}
        </span>
        <Search
          placeholder="input search text"
          onSearch={onSearch}
          value={keyword}
          style={{
            marginRight: 10,
            width: 200,
          }}
          onChange={onChangeInput}
        />
      </div>

      <Style.DataSetTable
        columns={columns(downloadFile, deleteFile)}
        dataSource={loading ? [] : tableList}
        pagination={{
          // current: pagination.current,
          // total: pagination.total,
          pageSize: 10,
          // onChange: onChangePage,
        }}
        showSizeChanger={false}
        rowKey="guid"
        loading={loading}
      />
    </Style.Container>
  );
};

ExcelTable.propTypes = {};

ExcelTable.defaultProps = {};

export default ExcelTable;
