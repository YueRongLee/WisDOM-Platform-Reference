/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  message,
  Select,
  DatePicker,
  Radio,
} from 'antd';
import ReactGA from 'react-ga';
import moment from 'moment';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { INPUT_RULES } from '~~constants/index';
import EndorsementByEmail from './EndorsementByEmail';

const { RangePicker } = DatePicker;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const DATEFORMAT = 'YYYY/MM/DD';

const PERIOD = [
  { label: '1 month', value: '1month' },
  { label: '3 months', value: '3months' },
  { label: '6 months', value: '6months' },
  { label: '12 months', value: '12months' },
  { label: 'Dateless', value: 'dateless' },
  { label: 'Others', value: 'others' },
];

const MAP_ALLOWTYPE = [
  'int',
  'long',
  'float',
  'double',
  'bigint',
  'smallint',
  'tinyint',
];

const COL_ALLOWTYPE = [
  'int',
  'long',
  'float',
  'double',
  'bigint',
  'smallint',
  'tinyint',
  'string',
];

const ENDORSEMENT_SELECTIONS = [
  { name: 'Search by E-mail', value: 'by-email' },
];

const ApplyModal = ({ modal, user, onFinish, selectedGroup, refresh }) => {
  const [error, setError] = useState(false);
  const [others, setOthers] = useState(false);
  const [trailBtn, setTrailBtn] = useState(false);
  const [trialResult, setTrialResult] = useState();
  const [trialLoading, setTrialLoading] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [hasCol, setHasCol] = useState(false);
  const [endorsementType, setEndorsementType] = useState('');
  const [endorsement, setEndorsement] = useState([]);
  const [form] = Form.useForm();

  const tableApplyQuery = useQuery(TableApi.tableApply);
  const columnTrialRun = useQuery(TableApi.columnFilterTrialRun);

  const { trackEvent } = useMatomo();

  const validateNumber = string => {
    const regex = new RegExp(/^[0-9]*$/i);
    return regex.test(string);
  };

  const handleBeforeLeave = () => {
    setError(false);
    setTrailBtn(false);
    setIsNumber(false);
    setTrialResult();
    setOthers(false);
    setHasCol(false);
    setEndorsementType('');

    form.resetFields();
    form.setFieldsValue({
      period: 'dateless',
      timeRange: [moment()],
    });
    modal.closeModal();
  };

  const getFilter = data => {
    const filter = modal.modalData.columns.filter(e => e.name === data.column);
    if (filter === -1 || filter.length < 1) {
      return undefined;
    }
    return [
      {
        columnName: modal.modalData.columns.filter(
          e => e.name === data.column,
        )[0].name,
        columnType: modal.modalData.columns.filter(
          e => e.name === data.column,
        )[0].type,
        value: data.value,
      },
    ];
  };

  const handleTrialRun = async () => {
    setTrialLoading(true);
    try {
      const data = form.getFieldValue();
      if (data.emailSelect) {
        delete data.emailSelect;
      }
      const req = {
        columnFilter: getFilter(data),
        tableName: modal.modalData.name,
      };
      const result = await columnTrialRun.exec(req);
      if (result === 1) {
        setTrialResult(true);
      } else {
        setTrialResult(false);
      }
    } catch (e) {
      setTrialResult(false);
      console.log(e);
    } finally {
      setTrialLoading(false);
    }
  };

  const handleApply = async data => {
    ReactGA.event({
      category: 'Apply',
      action: 'Apply a table permission',
    });
    trackEvent({
      category: 'Apply',
      action: 'Apply a table permission',
    });
    try {
      const req = {
        dept: data.dept,
        project: data.project,
        reason: data.reason,
        tableName: modal.modalData.name,
        type: modal.modalData.systemType,
        groupId: selectedGroup,
        startDate: data.timeRange[0].format('YYYY/MM/DD'),
        endDate:
          data.timeRange[1] && data.timeRange[1] !== ''
            ? data.timeRange[1].format('YYYY/MM/DD')
            : '',
        period: data.period,
        columnFilter: getFilter(data),
        applicantEndorsement: endorsement.map(
          ({ displayName, emailAddress }) => ({ displayName, emailAddress }),
        ),
      };
      await tableApplyQuery.exec(req);

      message.success('Your application form has been submitted successfully.');

      handleBeforeLeave();
      refresh();
      onFinish(modal.modalData);
    } catch (e) {
      console.log(e);
    }
  };

  const getRangeDate = () => {
    const range = form.getFieldValue('period');
    switch (range) {
      case '1month':
        return moment().add(1, 'M');
      case '3months':
        return moment().add(3, 'M');
      case '6months':
        return moment().add(6, 'M');
      case '12months':
        return moment().add(12, 'M');
      case 'dateless':
        return '';
      case 'others':
        return moment().add(1, 'days');
      default:
        return '';
    }
  };

  const onChange = checkedValues => {
    if (checkedValues.target.value === 'others') {
      setOthers(true);
    } else setOthers(false);

    const rangeAry = [moment(), getRangeDate()];
    form.setFieldsValue({ timeRange: rangeAry });
  };

  const handleColumn = (key, value) => {
    if (value.type && MAP_ALLOWTYPE.includes(value.type)) {
      setIsNumber(true);
    } else {
      setIsNumber(false);
    }

    if (value.type) {
      setHasCol(true);
    } else {
      setHasCol(false);
    }

    setTrialResult();
    setTrailBtn(false);
    form.setFieldsValue({ value: undefined });
  };

  const handleValue = value => {
    if (isNumber && value.length > 0) {
      const tempValue = [];
      value.forEach(v => {
        if (validateNumber(v)) {
          tempValue.push(v);
        }
      });

      if (tempValue.length > 0) {
        setTrailBtn(true);
      } else {
        setTrailBtn(false);
      }

      form.setFieldsValue({
        value: tempValue,
      });
    } else if (value.length > 0) {
      setTrailBtn(true);
    } else {
      setTrailBtn(false);
    }
    setTrialResult();
  };

  const showResult = result => {
    if (result === undefined || form.getFieldValue('value') === undefined) {
      return null;
    }
    if (result === true) {
      return <div style={{ color: '#20a7c9', marginLeft: '10px' }}>Valid</div>;
    }
    return (
      <div style={{ color: '#e04355', marginLeft: '10px' }}>
        No Data or Invalid Condition
      </div>
    );
  };

  //   const handleValueChange = changeValue => {
  //     const changeKey = Object.keys(changeValue)[0];
  //     const changeValues = Object.values(changeValue)[0];
  //     switch (changeKey) {
  //       case 'value':
  //         handleValue(changeValues);
  //         break;
  //       default:
  //         break;
  //     }
  //   };

  const onEndorsementTypeChange = value => {
    setEndorsementType(value);
  };

  useEffect(() => {
    form.setFieldsValue({
      period: 'dateless',
      timeRange: [moment()],
    });
  }, []);

  return (
    <Modal
      title="Table Permission Application"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={1260}
      footer={
        <Space align="end">
          <Button
            data-test="cancel"
            disabled={tableApplyQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={tableApplyQuery.isLoading}
            type="primary"
            onClick={form.submit}
            disabled={trialLoading}
          >
            Confirm
          </Button>
        </Space>
      }
      destroyOnClose
      closable={!tableApplyQuery.isLoading}
      maskClosable={!tableApplyQuery.isLoading}
    >
      {error ? (
        <div style={{ marginBottom: 24 }}>
          <Alert message={error} type="Error" showIcon />
        </div>
      ) : null}
      <Form
        {...formItemLayout}
        form={form}
        data-test="auth"
        name="auth"
        // onValuesChange={handleValueChange}
        onFinish={handleApply}
        scrollToFirstError
        initialValues={{ ...modal.modalData, ...user }}
      >
        <Form.Item label="Table Name">
          {modal.modalData && modal.modalData.name}
        </Form.Item>
        <Form.Item label="User Name">{user.lastName}</Form.Item>
        <Form.Item label="User Id">{user.emplId}</Form.Item>
        <Form.Item label="Email">{user.email}</Form.Item>
        <Form.Item label="Duration">
          <Form.Item
            name="period"
            rules={[{ required: true, message: 'Please Select a Duration' }]}
          >
            <Radio.Group options={PERIOD} onChange={onChange} />
          </Form.Item>
          <Form.Item
            name="timeRange"
            rules={[{ required: others, message: 'Please Select a Date' }]}
          >
            <RangePicker
              format={DATEFORMAT}
              // defaultValue={[moment()]}
              disabled={others === true ? [true, false] : [true, true]}
            />
          </Form.Item>
        </Form.Item>
        {/* TODO: fix disabled */}
        {modal.modalData &&
        modal.modalData.filtered &&
        modal.modalData.filtered === true ? null : (
          <>
            <Form.Item label="Column Filter">
              <Form.Item
                name="column"
                style={{
                  display: 'inline-block',
                  width: 'calc(50% - 5px)',
                  marginRight: '10px',
                  marginBottom: '0px',
                }}
              >
                <Select onChange={handleColumn}>
                  {modal.modalData &&
                    modal.modalData.columns.map(
                      e =>
                        COL_ALLOWTYPE.includes(e.type) && (
                          <Select.Option
                            key={e.name}
                            value={e.name}
                            type={e.type}
                          >{`${e.name}(${e.type})`}</Select.Option>
                        ),
                    )}
                </Select>
              </Form.Item>
              <Form.Item
                name="value"
                style={{
                  display: 'inline-block',
                  minWidth: 'calc(50% - 5px)',
                  marginBottom: '0px',
                }}
              >
                <Select
                  onChange={handleValue}
                  mode="tags"
                  placeholder="input a value by Enter"
                  disabled={!hasCol}
                />
              </Form.Item>
              <Form.Item style={{ marginTop: '16px' }}>
                <Button
                  data-test="trialRun"
                  loading={trialLoading}
                  onClick={() => handleTrialRun()}
                  disabled={!trailBtn || trialLoading}
                >
                  Filter Vaildate
                </Button>
                {showResult(trialResult)}
              </Form.Item>
            </Form.Item>
          </>
        )}
        <Form.Item
          label="Department Name"
          name="dept"
          rules={[{ required: true, message: 'Please input Department Name' }]}
        >
          <Input maxLength={INPUT_RULES.DEPARTMENT_NAME.value} />
        </Form.Item>
        <Form.Item label="Project" name="project">
          <Input maxLength={INPUT_RULES.PROJECT_NAME.value} />
        </Form.Item>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: 'Please input Reason' }]}
        >
          <Input.TextArea rows={4} maxLength={INPUT_RULES.REASON.value} />
        </Form.Item>
        <Form.Item label="Applicant Endorsement">
          <Form.Item>
            <Select value={endorsementType} onChange={onEndorsementTypeChange}>
              {ENDORSEMENT_SELECTIONS.map(selection => (
                <Option key={selection.value} value={selection.value}>
                  {selection.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {endorsementType === 'by-email' ? (
            <EndorsementByEmail
              id="create-pipeline-endorsement"
              setEndorsement={setEndorsement}
            />
          ) : null}
        </Form.Item>
      </Form>
    </Modal>
  );
};

ApplyModal.propTypes = {
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      name: PropTypes.string,
      children: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  selectedGroup: PropTypes.number,
  refresh: PropTypes.func,
};

ApplyModal.defaultProps = {
  refresh: () => null,
};

export default ApplyModal;
