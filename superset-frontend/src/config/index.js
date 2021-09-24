import devConfig from './app.dev.config';
import prodConfig from './app.prod.config';
import qasConfig from './app.qas.config';

const getConfiguration = environment => {
  if (environment === 'qas') {
    return qasConfig;
  }
  if (environment === 'prd') {
    return prodConfig;
  }
  return devConfig;
};

const AppConfig = getConfiguration(process.env.WISDOM_ENV);
export default AppConfig;
