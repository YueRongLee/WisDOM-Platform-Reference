/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import { FUNCTIONS } from '~~constants/index';
import './Poperties.less';
import * as Style from './style';

const DATEOPTIONS = {
  Interval: {
    key: 'Interval',
    name: 'Interval',
    option: ['3', '6', '8', '12'],
  },
  Day: {
    key: 'Day',
    name: 'Day',
    option: ['04:00', '10:00', '12:00', '16:00'],
  },
  Week: {
    key: 'Week',
    name: 'Week',
    option: ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT'],
  },
  Month: {
    key: 'Month',
    name: 'Month',
    option: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
    ],
  },
};

const FIXOPTION = [
  { value: DATEOPTIONS.Day.key },
  { value: DATEOPTIONS.Week.key },
  { value: DATEOPTIONS.Month.key },
  { value: DATEOPTIONS.Interval.key },
];

const Poperties = ({ setUItoValue, nodeData, data }) => {
  const [selectDate, setSelectDate] = useState(''); // select day/week/month
  const [selectTime, setSelectTime] = useState([]); // select Time
  const [optionsTime, setOptionsTime] = useState([]); // option Time
  const [optionDate, setOptionDate] = useState([]); // option Date
  const [showMsg, setShowMsg] = useState();
  const [form] = Form.useForm();

  const handleClear = () => {
    setSelectTime([]);
  };

  const handleSelect = value => {
    handleClear();
    setSelectDate(value);
    const { option } = DATEOPTIONS[value];
    const output = [];
    option.forEach(e => {
      output.push({ value: e });
    });

    setOptionsTime(output);
    setOptionDate(option);
  };

  // cron number to UI
  const handleGetUI = cronStr => {
    let strArray = [];
    if (cronStr !== '') {
      strArray = cronStr.split(' ');
    }

    if (strArray.length === 5) {
      if (strArray[2] !== '*') {
        setSelectDate(DATEOPTIONS.Month.key);
        const subArray = strArray[2].split(',');
        setSelectTime(subArray);
        // setGetUIValue(subArray);
        handleSelect(DATEOPTIONS.Month.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Month.key, Time: subArray });
      } else if (strArray[4] !== '*') {
        setSelectDate(DATEOPTIONS.Week.key);
        const subArray = strArray[4].split(',');
        const orgOption = DATEOPTIONS.Week.option;
        const returnArray = [];
        subArray.map(
          value =>
            value !== '' &&
            returnArray.push(orgOption[value === '7' ? '0' : value]),
        );
        setSelectTime(returnArray);
        // setGetUIValue(returnArray);
        handleSelect(DATEOPTIONS.Week.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Week.key, Time: returnArray });
      } else {
        setSelectDate(DATEOPTIONS.Day.key);
        let time = [];
        const subArray = strArray[1].split(',');
        if (subArray.length === 1) time = [`${subArray[0]}:00`];
        else time = subArray.map(value => `${value}:00`);
        setSelectTime(time);
        // setGetUIValue(time);
        handleSelect(DATEOPTIONS.Day.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Day.key, Time: time });
      }
    } else {
      setSelectDate(DATEOPTIONS.Interval.key);
      setSelectTime(strArray[0]);
      // setGetUIValue(subArray);
      handleSelect(DATEOPTIONS.Interval.key);
      form.setFieldsValue({
        Date: DATEOPTIONS.Interval.key,
        Time: strArray[0],
      });
    }
  };

  const handleTime = value => {
    setSelectTime(value);
  };

  // turn stringArray to unmber
  const returnNum = () => {
    const numArray = [];
    if (selectDate === DATEOPTIONS.Week.key) {
      selectTime.map(sub => numArray.push(optionDate.indexOf(sub)));
      numArray.sort((a, b) => a - b);
    } else {
      selectTime.map(sub => numArray.push(optionDate.indexOf(sub) + 1));
      numArray.sort((a, b) => a - b);
    }

    if (selectDate === DATEOPTIONS.Week.key) {
      return `0 12 * * ${numArray.join()}`;
    }
    return `0 12 ${numArray.join()} * *`;
  };

  const returnNumForDay = () => {
    const numArray = [];

    selectTime.map(sub => numArray.push(sub.substr(0, 2)));
    numArray.sort((a, b) => a - b);
    return `0 ${numArray.join()} * * *`;
  };

  // 0 12 * * * =>分 時 月 * 週
  const handleGetCron = () => {
    let cron = '';
    if (form.getFieldValue().Date === DATEOPTIONS.Interval.key) {
      // interval
      cron = `${form.getFieldValue().Time}`;
    } else if ((selectTime !== '') & (selectTime.length === 1)) {
      // 只有選一個時間
      let indexTime = -1;
      // DAY
      if (selectDate === DATEOPTIONS.Day.key) {
        cron = `0 ${selectTime[0].substr(0, 2)} * * *`;
      }
      // Week
      else if (selectDate === DATEOPTIONS.Week.key) {
        indexTime = optionDate.indexOf(selectTime[0]);
        cron = `0 12 * * ${indexTime}`;
      }
      // Month
      else if (selectDate === DATEOPTIONS.Month.key) {
        indexTime = optionDate.indexOf(selectTime[0]) + 1;
        cron = `0 12 ${indexTime} * *`;
      }
    } else if (selectTime.length > 1) {
      // 選多個時間
      if (selectDate === DATEOPTIONS.Day.key) {
        cron = returnNumForDay(selectDate);
      } else {
        cron = returnNum(selectDate);
      }
    }
    if (cron !== '') {
      setUItoValue(cron); // UI to cron number
    }
  };

  const handleValueChange = changedValues => {
    const changeKey = Object.keys(changedValues)[0];
    const changeValues = Object.values(changedValues)[0];

    if (changedValues.Date !== undefined) {
      handleSelect(changedValues.Date);
      form.setFieldsValue({ Time: [] });
    }
    if (changedValues.Time !== undefined) handleTime(changedValues.Time);

    switch (changeKey) {
      case 'Date':
        if (changeValues === undefined) {
          form.setFieldsValue({ Time: [] });
          setUItoValue('');
          setShowMsg('Please select both options  (Frequency and Time).');
        }
        break;
      default:
        break;
    }

    if (form.getFieldValue('Date') && form.getFieldValue('Time').length > 0) {
      setShowMsg();
    } else {
      setShowMsg('Please select both options  (Frequency and Time).');
    }
  };

  // useEffect(() => {
  //   setUItoValue('');
  // }, [selectDate]);

  // useEffect(() => {
  //   setUItoValue('');
  //   handleGetCron();
  // }, [selectTime]);

  const onBlur = () => {
    setUItoValue('');
    handleGetCron();
  };

  useEffect(() => {
    const temp = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (temp.length > 0 && temp[0].args.cron) {
      handleGetUI(temp[0].args.cron);
    }
  }, []);

  const renderText = () => {
    switch (selectDate) {
      case 'Day':
        return ' at ';
      case 'Interval':
        return ' Every ';
      default:
        return ' on ';
    }
  };

  const onChangeSelect = () => {
    setUItoValue('');
    handleGetCron();
  };

  return (
    <>
      {/* <div className="popertiesText">Frequency </div> */}
      <div style={{ padding: '12px 12px 0px 12px' }}>Frequency </div>
      <Form
        data-test="cron"
        form={form}
        name="cron"
        scrollToFirstError
        initialValues={{
          Time: selectTime,
        }}
        onValuesChange={handleValueChange}
      >
        <Form.Item
          style={{ padding: '12px' }}
          name="Date"
          // rules={[
          //   {
          //     required: true,
          //   },
          // ]}
        >
          <Select
            allowClear
            placeholder="Select a Date"
            style={{ width: '300px' }}
            options={FIXOPTION}
            disabled={!nodeData.edit}
          />
        </Form.Item>
        {/* <div className="popertiesText">{renderText()}</div> */}
        <div style={{ padding: '12px 12px 0px 12px' }}>{renderText()} </div>
        <Form.Item
          style={{ padding: '12px' }}
          name="Time"
          // rules={[
          //   {
          //     required: true,
          //   },
          // ]}
        >
          {selectDate === 'Interval' ? (
            <Select
              data-test="interval"
              placeholder="Select a Interval"
              style={{ width: '300px' }}
              disabled={!nodeData.edit}
              onChange={() => onChangeSelect()}
              allowClear
            >
              {optionsTime.map(item => (
                <Select.Option
                  value={item.value}
                >{`${item.value} HR`}</Select.Option>
              ))}
            </Select>
          ) : (
            <Style.SelectRemoveIcon
              allowClear
              data-test="time"
              mode="multiple"
              placeholder="Select a Time"
              style={{
                width: '300px',
              }}
              options={optionsTime}
              disabled={!nodeData.edit}
              onBlur={onBlur}
            />
          )}
        </Form.Item>
        <span className="popertiesText">
          {selectDate === 'Day' || selectDate === 'Interval'
            ? ''
            : ' at 12:00 p.m'}
        </span>
        <span>
          {showMsg ? (
            <div style={{ padding: '12px 12px 0px 12px', color: '#ff4d4f' }}>
              {showMsg}
            </div>
          ) : null}
        </span>
      </Form>
    </>
  );
};

export default Poperties;
