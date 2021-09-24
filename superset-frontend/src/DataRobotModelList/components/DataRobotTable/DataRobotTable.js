/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import { TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Input, Table, Tooltip, Button, Select } from 'antd';
// import DataRobotDetailModal from '../DataRobotDetailModal/DataRobotDetailModal';
import { DataRobotApi } from '~~apis/';
// import { useModal } from '~~hooks/';
import * as Style from './style';

const { Search } = Input;

const { Option } = Select;

const TemplateTable = () => {
  const [keyword, setKeyword] = useState('');
  const [dataRobot, setDataRobot] = useState();
  const [listLoading, setListLoading] = useState(false);
  const [resetPage, setResetPage] = useState();
  const [sorter, setSorter] = useState();
  const [metricList, setMetricList] = useState([]);
  const [metric, setMetric] = useState('');
  const [metricLoading, setMetricLoading] = useState(false);
  const [isUseTimeSeries, setIsUseTimeSeries] = useState(true);
  // const detailModal = useModal();

  const onChangeInput = e => {
    setKeyword(e.target.value);
  };

  const columns = tempSorter => [
    {
      title: 'Model Number',
      dataIndex: 'modelNumber',
      key: 'modelNumber',
      width: '25%',
      sorter: {
        compare: (a, b) => a.modelNumber - b.modelNumber,
        multiple: 3,
      },
      sortOrder:
        (tempSorter &&
          tempSorter.filter(e => e.field === 'modelNumber').length > 0 &&
          tempSorter.filter(e => e.field === 'modelNumber')[0].order) ||
        false,
    },
    {
      title: '',
      dataIndex: 'recommendationType',
      key: 'recommendationType',
      width: '3%',
      render: value => (
        <div>
          {value ? (
            <Tooltip title={value}>
              <TrophyOutlined style={{ fontSize: '22px', color: '#20a7c9' }} />
            </Tooltip>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Model Type',
      dataIndex: 'modelType',
      key: 'modelType',
      width: '22%',
      render: (value, record) => (
        <div>
          {record.recommendationType ? (
            <span style={{ color: '#20a7c9' }}>{value}</span>
          ) : (
            <span> {value}</span>
          )}
        </div>
      ),
    },
    {
      title: isUseTimeSeries ? 'Backtest 1' : 'Validation',
      dataIndex: 'validation',
      key: 'validation',
      width: '25%',
      sorter: {
        compare: (a, b) => a.validation - b.validation,
        multiple: 2,
      },
      sortOrder:
        (tempSorter &&
          tempSorter.filter(e => e.field === 'validation').length > 0 &&
          tempSorter.filter(e => e.field === 'validation')[0].order) ||
        false,
      render: value => (
        <div>
          <span> {value === '' ? '' : value.toFixed(4)}</span>
        </div>
      ),
    },
    {
      title: isUseTimeSeries ? 'All Backtests' : 'Cross Validation',
      dataIndex: 'crossValidation',
      key: 'crossValidation',
      width: '25%',
      sorter: {
        compare: (a, b) => a.crossValidation - b.crossValidation,
        multiple: 1,
      },
      sortOrder:
        (tempSorter &&
          tempSorter.filter(e => e.field === 'crossValidation').length > 0 &&
          tempSorter.filter(e => e.field === 'crossValidation')[0].order) ||
        false,
      render: value => (
        <div>
          <span> {value === '' ? '' : value.toFixed(4)}</span>
        </div>
      ),
    },
    // {
    //   title: 'Model Category',
    //   dataIndex: 'modelCategory',
    //   key: 'modelCategory',
    //   width: '10%',
    // },
    // {
    //   title: 'Processes',
    //   dataIndex: 'processes',
    //   key: 'processes',
    //   width: '20%',
    //   render: value => (
    //     <div style={{ overflowX: 'hidden' }}>
    //       {value.map(e => (
    //         <Tag title={e}>{e}</Tag>
    //       ))}
    //     </div>
    //   ),
    // },
    // {
    //   title: 'Model Family',
    //   dataIndex: 'modelFamily',
    //   key: 'modelFamily',
    //   width: '10%',
    // },
    // {
    //   title: 'Prediction Threshold',
    //   dataIndex: 'predictionThreshold',
    //   key: 'predictionThreshold',
    //   width: '10%',
    //   sorter: {
    //     compare: (a, b) => a.predictionThreshold - b.predictionThreshold,
    //     multiple: 2,
    //   },
    //   sortOrder:
    //     (tempSorter &&
    //       tempSorter.filter(e => e.field === 'predictionThreshold').length >
    //         0 &&
    //       tempSorter.filter(e => e.field === 'predictionThreshold')[0].order) ||
    //     false,
    // },
    // {
    //   title: 'Sample Percentage',
    //   dataIndex: 'samplePercentage',
    //   key: 'samplePercentage',
    //   width: '10%',
    //   sorter: {
    //     compare: (a, b) => a.samplePercentage - b.samplePercentage,
    //     multiple: 1,
    //   },
    //   sortOrder:
    //     (tempSorter &&
    //       tempSorter.filter(e => e.field === 'samplePercentage').length > 0 &&
    //       tempSorter.filter(e => e.field === 'samplePercentage')[0].order) ||
    //     false,
    //   render: value => <div>{`${value && parseFloat(value).toFixed(2)}%`}</div>,
    // },
  ];

  const getModelList = async (id, metricName) => {
    setResetPage(1);
    setListLoading(true);
    try {
      const payload = {
        projectId: id,
        metricName,
      };
      const result = await DataRobotApi.getModelList(payload);
      setIsUseTimeSeries(result.isUseTimeSeries);
      if (result.models.length > 0) {
        setDataRobot(result.models);
      } else {
        setDataRobot([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setListLoading(false);
    }
  };

  const getMetriclList = async id => {
    setMetricLoading(true);
    setMetric('');
    setMetricList([]);
    setDataRobot([]);
    try {
      const result = await DataRobotApi.getMetriclList(id);
      if (result.length > 0) {
        setMetricList(result);
        setMetric(result[0]);
        getModelList(keyword, result[0]);
      } else {
        setMetricList([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setMetricLoading(false);
    }
  };

  const handleChange = (pagination, filters, tempSorter) => {
    setResetPage();
    if (tempSorter.length !== undefined && tempSorter.length > 0) {
      setSorter(tempSorter);
    } else {
      setSorter([tempSorter]);
    }
  };

  const handleRefresh = () => {
    // reset table
    setSorter();
    getModelList(keyword, metric);
  };

  const onChangeSelect = value => {
    setMetric(value);
    getModelList(keyword, value);
  };

  return (
    <Style.Container>
      <div
        className="DataSetTable"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 10,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>DataRobot Project ID: </span>
          <Search
            placeholder="input project id"
            onSearch={() => getMetriclList(keyword)}
            disabled={metricLoading || listLoading}
            value={keyword}
            style={{
              marginRight: 10,
              width: 350,
            }}
            onChange={onChangeInput}
          />
          <span style={{ marginRight: '10px' }}>Metric: </span>
          <Select
            showSearch
            value={metric}
            style={{ width: 200 }}
            placeholder="Select a person"
            optionFilterProp="children"
            onChange={onChangeSelect}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            disabled={metricList.length === 0 || listLoading}
          >
            {metricList.map(metric => (
              <Option value={metric}>{metric}</Option>
            ))}
          </Select>
          ,
        </div>
        <Button
          type="primary"
          onClick={() => handleRefresh()}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
      </div>

      <div style={{ height: '68vh', overflowY: 'scroll' }}>
        <Table
          columns={columns(sorter)}
          dataSource={dataRobot}
          pagination={{
            position: 'bottom',
            defaultPageSize: 10,
            current: resetPage || undefined,
          }}
          showSizeChanger={false}
          // scroll={{ y: '60vh' }}
          rowKey="guid"
          loading={listLoading || metricLoading}
          // onRow={record => ({
          //   onClick: () => detailModal.openModal(record),
          //   style: { cursor: 'pointer' },
          // })}
          onChange={handleChange}
        />
      </div>
      {/* <DataRobotDetailModal modal={detailModal} /> */}
    </Style.Container>
  );
};

TemplateTable.propTypes = {};

TemplateTable.defaultProps = {};

export default TemplateTable;
