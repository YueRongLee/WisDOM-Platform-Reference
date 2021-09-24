/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  Radio,
  message,
  Select,
  Table,
  Tag,
  Divider,
} from 'antd';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import moment from 'moment';

import { INPUT_RULES, PREVIEW_STATUS } from 'src/constants/index';
import { TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import EndorsementByEmail from './EndorsementByEmail';
import * as Style from './style';

const { Option } = Select;

const PERIOD = [
  { label: '1 month', value: '1month' },
  { label: '3 months', value: '3months' },
  { label: '6 months', value: '6months' },
  { label: '12 months', value: '12months' },
  { label: 'Dateless', value: 'dateless' },
  { label: 'Others', value: 'others' },
];

const ENDORSEMENT_SELECTIONS = [
  { name: 'Search by E-mail', value: 'by-email' },
];

const DetailModal = ({ modal, onFinish }) => {
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [status, setStatus] = useState();
  const [applicantEndorsementType, setApplicantEndorsementType] = useState('');
  const [dataDomainEndorsementType, setDataDomainEndorsementType] = useState(
    '',
  );
  const [applicantEndorsement, setApplicantEndorsement] = useState([]);
  const [dataDomainEndorsement, setDataDomainEndorsement] = useState([]);
  // 簽核紀錄
  const [recordDataSource, setRecordDataSource] = useState([]);
  // 加簽名單，用於比對當前加簽是否重複
  const [signOffList, setSignOffList] = useState([]);
  const [form] = Form.useForm();
  // const [allowed, setAllowed] = useState(1);

  const grantPermissionQuery = useQuery(TableApi.grantPermission);
  const columnPreview = useQuery(TableApi.columnFilterPreview);
  const { trackEvent } = useMatomo();

  const recordColumns = [
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
    },
    {
      key: 'approver',
      title: 'Approver',
      dataIndex: 'approver',
    },
    {
      key: 'approvedAt',
      title: 'Approve Time',
      dataIndex: 'approvedAt',
    },
    {
      key: 'comment',
      title: 'Comment',
      dataIndex: 'comment',
    },
  ];

  const getSignOffInfo = async () => {
    try {
      const { uuid, currentSignOffId, stewardName } = modal.modalData;

      setLoading(true);
      // 簽核紀錄
      let signOffInfo = await TableApi.getSignOffInfo(uuid);

      let dataDomainEndorsement = [];

      signOffInfo = signOffInfo.map(info => {
        const { type, reviewer, actionTime, comment } = info;
        return {
          type,
          approver: reviewer,
          approvedAt: actionTime
            ? moment(actionTime).format('YYYY/MM/DD HH:MM')
            : '',
          comment,
        };
      });

      // 加簽名單，過濾兩者中重複項
      if (signOffInfo.length !== 0) {
        signOffInfo.forEach(info => {
          dataDomainEndorsement = modal.modalData.dataDomainEndorsement
            .filter(item => info.approver !== item.displayName)
            .map(item => ({
              type: 'data_domain',
              approver: item.displayName,
              approvedAt: '',
              comment: '',
            }));
        });
      } else {
        dataDomainEndorsement = modal.modalData.dataDomainEndorsement.map(
          item => ({
            type: 'data_domain',
            approver: item.displayName,
            approvedAt: '',
            comment: '',
          }),
        );
      }

      const steward = {
        type: 'data_steward',
        approver: stewardName,
        approvedAt: '',
        comment: '',
      };

      const comBineList = [...signOffInfo, steward, ...dataDomainEndorsement];

      // 設定加簽名單
      setSignOffList(comBineList);

      // currentSignOffId 有值表示當前為加簽人 沒有值表示當前為 steward
      if (currentSignOffId) {
        // 加簽人可看到審核紀錄(含當前自己)
        setRecordDataSource([...signOffInfo]);
      } else {
        // steward 要可以看到審核紀錄 & 加簽名單(含當前自己)
        setRecordDataSource(comBineList);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeLeave = () => {
    setError(false);
    setPreview(false);
    setLoading(false);
    setPreviewData([]);
    setColumns([]);
    setStatus();
    setApplicantEndorsementType('');
    setDataDomainEndorsementType('');
    setApplicantEndorsement([]);
    setDataDomainEndorsement([]);
    form.resetFields();
    modal.closeModal();
  };

  const handlePreviewFilter = async () => {
    try {
      if (preview === false) {
        setPreview(true);
        setLoading(true);
        const req = {
          columnFilter: modal.modalData.columnFilter,
          tableName: modal.modalData.tableName,
        };
        const result = await columnPreview.exec(req);
        // setPreviewData(result);

        const column = Object.keys(result[0]);

        const colList = column.map(col => ({
          title: col,
          dataIndex: col.toLowerCase(),
          render: value =>
            value !== undefined && value !== null && value.toString
              ? value.toString()
              : value,
        }));

        setColumns(colList);
        setPreviewData(result);
        setLoading(false);
      } else {
        setPreview(false);
      }
    } catch (e) {
      setLoading(false);
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async data => {
    const { uuid, currentSignOffId } = modal.modalData;

    ReactGA.event({
      category: 'Grant',
      action: `Grant table permission status is ${data.allowed}`,
    });
    trackEvent({
      category: 'Grant',
      action: `Grant table permission status is ${data.allowed}`,
    });

    const newData = data;
    delete newData.applicantEmailSelect;
    delete newData.dataDomainEmailSelect;

    try {
      const req = {
        ...newData,
        uuid,
        taskId: currentSignOffId,
        applicantEndorsement: applicantEndorsement.map(
          ({ displayName, emailAddress }) => ({ displayName, emailAddress }),
        ),
        dataDomainEndorsement: dataDomainEndorsement.map(
          ({ displayName, emailAddress }) => ({ displayName, emailAddress }),
        ),
      };

      await grantPermissionQuery.exec(req);

      message.success(
        `This table has been ${
          data.allowed ? 'approved' : 'rejected'
        } successfully!`,
      );
      handleBeforeLeave();
      onFinish();
    } catch (e) {
      console.log(e);
    }
  };

  const onApplicantEndorsementTypeChange = value => {
    setApplicantEndorsementType(value);
  };
  const onDataDomainEndorsementTypeChange = value => {
    setDataDomainEndorsementType(value);
  };

  const showLabel = () => {
    const data = modal.modalData;
    let filter = [];
    if (data.period) {
      filter = PERIOD.filter(e => e.value === data.period);
    }
    const time = filter.length > 0 ? filter[0].label : 'Dateless';

    const start = data.startDate
      ? moment(data.startDate).format('YYYY/MM/DD')
      : '';
    const end = data.endDate ? moment(data.endDate).format('YYYY/MM/DD') : '';

    if (time === 'Dateless' && start === '') {
      return time;
    }
    return `${time} ( ${start} - ${end} )`;
  };

  const showFilter = () => {
    const data = modal.modalData.columnFilter[0];
    if (data.columnName) {
      return `${data.columnName}(${data.columnType})`;
    }
    return '';
  };

  const showFilterValue = () => {
    const data = modal.modalData.columnFilter[0];
    return <Select defaultValue={data && data.value} mode="tags" disabled />;
  };

  const getTitle = () => {
    if (modal.modalData) {
      if (modal.modalData.allowed === PREVIEW_STATUS.EXTEND_APPLYING.value) {
        return `Extend Permission ${modal.modalData.tableName}`;
      }
      return `Grant Permission ${modal.modalData.tableName}`;
    }
    return '';
  };

  // const hangeValueChange = changeValue => {
  //   const changeKey = Object.keys(changeValue)[0];
  //   const changeValues = Object.values(changeValue)[0];

  //   if (changeKey === 'allowed') {
  //     setAllowed(changeValues);
  //   }
  // };

  const getWidth = cols => {
    const minWidth = 100;
    return minWidth + cols.length * 120;
  };

  const handleStatusChange = e => {
    setStatus(e.target.value);

    setApplicantEndorsementType('');
    setDataDomainEndorsementType('');
    setApplicantEndorsement([]);
    setDataDomainEndorsement([]);

    form.setFieldsValue({ comment: '' });

    // 當 dataDomainEndorsement 有值時需帶入以利編輯
    if (
      e.target.value === PREVIEW_STATUS.ENDORSEMENT.value &&
      modal.modalData?.dataDomainEndorsement.length !== 0
    ) {
      form.setFieldsValue({ allowed: PREVIEW_STATUS.ENDORSEMENT.value });
      setDataDomainEndorsementType('by-email');
    }
  };

  useEffect(() => {
    if (modal.visible) {
      form.setFieldsValue({ ...modal.modalData, allowed: 1 });
      getSignOffInfo();
    }
  }, [modal.visible]);

  // dataDomainEndorsement有值時，預設渲染時帶入
  useEffect(() => {
    if (
      modal.modalData &&
      modal.modalData.dataDomainEndorsement.length !== 0 &&
      !modal.modalData.currentSignOffId
    ) {
      form.setFieldsValue({ allowed: PREVIEW_STATUS.ENDORSEMENT.value });
      setStatus(PREVIEW_STATUS.ENDORSEMENT.value);
      setDataDomainEndorsementType('by-email');
    }
  }, [modal.modalData]);

  return (
    <Modal
      title={getTitle()}
      visible={modal.visible}
      onCancel={handleBeforeLeave}
      // width={150vh}
      width={1260}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      footer={
        <Space align="end">
          <Button
            disabled={grantPermissionQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={grantPermissionQuery.isLoading}
            type="primary"
            onClick={form.submit}
            disabled={
              status === PREVIEW_STATUS.ENDORSEMENT.value &&
              applicantEndorsement.length === 0 &&
              dataDomainEndorsement.length === 0
            }
          >
            Confirm
          </Button>
        </Space>
      }
      destroyOnClose
      closable={!grantPermissionQuery.isLoading}
      maskClosable={!grantPermissionQuery.isLoading}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, margin: '10px' }}>
          <Divider style={{ color: '#20A7C9' }}>Request Table Info</Divider>
          <Form scrollToFirstError>
            {() => (
              <>
                <Form.Item label="Table Name">
                  {modal.modalData.tableName}
                </Form.Item>
                <Form.Item label="Data Domain">
                  {modal.modalData.categories &&
                    modal.modalData.categories.map((c, index) => (
                      <Tag className="listTag2" key={index}>
                        {c}
                      </Tag>
                    ))}
                </Form.Item>
                <Form.Item label="Time Period">{showLabel()}</Form.Item>
                <Form.Item label="Filter Column">
                  {modal.modalData.columnFilter &&
                    modal.modalData.columnFilter[0] &&
                    showFilter()}
                </Form.Item>
                <Form.Item label="Filter Value">
                  {modal.modalData.columnFilter &&
                    modal.modalData.columnFilter[0] &&
                    showFilterValue()}
                </Form.Item>
              </>
            )}
          </Form>
        </div>
        <div style={{ flex: 1, margin: '10px' }}>
          <Divider style={{ color: '#20A7C9' }}>Apply Info</Divider>
          <Form scrollToFirstError>
            {() => (
              <>
                <Form.Item label="Group Name">
                  {modal.modalData.groupName}
                </Form.Item>
                <Form.Item label="User Name">
                  {`${modal.modalData.userEnName}(${modal.modalData.userId})`}
                </Form.Item>
                <Form.Item label="Department Name">
                  {modal.modalData.dept}
                </Form.Item>
                <Form.Item label="Project">{modal.modalData.project}</Form.Item>
                <Form.Item label="Reason">{modal.modalData.reason}</Form.Item>
              </>
            )}
          </Form>
        </div>
      </div>
      <Form
        form={form}
        name="auth"
        onFinish={handleChange}
        initialValues={{
          allowed: PREVIEW_STATUS.ALLOWED.value,
        }}
        // onValuesChange={hangeValueChange}
        scrollToFirstError
      >
        {modal.modalData &&
        modal.modalData.columnFilter &&
        modal.modalData.columnFilter[0] ? (
          <Form.Item>
            Perview Column Filter
            {preview ? (
              <CaretDownOutlined onClick={() => handlePreviewFilter()} />
            ) : (
              <CaretRightOutlined onClick={() => handlePreviewFilter()} />
            )}
            {preview ? (
              <Table
                columns={columns}
                dataSource={previewData}
                scroll={{ x: getWidth(columns), y: 500 }}
                pagination={false}
                rowKey="guid"
                loading={loading}
              />
            ) : null}
          </Form.Item>
        ) : null}
        <Form.Item label="Approval Record">
          <Table
            columns={recordColumns}
            dataSource={recordDataSource}
            scroll={{ x: getWidth(recordColumns), y: 480 }}
            pagination={false}
          />
        </Form.Item>

        <Form.Item label="Status" name="allowed" rules={[{ required: true }]}>
          <Radio.Group
            onChange={e => handleStatusChange(e)}
            options={[
              {
                label: 'Approve',
                value: PREVIEW_STATUS.ALLOWED.value,
              },
              {
                label: 'Reject',
                value: PREVIEW_STATUS.REJECT.value, // 依後端需求調整
              },
              {
                label: 'Add Endorsement',
                value: PREVIEW_STATUS.ENDORSEMENT.value,
                // 當有回傳值時 以 currentSignOffId 為依據 , 有值則 disabled
                disabled: modal.modalData?.currentSignOffId,
              },
            ]}
          />
        </Form.Item>
        {status !== PREVIEW_STATUS.ENDORSEMENT.value ? (
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: 'Please input comment!' }]}
            shouldUpdate
          >
            <Input.TextArea rows={4} maxLength={INPUT_RULES.REASON.value} />
          </Form.Item>
        ) : null}

        {status === PREVIEW_STATUS.ENDORSEMENT.value ? (
          <Form.Item>
            <Form.Item label="Applicant Endorsement">
              <Form.Item>
                <Select
                  value={applicantEndorsementType}
                  onChange={onApplicantEndorsementTypeChange}
                >
                  {ENDORSEMENT_SELECTIONS.map(selection => (
                    <Option key={selection.value} value={selection.value}>
                      {selection.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {applicantEndorsementType === 'by-email' ? (
                <EndorsementByEmail
                  id="preview-grant-permission-endorsement"
                  name="applicant"
                  setEndorsement={setApplicantEndorsement}
                  signOffList={signOffList}
                  modal={modal}
                  form={form}
                />
              ) : null}
            </Form.Item>
            <Form.Item label="Data Domain Endorsement">
              <Form.Item>
                <Select
                  value={dataDomainEndorsementType}
                  onChange={onDataDomainEndorsementTypeChange}
                >
                  {ENDORSEMENT_SELECTIONS.map(selection => (
                    <Option
                      key={selection.value}
                      value={selection.value}
                      modal={modal}
                    >
                      {selection.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {dataDomainEndorsementType === 'by-email' ? (
                <EndorsementByEmail
                  id="preview-grant-permission-endorsement"
                  name="dataDomain"
                  setEndorsement={setDataDomainEndorsement}
                  signOffList={signOffList}
                  isSelect={dataDomainEndorsementType === 'by-email'}
                  modal={modal}
                  form={form}
                />
              ) : null}
            </Form.Item>
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
};

DetailModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
};

DetailModal.defaultProps = {};

export default DetailModal;
