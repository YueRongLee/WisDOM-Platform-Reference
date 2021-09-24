const config = {
  serverUrl: process.env.CDP
    ? 'https://wisdom-harlequin-dev.k8sprd-whq.k8s.wistron.com'
    : 'https://wisdom-dataplatform-atlas-dev.southeastasia.cloudapp.azure.com',
  itmUrl: 'http://40.70.135.129:8443',
  operationUrl:
    'https://wisdomdataplatformprd.blob.core.windows.net/public/user_guide/WisDOM Service 操作手冊_20210706.pdf',
};

export default config;
