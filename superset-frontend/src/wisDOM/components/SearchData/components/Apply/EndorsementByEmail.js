/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import { Select, Table, Form } from 'antd';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';
import arrayMove from 'array-move';
import { UserApi } from '~~apis/';

const { Option } = Select;
const EndorsementTableByEmail = ({ setEndorsement }) => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [userList, setUserList] = useState([]);
  const [optionList, setOptionList] = useState([]);

  const container = document.getElementById('app');
  const bootstrap = JSON.parse(
    container?.getAttribute('data-bootstrap') ?? '{}',
  );

  // 用關鍵字搜尋 合法 email
  const getSearchList = async searchKey => {
    try {
      setLoading(true);
      const result = await UserApi.SearchUsersFromAAD(searchKey);

      // 搜尋出的結果加進下拉選單選項
      const options = result.map((user, index) => (
        <Option key={`${user.displayName} - ${index}`} value={user.displayName}>
          {user.emailAddress}
        </Option>
      ));

      setUserList(result);
      setOptionList(options);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = selectedUsers => {
    console.log(selectedUsers);
    setOptionList([]);

    const selected = selectedUsers.map((user, index) => ({
      key: `${user.value}-${index}`,
      displayName: user.value,
      emailAddress: user.label,
    }));

    setDataSource(selected);
  };

  const handleSearch = value => {
    // 三個字才搜尋
    if (value && value.length > 2) {
      getSearchList(value);
    } else {
      setOptionList([]);
    }
  };

  const DragHandle = sortableHandle(() => (
    <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
  ));

  const SortableItem = sortableElement(props => (
    <tr style={{ zIndex: 9999, border: '1px solid #ccc' }} {...props} />
  ));
  const SortableContainer = sortableContainer(props => <tbody {...props} />);

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      x => x.emailAddress === restProps['data-row-key'],
    );

    return <SortableItem index={index} {...restProps} />;
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove(
        [].concat(dataSource),
        oldIndex,
        newIndex,
      ).filter(el => !!el);

      setDataSource(newData);
    }
  };

  const DraggableContainer = props => (
    <SortableContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: '80px',
      className: 'drag-visible',
      render: () => <DragHandle />,
    },
    {
      title: 'Name',
      dataIndex: 'displayName',
      key: 'displayName',
      width: '150px',
    },
  ];

  const getWidth = cols => cols.length * 150;

  // 驗證規則
  const validator = (rule, value) =>
    new Promise((resolve, reject) => {
      // 不可選自己
      const foundOwnself = value.find(v => v.value === bootstrap.user.lastName);

      if (foundOwnself) {
        reject('Should not select your ownself');
      } else {
        resolve();
      }
    });

  useEffect(() => {
    setEndorsement(dataSource);
  }, [dataSource]);

  return (
    <>
      <Form.Item
        data-test="apply-endorsement-email-form-unit-test"
        name="emailSelect"
        rules={[{ validator }]}
      >
        <Select
          data-test="apply-endorsement-email-select-unit-test"
          labelInValue
          loading={loading}
          onSearch={handleSearch}
          mode="multiple"
          placeholder="Input emails to search"
          showSearch
          defaultActiveFirstOption={false}
          showArrow={false}
          onChange={handleSelectChange}
          allowClear
          optionFilterProp="children"
        >
          {optionList}
        </Select>
      </Form.Item>
      <Table
        data-test="apply-endorsement-email-table-unit-test"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        rowKey="emailAddress"
        scroll={{ x: getWidth(columns), y: 480 }}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }}
      />
    </>
  );
};

export default EndorsementTableByEmail;
