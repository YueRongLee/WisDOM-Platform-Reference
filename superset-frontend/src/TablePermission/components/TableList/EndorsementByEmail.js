/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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

const EndorsementTableByEmail = ({
  setEndorsement,
  name,
  signOffList,
  modal,
  isSelect,
  form,
}) => {
  const [loading, setLoading] = useState(false);
  // 顯示於Table的數據 & 最後sort要回傳的數據
  const [dataSource, setDataSource] = useState([]);
  // 下拉選單選項
  const [optionList, setOptionList] = useState([]);

  const container = document.getElementById('app');
  const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));

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

      setOptionList(options);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = selectedUsers => {
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
      if (name === 'applicant') {
        let foundDuplicate = false;

        signOffList.forEach(list => {
          value?.forEach(v => {
            if (list.type === 'applicant' && list.approver === v.value) {
              foundDuplicate = true;
            }
          });
        });

        const foundEqualToApplyUser = value?.find(
          v => v.value === modal.modalData.userEnName,
        );

        if (foundEqualToApplyUser) {
          // 不可是申請者本人
          reject('Should not equal to apply user.');
        } else if (foundDuplicate) {
          // applicantEndorsement 選擇項目不可與當前紀錄中 type 為 applicant 者重複
          reject('Duplicate select in records.');
        } else {
          resolve();
        }
      }
      if (name === 'dataDomain') {
        const foundOwnself = value?.find(
          v => v.value === bootstrap.user.lastName,
        );

        if (foundOwnself) {
          // 不可選自己
          reject('Should not select your ownself');
        } else {
          resolve();
        }
      }
    });

  useEffect(() => {
    setEndorsement(dataSource);
  }, [dataSource]);

  // 帶入前次加簽名單進 select and table
  useEffect(() => {
    const dataDomainEndorsement = modal.modalData.dataDomainEndorsement.map(
      endorsement => ({
        key: endorsement.displayName,
        label: endorsement.emailAddress,
        value: endorsement.displayName,
      }),
    );

    const selected = modal.modalData.dataDomainEndorsement.map(
      (endorsement, index) => ({
        key: `${endorsement.displayName}-${index}`,
        displayName: endorsement.displayName,
        emailAddress: endorsement.emailAddress,
      }),
    );

    if (isSelect) {
      form.setFieldsValue({ dataDomainEmailSelect: dataDomainEndorsement });
      setDataSource(selected);
    }
  }, [modal, isSelect]);

  return (
    <>
      <Form.Item name={`${name}EmailSelect`} rules={[{ validator }]}>
        <Select
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
