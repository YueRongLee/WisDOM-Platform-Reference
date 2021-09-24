/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { UserOutlined, FileDoneOutlined } from '@ant-design/icons';
import { DATE_TYPE } from '~~constants/index';
import * as Style from './style';

const ExpandInformation = ({ record }) => {
  const columns = [
    {
      title: 'Step Name',
      dataIndex: 'type',
      key: 'type',
      width: '22%',
    },
    {
      title: 'Approver',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: '20%',
    },
    {
      title: 'Action',
      dataIndex: 'approve',
      key: 'approve',
      width: '15%',
      render: (value, record) => {
        if (record.actionTime === '') {
          return '';
        }
        if (value) {
          return 'Approve';
        }
        return 'Reject';
      },
    },
    {
      title: 'Action Time',
      dataIndex: 'actionTime',
      key: 'actionTime',
      width: '20%',
      render: value => (value ? moment(value).format(DATE_TYPE.DATE_TIME) : ''),
    },
    {
      title: 'Comments',
      dataIndex: 'comment',
      key: 'comment',
      width: '23%',
    },
  ];

  const columnFilter = [
    {
      title: 'Column Name',
      dataIndex: 'columnName',
      key: 'columnName',
      width: '70%',
      render: (value, record) => (
        <div>{`${record.columnName}(${record.columnType})`}</div>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: '30%',
    },
  ];

  return (
    <Style.ExpandContainer>
      {/* left block */}
      <Style.InformationContainer>
        <Style.TitleContainer>
          <UserOutlined
            style={{
              fontSize: 18,
              marginRight: 10,
            }}
          />
          <span>Application Information</span>
        </Style.TitleContainer>
        <Style.InformationBlock>
          <Style.InformationItem>
            <Style.InformationTitle>Applicant</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.applicant}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Applicant Time</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.applyTime &&
                moment(record.userApplyRecordDetail.applyTime).format(
                  DATE_TYPE.DATE_TIME,
                )}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>End Date</Style.InformationTitle>:
            <Style.InformationText>
              {record.endDate && moment(record.endDate).format(DATE_TYPE.DATE)}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Group</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.group}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Department Name</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.departmentName}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Project</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.project}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Reason</Style.InformationTitle>:
            <Style.InformationText>
              {record.userApplyRecordDetail.reason}
            </Style.InformationText>
          </Style.InformationItem>
          <Style.InformationItem>
            <Style.InformationTitle>Column Condition</Style.InformationTitle>:
            <Style.InformationFilter>
              {record.userApplyRecordDetail.columnFilter.length > 0 && (
                <Table
                  columns={columnFilter}
                  dataSource={record.userApplyRecordDetail.columnFilter}
                  size="middle"
                />
              )}
            </Style.InformationFilter>
          </Style.InformationItem>
        </Style.InformationBlock>
      </Style.InformationContainer>
      {/* right block */}
      <Style.HistoryContainer>
        <Style.TitleContainer>
          <FileDoneOutlined
            style={{
              fontSize: 18,
              marginRight: 10,
            }}
          />
          <span>Approval History </span>
        </Style.TitleContainer>
        <Table
          columns={columns}
          dataSource={record.userApplyRecordDetail.signOffRecord}
          size="middle"
        />
      </Style.HistoryContainer>
    </Style.ExpandContainer>
  );
};

ExpandInformation.propTypes = {};

ExpandInformation.defaultProps = {};

export default ExpandInformation;
