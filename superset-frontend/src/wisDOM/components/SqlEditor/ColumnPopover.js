/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Popover, Select, Input } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { INPUT_RULES } from '~~constants/index';
import './SqlEditorStyle.less';

const { Option } = Select;

const ColumnPopover = ({
  data,
  children,
  onSave,
  modal,
  allEntity,
  columnDesc,
}) => {
  const [description, setDescription] = useState(
    modal.modalData ? modal.modalData.columnDesc : '',
  );
  const [type, setType] = useState(
    modal.modalData ? modal.modalData.columnType : 'string',
  );
  const [relationEntity, setRelationEntity] = useState(
    modal.modalData ? modal.modalData.relationEntity : undefined,
  );
  const [relationColumn, setRelationColumn] = useState(
    modal.modalData ? modal.modalData.relationColumn : undefined,
  );

  useEffect(() => {
    if (
      modal.visible &&
      modal.modalData &&
      data === modal.modalData.columnName
    ) {
      setDescription(
        modal.modalData.columnDesc !== ''
          ? modal.modalData.columnDesc
          : columnDesc,
      );
      setType(modal.modalData.columnType);
      setRelationColumn(
        modal.modalData ? modal.modalData.relationColumn : undefined,
      );
      setRelationEntity(
        modal.modalData ? modal.modalData.relationEntity : undefined,
      );
    } else {
      setDescription('');
      setType('string');
      setRelationColumn();
      setRelationEntity();
    }
  }, [modal.visible, modal.modalData, data]);

  // useEffect(() => {
  //   if (modal.visible && modal.modalData && data === modal.modalData.columnName) {
  //     setDescription(modal.modalData.columnDesc);
  //     setType(modal.modalData.columnType);
  //   } else {
  //     setDescription('');
  //     setType('string');
  //   }
  // }, [modal.visible, modal.modalData, data]);

  const handleSave = () => {
    const rtn = {
      columnName: data,
      columnDesc: description,
      columnType: type,
      relationEntity,
      relationColumn,
    };
    onSave(rtn);
    modal.closeModal();
  };

  return (
    <Popover
      visible={
        modal.visible && modal.modalData && data === modal.modalData.columnName
      }
      destroyTooltipOnHide
      content={
        <>
          <div className="entityContainer">
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Column descrption"
              maxLength={INPUT_RULES.COLUMN_DESCRIPTION.value}
            />
            <Select value={type} style={{ width: 200 }} onChange={setType}>
              <Option value="string">string</Option>
              <Option value="int64">integer</Option>
              <Option value="boolean">boolean</Option>
              <Option value="datetime">datetime</Option>
              <Option value="decimal">decimal</Option>
              <Option value="double">double</Option>
            </Select>
            <div className="action">
              <CloseCircleOutlined onClick={modal.closeModal} />
              <CheckCircleFilled onClick={handleSave} />
            </div>
          </div>
          <br />
          <div className="entityContainer">
            <Select
              value={relationEntity}
              style={{ width: 250 }}
              onChange={setRelationEntity}
            >
              <Option value="">Select relation entity</Option>
              {allEntity
                .filter(entity => entity.previewData)
                .map(entity => (
                  <Option
                    key={`${Math.random}${entity.entityName}`}
                    value={entity.entityName}
                  >
                    {entity.entityName}
                  </Option>
                ))}
            </Select>
            <Select
              value={relationColumn}
              style={{ width: 250 }}
              onChange={setRelationColumn}
            >
              <Option value="">Select relation column</Option>
              {relationEntity !== undefined && relationEntity !== ''
                ? allEntity
                    .find(
                      e =>
                        e.name === relationEntity ||
                        e.entityName === relationEntity,
                    )
                    .columns.map(col => (
                      <Option
                        key={`${Math.random}${col.name}`}
                        value={col.name}
                      >
                        {col.name}
                      </Option>
                    ))
                : null}
            </Select>
          </div>
        </>
      }
    >
      {children}
    </Popover>
  );
};

ColumnPopover.propTypes = {
  data: PropTypes.string,
  onSave: PropTypes.func,
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    closeModal: PropTypes.func,
    modalData: PropTypes.shape({
      columnDesc: PropTypes.string,
      columnType: PropTypes.string,
    }),
  }),
};

ColumnPopover.defaultProps = {
  data: '',
  onSave: () => null,
  modal: {
    visible: false,
    closeModal: () => null,
    modalData: {
      columnDesc: '',
      columnType: 'string',
    },
  },
};

export default ColumnPopover;
