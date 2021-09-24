/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import {
  Spin,
  Select,
  Form,
  Switch,
  InputNumber,
  DatePicker,
  Input,
  Space,
  Button,
  message,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
// import { TableApi } from '~~apis/';
import { FUNCTIONS, DATE_TYPE } from '~~constants/index';
import * as Style from '../style';

const { RangePicker } = DatePicker;

const DATEFORMAT = DATE_TYPE.DATE;
const dataType = ['timestamp', 'date'];

const DataRobotAutoTS = ({
  nodeData,
  data,
  dataRobotTarget,
  setNodeChange,
}) => {
  const [featureEndMin, setFeatureEndMin] = useState(0);
  const [forecastEndMin, setForecastEndMin] = useState(2);
  const [holdoutStart, setHoldoutStart] = useState();
  const [datasetMaxDate, setDatasetMaxDate] = useState(); // 後端因流程關係先移除api,若要改回建議看log
  const [showHoldout, setShowHoldout] = useState(true); // 預設true
  const [showSeries, setShowSeries] = useState(false);
  const [maxDateLoading, setMaxDateLoading] = useState(false); // 後端因流程關係先移除api
  const [form] = Form.useForm();

  const handleHoldoutDate = (value, dateString) => {
    setHoldoutStart(
      (dateString && dateString[0] !== '' && dateString[0]) || undefined,
    );
    if (dateString[0] === '') {
      form.setFieldsValue({ payload: null });
    }
  };

  const handleSetMaxDate = lastDate => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;

    setDatasetMaxDate(lastDate);
    let momentHoldoutDate = [];
    if (lastDate) {
      momentHoldoutDate = [
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[0] &&
          moment(setNewArg.autoTSData.holdoutDate[0])) ||
          null,
        moment(lastDate),
      ];

      setNewArg.autoTSData.holdoutDate = [
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[0]) ||
          '',
        lastDate,
      ];
    } else {
      momentHoldoutDate = [
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[0] &&
          moment(setNewArg.autoTSData.holdoutDate[0])) ||
          null,
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[1] &&
          moment(setNewArg.autoTSData.holdoutDate[1])) ||
          null,
      ];

      setNewArg.autoTSData.holdoutDate = [
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[0]) ||
          '',
        (setNewArg.autoTSData.holdoutDate &&
          setNewArg.autoTSData.holdoutDate[1]) ||
          '',
      ];
    }

    setHoldoutStart(
      (setNewArg.autoTSData.holdoutDate &&
        setNewArg.autoTSData.holdoutDate[0] !== '' &&
        setNewArg.autoTSData.holdoutDate[0]) ||
        undefined,
    );

    form.setFieldsValue({
      holdoutDate: momentHoldoutDate,
    });
  };

  const getDatasetLastDate = async columnName => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;
    setMaxDateLoading(true);
    try {
      if (setNewArg.dataflowId && setNewArg.targetList && columnName) {
        //   const payload = {
        //     dataflowId: setNewArg.dataflowId,
        //     targetId: setNewArg.targetList[0],
        //     column: columnName,
        //   };
        //   const result = await TableApi.getDatasetLastData(payload);
        //   const date = moment(result).format(DATEFORMAT);
        // handleSetMaxDate(date);
        handleSetMaxDate();
      } else {
        message.error('Please select a Dataflow,Target and Column');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setMaxDateLoading(false);
    }
  };

  useEffect(() => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0].args;

      setNewArg.dataRobotType = 'dataRobotAutoTS';
      setNewArg.triggerAutoML = true;
      setNewArg.triggerTimeSeries = true;

      if (setNewArg.autoTSData === undefined) {
        setNewArg.autoTSData = {
          recommendation: true,
          featureStart: -1,
          featureEnd: 0,
          forecastStart: 1,
          forecastEnd: 2,
          enableHoldout: true,
          backTestNum: 0,
          workerCount: 1,
        };
      } else {
        if (setNewArg.autoTSData.featureStart) {
          setFeatureEndMin(setNewArg.autoTSData.featureStart + 1);
        }

        if (setNewArg.autoTSData.forecastStart) {
          setForecastEndMin(setNewArg.autoTSData.forecastStart + 1);
        }

        if (setNewArg.autoTSData.enableHoldout !== undefined) {
          const switchH = setNewArg.autoTSData.enableHoldout;
          setShowHoldout(switchH);
          if (switchH === false) {
            setNewArg.autoTSData.backTestNum = 0;
            setNewArg.autoTSData.holdoutDate = undefined;
            setHoldoutStart();
          }
          setShowHoldout(switchH);
        }

        setShowSeries(setNewArg.autoTSData.datetimeColumn !== undefined);

        form.setFieldsValue({
          target: setNewArg.autoTSData.target,
          datetimeColumn: setNewArg.autoTSData.datetimeColumn,
          seriesIdentifiers: setNewArg.autoTSData.seriesIdentifiers,
          recommendation: setNewArg.autoTSData.recommendation,
          featureStart: setNewArg.autoTSData.featureStart,
          featureEnd: setNewArg.autoTSData.featureEnd,
          forecastStart: setNewArg.autoTSData.forecastStart,
          forecastEnd: setNewArg.autoTSData.forecastEnd,
          workerCount: setNewArg.autoTSData.workerCount,
          enableHoldout: setNewArg.autoTSData.enableHoldout,
          // holdoutDate: setNewArg.autoTSData.holdoutDate,
          backTestNum:
            (setNewArg.autoTSData.backTestList &&
              setNewArg.autoTSData.backTestList.length) ||
            0,
          payload:
            setNewArg.autoTSData.backTestList &&
            setNewArg.autoTSData.backTestList.map(e => ({
              primaryDate:
                e && e.primaryDate
                  ? [moment(e.primaryDate[0]), moment(e.primaryDate[1])]
                  : null,
              validationDate:
                e && e.validationDate
                  ? [moment(e.validationDate[0]), moment(e.validationDate[1])]
                  : null,
            })),
        });
      }

      //   if (setNewArg.autoTSData.datetimeColumn && nodeData.edit === true) {
      //     getDatasetLastDate(setNewArg.autoTSData.datetimeColumn);
      //   }

      if (nodeData.edit === true) {
        handleSetMaxDate();
      } else if (setNewArg.autoTSData.holdoutDate && nodeData.edit === false) {
        form.setFieldsValue({
          holdoutDate: [
            (setNewArg.autoTSData.holdoutDate[0] &&
              moment(setNewArg.autoTSData.holdoutDate[0])) ||
              null,
            moment(setNewArg.autoTSData.holdoutDate[1]),
          ],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (nodeData.edit === true) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg =
        nodeFilter && nodeFilter.length > 0 && nodeFilter[0].args;
      if (
        setNewArg &&
        setNewArg.autoTSData &&
        setNewArg.autoTSData.datetimeColumn
      ) {
        getDatasetLastDate(setNewArg.autoTSData.datetimeColumn);
      }
    }
  }, [nodeData]);

  const payloadFormate = () => {
    const nowPayload = form.getFieldValue('payload');
    const formatePayload = nowPayload.map(e => ({
      primaryDate:
        e && e.primaryDate
          ? [
              moment(e.primaryDate[0]).format(DATEFORMAT),
              moment(e.primaryDate[1]).format(DATEFORMAT),
            ]
          : null,
      validationDate:
        e && e.validationDate
          ? [
              moment(e.validationDate[0]).format(DATEFORMAT),
              moment(e.validationDate[1]).format(DATEFORMAT),
            ]
          : null,
    }));

    return formatePayload;
  };

  const checkBackTestNum = () => {
    const getPayload = form.getFieldValue('payload');
    form.setFieldsValue({ backTestNum: getPayload.length });
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;

    if (setNewArg.autoTSData.backTestNum !== getPayload.length) {
      const nowPayload = payloadFormate();
      setNewArg.autoTSData.backTestList = nowPayload;
      setNewArg.autoTSData.backTestNum = getPayload.length;
    }
  };

  const checkNodeStatus = () => {
    const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    let checkOK;

    if (
      getArgNode[0] &&
      getArgNode[0].args &&
      getArgNode[0].args.autoTSData &&
      getArgNode[0].args.autoTSData.backTestList &&
      getArgNode[0].args.autoTSData.backTestList.length > 0
    ) {
      const tsData = getArgNode[0].args.autoTSData;

      let overlap = false;
      let dateNull = false;

      // check not null
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tsData.backTestList.length; i++) {
        if (
          tsData.backTestList[i] &&
          tsData.backTestList[i].primaryDate &&
          tsData.backTestList[i].primaryDate[0] &&
          tsData.backTestList[i].primaryDate[1] &&
          tsData.backTestList[i].validationDate &&
          tsData.backTestList[i].validationDate[0] &&
          tsData.backTestList[i].validationDate[1]
        ) {
          overlap = false;
        } else {
          dateNull = true;
        }
      }

      if (dateNull === true) {
        checkOK = false;
      } else if (tsData.enableHoldout === true) {
        if (
          holdoutStart &&
          tsData.holdoutDate &&
          tsData.holdoutDate.length === 2 &&
          tsData.holdoutDate[1]
        ) {
          // check overlap
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < tsData.backTestList.length; i++) {
            if (
              (tsData.backTestList[i].primaryDate &&
                moment(holdoutStart).isBefore(
                  tsData.backTestList[i].primaryDate[1],
                )) ||
              (tsData.backTestList[i].validationDate &&
                moment(holdoutStart).isBefore(
                  tsData.backTestList[i].validationDate[1],
                ))
            ) {
              overlap = true;
            }
          }
          checkOK = !overlap;
        } else {
          checkOK = false;
        }
      } else {
        checkOK = true;
      }
    } else {
      checkOK = false;
    }

    let statusChange = false;
    if (checkOK && getArgNode[0].check !== undefined) {
      getArgNode[0].check = undefined;
      statusChange = true;
    } else if (!checkOK && getArgNode[0].check === undefined) {
      getArgNode[0].check = 'error';
      statusChange = true;
    }

    if (statusChange === true) {
      setNodeChange(getArgNode[0]);
    }
  };

  useEffect(() => {
    if (nodeData.edit) {
      checkNodeStatus();
    }
  }, [holdoutStart]);

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;

    switch (changeKey) {
      case 'target':
        setNewArg.autoTSData.target = changeValues;
        break;
      case 'seriesIdentifiers':
        setNewArg.autoTSData.seriesIdentifiers = changeValues;
        break;
      case 'featureStart':
        if (changeValues) {
          setFeatureEndMin(changeValues + 1);
        }
        setNewArg.autoTSData.featureStart = changeValues;
        break;
      case 'featureEnd':
        setNewArg.autoTSData.featureEnd = changeValues;
        break;
      case 'forecastStart':
        if (changeValues) {
          setForecastEndMin(changeValues + 1);
        }
        setNewArg.autoTSData.forecastStart = changeValues;
        break;
      case 'forecastEnd':
        setNewArg.autoTSData.forecastEnd = changeValues;
        break;
      case 'workerCount':
        setNewArg.autoTSData.workerCount = changeValues;
        break;
      case 'enableHoldout':
        setShowHoldout(changeValues);
        if (changeValues === false) {
          setNewArg.autoTSData.backTestNum = 0;
          setNewArg.autoTSData.holdoutDate = undefined;
          form.setFieldsValue({ holdoutDate: undefined });
          setHoldoutStart();
        }
        setNewArg.autoTSData.enableHoldout = changeValues;
        checkNodeStatus();
        break;
      case 'datetimeColumn':
        setNewArg.autoTSData.datetimeColumn = changeValues;
        if (changeValues) {
          setShowSeries(true);
        }
        getDatasetLastDate(changeValues);
        break;
      case 'recommendation':
        setNewArg.autoTSData.recommendation = changeValues;
        break;
      case 'holdoutDate':
        setNewArg.autoTSData.holdoutDate = [
          moment(changeValues[0]).format(DATEFORMAT),
          moment(changeValues[1]).format(DATEFORMAT),
        ];
        break;
      case 'payload':
        checkBackTestNum();
        break;
      default:
        break;
    }
  };

  const handleChange = (value, dateString, type, index) => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      const setNewArg = nodeFilter[0].args;

      const nowPayload = payloadFormate();

      setNewArg.autoTSData.backTestList = nowPayload;
    }

    const formPayload = form.getFieldValue('payload');

    if (
      dateString[0] !== '' &&
      type === 'validation' &&
      formPayload[index].primaryDate
    ) {
      formPayload[index].primaryDate = null;
      form.setFieldsValue({ payload: formPayload });
    } else {
      form.setFieldsValue({ payload: formPayload });
    }

    // if (
    //   dateString[0] !== '' &&
    //   type === 'primary' &&
    //   formPayload[index].validationDate
    // ) {
    //   formPayload[index].validationDate = null;
    //   form.setFieldsValue({ payload: formPayload });
    // } else {
    //   form.setFieldsValue({ payload: formPayload });
    // }

    checkNodeStatus();
  };

  const validationDisabledDate = current =>
    current && current > moment(holdoutStart || datasetMaxDate).endOf('day');

  const primaryDisabledDate = (current, index) => {
    const vDate2 =
      form.getFieldValue('payload')[index].validationDate &&
      form.getFieldValue('payload')[index].validationDate[0];

    const vDateFormate = vDate2 ? moment(vDate2).format(DATEFORMAT) : vDate2;
    // pDateFormate = moment(pDateFormate).add(-1, 'days');//反向就不用-1天

    if (index > 0) {
      if (holdoutStart || datasetMaxDate) {
        return (
          current &&
          (current > moment(vDateFormate).endOf('day') ||
            current > moment(holdoutStart || datasetMaxDate).endOf('day'))
        );
      }
      return (
        current && current > moment(vDateFormate).endOf('day')
        // || current >= moment(lastVDate).endOf('day')
      );
    }

    if (vDateFormate) {
      if (holdoutStart || datasetMaxDate) {
        return (
          current &&
          (current > moment(vDateFormate).endOf('day') ||
            current > moment(holdoutStart || datasetMaxDate).endOf('day'))
        );
      }
      return current && current > moment(vDateFormate).endOf('day');
    }

    if (holdoutStart || datasetMaxDate) {
      return (
        current && current > moment(holdoutStart || datasetMaxDate).endOf('day')
      );
    }
    return true;
  };

  //   const validationDisabledDate = (current, index) => {
  //     const pDate2 =
  //       form.getFieldValue('payload')[index].primaryDate &&
  //       form.getFieldValue('payload')[index].primaryDate[1];

  //     let pDateFormate = pDate2 ? moment(pDate2).format(DATEFORMAT) : pDate2;
  //     pDateFormate = moment(pDateFormate).add(-1, 'days');

  //   if (index > 0) {
  //     //前一筆的改成不卡
  //     //   const lastVDate =
  //     //     form.getFieldValue('payload')[index - 1].validationDate &&
  //     //     form.getFieldValue('payload')[index - 1].validationDate[0];

  //       if (holdoutStart || datasetMaxDate) {
  //         return (
  //           current &&
  //           (current < moment(pDateFormate).endOf('day') ||
  //             // current >= moment(lastVDate).endOf('day') ||
  //             current > moment(holdoutStart || datasetMaxDate).endOf('day'))
  //         );
  //       }
  //       return (
  //         current && current < moment(pDateFormate).endOf('day')
  //         // || current >= moment(lastVDate).endOf('day')
  //       );
  //     }

  //     if (pDateFormate) {
  //       if (holdoutStart || datasetMaxDate) {
  //         return (
  //           current &&
  //           (current < moment(pDateFormate).endOf('day') ||
  //             current > moment(holdoutStart || datasetMaxDate).endOf('day'))
  //         );
  //       }
  //       return current && current < moment(pDateFormate).endOf('day');
  //     }

  //     if (holdoutStart || datasetMaxDate) {
  //       return (
  //         current && current > moment(holdoutStart || datasetMaxDate).endOf('day')
  //       );
  //     }
  //     return true;
  //   };

  //   const primaryDisabledDate = current =>
  //     current && current > moment(holdoutStart || datasetMaxDate).endOf('day');

  const disabledAdd = () => {
    const temp = form.getFieldValue('payload');
    if (temp && temp.length > 0 && temp[temp.length - 1]) {
      return !(
        temp[temp.length - 1].primaryDate &&
        temp[temp.length - 1].validationDate
      );
    }
    if (!temp || temp === null) {
      return false;
    }
    return true;
  };

  const handleDisableAdd = () => {
    if (!nodeData.edit) {
      return true;
    }
    if (holdoutStart || datasetMaxDate) {
      if (!holdoutStart && !datasetMaxDate && disabledAdd()) {
        return true;
      }
      if (showHoldout && holdoutStart && disabledAdd()) {
        return true;
      }
      if (
        form.getFieldValue('payload') &&
        form.getFieldValue('payload').length >= 20
      ) {
        return true;
      }
      return false;
    }
    return false;
  };

  const pickerValidateError = (type, holdDate, index) => {
    switch (type) {
      case 'primaryDate':
        if (
          form.getFieldValue('payload')[index] &&
          form.getFieldValue('payload')[index].primaryDate &&
          moment(holdDate).isBefore(
            form.getFieldValue('payload')[index].primaryDate[1],
          )
        ) {
          return true;
        }
        return false;

      case 'validationDate':
        if (
          form.getFieldValue('payload')[index] &&
          form.getFieldValue('payload')[index].validationDate &&
          moment(holdDate)
            // .add(1, 'days')
            .isBefore(form.getFieldValue('payload')[index].validationDate[1])
        ) {
          if (
            moment(holdDate).isSame(
              form.getFieldValue('payload')[index].validationDate[1],
              'day',
            )
          ) {
            return false;
          }
          return true;
        }
        return false;
      default:
        return false;
    }
  };

  return (
    <Style.DataRobotScroll className="node-wrapper">
      <Spin spinning={maxDateLoading}>
        <Form
          data-test="formValueChange"
          form={form}
          onValuesChange={hangeValueChange}
          className="node-wrapper"
          scrollToFirstError
          //   initialValues={{
          //     payload: [
          //       {
          //         primaryDate: [null, null],
          //         validationDate: [null, null],
          //       },
          //     ], // 預設帶一筆
          //   }}
          //   initialValues={{
          //     payload: [{}], // 預設帶一筆
          //   }}
        >
          <Form.Item
            label="DataRobot Target"
            name="target"
            rules={[{ required: true, message: 'Please select a Target' }]}
          >
            <Select disabled={!nodeData.edit}>
              {dataRobotTarget &&
                dataRobotTarget.schema.map(o => (
                  <Select.Option key={o.name} value={o.name}>
                    {o.name}({o.type})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Datetime Partition Column"
            name="datetimeColumn"
            rules={[
              { required: true, message: 'Please select a Datetime Column' },
            ]}
          >
            <Select disabled={!nodeData.edit}>
              {dataRobotTarget &&
                dataRobotTarget.schema
                  .filter(s => dataType.includes(s.type))
                  .map(o => (
                    <Select.Option key={o.name} value={o.name}>
                      {o.name}({o.type})
                    </Select.Option>
                  ))}
            </Select>
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Series Identifier"
            name="seriesIdentifiers"
            tooltip={{
              title:
                'If the selected date/time feature in Datetime Partition Column has multiple rows with the same timestamp, you can identify a series identifier to keep date/time feature of each series unique and regular.',
              icon: <InfoCircleOutlined />,
            }}
          >
            <Select
              mode="multiple"
              allowClear
              disabled={
                !nodeData.edit ||
                // !(form.getFieldValue('datetimeColumn') !== undefined)
                !showSeries
              }
            >
              {dataRobotTarget &&
                dataRobotTarget.schema
                  .filter(
                    s =>
                      s.name !== form.getFieldValue('datetimeColumn') &&
                      s.name !== form.getFieldValue('target'),
                  )
                  .map(o => (
                    <Select.Option key={o.name} value={o.name}>
                      {o.name}({o.type})
                    </Select.Option>
                  ))}
            </Select>
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Consider Blenders In Recommendation"
            name="recommendation"
            valuePropName="checked"
          >
            <Switch
              disabled={!nodeData.edit}
              defaultChecked
              style={{ width: '10%' }}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Feature Derivation Window Start"
            name="featureStart"
            rules={[
              {
                required: true,
                message: 'Please Input a Feature Derivation Start',
              },
            ]}
            tooltip={{
              title: (
                <span>
                  Time series models derive lag features and statistics using a
                  rolling window (the Feature Derivation Window) relative to a
                  forecast point (<i>i.e.</i>, the time from which DataRobot
                  forecasts).
                </span>
              ),
              icon: <InfoCircleOutlined />,
            }}
            extra="A negative integer smaller than Feature Derivation Window End"
          >
            <InputNumber disabled={!nodeData.edit} max={-1} defaultValue={-1} />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Feature Derivation Window End"
            name="featureEnd"
            rules={[
              {
                required: true,
                message: 'Please Input a Feature Derivation End',
              },
            ]}
            extra="An integer with 0 maximum, which is recommended to be as close to the forecast point as possible"
          >
            {/* 需大於Feature Derivation Start */}
            <InputNumber
              disabled={!nodeData.edit}
              min={featureEndMin}
              max={0}
              defaultValue={0}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Forecast Window Start"
            name="forecastStart"
            rules={[
              { required: true, message: 'Please Input a Forecast Start' },
            ]}
            extra="A positive integer, which indicates the distance from the forecast point"
            tooltip={{
              title:
                'The Forecast Window defines the distance into the future (relative to the forecast point) that the model will be trained to predict',
              icon: <InfoCircleOutlined />,
            }}
          >
            <InputNumber disabled={!nodeData.edit} min={1} defaultValue={1} />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Forecast Window End"
            name="forecastEnd"
            rules={[{ required: true, message: 'Please Input a Forecast End' }]}
            extra="A positive integer larger than Forecast Window Start"
          >
            <InputNumber
              disabled={!nodeData.edit}
              min={forecastEndMin}
              defaultValue={2}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Worker Count"
            name="workerCount"
            extra="Range:1~20"
          >
            <InputNumber
              disabled={!nodeData.edit}
              min={1}
              max={20}
              defaultValue={1}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Enable Holdout"
            name="enableHoldout"
            valuePropName="checked"
          >
            <Switch
              disabled={!nodeData.edit}
              defaultChecked
              style={{ width: '10%' }}
            />
          </Form.Item>
          {showHoldout ? (
            <Form.Item
              style={{ padding: '12px 24px' }}
              label="Holdout Date"
              name="holdoutDate"
              rules={[
                {
                  required: true,
                  message: 'Please select a holdout date',
                },
              ]}
              validateStatus={
                form.getFieldValue('holdoutDate') &&
                form.getFieldValue('holdoutDate').length === 2 &&
                form.getFieldValue('holdoutDate')[1]
                  ? null
                  : 'error'
              }
              help={
                form.getFieldValue('holdoutDate') &&
                form.getFieldValue('holdoutDate').length === 2 &&
                form.getFieldValue('holdoutDate')[1]
                  ? null
                  : 'Please select a holdout date'
              }
              extra="Select the Holdout Date before setting the backtest configuration"
              tooltip={{
                title:
                  'The training set for the holdout requires at least 20 rows. To increase the number of rows, try reducing the size of the feature derivation window or the forecast window. Alternatively, you can modify the validation or gap length.',
                icon: <InfoCircleOutlined />,
              }}
            >
              <RangePicker
                data-test="rangePickerHoldDateChange"
                allowClear={false}
                renderExtraFooter={() =>
                  // `Last Dataset Date :${holdoutStart || datasetMaxDate}`
                  holdoutStart ? `Last Dataset Date :${holdoutStart}` : null
                }
                format={DATEFORMAT}
                onChange={handleHoldoutDate}
                disabled={
                  // !nodeData.edit || !datasetMaxDate
                  //     ? [true, true]
                  //     : [false, true]
                  !nodeData.edit ? [true, true] : [false, false]
                }
                defaultValue={
                  datasetMaxDate
                    ? [null, moment(datasetMaxDate, DATE_TYPE.DATE)]
                    : null
                }
              />
            </Form.Item>
          ) : null}
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Number of Backtests (20 maximum)"
            name="backTestNum"
          >
            <Input disabled />
          </Form.Item>
          {/* 
            Disable_Hold=true => 用holdoutStart判斷,hold out end date = datasetMaxDate
            Disable_Hold=false =>用 datasetMaxDate 判斷
          */}
          <Form.List name="payload">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, fIdx) => (
                  <div className="blockDashed">
                    <Space
                      size={0}
                      key={field.key}
                      align="center"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'revert',
                        width: '70vh',
                      }}
                    >
                      <Style.TableBlock>
                        <Form.Item
                          {...field}
                          label="Validation Date"
                          name={[field.name, 'validationDate']}
                          fieldKey={[field.fieldKey, 'validationDate']}
                          rules={[
                            {
                              required: true,
                              message: 'Select a validation date range',
                            },
                          ]}
                          style={{
                            width: '90%',
                          }}
                          validateStatus={
                            holdoutStart &&
                            pickerValidateError(
                              'validationDate',
                              holdoutStart,
                              fIdx,
                            )
                              ? 'error'
                              : null
                          }
                          help={
                            holdoutStart &&
                            pickerValidateError(
                              'validationDate',
                              holdoutStart,
                              fIdx,
                            )
                              ? 'Validation Date cannot overlap with Holdout Date.'
                              : null
                          }
                        >
                          <RangePicker
                            renderExtraFooter={() =>
                              `Last Dataset Date :${
                                holdoutStart || datasetMaxDate
                              }`
                            }
                            format={DATEFORMAT}
                            disabled={!nodeData.edit}
                            // disabled={
                            //   !nodeData.edit ||
                            //   form.getFieldValue([
                            //     'payload',
                            //     field.name,
                            //     'primaryDate',
                            //   ]) === undefined
                            // }

                            disabledDate={current =>
                              holdoutStart || datasetMaxDate
                                ? validationDisabledDate(current)
                                : undefined
                            }
                            onChange={(value, dateString) =>
                              handleChange(
                                value,
                                dateString,
                                'validation',
                                fIdx,
                              )
                            }
                          />
                        </Form.Item>
                        {nodeData.edit &&
                          form.getFieldValue('payload') &&
                          form.getFieldValue('payload').length > 1 && (
                            <Form.Item style={{ width: '10%' }}>
                              <MinusCircleOutlined
                                data-test="delbutton"
                                onClick={() => {
                                  remove(field.name);
                                }}
                                disabled={!nodeData.edit}
                              />
                            </Form.Item>
                          )}
                      </Style.TableBlock>

                      <Style.TableBlock>
                        <Form.Item
                          {...field}
                          label="Training Date"
                          name={[field.name, 'primaryDate']}
                          fieldKey={[field.fieldKey, 'primaryDate']}
                          rules={[
                            {
                              required: true,
                              message: 'Select a primary training date range',
                            },
                          ]}
                          validateStatus={
                            holdoutStart &&
                            pickerValidateError(
                              'primaryDate',
                              holdoutStart,
                              fIdx,
                            )
                              ? 'error'
                              : null
                          }
                          help={
                            holdoutStart &&
                            pickerValidateError(
                              'primaryDate',
                              holdoutStart,
                              fIdx,
                            )
                              ? 'Training Date cannot overlap with Holdout Date.'
                              : null
                          }
                          style={{
                            width: '90%',
                          }}
                        >
                          <RangePicker
                            data-test="rangePickerValueChange"
                            renderExtraFooter={() =>
                              `Last Dataset Date :${
                                holdoutStart || datasetMaxDate
                              }`
                            }
                            format={DATEFORMAT}
                            disabledDate={current =>
                              primaryDisabledDate(current, fIdx)
                            }
                            // disabledDate={
                            //   holdoutStart || datasetMaxDate
                            //     ? primaryDisabledDate
                            //     : undefined
                            // }
                            // disabled={!nodeData.edit}
                            disabled={
                              !nodeData.edit ||
                              form.getFieldValue([
                                'payload',
                                field.name,
                                'validationDate',
                              ]) === undefined
                            }
                            onChange={(value, dateString) =>
                              handleChange(value, dateString, 'primary', fIdx)
                            }
                          />
                        </Form.Item>
                      </Style.TableBlock>
                    </Space>
                  </div>
                ))}
                <Button
                  type="dashed"
                  data-test="addBtn"
                  style={{ width: '70.5vh', margin: '0 0 0 15px' }}
                  onClick={() => {
                    add();
                  }}
                  block
                  icon={<PlusOutlined />}
                  disabled={handleDisableAdd()}
                >
                  Add Backtest
                </Button>
              </>
            )}
          </Form.List>
          {/* ) : null} */}
        </Form>
      </Spin>
    </Style.DataRobotScroll>
  );
};

export default DataRobotAutoTS;
