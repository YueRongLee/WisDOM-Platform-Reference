/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Divider,
  Button,
  Tag,
  message,
  Card,
  Avatar,
  List,
  Select,
  Tooltip,
  Badge,
  //   Modal,
} from 'antd';
import {
  FileDoneOutlined,
  EyeOutlined,
  PlusOutlined,
  LogoutOutlined,
  CheckOutlined,
  AppstoreOutlined,
  BarsOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  PartitionOutlined, // mark kedro
  DatabaseOutlined,
} from '@ant-design/icons';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import ConfirmModal from 'src/wisDOM/components/ConfirmModal/ConfirmModal';
import { useQuery, useModal, useUpdateEffect, usePrevious } from '~~hooks/';
import { AtlasApi, UserApi } from '~~apis/';
import {
  TAB_KEY,
  SYSTEM_TYPE,
  PREVIEW_STATUS,
  CONSUME_STATUS,
  GROUP_TYPE,
  ROLEPERMISSION,
  ROLE_TYPE,
} from '~~constants/index';
import {
  PreviewModal,
  TermTable,
  ConsumeModal,
  ApplyModal,
  CartList,
  HealthDataModal,
  InfoModal,
  ReferenceChartModal,
  DeleteTableModal,
} from './components';
import './SearchDataStyle.less';

// import { mockData } from './mockData';

const SearchData = ({
  next,
  selectedColumns,
  setSelectedColumns,
  user,
  setGroupList,
  selectedGroup,
  setSelectedGroup,
  setSelectedGroupObject,
}) => {
  //   const [atlasContent, setAtlasContent] = useState(mockData.tables);
  const [atlasContent, setAtlasContent] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [checking, setChecking] = useState([]);
  const [changeGroupList, setChangeGroupList] = useState([]);
  const [searchText, setSearchText] = useState(
    window.location.search !== '' || window.location.search !== undefined
      ? decodeURIComponent(
          new URL(window.location.href).searchParams.get('keyword'),
        )
      : '',
  );
  const [selectValue, setSelectValue] = useState('all');
  const [selectCategory, setSelectCategory] = useState('all'); // Category filter
  const [selectTerm, setSelectTerm] = useState('all'); // Term filter
  const [saveLoading, setSaveLoading] = useState(false);
  const [gridChange, setGridChange] = useState(false);
  const [initTemp, setInitTemp] = useState(true);
  const [page, setPage] = useState(1);
  const [categoryList, setCategoryList] = useState();
  // const [loading, setLoading] = useState(false);//getCategory api
  const [clickCard, setClickCard] = useState([]);
  const preSearchText = usePrevious(searchText);

  const previewModal = useModal();
  const consumeModal = useModal();
  const applyModal = useModal();
  const infoModal = useModal();
  const healthDataModal = useModal();
  const deleteConfirmModal = useModal();
  const referenceChartModal = useModal();
  const deleteTableConfirmModal = useModal();

  const getGroupsQuery = useQuery(UserApi.getGroups);
  const getEntityListQuery = useQuery(AtlasApi.getEntityListFromAtlas);
  const saveSelectETL = useQuery(AtlasApi.saveSelectETL);
  const getSelectTable = useQuery(AtlasApi.getUserSelectTable);
  // const getEnableTagListQuery = useQuery(UserApi.getEnableTags);

  const { trackEvent } = useMatomo();
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getWKCRelatedTable = async globalId => {
    try {
      setTableLoading(true);
      if (globalId) {
        const result = await AtlasApi.getWKCRelatedTables({
          globalId,
        });
        setSelectTerm(result);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (clickCard.length === 0) {
      setSelectTerm('all');
    } else if (clickCard) {
      //   setSelectTerm(clickCard);
      getWKCRelatedTable(clickCard.globalId);
      // 等後端, call api後在setSelect
    }
  }, [clickCard]);

  const getGroups = async () => {
    try {
      const result = await getGroupsQuery.exec({
        page: 1,
        pageSize: 9999,
        status: PREVIEW_STATUS.ALLOWED.value,
      });
      setChangeGroupList(result.groupListData);
      setGroupList(result.groupListData);
      const selfDefaultGroup = result.groupListData.find(
        group =>
          group.groupType === GROUP_TYPE.DEFAULT &&
          group.owner.toLowerCase() === user.emplId.toLowerCase(),
      );
      if (selfDefaultGroup && !selectedGroup) {
        setSelectedGroup(selfDefaultGroup.groupId);
        setSelectedGroupObject(selfDefaultGroup);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getCategoryList = data => {
    if (data) {
      // 取出table的category
      const categories = data
        .map(e => e.categories && e.categories[0])
        .filter(e => e && e !== '');
      const setList = [...new Set(categories)]; // 去重複
      const list = setList.map(e => ({ key: e, value: e, label: e }));
      if (categories.length !== data.length) {
        setCategoryList([
          ...list,
          { key: 'noCategory', value: 'noCategory', label: 'Undefined' },
        ]);
      } else {
        setCategoryList([...list]);
      }
    } else {
      setCategoryList();
    }
  };

  const saveTable = async () => {
    setSaveLoading(true);
    const req = selectedColumns.map(st => ({
      guid: st.guid,
      tableName: st.name,
    }));
    try {
      await saveSelectETL.exec({ tables: req, groupId: selectedGroup });
    } catch (e) {
      console.log(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSearch = async (data, groupId) => {
    setClickCard([]);
    if (!data || !groupId) {
      return;
    }
    ReactGA.event({
      category: 'Search',
      action: 'Search table',
    });

    trackEvent({
      category: 'Search',
      action: 'Search table',
    });

    setTableLoading(true);
    if (data !== 'null') {
      // eslint-disable-next-line no-restricted-globals
      history.pushState(
        '',
        '',
        data === '' ? '' : `?keyword=${encodeURIComponent(data.trim())}`,
      );
    }
    try {
      const result = await getEntityListQuery.exec({ keyword: data, groupId });
      const entityList = [];

      if (result.wkcStatus) {
        switch (result.wkcStatus.code) {
          case 0: // error
            message.error(
              'The connection to Watson Knowledge Catalog (wkc) is temporarily wrong. Please try again later. If you have encountered this issue for several hours, please contact Hiram Shen (Hiram_Shen@wistron.com). ',
              5,
            );
            break;
          case 1: // success
            break;
          case 2: // 系統維護
            message.info(
              'Watson Knowledge Catalog (wkc) is currently undergoing routine maintenance. WisDOM will provide you with wkc service after the routine maintenance is completed.',
              5,
            );
            break;
          default:
            break;
        }
      }

      if (result.tables && result.tables.length) {
        result.tables
          .filter(res => res.consume !== CONSUME_STATUS.CONSUMEABLE)
          .forEach(res => {
            entityList.push(res);
          });
        if (preSearchText !== data) {
          setPage(1);
        }
        getCategoryList(result.tables);
      } else {
        message.success('No results found');
        setCategoryList();
        setPage(1);
      }
      setSelectCategory('all');
      setAtlasContent(entityList);
    } catch (e) {
      console.log(e);
      setCategoryList();
      setSelectCategory('all');
    } finally {
      setTableLoading(false);
    }
  };

  useUpdateEffect(() => {
    // 第一次進來畫面把temp table設定到購物車時不要進行save table動作
    if (!initTemp) {
      saveTable();
    }
  }, [selectedColumns]);

  useUpdateEffect(() => {
    if (searchText !== 'null') {
      handleSearch(searchText, selectedGroup);
    }
  }, [selectedGroup]);

  const toggleSelectedRow = (changeRows, selected) => {
    const nextColumns = [].concat(selectedColumns);
    changeRows.forEach(record => {
      const selObjIdx = nextColumns.findIndex(sel => sel.guid === record.guid);
      if (selected && selObjIdx === -1) {
        nextColumns.push({ ...record });
      } else if (!selected && selObjIdx !== -1) {
        nextColumns.splice(selObjIdx, 1);
      }
    });
    setSelectedColumns(nextColumns);
  };

  const getSelect = async () => {
    try {
      const result = await getSelectTable.exec();
      if (result.tables.length !== 0) {
        setSelectedGroup(result.groupId);
        setSelectedGroupObject({
          groupId: result.groupId,
          groupName: result.groupName,
        });
        toggleSelectedRow(result.tables, true);
      }
      setInitTemp(false);
    } catch (e) {
      console.log(e);
    }
  };

  const init = async () => {
    await getGroups();
    // await getCategoryList();
    await getSelect();
  };

  useEffect(() => {
    init();
  }, []);

  const handlePreview = (row, e) => {
    previewModal.openModal(row);
    e.stopPropagation();
  };

  const handleDisplay = data => {
    const idx = selectedColumns.findIndex(item => item.guid === data.guid);
    if (idx === -1) {
      return 'list-item';
    }
    return 'none';
  };

  const openConsume = (row, e) => {
    consumeModal.openModal(row);
    e.stopPropagation();
  };

  const openApply = (row, e) => {
    applyModal.openModal(row);
    e.stopPropagation();
  };
  // create data pipeline info button
  const openInfo = (row, e) => {
    infoModal.openModal(row);
    e.stopPropagation();
  };

  // mark kedro
  const openChart = (row, e) => {
    referenceChartModal.openModal(row);
    e.stopPropagation();
  };

  const openHealthData = row => healthDataModal.openModal(row);

  const handleUpdateName = (table, newName, previewState, updateType) => {
    const nextContent = [].concat(atlasContent);
    nextContent.forEach((c, idx) => {
      if (c.guid === table.guid) {
        nextContent[idx].name = newName;
        nextContent[idx].systemType =
          updateType !== undefined ? updateType : nextContent[idx].systemType;
        nextContent[idx].preview = previewState;
      }
    });
    setAtlasContent(nextContent);
  };

  const handleNext = () => {
    setAtlasContent([]);
    setChecking([]);
    setSearchText('');
    next(TAB_KEY.EXPLORE);
    setCartVisible(false);
  };

  const handleDataflowNext = () => {
    setAtlasContent([]);
    setChecking([]);
    setSearchText('');
    next(TAB_KEY.DATAFLOW);
  };

  const handleSelect = value => {
    setSelectValue(value);
  };

  const handleSelectCategory = value => {
    setSelectCategory(value);
  };

  const handleCart = () => {
    setCartVisible(true);
  };

  const handleClose = () => {
    setCartVisible(false);
  };

  const handleAddBtn = (item, e) => {
    toggleSelectedRow([item], true);
    e.stopPropagation();
  };

  const options = SYSTEM_TYPE.getOptionList().map(type => ({
    value: type.key,
    label: type.name,
  }));

  const tagRender = props => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag
        color={SYSTEM_TYPE.props[value].color}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  const categoryTagRender = props => {
    const { label, value, closable, onClose } = props;
    return (
      <Tag
        // color={SYSTEM_TYPE.props[value].color}
        color={value === 'noCategory' ? '#ec8584' : '#1890ffb8'}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  // consume Button

  const ListConsumeButton = item => {
    if (
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.createPipeline.consume.value,
      )
    ) {
      if (
        item.systemType === SYSTEM_TYPE.props.ITPG.key ||
        item.systemType === SYSTEM_TYPE.props.ITKA.key
      ) {
        return (
          <Button title="Consume" onClick={e => openConsume(item, e)}>
            <LogoutOutlined />
            {gridChange === false && 'Consume'}
          </Button>
        );
      }
    }

    return null;
  };

  // sample button
  const ListSampleButton = item => {
    const currGroup = getGroupsQuery.data.groupListData.find(
      group => group.groupId === selectedGroup,
    );
    if (!currGroup) return null;
    if (
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.createPipeline.preview.value,
      )
    ) {
      if (
        item.systemType === SYSTEM_TYPE.props.ITPG.key ||
        item.systemType === SYSTEM_TYPE.props.ITKA.key
      ) {
        return null;
      }

      return (
        <Button
          style={{ margin: '5px' }}
          onClick={e => handlePreview(item, e)}
          title="Sample"
          disabled={
            !(
              item.preview === PREVIEW_STATUS.ALLOWED.value ||
              item.preview === PREVIEW_STATUS.EXTEND_NOTIFIED.value ||
              item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value ||
              item.preview === PREVIEW_STATUS.PREVIEW.value ||
              localStorage.getItem('role').includes(ROLE_TYPE.DATA_MASTER) ||
              item.owner.toLowerCase() === user.emplId.toLowerCase() ||
              item.categoryOwner.toLowerCase() === user.emplId.toLowerCase()
            )
          }
        >
          <EyeOutlined />
          {gridChange === false && 'Sample'}
        </Button>
      );
    }
    return null;
  };

  // apply button
  const ListApplyButton = item => {
    const currGroup = getGroupsQuery.data.groupListData.find(
      group => group.groupId === selectedGroup,
    );
    // 只有group owner是自己時，才能做consume和apply
    if (currGroup.owner.toLowerCase() === user.emplId.toLowerCase()) {
      if (
        ROLEPERMISSION.checkPermission(
          SYSTEMLIST,
          ROLEPERMISSION.dataPipeline.createPipeline.apply.value,
        )
      ) {
        if (
          item.systemType === SYSTEM_TYPE.props.WisDOM.key ||
          item.systemType === SYSTEM_TYPE.props.WDC.key ||
          item.systemType === SYSTEM_TYPE.props.WDL.key
        ) {
          if (
            item.preview === PREVIEW_STATUS.ALLOWED.value ||
            // item.systemType === SYSTEM_TYPE.props.WDC.key ||
            // item.systemType === SYSTEM_TYPE.props.WDL.key ||
            currGroup.owner.toLowerCase() !== user.emplId.toLowerCase()
          ) {
            return null;
          }

          return (
            <Button
              style={{ margin: '5px' }}
              disabled={
                item.preview === PREVIEW_STATUS.APPLYING.value ||
                item.preview === PREVIEW_STATUS.ALLOWED.value ||
                item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value ||
                // item.systemType === SYSTEM_TYPE.props.WDC.key ||
                // item.systemType === SYSTEM_TYPE.props.WDL.key ||
                currGroup.owner.toLowerCase() !== user.emplId.toLowerCase()
                // ||
                // item.systemType === SYSTEM_TYPE.props.WDC.key ||
                // item.systemType === SYSTEM_TYPE.props.WDL.key
              }
              onClick={e => openApply(item, e)}
              title="Apply"
            >
              <CheckOutlined />
              {gridChange === false &&
                (item.preview === PREVIEW_STATUS.APPLYING.value ||
                item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value
                  ? 'Applying'
                  : 'Apply')}
            </Button>
          );
        }
      }
    }
    return null;
  };

  // add button
  const ListAddButton = item => {
    if (
      ROLEPERMISSION.checkPermission(
        SYSTEMLIST,
        ROLEPERMISSION.dataPipeline.createPipeline.add.value,
      )
    ) {
      if (
        item.systemType !== SYSTEM_TYPE.props.WisDOM.key ||
        item.preview === PREVIEW_STATUS.PREVIEW.value ||
        item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value ||
        !(
          item.preview === PREVIEW_STATUS.ALLOWED.value ||
          item.preview === PREVIEW_STATUS.EXTEND_NOTIFIED.value ||
          item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value
        )
      ) {
        return null;
      }
      return (
        <Button
          style={{ margin: '5px' }}
          title="Add"
          disabled={
            item.systemType !== SYSTEM_TYPE.props.WisDOM.key ||
            item.preview === PREVIEW_STATUS.PREVIEW.value ||
            !(
              item.preview === PREVIEW_STATUS.ALLOWED.value ||
              item.preview === PREVIEW_STATUS.EXTEND_NOTIFIED.value ||
              item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value
            )
            // ||
            // currGroup.owner.toLowerCase() !== user.emplId.toLowerCase()
          }
          onClick={e => handleAddBtn(item, e)}
        >
          <PlusOutlined />
          {gridChange === false && 'Add'}
        </Button>
      );
    }
    return null;
  };

  const handleGroupChange = changedGroup => {
    if (selectedColumns.length) {
      //   deleteConfirmModal.openModal(changedGroup);
      deleteConfirmModal.openModal({
        row: changedGroup,
        showMsg: (
          <>
            <p>Change group will clear all of the selected tables.</p>
            <p>Are you sure you want to continue?</p>
          </>
        ),
      });
    } else {
      setSelectedGroup(changedGroup);
      setSelectedGroupObject(
        changeGroupList.filter(i => i.groupId === changedGroup)[0],
      );
    }
  };

  const handleDelete = () => {
    setSelectedColumns([]);
    setSelectedGroup(deleteConfirmModal.modalData.row);
    setSelectedGroupObject(
      changeGroupList.filter(
        i => i.groupId === deleteConfirmModal.modalData.row,
      )[0],
    );
    deleteConfirmModal.closeModal();
  };

  const handlePageChange = nextPage => {
    setPage(nextPage);
  };

  const handleDeleteTable = (e, item) => {
    e.stopPropagation();
    deleteTableConfirmModal.openModal(item);
  };

  const includeCategory = cat => {
    const checkList = selectCategory.map(e => (e === 'noCategory' ? '' : e));
    if (cat.length === 0) {
      return checkList.includes('');
    }

    // item的Category是array
    let check = true;
    cat.forEach(e => {
      if (!checkList.includes(e)) {
        check = false;
      }
    });

    return check;
  };

  const includeTables = tableName => {
    let check = false;

    // if (selectTerm.tables && selectTerm.tables.length !== 0) {
    //   selectTerm.tables.forEach(e => {
    //     if (tableName.includes(e)) {
    //       check = true;
    //     }
    //   });
    // }

    if (selectTerm && selectTerm.length !== 0) {
      selectTerm.forEach(e => {
        if (tableName.includes(e)) {
          check = true;
        }
      });
    }
    return check;
  };

  const checkDelete = item => {
    // deleteFlag true 可以刪
    if (item.deleteFlag) {
      const userId = user.emplId.toLowerCase();
      // 狀態 1,2,4,5 都可刪除
      const allow =
        item.preview === PREVIEW_STATUS.ALLOWED.value ||
        item.preview === PREVIEW_STATUS.APPLYING.value ||
        item.preview === PREVIEW_STATUS.EXTEND_NOTIFIED.value ||
        item.preview === PREVIEW_STATUS.EXTEND_APPLYING.value;

      if (allow === true) {
        // category
        if (item.categories && item.categories.length > 0) {
          if (
            item.categoryOwner &&
            item.categoryOwner.toLowerCase() === userId
          ) {
            return true;
          } // 可刪除

          return false;
        }

        // dataset owner
        if (item.owner && item.owner.toLowerCase() === userId) {
          return true; // 可刪除
        }
        return false;
      }
      return item.deleteFlag;
    }
    // if (notAllow === false) {
    //   // 有categories時,只有category Owner才可以刪除Table
    //   if (item.categories && item.categories.length > 0) {
    //     if (
    //       item.categoryOwner &&
    //       item.categoryOwner.toLowerCase() === userId
    //     ) {
    //       return false; // disable=false 可刪除
    //     }
    //     return true;
    //   }

    //   if (item.owner && item.owner.toLowerCase() === userId) {
    //     return false;
    //   }
    //   return true;
    // }
    //   return !item.deleteFlag;
    // }
    return false;
  };

  return (
    <>
      <Divider />
      {/* search長度不限 */}
      <Input.Search
        disabled={!selectedGroup}
        onSearch={text => handleSearch(text, selectedGroup)}
        placeholder="Please enter a keyword to search business terms or tables"
        enterButton
        onChange={e => setSearchText(e.target.value)}
        value={searchText !== 'null' ? decodeURIComponent(searchText) : ''}
      />
      {getEntityListQuery.data.terms && getEntityListQuery.data.terms.length ? (
        <>
          <Divider orientation="left">Term List</Divider>
          <Card
            className="termWrapper"
            bordered={false}
            bodyStyle={{ height: '300px', width: '100%', overflow: 'hidden' }}
          >
            <TermTable
              termList={getEntityListQuery.data.terms}
              loading={getEntityListQuery.isLoading}
              setClickCard={setClickCard}
            />
          </Card>
        </>
      ) : null}
      <div className="toolbar">
        <div className="select-wrapper">
          <span style={{ marginRight: '10px' }}>Group: </span>
          <Select
            disabled={!selectedGroup}
            loading={getGroupsQuery.isLoading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            style={{ minWidth: '250px' }}
            value={selectedGroup}
            onChange={handleGroupChange}
          >
            {getGroupsQuery.data.groupListData.map(d => (
              <Select.Option key={d.groupId} value={d.groupId}>
                {d.groupName}
              </Select.Option>
            ))}
          </Select>
        </div>
        {categoryList ? (
          <div className="select-wrapper">
            <span>Data Domain: </span>
            <Select
              // loading={loading}
              disabled={tableLoading}
              loading={tableLoading}
              className="type-select"
              defaultValue={categoryList.map(type => type.key)}
              value={
                selectCategory === 'all'
                  ? categoryList.map(type => type.key)
                  : selectCategory
              }
              onChange={handleSelectCategory}
              mode="multiple"
              tagRender={categoryTagRender}
              options={categoryList}
              allowClear
            />
          </div>
        ) : null}

        <div className="select-wrapper">
          <span style={{ marginRight: '10px' }}>Location: </span>
          <Select
            className="type-select"
            defaultValue={SYSTEM_TYPE.getOptionList().map(type => type.key)}
            onChange={handleSelect}
            mode="multiple"
            tagRender={tagRender}
            options={options}
            allowClear
          />
        </div>
        <Button.Group style={{ marginLeft: '10px' }}>
          <Button onClick={() => setGridChange(true)}>
            <AppstoreOutlined />
          </Button>
          <Button onClick={() => setGridChange(false)}>
            <BarsOutlined />
          </Button>
        </Button.Group>
      </div>

      <div>
        <List
          grid={gridChange === true ? { gutter: 4 } : { gutter: 4, column: 1 }}
          pagination={{
            current: page,
            position: 'bottom',
            defaultPageSize: 10,
            onChange: handlePageChange,
          }}
          size="large"
          dataSource={atlasContent.filter(
            item =>
              (selectValue === 'all' ||
                selectValue.includes(item.systemType)) &&
              (selectCategory === 'all' || includeCategory(item.categories)) &&
              // (selectTerm === 'all' || item.wkcGuid === selectTerm),
              (selectTerm === 'all' || includeTables(item.name)),
          )}
          loading={tableLoading}
          renderItem={item => (
            <List.Item style={{ display: handleDisplay(item) }} key={item.guid}>
              <Card
                className="listCard"
                onClick={
                  ROLEPERMISSION.checkPermission(
                    SYSTEMLIST,
                    ROLEPERMISSION.dataPipeline.createPipeline.healthData
                      .pageView.value,
                  )
                    ? () => openHealthData(item)
                    : () => {}
                }
              >
                <div
                  style={
                    gridChange === true
                      ? { width: '230px', height: '235px' }
                      : { width: '100%', height: '140px' }
                  }
                >
                  <div className="listTitle-wrapper">
                    <Tooltip title={item.name}>
                      <div className="listTitle">
                        {item.filtered && item.filtered === true ? (
                          <DatabaseOutlined />
                        ) : null}
                        {item.name}
                      </div>
                    </Tooltip>
                    {item.systemType === SYSTEM_TYPE.props.WisDOM.key ||
                    item.systemType === SYSTEM_TYPE.props.WDC.key ||
                    item.systemType === SYSTEM_TYPE.props.WDL.key ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {!gridChange ? (
                          <div>reference count: {item.referenceCount}</div>
                        ) : (
                          <Tooltip
                            title={`reference count: ${item.referenceCount}`}
                          >
                            <Badge
                              count={item.referenceCount}
                              style={{ paddingTop: '10px' }}
                              showZero
                            />
                          </Tooltip>
                        )}
                        <Button
                          // disabled={!item.deleteFlag}
                          disabled={!checkDelete(item)}
                          type="text"
                          shape="circle"
                          icon={<DeleteOutlined />}
                          onClick={e => handleDeleteTable(e, item)}
                          style={{
                            backgroundColor: '#ececec',
                            marginLeft: '10px',
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="listText">
                    {item.comment === 'null' ? '' : item.comment}
                  </div>
                  <hr />
                  <div>
                    <Tag
                      color={
                        SYSTEM_TYPE.props[item.systemType] &&
                        SYSTEM_TYPE.props[item.systemType].color
                      }
                    >
                      {SYSTEM_TYPE.props[item.systemType] &&
                        SYSTEM_TYPE.props[item.systemType].name}
                    </Tag>
                    {(item.tags && item.tags.length ? item.tags : []).map(
                      (tag, index) => (
                        <Tag className="listTag" key={index}>
                          {tag}
                        </Tag>
                      ),
                    )}
                    {(item.categories && item.categories.length
                      ? item.categories
                      : []
                    ).map((cat, index) => (
                      <Tag className="listCategory" key={index}>
                        {cat}
                      </Tag>
                    ))}
                    <div
                      style={
                        gridChange === true
                          ? {
                              position: 'absolute',
                              bottom: '0px',
                              right: '0px',
                              display: 'flex',
                              alignItems: 'center',
                            }
                          : { float: 'right' }
                      }
                    >
                      {/* // mark kedro */}
                      {item.systemType === SYSTEM_TYPE.props.WisDOM.key ||
                      item.systemType === SYSTEM_TYPE.props.WDC.key ||
                      item.systemType === SYSTEM_TYPE.props.WDL.key ? (
                        <Button
                          style={{ margin: '10px' }}
                          title="Reference Chart"
                          onClick={e => openChart(item, e)}
                        >
                          <PartitionOutlined />
                          {gridChange === false && 'Reference Chart'}
                        </Button>
                      ) : null}
                      {item.consumeType === SYSTEM_TYPE.props.ITKA.key ||
                      item.consumeType === SYSTEM_TYPE.props.ITPG.key ? (
                        <Button
                          style={{ margin: '10px' }}
                          title="Trusted Info"
                          onClick={e => openInfo(item, e)}
                        >
                          <InfoCircleOutlined />
                          {gridChange === false && 'Trusted Info'}
                        </Button>
                      ) : null}
                      {ListConsumeButton(item)}
                      {ListSampleButton(item)}
                      {ListApplyButton(item)}
                      {ListAddButton(item)}
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
      <div className="fixIcon">
        <>
          {ROLEPERMISSION.checkPermission(
            SYSTEMLIST,
            ROLEPERMISSION.dataPipeline.createPipeline.add.value,
          ) ? (
            <>
              {' '}
              {selectedColumns.length > 0 ? (
                <div>
                  <div className="badgeCircle">{selectedColumns.length}</div>
                  <Avatar
                    onClick={handleCart}
                    className="fixShadow fixIcon2"
                    size={50}
                    icon={<FileDoneOutlined />}
                  />
                </div>
              ) : (
                <Avatar
                  onClick={handleCart}
                  className="fixShadow fixIcon2"
                  size={50}
                  icon={<FileDoneOutlined />}
                />
              )}
            </>
          ) : null}
        </>
      </div>
      <PreviewModal modal={previewModal} groupId={selectedGroup} />
      <ConsumeModal
        modal={consumeModal}
        checking={checking}
        setChecking={setChecking}
        updatePreviewName={handleUpdateName}
        refresh={() => handleSearch(searchText, selectedGroup)}
      />
      <ApplyModal
        modal={applyModal}
        user={user}
        onFinish={table =>
          handleUpdateName(table, table.name, PREVIEW_STATUS.APPLYING.value)
        }
        selectedGroup={selectedGroup}
        refresh={() => handleSearch(searchText, selectedGroup)}
      />
      <CartList
        cartlist={selectedColumns}
        visible={cartVisible}
        onClose={handleClose}
        Delete={toggleSelectedRow}
        handleSubmit={handleNext}
        loading={saveLoading}
        handleDataflowNext={handleDataflowNext}
      />
      <HealthDataModal
        modal={healthDataModal}
        disEdit={PREVIEW_STATUS.NOT_ALLOWED.value}
        // refresh={() => handleSearch(searchText, selectedGroup)}
      />
      <InfoModal modal={infoModal} />
      <ReferenceChartModal modal={referenceChartModal} />
      {/* <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal.visible}
        onOk={handleDelete}
        onCancel={deleteConfirmModal.closeModal}
        maskClosable={!saveLoading}
        confirmLoading={saveLoading}
        closable={!saveLoading}
        cancelButtonProps={{ disabled: saveLoading }}
      >
        <p>Change group will clear all of the selected tables.</p>
        <p>Are you sure you want to continue?</p>
      </Modal> */}
      <ConfirmModal
        modal={deleteConfirmModal}
        handleOK={handleDelete}
        loading={saveLoading}
      />
      <DeleteTableModal
        modal={deleteTableConfirmModal}
        refresh={() => handleSearch(searchText, selectedGroup)}
        groupId={selectedGroup}
      />
    </>
  );
};

SearchData.propTypes = {
  selectedColumns: PropTypes.arrayOf(PropTypes.shape({})),
  setSelectedColumns: PropTypes.func,
  next: PropTypes.func,
  selectedGroup: PropTypes.number,
  setSelectedGroup: PropTypes.func,
  setSelectedGroupObject: PropTypes.func,
};

SearchData.defaultProps = {
  selectedColumns: [],
  setSelectedColumns: () => null,
  next: () => null,
  selectedGroup: undefined,
  setSelectedGroup: () => null,
  setSelectedGroupObject: () => null,
};

export default SearchData;
