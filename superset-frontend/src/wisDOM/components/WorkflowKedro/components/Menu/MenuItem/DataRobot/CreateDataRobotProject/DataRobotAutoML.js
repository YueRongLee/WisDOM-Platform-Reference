/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Spin, Select, Form, Switch, InputNumber } from 'antd';
// import { InfoCircleOutlined } from '@ant-design/icons';
// import { WorkFlowApi } from '~~apis/';
// import { useQuery } from '~~hooks/';
import { FUNCTIONS } from '~~constants/index';
import * as Style from '../style';

const DataRobotAutoML = ({ nodeData, data, dataRobotTarget }) => {
  const [partitionSetting, setPartitionSetting] = useState();
  const [form] = Form.useForm();

  useEffect(() => {
    if (nodeData && data) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const setNewArg = nodeFilter[0].args;

      setNewArg.dataRobotType = 'dataRobotAutoML';
      setNewArg.triggerAutoML = true;

      if (setNewArg.autoMLData === undefined) {
        setNewArg.autoMLData = {
          recommendation: true,
          holdoutPercentage: 20,
          reps: 5,
          validationPCT: 19,
          workerCount: 1,
        };
      } else {
        form.setFieldsValue({
          target: setNewArg.autoMLData.target,
          recommendation: setNewArg.autoMLData.recommendation,
          holdoutPercentage: setNewArg.autoMLData.holdoutPercentage,
          partition: setNewArg.autoMLData.partition,
          reps: setNewArg.autoMLData.reps,
          validationPCT: setNewArg.autoMLData.validationPCT,
          workerCount: setNewArg.autoMLData.workerCount,
        });

        if (setNewArg.autoMLData.partition) {
          setPartitionSetting(setNewArg.autoMLData.partition);
        }
      }
    }
  }, []);

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;

    switch (changeKey) {
      case 'target':
        setNewArg.autoMLData.target = changeValues;
        break;
      case 'recommendation':
        setNewArg.autoMLData.recommendation = changeValues;
        break;
      case 'holdoutPercentage':
        setNewArg.autoMLData.holdoutPercentage = changeValues;
        break;
      case 'partition':
        setPartitionSetting(changeValues);
        setNewArg.autoMLData.partition = changeValues;
        break;
      case 'reps':
        setNewArg.autoMLData.reps = changeValues;
        break;
      case 'validationPCT':
        setNewArg.autoMLData.validationPCT = changeValues;
        break;
      case 'workerCount':
        setNewArg.autoMLData.workerCount = changeValues;
        break;
      default:
        break;
    }
  };

  return (
    <Style.DataRobotScroll className="node-wrapper">
      <Spin spinning={false}>
        <Form
          data-test="formValueChange"
          form={form}
          onValuesChange={hangeValueChange}
          className="node-wrapper"
        >
          <Form.Item
            label="Target"
            name="target"
            rules={[{ required: false, message: 'Please select a Target' }]}
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
          {/* <Style.FormItem
            label="Mertic"
            name="mertic"
            rules={[{ required: true, message: 'Please select a mertic' }]}
          >
            <Select />
          </Style.FormItem> */}
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Consider Blenders In Recommendation"
            name="recommendation"
          >
            <Switch
              disabled={!nodeData.edit}
              defaultChecked
              style={{ width: '10%' }}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Holdout Percentage"
            name="holdoutPercentage"
            rules={[
              { required: true, message: 'Please select a Holdout percentage' },
            ]}
            extra="The percentage of data allocated to the holdout set -- must be between 0% - 80%"
          >
            <InputNumber
              disabled={!nodeData.edit}
              min={0}
              max={80}
              defaultValue={20}
            />
          </Form.Item>
          <Form.Item
            style={{ padding: '12px 24px' }}
            label="Partition Method"
            name="partition"
            rules={[{ required: true, message: 'Please select a partition' }]}
          >
            <Select placeholder="partition" disabled={!nodeData.edit}>
              <Select.Option key="randomCV" value="RandomCV">
                Random Partition with Cross-Validation (RandomCV)
              </Select.Option>
              <Select.Option key="randomTVH" value="RandomTVH">
                Random Partition with Train-Validation-Holdout (RandomTVH)
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="REPS"
            name="reps"
            rules={[{ required: true, message: 'Please Input a REPS' }]}
            extra="The number of CV folds defined between 2-50"
            style={
              partitionSetting && partitionSetting === 'RandomCV'
                ? { padding: '12px 24px' }
                : { padding: '12px 24px', display: 'none' }
            }
          >
            <InputNumber
              disabled={!nodeData.edit}
              min={2}
              max={50}
              defaultValue={5}
            />
          </Form.Item>
          <Form.Item
            label="Validation Percentage"
            name="validationPCT"
            rules={[
              {
                required: true,
                message: 'Please Input a Validation Percentage',
              },
            ]}
            extra="The percentage of data allocated to the validation set -- must be between 19% - 99%"
            style={
              partitionSetting && partitionSetting === 'RandomTVH'
                ? { padding: '12px 24px' }
                : { padding: '12px 24px', display: 'none' }
            }
          >
            <InputNumber
              disabled={!nodeData.edit}
              min={19}
              max={99}
              defaultValue={19}
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
        </Form>
      </Spin>
    </Style.DataRobotScroll>
  );
};

export default DataRobotAutoML;
