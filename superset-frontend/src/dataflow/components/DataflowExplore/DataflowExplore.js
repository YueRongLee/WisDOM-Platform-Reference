/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Select, message, Spin, Switch } from 'antd';
// import { ExclamationCircleOutlined } from '@ant-design/icons';
import { tableDataformat } from '../../../wisDOM/components/SqlKedro/actions/KedroData';
import { useQuery, useModal } from '~~hooks/';
import { DataFlowApi, TableApi } from '~~apis/';
import { INPUT_RULES, TABLE_NAME_RULES, FUNCTIONS } from '~~constants/index';
import SqlKedro from '../../../wisDOM/components/SqlKedro/SqlKedro';
import CustomCronModal from '../../../wisDOM/components/CronModal/CustomCronModal';
import * as Style from './style';

const INIT_NODE = [
  {
    name: 'new_node',
    columns: [],
  },
];

const { Option } = Select;
const DataflowExplore = ({
  selectGroupObject,
  selectedColumns,
  setSelectedColumns,
  selectedGroup,
  groupList,
  setCurr,
  fourceUpdate,
}) => {
  const [form] = Form.useForm();
  const [getDiagram, setDiagram] = useState([]);
  const [getSeqId, setSeqId] = useState('');
  const [saveOrRunLoading, setSaveOrRunLoading] = useState(false);
  const [dataFlowChangedGroupId, setDataFlowGroupId] = useState(
    selectGroupObject.groupId,
  );
  const cronPopupModal = useModal();
  const [cronLoading, setCronLoading] = useState(false);
  const [cronValue, setCronValue] = useState(''); // for UI to Cron
  const [getUIValue, setGetUIValue] = useState(''); // for Cron to UI
  const [resetShowData, setResetShowData] = useState(false);
  const [changeGroupStatus, setChangeGroup] = useState(false);
  const [entityData, setEntity] = useState();
  const saveDataFlow = useQuery(DataFlowApi.saveDataFlow);

  useEffect(() => {
    if (selectedGroup !== selectGroupObject.groupId) {
      setDataFlowGroupId(
        groupList &&
          groupList.filter(group => group.groupId === selectedGroup)[0].groupId,
      );
    }
  }, []);

  const recordSelectedGroupId = value => {
    setDataFlowGroupId(value);
    setChangeGroup(true);
    setSelectedColumns([]);
  };

  const OpenCornModel = () => {
    cronPopupModal.openModal();
  };

  const checkSchedule = () => {
    // 判斷是否有publish
    if (getDiagram.nodes.length !== 0) {
      const check = getDiagram.nodes.filter(
        e => e.args.publish !== undefined && e.args.publish,
      );
      if (check.length !== 0) {
        return true;
      }
      return false;
    }
    return false;
  };

  const checkBeforeSave = data => {
    const transformList =
      data.diagram.nodes.length !== 0
        ? data.diagram.nodes.filter(item => item.type === 'Transform')
        : [];

    const saveStatus = transformList.map(item => {
      if (item.args.classification === 'SelectFields') {
        return (
          item.args.fields === undefined ||
          (item.args.fields !== undefined && item.args.fields.length === 0)
        );
      }
      if (item.args.classification === 'Customize') {
        return (
          item.args.sql === undefined ||
          (item.args.sql !== undefined && item.args.sql === '') ||
          item.args.frontend === undefined ||
          item.args.frontend.sqlVerify === undefined ||
          (item.args.frontend &&
            item.args.frontend.sqlVerify &&
            item.args.frontend.sqlVerify === false)
        );
      }
      if (item.args.classification === 'Join') {
        return true;
      }
      return '';
    });

    return saveStatus.includes(true);
  };

  const checkTargetBeforeSave = sendData => {
    const targetList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Target')
        : [];

    // Transform or Cleansing 有error不能save
    const transformList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Transform')
        : [];

    const CleanList =
      sendData.diagram.nodes.length !== 0
        ? sendData.diagram.nodes.filter(item => item.type === 'Cleansing')
        : [];

    const errorFilter = targetList.filter(e => e.check === 'error');
    const errorFilterTrans = transformList.filter(e => e.check === 'error');
    const errorFilterClean = CleanList.filter(e => e.check === 'error');

    if (
      errorFilter.length > 0 ||
      errorFilterTrans.length > 0 ||
      errorFilterClean.length > 0
    ) {
      return true;
    }
    return false;
  };

  const sameTarget = data => {
    const targetList =
      data.diagram.nodes.length !== 0
        ? data.diagram.nodes.filter(item => item.type === 'Target')
        : [];

    if (targetList.length !== 0) {
      const uniqName = [...new Set(targetList.map(e => e.name))];
      if (uniqName.length !== targetList.length) {
        return true;
      }
      return false;
    }
    return false;
  };

  const handleSaveApi = async cronjobValue => {
    let data = {
      // ...form.getFieldValue(),
      projectName: form.getFieldValue().projectName,
      groupId: dataFlowChangedGroupId,
      diagram: getDiagram,
      schedule: cronjobValue,
      healthyAssessment: form.getFieldValue().healthyAssessment,
    };

    if (getSeqId) {
      data = {
        ...data,
        seqId: getSeqId,
      };
    }

    setSaveOrRunLoading(true);
    try {
      if (!checkBeforeSave(data) && !checkTargetBeforeSave(data)) {
        if (!sameTarget(data)) {
          const seqId = await saveDataFlow.exec(data); // save之後拿到 seqId 之後才能執行run按鈕

          if (seqId) {
            setSeqId(seqId);
            setCurr(seqId);
            message.success('This Dataflow save successfully!');
            fourceUpdate();
            // window.location.href = `${window.location.origin}/pipeline/newworkspace`;
          }
        } else {
          message.error('Target name is repeat , please change it!');
        }
      } else {
        message.error('You need to set transform condition successfully!');
      }

      cronPopupModal.closeModal();
    } catch (e) {
      message.error(e.message);
    } finally {
      setCronLoading(false);
      setSaveOrRunLoading(false);
    }
  };

  const handleSave = () => {
    if (checkSchedule() === true) {
      OpenCornModel();
    } else {
      handleSaveApi('');
    }
  };

  const handleFinish = () => {
    if (cronValue === '' || cronValue === undefined) {
      message.error('Check your select !');
    } else {
      setCronLoading(true);
      handleSaveApi(cronValue);
    }
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

  const getformatData = async () => {
    let data = [];
    if (selectedColumns !== undefined) {
      data = tableDataformat(selectedColumns);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < data.nodes.length; i++) {
        let overMonth = false;
        if (data.nodes[i].args.table_name) {
          // eslint-disable-next-line no-await-in-loop
          const result = await TableApi.getAllowedTableColumns(
            data.nodes[i].args.table_name,
          );

          const stamp =
            result && result !== null && result.lastUpdateTime
              ? result.lastUpdateTime
              : undefined;

          if (stamp) {
            const now = new Date();
            const timeStamp = new Date(stamp); // 10位需*1000,13位不用
            const subtract = now.getTime() - timeStamp.getTime();
            const value = new Date(subtract);
            const monthCount = value.getMonth();
            if (monthCount >= 1) {
              overMonth = true;
            }
          }

          if (overMonth) {
            data.nodes[i].check = 'warning';
            if (!data.nodes[i].args.frontend) {
              data.nodes[i].args.frontend = {
                lastUpdateTime: FUNCTIONS.TIMESTAMP_TO_TIME(
                  result.lastUpdateTime,
                ),
              };
            } else {
              data.nodes[
                i
              ].args.frontend.lastUpdateTime = FUNCTIONS.TIMESTAMP_TO_TIME(
                result.lastUpdateTime,
              );
            }
          }
        }
      }
    } else {
      data = tableDataformat(INIT_NODE);
    }

    setEntity(data);
  };

  useEffect(() => {
    getformatData();
  }, []);

  return (
    <>
      <Style.DataflowExploreContainer>
        <Style.DataflowListContainer>
          <div className="title">Data Flow</div>
          <Spin spinning={saveOrRunLoading}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingLeft: '10px',
              }}
            >
              <Form
                form={form}
                style={{ display: 'flex' }}
                initialValues={{
                  groupName: selectGroupObject && selectGroupObject.groupName,
                  healthyAssessment: false,
                }}
                onFinish={handleSave}
              >
                <Form.Item
                  label="Project Name"
                  name="projectName"
                  rules={[
                    { required: true, message: 'Please input project name!' },
                    {
                      pattern: TABLE_NAME_RULES.pattern,
                      message:
                        'Start with alphabet and accept only letters(A-Za-z), numbers(0-9) and underline(_)',
                    },
                  ]}
                >
                  <Input
                    placeholder="Project Name"
                    maxLength={INPUT_RULES.PROJECT_NAME.value}
                    onBlur={() => handleValidate()}
                  />
                </Form.Item>

                <Form.Item
                  label="Group Name"
                  name="groupName"
                  style={{ marginLeft: '10px' }}
                >
                  <Select
                    onChange={recordSelectedGroupId}
                    disabled={getSeqId !== ''}
                  >
                    {groupList &&
                      groupList.map(item => (
                        <Option key={item.groupId} value={item.groupId}>
                          {item.groupName}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  style={{ marginLeft: '10px' }}
                  name="healthyAssessment"
                  label="Enable dataset healthy assessment"
                  valuePropName="checked"
                >
                  <Switch
                    style={{ width: '60px' }}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </Form.Item>
              </Form>

              <Form.Item>
                {/* <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: '20px' }}
                  disabled={getSeqId === ''}
                  onClick={handleRunMethod} // form.submit
                >
                  Run
                </Button> */}
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={form.submit} // form.submit
                >
                  Save
                </Button>
              </Form.Item>
            </div>
          </Spin>
        </Style.DataflowListContainer>
        <Style.DataflowContainer>
          {entityData && (
            <SqlKedro
              oEntity={entityData}
              dataFlowChangedGroupId={dataFlowChangedGroupId}
              edit
              setDiagram={setDiagram}
              sqlID={getSeqId}
              setResetShowData={setResetShowData}
              resetShowData={resetShowData}
              changeGroupStatus={changeGroupStatus}
              setChangeGroup={setChangeGroup}
              historyMode={false}
              projectName={form.getFieldValue().projectName}
              diagram={getDiagram}
              schedule={cronValue}
            />
          )}
        </Style.DataflowContainer>
      </Style.DataflowExploreContainer>
      <CustomCronModal
        modal={cronPopupModal}
        setCronValue={setCronValue}
        getUIValue={getUIValue}
        setGetUIValue={setGetUIValue}
        handleOK={handleFinish}
        loading={cronLoading}
      />
    </>
  );
};

DataflowExplore.propTypes = {
  selectedColumns: PropTypes.arrayOf(PropTypes.shape({})),
  setSelectedColumns: PropTypes.func,
};

DataflowExplore.defaultProps = {
  selectedColumns: [],
  setSelectedColumns: () => null,
};

export default DataflowExplore;
