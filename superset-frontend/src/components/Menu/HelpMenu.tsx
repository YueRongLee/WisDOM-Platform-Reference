/**
 for Operation menual
 */
import React from 'react';
import { MenuItem } from 'react-bootstrap';
import NavDropdown from 'src/components/NavDropdown';
import { t } from '@superset-ui/core';
import AppConfig from 'src/config/app.base.config';
import ReactGA from 'react-ga';
import { useMatomo } from '@datapunt/matomo-tracker-react';

export default function HelpMenu() {
  const fileUrl = `${AppConfig.operationUrl}?d=${new Date().valueOf()}`;
  const { trackEvent } = useMatomo();
  const handleRecord = () => {
    ReactGA.event({
      category: 'Download',
      action: 'Download Operation Menual',
    });

    trackEvent({
      category: 'Download',
      action: 'Download Operation Menual',
    });
  };
  return (
    <NavDropdown
      id="user-menu-dropwn"
      title={
        <>
          <i className="fa fa-question-circle" />
        </>
      }
    >
      <MenuItem
        id="menu-help-MenuItem"
        href={fileUrl}
        onClick={() => handleRecord()}
      >
        {t('Operation Menual Download')}
      </MenuItem>
    </NavDropdown>
  );
}
