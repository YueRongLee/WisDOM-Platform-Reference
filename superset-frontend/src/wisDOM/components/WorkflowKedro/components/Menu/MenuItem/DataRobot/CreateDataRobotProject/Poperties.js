/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports
import { EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Form, Input, Spin, Select, Button, Switch } from 'antd';
import PreviewModal from '../../../../PreviewModal/PreviewModal';
import { DataFlowApi, DataRobotApi } from '~~apis/';
import { FUNCTIONS, TABLE_NAME_RULES } from '~~constants/index';
import { useModal, useQuery } from '~~hooks/';
import * as Style from '../style';

const dataType = ['dateTime', 'timestamp', 'date', 'dateTimeOffset'];

const Poperties = ({
  data,
  nodeData,
  menuLoading,
  setData,
  setFocusNode,
  setSelectFinish,
  setNodeChange,
  dataflowLoading,
  dataflowList,
  openModal,
  closeModal,
  setOutputType,
  setDataRobotTarget,
  dataRobotTarget,
}) => {
  const [targetList, setTargetList] = useState();
  const [targetLoading, setTargetLoading] = useState(false);
  const [accountList, setAccountList] = useState();
  const [accountLoading, setAccountLoading] = useState(false);
  const [showAutoTS, setShowAutoTS] = useState(false);
  const [form] = Form.useForm();
  const previewModal = useModal();
  const getAccount = useQuery(DataRobotApi.getAccountList);

  const getValuebyKey = (list, key) => {
    if (key !== undefined || key !== '') {
      const ary = list.find(d => d.key === key);
      if (ary !== undefined) {
        return list.find(d => d.key === key).value;
      }
      return '';
    }
    return '';
  };

  const getAccountList = async () => {
    try {
      setAccountLoading(true);
      const result = await getAccount.exec();
      setAccountList(result);
    } catch (e) {
      console.log(e);
    } finally {
      setAccountLoading(false);
    }
  };

  const handleSwitch = (check, dataList) => {
    // true: show page AutoML Properties
    // true: setOutputType(AutoML)

    if (check === true) {
      setOutputType('dataRobotAutoML');

      const hasDate =
        (dataRobotTarget &&
          dataRobotTarget.schema.filter(s => dataType.includes(s.type))) ||
        (dataList && dataList.schema.filter(s => dataType.includes(s.type)));

      if (hasDate && hasDate.length > 0) {
        setShowAutoTS(true);
      } else {
        setShowAutoTS(false);
      }
    } else {
      setOutputType();
      setShowAutoTS(false); // 不顯示
      form.setFieldsValue({
        triggerTimeSeries: false,
      });
    }
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      const setNewArg = nodeFilter[0].args;
      setNewArg.triggerAutoML = check;
      if (check === true) {
        setNewArg.dataRobotType = 'dataRobotAutoML';
        if (setNewArg.triggerTimeSeries === true) {
          setNewArg.dataRobotType = 'dataRobotAutoTS';
        }
      } else {
        setNewArg.dataRobotType = undefined;
        setNewArg.triggerTimeSeries = false;
      }
    }
  };

  const getTarget = async (dataflowId, targetArg) => {
    try {
      setTargetLoading(true);
      const result = await DataFlowApi.getTargetNode(dataflowId);
      const cols = result.map(e => ({
        // key: e.id,
        // value: e.id,
        key: e.full_name,
        value: e.full_name,
        label: e.full_name,
        schema: e.schema,
      }));

      if (targetArg && targetArg[0]) {
        setDataRobotTarget(cols.filter(e => e.key === targetArg[0])[0]);
        const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

        handleSwitch(
          nodeFilter[0].args.triggerAutoML,
          cols.filter(e => e.key === targetArg[0])[0],
        );

        if (nodeFilter[0].args.triggerTimeSeries === true) {
          setOutputType('dataRobotAutoTS');
        }
      }

      setTargetList(cols);

      if (targetArg) {
        form.setFieldsValue({
          target: targetArg,
        });
      }
    } catch (e) {
      console.log(e);
      setTargetList();
    } finally {
      setTargetLoading(false);
    }
  };

  const handleSwitchTime = check => {
    // false: show page AutoML Properties
    // true: AutoML 改為 AutoTS Properties

    if (check) {
      setOutputType('dataRobotAutoTS');
    } else if (showAutoTS) {
      setOutputType('dataRobotAutoML');
    } else {
      setOutputType();
    }

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      const setNewArg = nodeFilter[0].args;
      setNewArg.triggerTimeSeries = check;
      if (check === true) {
        setNewArg.dataRobotType = 'dataRobotAutoTS';
      } else if (showAutoTS) {
        setNewArg.dataRobotType = 'dataRobotAutoML';
      } else {
        setNewArg.dataRobotType = undefined;
      }
    }
  };

  useEffect(() => {
    if (nodeData.id !== undefined && nodeData.id !== null) {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (nodeFilter !== undefined && nodeFilter[0].args !== undefined) {
        form.setFieldsValue({
          projectName: nodeFilter[0].args.projectName,
          share: nodeFilter[0].args.shareUser,
        });

        const targetAry = nodeFilter[0].args.targetList;

        if (nodeFilter[0].args.dataflowId !== undefined) {
          const flowId = nodeFilter[0].args.dataflowId;
          form.setFieldsValue({
            dataflow: getValuebyKey(dataflowList, flowId),
          });
          getTarget(flowId, targetAry);
        }

        nodeFilter[0].args.triggerAutoML =
          nodeFilter[0].args.triggerAutoML || false;

        nodeFilter[0].args.triggerTimeSeries =
          nodeFilter[0].args.triggerTimeSeries || false;

        form.setFieldsValue({
          triggerAutoML: nodeFilter[0].args.triggerAutoML,
        });
        form.setFieldsValue({
          triggerTimeSeries: nodeFilter[0].args.triggerTimeSeries,
        });

        if (nodeFilter[0].args.triggerAutoML === true) {
          nodeFilter[0].args.dataRobotType = 'dataRobotAutoML';
          if (nodeFilter[0].args.triggerTimeSeries === true) {
            nodeFilter[0].args.dataRobotType = 'dataRobotAutoTS';
          }
        }
        // handleSwitch(nodeFilter[0].args.triggerAutoML);

        // if (nodeFilter[0].args.triggerTimeSeries === true) {
        //   setOutputType('dataRobotAutoTS');
        // }
      }

      getAccountList();
    }
  }, []);

  const handleSetDataArg = async setNewArg => {
    if (setNewArg !== undefined) {
      const newArg = setNewArg;

      setSelectFinish(false);
      const index = data.nodes.findIndex(e => e.id === nodeData.id);
      const getArgNode = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      const newData = FUNCTIONS.SET_DATA(
        data,
        nodeData,
        index,
        nodeData.id,
        getArgNode[0],
        newArg,
        data.edges,
      );

      setData(newData);

      setFocusNode({
        full_name: nodeData.name,
        name: FUNCTIONS.NODE_NAME(nodeData.name),
        id: nodeData.id,
        type: nodeData.type,
      });
    }
  };

  const handlePreview = async () => {
    try {
      const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
      if (nodeFilter && nodeFilter[0] && nodeFilter[0].args) {
        const seqId = nodeFilter[0].args.dataflowId;
        const result = await DataFlowApi.getDataFlowDetail(seqId);
        openModal();
        previewModal.openModal({
          diagram: JSON.parse(result.diagram),
          seqId,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const clearTarget = () => {
    setTargetList();
    form.setFieldsValue({
      target: [],
    });
  };

  const checkNodeStatus = () => {
    let check;
    let change = false;
    const projectName = form.getFieldValue('projectName');
    const dataflowId = form.getFieldValue('dataflow');
    const targetList = form.getFieldValue('target');
    const shareUser = form.getFieldValue('share');
    if (projectName || targetList || dataflowId || shareUser) {
      if (
        projectName &&
        targetList &&
        targetList.length > 0 &&
        dataflowId &&
        dataflowId !== undefined &&
        shareUser &&
        shareUser.length > 0
      ) {
        check = undefined;
      } else {
        check = 'error';
      }
    }
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);

    if (nodeFilter.length > 0) {
      if (nodeFilter[0].check === undefined && check === 'error') {
        nodeFilter[0].check = 'error';
        change = true;
      } else if (nodeFilter[0].check === 'error' && check === undefined) {
        nodeFilter[0].check = undefined;
        change = true;
      }
    }

    if (change === true) {
      setNodeChange(nodeFilter[0]);
    }
  };

  const hangeValueChange = changeValue => {
    const changeKey = Object.keys(changeValue)[0];
    const changeValues = Object.values(changeValue)[0];
    let setChange = false;
    let flowId = '';

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }

      const setNewArg = nodeFilter[0].args;

      if (setNewArg.length !== 0) {
        switch (changeKey) {
          case 'dataflow':
            flowId = dataflowList.find(e => e.value === changeValues).key;
            setNewArg.dataflowId = flowId;
            setChange = true;
            clearTarget();
            getTarget(flowId);
            break;
          case 'target':
            setNewArg.targetList = [changeValues]; // 已改成單選,但後端仍使用array
            break;
          case 'share':
            setNewArg.shareUser = changeValues;
            break;
          default:
            break;
        }

        if (setChange === true) {
          handleSetDataArg(setNewArg);
          setChange = false;
        }

        if (changeKey !== 'projectName') {
          checkNodeStatus();
        }
      }
    }
  };

  const onBlurProjectName = name => {
    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    if (nodeFilter !== undefined) {
      if (nodeFilter[0].args === undefined) {
        nodeFilter[0].args = '';
      }
      const setNewArg = nodeFilter[0].args;
      setNewArg.projectName = name;
      checkNodeStatus();
    }
  };

  const handleSelectTarget = (value, option) => {
    if (value) {
      setDataRobotTarget(option);
    } else {
      setDataRobotTarget();
    }

    const filter =
      option.schema && option.schema.filter(e => dataType.includes(e.type));

    const nodeFilter = FUNCTIONS.GET_NODE_DETAIL(data, nodeData.id);
    const setNewArg = nodeFilter[0].args;

    const isML = form.getFieldValue('triggerAutoML');
    if (filter && filter.length > 0) {
      if (isML === true && showAutoTS === false) {
        setShowAutoTS(true);
      } else if (!isML && showAutoTS === true) {
        setShowAutoTS(false);
        form.setFieldsValue({ triggerTimeSeries: false });
        setNewArg.triggerTimeSeries = false;
      }
    } else {
      if (isML === true) {
        setOutputType('dataRobotAutoML');
      }
      setShowAutoTS(false);
      form.setFieldsValue({ triggerTimeSeries: false });
      setNewArg.triggerTimeSeries = false;
    }
  };

  return (
    <Style.DataRobotScroll>
      <Spin spinning={menuLoading}>
        <Form
          data-test="formValueChange"
          form={form}
          onValuesChange={hangeValueChange}
          className="node-wrapper"
        >
          <Style.FormItem
            label="DataRobot Project Name"
            name="projectName"
            tooltip={{
              title:
                'It will create a new project when you change project name.',
              icon: <InfoCircleOutlined />,
            }}
            rules={[
              { required: true, message: 'Please input a Project Name.' },
              {
                pattern: TABLE_NAME_RULES.pattern,
                message:
                  'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
              },
            ]}
          >
            <Input
              data-test="projectNameInput"
              placeholder="DataRobot Project Name"
              disabled={!nodeData.edit}
              onBlur={e => onBlurProjectName(e.target.value)}
            />
          </Style.FormItem>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Style.FormItem
              label="Dataflow"
              name="dataflow"
              style={{ marginBottom: '6px' }}
              rules={[
                { required: true, message: 'Please input a Project Name.' },
              ]}
            >
              <Select
                placeholder="Please select a Dataflow"
                disabled={dataflowLoading || !nodeData.edit}
                style={{ width: 210 }}
                showSearch
              >
                {dataflowList &&
                  dataflowList.map(d => (
                    <Select.Option key={d.key} value={d.value}>
                      {d.value}
                    </Select.Option>
                  ))}
              </Select>
            </Style.FormItem>
            <Button
              data-test="previewBtn"
              style={{ width: 100 }}
              onClick={() => handlePreview()}
              disabled={
                dataflowLoading ||
                !nodeData.edit ||
                form.getFieldValue('dataflow') === undefined
              }
            >
              <EyeOutlined />
              Preview
            </Button>
            <PreviewModal modal={previewModal} close={closeModal} />
          </div>
          <Style.FormItem
            label="Target List"
            name="target"
            rules={[{ required: true, message: 'Please select a Target' }]}
          >
            <Select
              disabled={
                dataflowLoading ||
                targetLoading ||
                !nodeData.edit ||
                form.getFieldValue('dataflow') === undefined
              }
              loading={targetLoading}
              // mode="multiple"
              onChange={handleSelectTarget}
              options={targetList}
              allowClear
            />
          </Style.FormItem>
          <Style.FormItem
            label="Share this project with another DataRobot user"
            name="share"
            rules={[{ required: true, message: 'Please select an user' }]}
          >
            <Select
              placeholder="Please select an user"
              disabled={!nodeData.edit || accountLoading}
              loading={accountLoading}
              mode="multiple"
              allowClear
            >
              {accountList &&
                accountList.map(e => (
                  <Select.Option key={e} value={e}>
                    {e}
                  </Select.Option>
                ))}
            </Select>
          </Style.FormItem>

          <Style.FormItemSwitch
            name="triggerAutoML"
            label="Trigger AutoML/AutoTS from WisDOM"
            valuePropName="checked"
          >
            <Switch
              onChange={handleSwitch}
              disabled={
                !nodeData.edit || form.getFieldValue('target') === undefined
              }
            />
          </Style.FormItemSwitch>

          {showAutoTS ? (
            <>
              <Style.FormItemSwitch
                name="triggerTimeSeries"
                valuePropName="checked"
                label="WisDOM has detected time feature in your targets.Would youlike to use time series modeling?"
              >
                <Switch disabled={!nodeData.edit} onChange={handleSwitchTime} />
              </Style.FormItemSwitch>
            </>
          ) : null}
        </Form>
      </Spin>
    </Style.DataRobotScroll>
  );
};

export default Poperties;
