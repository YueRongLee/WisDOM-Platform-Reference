/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState, useEffect } from 'react';
import { t } from '@superset-ui/core';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { notification, Statistic, List } from 'antd';
import { BellTwoTone } from '@ant-design/icons';
import NavDropdown from 'src/components/NavDropdown';
import { Menu as DropdownMenu } from 'src/common/components';
import BellMenu from 'src/components/Menu/BellMenu';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { SET_MATOMO, ROLEPERMISSION } from 'src/constants/index';
import { Link } from 'react-router-dom';
// import moment from 'moment';
import { NotifyApi, UserManagementApi } from 'src/apis';
import { useQuery } from 'src/hooks';
import AppConfig from 'src/config/app.base.config';
import MenuObject, {
  MenuObjectProps,
  MenuObjectChildProps,
} from './MenuObject';
import LanguagePicker, { Languages } from './LanguagePicker';
// import HelpMenu from './HelpMenu';
// import NewMenu from './NewMenu';
import {
  DataApplicationToolsMenu,
  NotShowMenu,
  StyledHeader,
} from './MenuData';
import './BellMenuStyle.less';
import * as Style from './style';

const HOME_PAGE = '/pipeline/create/';

const container = document.getElementById('app');
let userName = '';
if (container !== null) {
  const bootstrap = JSON.parse(
    container.getAttribute('data-bootstrap') || '{}',
  );

  if (bootstrap.user) {
    sessionStorage.setItem('access_token', bootstrap.user.access_token);
    userName = bootstrap.user.lastName;
  }
}

const instance = createInstance({
  urlBase: SET_MATOMO.URL_BASE,
  siteId: SET_MATOMO.SITE_ID,
  userId: userName,
});
interface BrandProps {
  path: string;
  icon: string;
  alt: string;
  width: string | number;
}

interface NavBarProps {
  bug_report_url?: string;
  version_string?: string;
  version_sha?: string;
  documentation_url?: string;
  languages: Languages;
  show_language_picker: boolean;
  user_is_anonymous: boolean;
  user_info_url: string;
  user_login_url: string;
  user_logout_url: string;
  user_profile_url: string | null;
  locale: string;
}

export interface MenuProps {
  data: {
    menu: MenuObjectProps[];
    brand: BrandProps;
    navbar_right: NavBarProps;
    settings: MenuObjectProps[];
  };
  isFrontendRoute?: (path?: string) => boolean;
}
interface MsgFormate {
  updateAt: number;
  message: string;
}

export function Menu({
  data: { menu, brand, navbar_right: navbarRight, settings },
  isFrontendRoute = () => false,
}: MenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenTools, setDropdownOpenTools] = useState(false);
  const [dropdownOpenInfo, setDropdownOpenInfo] = useState(false);
  const [bellTimeOut, setBellTimeOut] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const getLatestMsg = useQuery(NotifyApi.getLatestMessage);
  const { Countdown } = Statistic;
  const [rolePermissionList, setRolePermissionList] = useState([
    // // data pipeline
    // 'DATAPIPELINE_PAGEVIEW',
    // 'DATAPIPELINE_CREATEPIPELINE_PAGEVIEW',
    // 'DATAPIPELINE_CREATEPIPELINE_UPLOADDATA',
    // 'DATAPIPELINE_CREATEPIPELINE_SYNCDATA',
    // 'DATAPIPELINE_CREATEPIPELINE_APPLYSYNCDATA',
    // 'DATAPIPELINE_CREATEPIPELINE_CART',
    // 'DATAPIPELINE_CREATEPIPELINE_APPLY',
    // 'DATAPIPELINE_CREATEPIPELINE_PREVIEW',
    // 'DATAPIPELINE_CREATEPIPELINE_ADD',
    // 'DATAPIPELINE_CREATEPIPELINE_HEALTHDATA_PAGEVIEW',
    // 'DATAPIPELINE_CREATEPIPELINE_HEALTHDATA_EDIT',
    // 'DATAPIPELINE_TABLEPERMISSION_PAGEVIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_APPLICATIONRECORD_PAGEVIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_APPLICATIONRECORD_VIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_APPLICATIONRECORD_EDIT',
    // 'DATAPIPELINE_TABLEPERMISSION_APPLICATIONRECORD_EXTEND',
    // 'DATAPIPELINE_TABLEPERMISSION_DATASETPERMISSION_PAGEVIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_DATASETPERMISSION_APPROVE',
    // 'DATAPIPELINE_TABLEPERMISSION_DATADOMAINPERMISSION_PAGEVIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_DATADOMAINPERMISSION_APPROVE',
    // 'DATAPIPELINE_TABLEPERMISSION_GROUPPERMISSION_PAGEVIEW',
    // 'DATAPIPELINE_TABLEPERMISSION_GROUPPERMISSION_DELETE',
    // 'DATAPIPELINE_TABLEPERMISSION_REQUESTSYNCDATAPERMISSION_PAGEVIEW',
    // 'DATAPIPELINE_WORKSPACE_PAGEVIEW',
    // 'DATAPIPELINE_WORKSPACE_EDIT',
    // 'DATAPIPELINE_WORKSPACE_DELETE',
    // 'DATAPIPELINE_WORKSPACE_SHARE',
    // 'DATAPIPELINE_MYFLOWS_PAGEVIEW',
    // 'DATAPIPELINE_MYFLOWS_DATAFLOW_PAGEVIEW',
    // 'DATAPIPELINE_MYFLOWS_DATAFLOW_EDIT',
    // 'DATAPIPELINE_MYFLOWS_DATAFLOW_DELETE',
    // 'DATAPIPELINE_MYFLOWS_DATAFLOW_EXECUTE',
    // 'DATAPIPELINE_MYFLOWS_DATAFLOW_CREATE',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_PAGEVIEW',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_CREATE',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_EXECUTE',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_DELETE',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_EDIT',
    // 'DATAPIPELINE_MYFLOWS_WORKFLOW_ACTIVE',
    // 'DATAPIPELINE_MYOUTPUT_PAGEVIEW',
    // 'DATAPIPELINE_MYOUTPUT_DOWNLOAD',
    // 'DATAPIPELINE_MYOUTPUT_DELETE',
    // // sql lab
    // 'SQLLAB_PAGEVIEW',
    // 'SQLLAB_SQLEDITOR_PAGEVIEW',
    // 'SQLLAB_SAVEQUERIES_PAGEVIEW',
    // 'SQLLAB_QUERYHISTORY_PAGEVIEW',
    // // data application tool
    // 'DATAAPPLICATIONTOOLS_PAGEVIEW',
    // 'DATAAPPLICATIONTOOLS_CHARTS_PAGEVIEW',
    // 'DATAAPPLICATIONTOOLS_DASHBOARD_PAGEVIEW',
    // 'DATAAPPLICATIONTOOLS_POWERBITEMPLATE_PAGEVIEW',
    // 'DATAAPPLICATIONTOOLS_POWERBITEMPLATE_CREATE',
    // 'DATAAPPLICATIONTOOLS_POWERBITEMPLATE_ITEMCLICK',
    // 'DATAAPPLICATIONTOOLS_POWERBITEMPLATE_EDIT',
    // 'DATAAPPLICATIONTOOLS_POWERBITEMPLATE_DELETE',
    // 'DATAAPPLICATIONTOOLS_DATAROBOTMODELLIST_PAGEVIEW',
    // // setting
    // 'SETTING_PAGEVIEW',
    // 'SETTING_ROLEMANAGEMENT_PAGEVIEW',
    // 'SETTING_ROLEMANAGEMENT_SYSTEMROLE_PAGEVIEW',
    // 'SETTING_ROLEMANAGEMENT_SYSTEMROLE_CREATE',
    // 'SETTING_ROLEMANAGEMENT_SYSTEMROLE_EDIT',
    // 'SETTING_ROLEMANAGEMENT_SYSTEMROLE_VIEW',
    // 'SETTING_ROLEMANAGEMENT_SYSTEMROLE_DELETE',
    // 'SETTING_ROLEMANAGEMENT_DATAROLE_PAGEVIEW',
    // 'SETTING_ROLEMANAGEMENT_DATAROLE_CREATE',
    // 'SETTING_ROLEMANAGEMENT_DATAROLE_EDIT',
    // 'SETTING_ROLEMANAGEMENT_DATAROLE_VIEW',
    // 'SETTING_ROLEMANAGEMENT_DATAROLE_DELETE',
    // 'SETTING_DATADOMAINMANAGEMENT_PAGEVIEW',
    // 'SETTING_DATADOMAINMANAGEMENT_ADD',
    // 'SETTING_DATADOMAINMANAGEMENT_EDIT',
    // 'SETTING_DATADOMAINMANAGEMENT_SHOW',
    // 'SETTING_DATASETMANAGEMENT_PAGEVIEW',
    // 'SETTING_DATASETMANAGEMENT_EDIT',
    // 'SETTING_DATASETMANAGEMENT_ITEMCLICK',
    // 'SETTING_DATASETMANAGEMENT_DISABLE',
    // 'SETTING_GROUPMANAGEMENT_PAGEVIEW',
    // 'SETTING_GROUPMANAGEMENT_ADD',
    // 'SETTING_GROUPMANAGEMENT_EDIT',
    // 'SETTING_GROUPMANAGEMENT_DELETE',
    // 'SETTING_GROUPPERMISSION_PAGEVIEW',
    // 'SETTING_GROUPPERMISSION_APPROVE',
    // // infromation
    // 'INFORMATION_PAGEVIEW',
    // 'INFORMATION_FUNCTIONRELEASE_PAGEVIEW',
    // 'INFORMATION_FUNCTIONRELEASE_EDIT',
    // 'INFORMATION_SITEMAP_PAGEVIEW',
    // 'INFORMATION_SITEMAP_EDIT',
    // 'INFORMATION_SYSTEMGUIDEBOOK_PAGEVIEW',
    // 'INFORMATION_SYSTEMGUIDEBOOK_EDIT',
    // 'INFORMATION_DATASECURITYPOLICY_PAGEVIEW',
    // 'INFORMATION_DATASECURITYPOLICY_EDIT',
    // 'INFORMATION_LEARNINGBYFUNCTION_PAGEVIEW',
    // 'INFORMATION_LEARNINGBYFUNCTION_EDIT',
    // 'INFORMATION_LEARNINGBYSCENARIOS_PAGEVIEW',
    // 'INFORMATION_LEARNINGBYSCENARIOS_EDIT',
    // 'INFORMATION_WORKSHOP_PAGEVIEW',
    // 'INFORMATION_WORKSHOP_EDIT',
  ]);

  const getRolePermission = async () => {
    try {
      const container = document.getElementById('app');

      if (container !== null) {
        const bootstrap = JSON.parse(
          container.getAttribute('data-bootstrap') || '{}',
        );

        const result = await UserManagementApi.getUserPermission(
          bootstrap.user.emplId,
        );

        setRolePermissionList(result.data.permission);
        localStorage.setItem(
          'rolePermission',
          JSON.stringify(result.data.permission),
        );
        localStorage.setItem('role', JSON.stringify(result.data.role));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const InformationMenu = [
    {
      category: 'What’s New',
      childs: [
        {
          label: 'Function Releases',
          url: '/information/releases/',
          pageView: ROLEPERMISSION.information.functionRelease.pageView.value,
        },
      ],
    },
    {
      category: 'WisDOM Service',
      childs: [
        {
          label: 'Operation Manual',
          url: `${AppConfig.operationUrl}?d=${new Date().valueOf()}`,
          pageView: 'allowed',
        },
        {
          label: 'Sitemap',
          url: '/information/sitemap/',
          pageView: ROLEPERMISSION.information.siteMap.pageView.value,
        },
        {
          label: 'System Guidebook',
          url: '/information/systemGuidebook/',
          pageView: ROLEPERMISSION.information.systemGuidebook.pageView.value,
        },
        {
          label: 'Data Security Policy',
          url: '/information/dataSecurityPolicy/',
          pageView:
            ROLEPERMISSION.information.dataSecurityPolicy.pageView.value,
        },
      ],
    },
    {
      category: 'Tutorial',
      childs: [
        {
          label: 'Learning By Functions',
          url: '/information/learningByFunctions/',
          pageView:
            ROLEPERMISSION.information.learningByFunctions.pageView.value,
        },
        {
          label: 'Learning By Scenarios',
          url: '/information/learningByScenarios/',
          pageView:
            ROLEPERMISSION.information.learningByScenarios.pageView.value,
        },
        {
          label: 'Workshop',
          url: '/information/workshop/',
          pageView: ROLEPERMISSION.information.workshop.pageView.value,
        },
      ],
    },
    {
      category: 'About',
      childs: [
        {
          label: `Version: ${navbarRight.version_string || ''}`,
          url: '',
          pageView: 'allowed',
        },
      ],
    },
  ];

  const openNotification = (DATA: MsgFormate[]) => {
    const args = {
      message: 'Notification',
      description: (
        <List
          dataSource={DATA}
          renderItem={item => (
            <List.Item
              id="menu-bell-listItem"
              style={{ display: 'flex', alignContent: 'center' }}
            >
              <div style={{ display: 'flex', alignContent: 'center' }}>
                <div>{item.message}</div>
              </div>
            </List.Item>
          )}
        />
      ),
      duration: 5,
      icon: <BellTwoTone twoToneColor="#20a7c9" />,
    };
    notification.open(args);
  };

  const getNewMsg = async () => {
    try {
      const req = {
        status: 0,
      };
      const result = await getLatestMsg.exec(req);
      openNotification(result);
    } catch (e) {
      console.log(e);
    }
  };

  const onFinish = () => {
    setBellTimeOut(true);
    setDeadline(Date.now() + 1000 * 60); // restart
  };

  useEffect(() => {
    if (showMessage) {
      // message.info('You got a new notification!');
      // openNotification();
      getNewMsg();
      setShowMessage(false);
    }
  }, [showMessage]);

  useEffect(() => {
    getRolePermission();
    setDeadline(Date.now() + 1000 * 60); // 1 min
  }, []);

  const renderMenu = () => {
    const tempMenu = menu
      .map(subMenu => {
        if (subMenu.label === 'Data' || subMenu.label === 'Logout') {
          return subMenu;
        }
        if (subMenu.childs && subMenu.childs.length > 0) {
          const tempChild = subMenu.childs.filter(sub =>
            ROLEPERMISSION.checkPermission(
              rolePermissionList,
              ROLEPERMISSION.returnPermissionKey(sub.label),
            ),
          );
          return { ...subMenu, childs: tempChild };
        }
        return subMenu;
      })
      .filter(section => section.childs && section.childs[0] !== '-');

    return tempMenu.map((item, index) => {
      const props = {
        ...item,
        isFrontendRoute: isFrontendRoute(item.url),
        childs: item.childs?.map(c => {
          if (typeof c === 'string') {
            return c;
          }

          return {
            ...c,
            isFrontendRoute: isFrontendRoute(c.url),
          };
        }),
      };
      if (
        // rolePermissionList.length > 0 &&
        !ROLEPERMISSION.checkPermission(
          rolePermissionList,
          ROLEPERMISSION.dataPipeline.pageView.value,
        )
      ) {
        NotShowMenu.push('Data Pipeline');
      } else {
        while (NotShowMenu.indexOf('Data Pipeline') !== -1) {
          NotShowMenu.splice(NotShowMenu.indexOf('Data Pipeline'), 1);
        }
      }

      if (
        // rolePermissionList.length > 0 &&
        !ROLEPERMISSION.checkPermission(
          rolePermissionList,
          ROLEPERMISSION.sqlLab.pageView.value,
        )
      ) {
        NotShowMenu.push('SQL Lab');
      } else {
        while (NotShowMenu.indexOf('SQL Lab') !== -1) {
          NotShowMenu.splice(NotShowMenu.indexOf('SQL Lab'), 1);
        }
      }

      if (NotShowMenu.includes(item.label)) {
        return null;
      }

      return <MenuObject {...props} key={item.label} index={index + 1} />;
    });
  };

  const renderDataApplicationTool = () => {
    const tempDataApplicationToolsMenu = DataApplicationToolsMenu.map(menu => {
      if (menu.childs.length > 0) {
        const tempChild = menu.childs.filter(sub =>
          ROLEPERMISSION.checkPermission(
            rolePermissionList,
            ROLEPERMISSION.returnPermissionKey(sub.label),
          ),
        );
        return { ...menu, childs: tempChild };
      }
      return menu;
    }).filter(section => section.childs && section.childs.length > 0);

    return (
      <DropdownMenu>
        {tempDataApplicationToolsMenu.map((section, index) => [
          <DropdownMenu.ItemGroup
            key={`${section.category}`}
            title={section.category}
          >
            {section.childs.map(child => (
              <DropdownMenu.Item key={`${child.label}`}>
                {isFrontendRoute(child.url) ? (
                  <Link to={child.url || ''}>{child.label}</Link>
                ) : (
                  <a href={child.url}>{child.label}</a>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.ItemGroup>,
          index < DataApplicationToolsMenu.length - 1 && (
            <DropdownMenu.Divider />
          ),
        ])}
      </DropdownMenu>
    );
  };

  const renderSettings = () => {
    const tempSettings = settings
      .map(menu => {
        if (menu.childs.length > 0) {
          if (menu.label === 'Security' && menu.childs.length > 0) {
            return menu;
          }
          const tempChild = menu.childs.filter(sub =>
            ROLEPERMISSION.checkPermission(
              rolePermissionList,
              ROLEPERMISSION.returnPermissionKey(sub.label),
            ),
          );
          return { ...menu, childs: tempChild };
        }
        return menu;
      })
      .filter(
        section =>
          section.childs &&
          section.childs[0] !== '-' &&
          section.childs.length !== 0,
      );

    return tempSettings.map((section, index) => [
      <DropdownMenu.ItemGroup key={`${section.label}`} title={section.label}>
        {section.childs?.map(child => {
          if (typeof child !== 'string') {
            return (
              <DropdownMenu.Item key={`${child.label}`}>
                {isFrontendRoute(child.url) ? (
                  <Link to={child.url || ''}>{child.label}</Link>
                ) : (
                  <a href={child.url}>{child.label}</a>
                )}
              </DropdownMenu.Item>
            );
          }
          return null;
        })}
      </DropdownMenu.ItemGroup>,
      index < settings.length - 1 && <DropdownMenu.Divider />,
    ]);
  };

  const renderInformation = () => {
    const tempInformationMenu = InformationMenu.map(menu => {
      if (menu.childs.length > 0) {
        const tempChild = menu.childs.filter(
          sub =>
            sub.pageView === 'allowed' ||
            ROLEPERMISSION.checkPermission(rolePermissionList, sub.pageView),
        );
        return { ...menu, childs: tempChild };
      }
      return menu;
    }).filter(section => section.childs && section.childs.length > 0);
    return (
      <>
        {ROLEPERMISSION.checkPermission(
          rolePermissionList,
          ROLEPERMISSION.information.pageView.value,
        ) ? (
          <NavDropdown
            id="informationMenu-dropdown"
            title={<i className="fa fa-question-circle" />}
            onMouseEnter={() => setDropdownOpenInfo(true)}
            onMouseLeave={() => setDropdownOpenInfo(false)}
            onToggle={value => setDropdownOpenInfo(value)}
            open={dropdownOpenInfo}
          >
            <DropdownMenu>
              {tempInformationMenu.map((section, index) => [
                <DropdownMenu.ItemGroup
                  key={`${section.category}`}
                  title={section.category}
                >
                  {section.childs.map(child => (
                    <Style.DropdownMenuItem
                      key={`${child.label}`}
                      childUrl={child.url}
                    >
                      {child.url === '' ? (
                        <p style={{ cursor: 'auto', color: '#323232' }}>
                          {child.label}
                        </p>
                      ) : (
                        <>
                          {isFrontendRoute(child.url) ? (
                            <Link to={child.url || ''}>{child.label}</Link>
                          ) : (
                            // eslint-disable-next-line react/jsx-no-target-blank
                            <a
                              href={child.url}
                              target={
                                child.label === 'Operation Manual'
                                  ? '_blank'
                                  : ''
                              }
                            >
                              {child.label}
                            </a>
                          )}
                        </>
                      )}
                    </Style.DropdownMenuItem>
                  ))}
                </DropdownMenu.ItemGroup>,
                index < InformationMenu.length - 1 && <DropdownMenu.Divider />,
              ])}
            </DropdownMenu>
          </NavDropdown>
        ) : null}
      </>
    );
  };

  return (
    <StyledHeader className="top" id="main-menu">
      <Countdown
        style={{ display: 'none' }}
        value={deadline}
        onFinish={onFinish}
      />
      <Navbar inverse fluid staticTop role="navigation">
        <Navbar.Header>
          <Navbar.Brand>
            <a className="navbar-brand" href={HOME_PAGE}>
              <img width={brand.width} src={brand.icon} alt={brand.alt} />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav data-test="navbar-top">
          {renderMenu()}
          {ROLEPERMISSION.checkPermission(
            rolePermissionList,
            ROLEPERMISSION.dataApplicationTools.pageView.value,
          ) ? (
            <NavDropdown
              id="dataApplicationTools-dropdown"
              title={t('Data Application Tools')}
              onMouseEnter={() => setDropdownOpenTools(true)}
              onMouseLeave={() => setDropdownOpenTools(false)}
              onToggle={value => setDropdownOpenTools(value)}
              open={dropdownOpenTools}
            >
              {renderDataApplicationTool()}
            </NavDropdown>
          ) : null}
        </Nav>
        <Nav className="navbar-right">
          {/* {!navbarRight.user_is_anonymous && <NewMenu />} */}
          {ROLEPERMISSION.checkPermission(
            rolePermissionList,
            ROLEPERMISSION.setting.pageView.value,
          ) ? (
            <NavDropdown
              id="settings-dropdown"
              title={t('Settings')}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              onToggle={value => setDropdownOpen(value)}
              open={dropdownOpen}
            >
              <DropdownMenu>
                {renderSettings()}
                {!navbarRight.user_is_anonymous && [
                  <DropdownMenu.Divider key="user-divider" />,
                  <DropdownMenu.ItemGroup key="user-section" title={t('User')}>
                    {navbarRight.user_profile_url && (
                      <DropdownMenu.Item key="profile">
                        <a href={navbarRight.user_profile_url}>
                          {t('Profile')}
                        </a>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item key="info">
                      <a href={navbarRight.user_info_url}>{t('Info')}</a>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item key="logout">
                      {/* <a href="/logoutAAD/">{t('Logout')}</a> */}
                      <a href={navbarRight.user_logout_url}>{t('Logout')}</a>
                    </DropdownMenu.Item>
                  </DropdownMenu.ItemGroup>,
                ]}
                {/* {(navbarRight.version_string || navbarRight.version_sha) && [
                <DropdownMenu.Divider key="version-info-divider" />,
                <DropdownMenu.ItemGroup key="about-section" title={t('About')}>
                  <div className="about-section">
                    {navbarRight.version_string && (
                      <li className="version-info">
                        <span>Version: {navbarRight.version_string}</span>
                      </li>
                    )}
                    {navbarRight.version_sha && (
                      <li className="version-info">
                        <span>SHA: {navbarRight.version_sha}</span>
                      </li>
                    )}
                  </div>
                </DropdownMenu.ItemGroup>,
              ]} */}
              </DropdownMenu>
            </NavDropdown>
          ) : null}

          {renderInformation()}

          {navbarRight.documentation_url && (
            <NavItem
              href={navbarRight.documentation_url}
              target="_blank"
              title="Documentation"
            >
              <i className="fa fa-question" />
              &nbsp;
            </NavItem>
          )}
          {navbarRight.bug_report_url && (
            <NavItem
              href={navbarRight.bug_report_url}
              target="_blank"
              title="Report a Bug"
            >
              <i className="fa fa-bug" />
              &nbsp;
            </NavItem>
          )}
          {navbarRight.show_language_picker && (
            <LanguagePicker
              locale={navbarRight.locale}
              languages={navbarRight.languages}
            />
          )}
          {/* {!navbarRight.user_is_anonymous && <HelpMenu />} */}
          {!navbarRight.user_is_anonymous && (
            <MatomoProvider value={instance}>
              <BellMenu
                bellTimeOut={bellTimeOut}
                setBellTimeOut={setBellTimeOut}
                setShowMessage={setShowMessage}
              />
            </MatomoProvider>
          )}
          {navbarRight.user_is_anonymous && (
            <NavItem href={navbarRight.user_login_url}>
              <i className="fa fa-fw fa-sign-in" />
              {t('Login')}
            </NavItem>
          )}
        </Nav>
      </Navbar>
    </StyledHeader>
  );
}

// transform the menu data to reorganize components
export default function MenuWrapper({ data, ...rest }: MenuProps) {
  const newMenuData = {
    ...data,
  };
  // Menu items that should go into settings dropdown
  const settingsMenus = {
    Security: true,
    Management: true,
  };

  // Cycle through menu.menu to build out cleanedMenu and settings
  const cleanedMenu: MenuObjectProps[] = [];
  const settings: MenuObjectProps[] = [];
  newMenuData.menu.forEach((item: any) => {
    if (!item) {
      return;
    }

    const children: (MenuObjectProps | string)[] = [];
    const newItem = {
      ...item,
    };

    // Filter childs
    if (item.childs) {
      item.childs.forEach((child: any) => {
        if (typeof child === 'string') {
          children.push(child);
        } else if ((child as MenuObjectChildProps).label) {
          children.push(child);
        }
      });

      newItem.childs = children;
    }

    if (!settingsMenus.hasOwnProperty(item.name)) {
      cleanedMenu.push(newItem);
    } else {
      settings.push(newItem);
    }
  });

  newMenuData.menu = cleanedMenu;
  newMenuData.settings = settings;

  return <Menu data={newMenuData} {...rest} />;
}
