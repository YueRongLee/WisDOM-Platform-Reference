/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Modal, Button, Spin, Table, Tag } from 'antd';
import {
  TableOutlined,
  UserOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { DATE_TYPE } from '~~constants/index';
import { TableApi } from '~~apis/';
import * as Style from './style';

const INIT_VALUE = {
  applicant: '',
  applyTime: '',
  categories: [],
  columnFilter: [
    {
      columnName: '',
      columnType: '',
      value: [],
    },
  ],
  departmentName: '',
  endTime: '',
  group: '',
  project: '',
  reason: '',
  signOffRecord: [],
  tableDescription: '',
  tableName: '',
};

const ApprovalHistoryModal = ({ modal }) => {
  const [healthResult, setHealthResult] = useState({ ...INIT_VALUE });
  const [resultIsLoading, setResultIsLoading] = useState(false);

  // const container = document.getElementById('app');
  // const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
  // const getEnableTagListQuery = useQuery(UserApi.getEnableTags);
  // const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

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

  const handleBeforeLeave = () => {
    modal.closeModal();
    setHealthResult({ ...INIT_VALUE });
  };

  const getHealthData = async uuid => {
    setResultIsLoading(true);
    try {
      const result = await TableApi.getUserApplyRecordDetail(uuid);

      setHealthResult(result);
    } catch (e) {
      handleBeforeLeave();
    } finally {
      setResultIsLoading(false);
    }
  };

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      getHealthData(modal.modalData.uuid);
    }
  }, [modal.visible, modal.modalData]);

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
    <div className="HealthDataModal">
      <Modal
        width={1100}
        bodyStyle={{
          maxHeight: '75vh',
          minHeight: '50vh',
          overflow: 'auto',
        }} // 高度自動,超過螢幕的75％就scroll
        title={
          <div style={{ fontSize: '20px' }}>
            Application Record - {healthResult.tableName}
          </div>
        }
        visible={modal.visible}
        destroyOnClose
        onCancel={handleBeforeLeave}
        footer={
          <Button data-test="leave" type="primary" onClick={handleBeforeLeave}>
            Ok
          </Button>
        }
      >
        <Spin spinning={resultIsLoading}>
          <Style.ExpandContainer>
            {/* left block */}
            <Style.InformationContainer>
              <Style.TitleContainer>
                <TableOutlined
                  style={{
                    fontSize: 18,
                    marginRight: 10,
                    color: '#20a7c994',
                  }}
                />
                <span>Table Information</span>
              </Style.TitleContainer>
              <Style.InformationBlock style={{ marginBottom: 20 }}>
                <Style.InformationItem>
                  <Style.InformationTitle>Table Name</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.tableName}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>Description</Style.InformationTitle>:
                  <Style.InformationText>
                    {' '}
                    {healthResult.tableDescription}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>Data Domain</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.categories.map(c => (
                      <>
                        <Tag className="listTag2">{c}</Tag>
                      </>
                    ))}
                  </Style.InformationText>
                </Style.InformationItem>
              </Style.InformationBlock>
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
                    {healthResult.applicant}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>
                    Applicant Time
                  </Style.InformationTitle>
                  :
                  <Style.InformationText>
                    {healthResult.applyTime &&
                      moment(healthResult.applyTime).format(
                        DATE_TYPE.DATE_TIME,
                      )}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>End Date</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.endTime &&
                      moment(healthResult.endTime).format(DATE_TYPE.DATE_TIME)}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>Group</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.group}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>
                    Department Name
                  </Style.InformationTitle>
                  :
                  <Style.InformationText>
                    {healthResult.departmentName}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>Project</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.project}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>Reason</Style.InformationTitle>:
                  <Style.InformationText>
                    {healthResult.reason}
                  </Style.InformationText>
                </Style.InformationItem>
                <Style.InformationItem>
                  <Style.InformationTitle>ColumnFilter</Style.InformationTitle>:
                  <Style.InformationFilter>
                    {healthResult.columnFilter.length > 0 && (
                      <Table
                        columns={columnFilter}
                        dataSource={healthResult.columnFilter}
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
                dataSource={healthResult.signOffRecord}
                size="middle"
              />
            </Style.HistoryContainer>
          </Style.ExpandContainer>
        </Spin>
      </Modal>
    </div>
  );
};

ApprovalHistoryModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

ApprovalHistoryModal.defaultProps = {};

export default ApprovalHistoryModal;
