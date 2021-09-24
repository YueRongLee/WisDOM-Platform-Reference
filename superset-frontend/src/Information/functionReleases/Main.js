/* eslint-disable react/no-danger */
/* eslint-disable no-console */
/* eslint-disable no-restricted-imports */
import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import 'react-quill/dist/quill.snow.css';
import {
  EditOutlined,
  SaveOutlined,
  WalletOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import setupApp from '../../setup/setupApp';
import { ROLE_TYPE, INFO_TITLE, ROLEPERMISSION } from '~~constants/index';
import { AnnouncementApi } from '~~apis/';
import './MainStyle.less';
import { ModifyLink } from '../common';
import * as Style from './style';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => {
  const [editable, setEditable] = useState(false);

  const [content, setContent] = useState('');
  const { confirm } = Modal;
  const SYSTEMLIST = JSON.parse(localStorage.getItem('rolePermission'));

  const getContent = async () => {
    try {
      const result = await AnnouncementApi.getContent(
        INFO_TITLE.functionReleases,
      );

      const content = ModifyLink(result.content);
      setContent(content);
    } catch (e) {
      console.log(e);
    }
  };

  const saveContent = async () => {
    try {
      await AnnouncementApi.saveContent(INFO_TITLE.functionReleases, content);
      // setContent(result.content);
      setEditable(false);
      getContent();
    } catch (e) {
      console.log(e);
    }
  };

  const resetContent = () => {
    getContent();
  };

  const cancelContent = () => {
    confirm({
      title: 'Do you Want to cancel these editor?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setEditable(false);
        getContent();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  useEffect(() => {
    getContent();
  }, []);

  return (
    <div className="functionReleases">
      {localStorage.getItem('role').includes(ROLE_TYPE.SYSTEM_MASTER) ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div className="ManaTitle">Function Releases</div>
            <div>
              {SYSTEMLIST &&
              ROLEPERMISSION.checkPermission(
                SYSTEMLIST,
                ROLEPERMISSION.information.functionRelease.edit.value,
              ) ? (
                <>
                  {!editable && (
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      style={{ marginRight: 10, width: 120 }}
                      onClick={() => setEditable(true)}
                    >
                      Edit
                    </Button>
                  )}
                </>
              ) : null}
              {editable && (
                <>
                  <Button
                    icon={<SaveOutlined />}
                    type="primary"
                    style={{ marginRight: 10, width: 120, border: 0 }}
                    onClick={() => saveContent()}
                  >
                    Save
                  </Button>
                  <Button
                    icon={<WalletOutlined />}
                    style={{
                      marginRight: 10,
                      width: 120,
                      background: '#e3605c',
                      color: '#ffff',
                      border: 0,
                    }}
                    onClick={() => cancelContent()}
                  >
                    Cancel
                  </Button>
                  <Button
                    icon={<UndoOutlined />}
                    style={{
                      marginRight: 10,
                      width: 120,
                      background: '#FFB11B',
                      color: '#ffff',
                      border: 0,
                    }}
                    onClick={() => resetContent()}
                  >
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
          {!editable && (
            <Style.Container>
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: content }}
              />{' '}
            </Style.Container>
          )}
          {editable && (
            <Style.QuillContainer>
              <Style.NewReactQuill
                value={content}
                onChange={value => setContent(value)}
                modules={Main.modules}
                formats={Main.formats}
                // onBlur={onBlurMessage}
                // readOnly={!nodeData.edit}
              />
            </Style.QuillContainer>
          )}
        </>
      ) : (
        <>
          <div className="ManaTitle">Function Releases</div>

          <Style.Container>
            {!editable && <div dangerouslySetInnerHTML={{ __html: content }} />}
          </Style.Container>
        </>
      )}
    </div>
  );
};

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Main.modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Main.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
];

Main.propTypes = {};

Main.defaultProps = {};

export default Main;
