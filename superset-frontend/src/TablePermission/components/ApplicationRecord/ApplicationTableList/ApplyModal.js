/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  Form,
  Space,
  Input,
  Alert,
  // message,
  Select,
  DatePicker,
  Radio,
} from 'antd';
import moment from 'moment';
// import { setUserOffline } from 'src/SqlLab/actions/sqlLab';
import { TableApi } from '~~apis/';
import { useQuery } from '~~hooks/';
import { INPUT_RULES, DATE_TYPE } from '~~constants/index';
// import * as Style from './style';

const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 18,
      offset: 6,
    },
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

// const MAP_ALLOWTYPE = [
//   'int',
//   'long',
//   'float',
//   'double',
//   'bigint',
//   'smallint',
//   'tinyint',
// ];

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

const ApplyModal = ({ modal, onFinish, refresh }) => {
  const [error, setError] = useState(false);
  const [others, setOthers] = useState(false);
  // const [isNumber, setIsNumber] = useState(false);
  // const [hasCol, setHasCol] = useState(false);
  const [user, setUser] = useState({
    userEnName: '',
    applyEmail: '',
    userId: '',
  });
  const [form] = Form.useForm();

  const tableApplyQuery = useQuery(TableApi.tableApply);

  const ENDDATE =
    modal.modalData && modal.modalData.endDate
      ? moment(modal.modalData.endDate).format(DATE_TYPE.DATE)
      : '';

  const handleBeforeLeave = () => {
    setError(false);
    // setIsNumber(false);
    setOthers(false);
    // setHasCol(false);
    form.resetFields();
    form.setFieldsValue({
      period: 'dateless',
      timeRange: [moment(ENDDATE, DATE_TYPE.DATE)],
    });
    modal.closeModal();
  };

  const handleApply = async data => {
    try {
      // message.success('Your application form has been submitted successfully.');
      handleBeforeLeave();
      refresh();
      onFinish(modal.modalData, data);
    } catch (e) {
      console.log(e);
    }
  };

  const getRangeDate = () => {
    const range = form.getFieldValue('period');
    switch (range) {
      case '1month':
        return moment(ENDDATE).add(1, 'M');
      case '3months':
        return moment(ENDDATE).add(3, 'M');
      case '6months':
        return moment(ENDDATE).add(6, 'M');
      case '12months':
        return moment(ENDDATE).add(12, 'M');
      case 'dateless':
        return '';
      case 'others':
        return moment(ENDDATE).add(1, 'days');
      default:
        return '';
    }
  };

  const onChange = checkedValues => {
    if (checkedValues.target.value === 'others') {
      setOthers(true);
    } else setOthers(false);

    const rangeAry = [moment(ENDDATE, DATE_TYPE.DATE), getRangeDate()];
    form.setFieldsValue({ timeRange: rangeAry });
  };

  // const handleColumn = (key, value) => {
  //   if (value.type && MAP_ALLOWTYPE.includes(value.type)) {
  //     setIsNumber(true);
  //   } else {
  //     setIsNumber(false);
  //   }

  //   if (value.type) {
  //     setHasCol(true);
  //   } else {
  //     setHasCol(false);
  //   }

  //   setTrialResult();
  //   setTrailBtn(false);
  //   form.setFieldsValue({ value: undefined });
  // };

  // const handleValue = value => {
  //   if (isNumber && value.length > 0) {
  //     const tempValue = [];
  //     value.forEach(v => {
  //       if (validateNumber(v)) {
  //         tempValue.push(v);
  //       }
  //     });

  //     if (tempValue.length > 0) {
  //       setTrailBtn(true);
  //     } else {
  //       setTrailBtn(false);
  //     }

  //     form.setFieldsValue({
  //       value: tempValue,
  //     });
  //   } else if (value.length > 0) {
  //     setTrailBtn(true);
  //   } else {
  //     setTrailBtn(false);
  //   }

  // };

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

  useEffect(() => {
    if (modal.visible && modal.modalData) {
      setUser({
        userEnName: modal.modalData.userEnName,
        applyEmail: modal.modalData.applyEmail,
        userId: modal.modalData.userId,
      });
      form.setFieldsValue({
        // period: modal.modalData.period,
        // timeRange: [
        //   moment(modal.modalData.startDate),
        //   moment(modal.modalData.endDate),
        // ],
        period: 'dateless',
        timeRange: [moment(ENDDATE, DATE_TYPE.DATE)],
        columnFilter: modal.modalData.columnFilter,
        column:
          modal.modalData.columnFilter.length > 0
            ? `${modal.modalData.columnFilter[0].columnName}(${modal.modalData.columnFilter[0].columnType})`
            : '',
        value:
          modal.modalData.columnFilter.length > 0
            ? modal.modalData.columnFilter[0].value
            : [],
        dept: modal.modalData.dept,
        project: modal.modalData.project,
        reason: modal.modalData.reason,
      });
    }
  }, [modal.visible]);

  return (
    <Modal
      title="Table Permission Application"
      visible={modal.visible}
      bodyStyle={{
        maxHeight: '70vh',
        overflow: 'auto',
      }} // 高度自動,超過螢幕的70％就scroll
      onCancel={handleBeforeLeave}
      width={700}
      footer={
        <Space align="end">
          <Button
            disabled={tableApplyQuery.isLoading}
            onClick={handleBeforeLeave}
          >
            Cancel
          </Button>
          <Button
            loading={tableApplyQuery.isLoading}
            type="primary"
            onClick={form.submit}
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
        name="auth"
        // onValuesChange={handleValueChange}
        onFinish={handleApply}
        scrollToFirstError
        // initialValues={{ ...modal.modalData, ...user }}
        initialValues={{ ...modal.modalData }}
      >
        <Form.Item label="Table Name">
          {modal.modalData && modal.modalData.tableName}
        </Form.Item>
        <Form.Item label="User Name">{user.userEnName}</Form.Item>
        <Form.Item label="User Id">{user.userId}</Form.Item>
        <Form.Item label="Email">{user.applyEmail}</Form.Item>
        <Form.Item
          label="Extend Duration"
          name="period"
          rules={[{ required: true, message: 'Please Select a Duration' }]}
        >
          <Radio.Group options={PERIOD} onChange={onChange} />
        </Form.Item>

        <Form.Item
          name="timeRange"
          rules={[{ required: others, message: 'Please Select a Date' }]}
          {...tailFormItemLayout}
        >
          <RangePicker
            style={{ width: '100%' }}
            format={DATEFORMAT}
            // defaultValue={[moment()]}
            disabled={others === true ? [true, false] : [true, true]}
          />
        </Form.Item>

        <Form.Item label="Column Filter" name="columnFilter">
          <Form.Item
            name="column"
            style={{
              display: 'inline-block',
              width: 'calc(50% - 5px)',
              marginRight: '10px',
              marginBottom: '0px',
            }}
          >
            <Select disabled>
              {modal.modalData &&
                modal.modalData.columnFilter.length > 0 &&
                modal.modalData.columnFilter.map(
                  e =>
                    COL_ALLOWTYPE.includes(e.columnType) && (
                      <Select.Option
                        value={e.columnName}
                        type={e.columnType}
                      >{`${e.columnName}(${e.columnType})`}</Select.Option>
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
              // onChange={handleValue}
              mode="tags"
              placeholder="input a value by Enter"
              disabled
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="Department Name"
          name="dept"
          rules={[{ required: true, message: 'Please input Department Name' }]}
        >
          <Input maxLength={INPUT_RULES.DEPARTMENT_NAME.value} disabled />
          {/* {modal.modalData && modal.modalData.dept} */}
        </Form.Item>
        <Form.Item label="Project" name="project">
          <Input maxLength={INPUT_RULES.PROJECT_NAME.value} disabled />
          {/* {modal.modalData && modal.modalData.project} */}
        </Form.Item>
        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: 'Please input Reason' }]}
        >
          <Input.TextArea
            rows={4}
            maxLength={INPUT_RULES.REASON.value}
            disabled
          />
          {/* {modal.modalData && modal.modalData.reason} */}
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
  refresh: PropTypes.func,
};

ApplyModal.defaultProps = {
  refresh: () => null,
};

export default ApplyModal;
