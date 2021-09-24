/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-imports */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { Form, Spin, Input, Select, Button, message } from 'antd';
import WorkflowKedro from '../../../wisDOM/components/WorkflowKedro/WorkflowKedro';
import { useModal, useQuery } from '~~hooks/';
import {
  PREVIEW_STATUS,
  GROUP_TYPE,
  INPUT_RULES,
  TABLE_NAME_RULES,
} from '~~constants/index';
import { WorkFlowApi } from '~~apis/';
import './WorkflowETLDetailStyle.less';
import CustomCronModal from '../../../wisDOM/components/CronModal/CustomCronModal';

const INIT_VALUE = {
  diagram: undefined,
  seqId: undefined,
  projectName: undefined,
  groupId: undefined,
  schedule: undefined,
};

const INIT_NODE = {
  edges: [],
  nodes: [
    {
      id: 'Trigger',
      full_name: 'Schedule_full_name',
      name: 'Schedule_f...',
      type: 'Trigger',
      edit: false,
      args: {
        type: 'trigger',
        name: 'schedule_trigger_1',
        cron: '',
        classification: 'schedule',
      },
    },
  ],
};

const { Option } = Select;

const WorkflowETLDetail = ({
  curr,
  groupId,
  groupList,
  selfGroupObject,
  fourceUpdate,
  setCurr,
  isCreateNewWork,
  setCreateNewWork,
}) => {
  const [form] = Form.useForm();
  const [detailData, setDetailData] = useState({ ...INIT_VALUE });
  const [isLoading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [save, setSave] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [diagram, setDataDiagram] = useState('');
  const [getSeqId, setSeqId] = useState();
  const [cronValue, setCronValue] = useState(''); //  for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  const [selectGroupId, setSelectGroupId] = useState();
  const [saveCronValue, setSaveCronValue] = useState('');
  const [resetShowData, setResetShowData] = useState(false);
  const saveWorkFlow = useQuery(WorkFlowApi.saveWorkFlow);
  const cronPopupModal = useModal();

  const initialData = () => {
    setDetailData({ ...detailData, diagram: INIT_NODE });
    setResetShowData(true);
  };

  useEffect(() => {
    if (curr === 'new') {
      initialData();
    }
  }, [curr]);

  useEffect(() => {
    if (isCreateNewWork) {
      form.setFieldsValue({
        projectName: '',
      });
    }
  }, [isCreateNewWork]);

  const dataRobotCheck = createDRNodes => {
    let check = false;
    createDRNodes.forEach(e => {
      if (e.check === 'error') {
        check = true;
      }
    });

    return check;
  };

  const insertDataError = filterNodes => {
    let totalStatus = false;
    const targetList = filterNodes.map(e => e.args.targetMapping);

    if (targetList) {
      targetList.forEach(e => {
        const checkboxList = e.map(a => a.checkbox);
        const noRepeat = [...new Set(checkboxList)];
        if (noRepeat.length === 1 && noRepeat[0] !== true) {
          totalStatus = true;
        }
      });
    }

    return totalStatus;
  };

  const onClickSave = async () => {
    diagram.nodes.forEach(e => {
      if (e.args.targetMapping) {
        e.args.targetMapping.forEach(a => {
          if (a.checkbox !== true) {
            a.checkbox = false;
          }
        });
      }
    });
    const filter = diagram.nodes.filter(
      e => e.args.targetMapping !== undefined,
    );

    const filterCreateDataRobot = diagram.nodes.filter(
      e => e.args.classification === 'createDataRobotProject',
    );

    const errorAry = filter.map(e =>
      e.args.targetMapping.find(
        e =>
          e.duplicateStatus === 'error' ||
          e.duplicateStatus === 'sameError' ||
          e.duplicateStatus === 'ruleError',
      ),
    );

    if (errorAry[0] !== undefined) {
      message.error(
        'There is a error in InsertData : Table Name , Please Check !',
      );
    } else if (
      filterCreateDataRobot.length > 0 &&
      dataRobotCheck(filterCreateDataRobot)
    ) {
      message.error(
        'Some properies is null or error in Create a Project on DataRobot Prediction , please check it !',
      );
    } else if (filter && insertDataError(filter)) {
      message.error(
        'No TableName checkbox selected for output in InsertData/DataRobot Prediction , please check it !',
      );
    } else {
      setSaveLoading(true);
      const sendData = {
        projectName: form.getFieldValue().projectName,
        groupId: selectGroupId === undefined ? groupId : selectGroupId,
        diagram,
      };
      try {
        if (getSeqId === undefined) {
          const seqId = await saveWorkFlow.exec(sendData);
          setSeqId(seqId);
          message.success('This Workflow save successfully');
          setSave(true);
          fourceUpdate();
          setCurr(seqId);
        } else {
          const seqId = await saveWorkFlow.exec({
            ...sendData,
            seqId: getSeqId,
          });
          setSeqId(seqId);
          fourceUpdate();
        }
      } catch (e) {
        console.log(e);
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const getSelectGroup = value => {
    if (groupList !== undefined) {
      const key = groupList.find(e => e.groupName === value).groupId;
      setSelectGroupId(key);
      setResetShowData(true);
    }
  };

  const handleBeforeLeave = () => {
    setCronValue('');
    setGetUIValue('');
    setSaveCronValue('');
    cronPopupModal.closeModal();
  };

  const handleOK = () => {
    setCronLoading(true);
    if (
      cronValue !== '' &&
      cronValue !== undefined &&
      getUIValue !== undefined
    ) {
      setSaveCronValue(cronValue);
      handleBeforeLeave();
    } else if (getUIValue !== undefined) handleBeforeLeave();
    else {
      message.error('Check your select !');
    }
    setCronLoading(false);
  };

  const handleValidate = () => {
    form
      .validateFields()
      .then()
      .catch(info => {
        if (info.values.projectName !== undefined) {
          form.setFieldsValue({ projectName: '' });
        }
      });
  };

  return (
    <div className="flowDetail">
      <Spin spinning={isLoading || saveLoading}>
        <Form
          form={form}
          initialValues={{
            groupName: selfGroupObject.groupName,
          }}
          onFinish={onClickSave}
        >
          <div className="flowHeader">
            <div>
              <div className="title">
                {/* <div style={{ marginRight: 10, width: 120 }}>
                  Workflow Name :{' '}
                </div> */}
                <Form.Item
                  label="Workflow Name"
                  name="projectName"
                  rules={[
                    { required: true, message: 'Please input Workflow name!' },
                    {
                      pattern: TABLE_NAME_RULES.pattern,
                      message:
                        'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                    },
                  ]}
                >
                  {/* {curr === 'new' ? ( */}
                  <Input
                    style={{ width: 200 }}
                    placeholder="Workflow name"
                    maxLength={INPUT_RULES.PROJECT_NAME.value}
                    onChange={e =>
                      setDetailData({
                        ...detailData,
                        projectName: e.target.value,
                      })
                    }
                    onBlur={() => handleValidate()}
                  />
                  {/* } */}
                </Form.Item>
              </div>
              <div className="flowInfo-detail-container">
                {/* <div style={{ marginRight: 10, width: 120 }}>GroupName : </div> */}
                <Form.Item label="Group Name" name="groupName">
                  <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a group"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={getSelectGroup}
                  >
                    {groupList &&
                      groupList.map(group => (
                        <Select.Option
                          key={group.groupId}
                          value={group.groupName}
                        >
                          {group.groupName}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
            <Button
              style={{ marginTop: '10px' }}
              type="primary"
              onClick={form.submit} // form.submit
            >
              Save
            </Button>
          </div>
          <div className="flowContent">
            {detailData.diagram !== undefined ? (
              <>
                <WorkflowKedro
                  oEntity={detailData.diagram}
                  dataFlowChangedGroupId={
                    selectGroupId === undefined ? groupId : selectGroupId
                  }
                  edit
                  setDiagram={setDataDiagram}
                  sqlID={detailData.seqId}
                  setResetShowData={setResetShowData}
                  resetShowData={resetShowData}
                  historyMode={false}
                  save={save}
                  setSave={setSave}
                  selectGroupId={selectGroupId}
                  setCreateNewWork={setCreateNewWork}
                  isCreateNewWork={isCreateNewWork}
                />
              </>
            ) : null}
          </div>
        </Form>
      </Spin>
      <CustomCronModal
        modal={cronPopupModal}
        loading={cronLoading}
        handleOK={handleOK}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
      />
    </div>
  );
};

export default WorkflowETLDetail;
