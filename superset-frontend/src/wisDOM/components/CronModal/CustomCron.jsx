/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { Select, Form } from 'antd';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import '../../MainStyle.less';
import './CronJobStyle.less';

const DATEOPTIONS = {
  Day: {
    key: 'Day',
    name: 'Day',
    option: ['10:00', '12:00', '16:00'],
  },
  Week: {
    key: 'Week',
    name: 'Week',
    option: ['SUN', 'MON', 'TUE', 'WED', 'THE', 'FRI', 'SAT'],
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
];

// setUItoValue UItoCron,getUIValue 傳入value轉成UI
const CustomCron = ({
  setUItoValue,
  getUIValue,
  setGetUIValue,
  modalVisible,
  okIsLoading,
  setSubmitIsLoading,
  setOkIsLoading,
  // healthyAssessment,
  // setHealthyAssessment,
}) => {
  const [selectDate, setSelectDate] = useState(''); // select day/week/month
  const [selectTime, setSelectTime] = useState([]); // select Time
  const [optionsTime, setOptionsTime] = useState([]); // option Time
  const [optionDate, setOptionDate] = useState([]); // option Date
  const [form] = Form.useForm();
  const { trackEvent } = useMatomo();
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

  const handleTime = value => {
    setSelectTime(value);
  };

  // const handdleSwitch = value => {
  //   setHealthyAssessment(value);
  // };

  // turn stringArray to unmber
  const returnNum = () => {
    const numArray = [];
    if (selectDate === DATEOPTIONS.Week.key) {
      selectTime.map(sub => numArray.push(optionDate.indexOf(sub)));
      numArray.sort((a, b) => a - b);
      return `0 12 * * ${numArray.join()}`;
    }
    selectTime.map(sub => numArray.push(optionDate.indexOf(sub) + 1));
    numArray.sort((a, b) => a - b);
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
    if ((selectTime !== '') & (selectTime.length === 1)) {
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
      } else cron = returnNum(selectDate);
    }
    if (cron !== '') {
      setUItoValue(cron); // UI to cron number
    }
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
        setGetUIValue(subArray);
        handleSelect(DATEOPTIONS.Month.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Month.key, Time: subArray });
      } else if (strArray[4] !== '*') {
        setSelectDate(DATEOPTIONS.Week.key);
        const subArray = strArray[4].split(',');
        const orgOption = DATEOPTIONS.Week.option;
        const returnArray = [];
        subArray.map(
          value => value !== '' && returnArray.push(orgOption[value]),
        );
        setSelectTime(returnArray);
        setGetUIValue(returnArray);
        handleSelect(DATEOPTIONS.Week.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Week.key, Time: returnArray });
      } else {
        setSelectDate(DATEOPTIONS.Day.key);
        let time = [];
        const subArray = strArray[1].split(',');
        if (subArray.length === 1) time = [`${subArray[0]}:00`];
        else time = subArray.map(value => `${value}:00`);
        setSelectTime(time);
        setGetUIValue(time);
        handleSelect(DATEOPTIONS.Day.key);
        form.setFieldsValue({ Date: DATEOPTIONS.Day.key, Time: time });
      }
    }
  };

  const handleValueChange = changedValues => {
    if (changedValues.Date !== undefined) {
      handleSelect(changedValues.Date);
      form.setFieldsValue({ Time: [] });
    }
    if (changedValues.Time !== undefined) handleTime(changedValues.Time);

    // if (changedValues.HealthyAssessment !== undefined) {
    //   handdleSwitch(changedValues.HealthyAssessment);
    // }
  };

  useEffect(() => {
    if (getUIValue !== undefined && getUIValue.length !== 0) {
      handleGetUI(getUIValue);
    }
    // if (healthyAssessment !== undefined) {
    //   form.setFieldsValue({ HealthyAssessment: healthyAssessment });
    // }
  }, [modalVisible]);

  const handleFinish = () => {
    ReactGA.event({
      category: 'CronJob',
      action: 'set cron time',
    });
    trackEvent({
      category: 'CronJob',
      action: 'set cron time',
    });

    setSubmitIsLoading(true);
  };

  useEffect(() => {
    if (okIsLoading === true) {
      form.submit();
      setSubmitIsLoading(false);
      setOkIsLoading(false);
    }
  }, [okIsLoading]);

  useEffect(() => {
    setUItoValue('');
  }, [selectDate]);

  useEffect(() => {
    setUItoValue('');
    handleGetCron();
  }, [selectTime]);

  return (
    <Form
      form={form}
      name="cron"
      onFinish={handleFinish}
      scrollToFirstError
      initialValues={{
        Time: selectTime,
      }}
      onValuesChange={handleValueChange}
    >
      <Form.Item name="setFrequency" label="Set Frequency">
        <div className="cronSelect">
          <span className="cronSelectText">Every </span>
          <Form.Item
            name="Date"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              placeholder="Select a Date"
              style={{ width: '150px' }}
              options={FIXOPTION}
            />
          </Form.Item>
          <span className="cronSelectText">
            {selectDate === 'Day' ? ' at ' : ' on '}
          </span>
          <Form.Item
            name="Time"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select a Time"
              style={{
                width: selectTime.length > 3 ? '300px' : '150px',
              }}
              options={optionsTime}
            />
          </Form.Item>
          <span className="cronSelectText">
            {selectDate === 'Day' ? '' : ' at 12:00 p.m '}
          </span>
        </div>
      </Form.Item>

      {/* <Form.Item
        style={{ marginTop: '12px' }}
        name="HealthyAssessment"
        label="Enable dataset healthy assessment"
        valuePropName="checked"
      >
        <Switch
          style={{ width: '60px' }}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      </Form.Item> */}
    </Form>
  );
};

export default CustomCron;
