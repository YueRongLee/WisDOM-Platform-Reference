/* eslint-disable react/no-danger */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-restricted-imports */
import React, { useEffect } from 'react';
import setupApp from '../setup/setupApp';
import 'react-quill/dist/quill.snow.css';
import './MainStyle.less';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
sessionStorage.setItem('access_token', bootstrap.user.access_token);

const Main = () => {
  useEffect(() => {
    sessionStorage.clear();
    // window.location.href =
    //   'https://login.microsoftonline.com/wistron.com/oauth2/logout';
  }, []);

  return <div className="logout">logout</div>;
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
