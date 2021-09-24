import { styled } from '@superset-ui/core';

export const DataApplicationToolsMenu = [
  {
    category: 'Data Visualization',
    childs: [
      {
        label: 'Power BI Template',
        url: '/application/powerbiTemplate/',
      },
      {
        label: 'Charts',
        url: '/chart/list/',
      },
      {
        label: 'Dashboards',
        url: '/dashboard/list/',
      },
    ],
  },
  {
    category: 'Target Prediction',
    childs: [
      {
        label: 'DataRobot Model List',
        url: '/application/dataRobotModelList/',
      },
    ],
  },
];

export const NotShowMenu = [
  'Power BI Template',
  'Data Robot ModelList',
  'Function Releases',
  'Sitemap',
  'System Guidebook',
  'Data Security Policy',
  'Learning By Functions',
  'Learning By Scenarios',
  'Workshop',
  'Charts',
  'Dashboards',
];

export const StyledHeader = styled.header`
  &:nth-last-of-type(2) nav {
    margin-bottom: 2px;
  }

  .caret {
    display: none;
  }

  .navbar-inverse {
    border: none;
  }

  .version-info {
    padding: ${({ theme }) => theme.gridUnit * 1.5}px
      ${({ theme }) => theme.gridUnit * 4}px
      ${({ theme }) => theme.gridUnit * 1.5}px
      ${({ theme }) => theme.gridUnit * 7}px;
    color: ${({ theme }) => theme.colors.grayscale.base};
    font-size: ${({ theme }) => theme.typography.sizes.xs}px;

    div {
      white-space: nowrap;
    }
  }

  .navbar-brand {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .nav > li > a {
    padding: ${({ theme }) => theme.gridUnit * 4}px;
  }
  .dropdown-header {
    text-transform: uppercase;
    padding-left: 12px;
  }

  .navbar-inverse .navbar-nav li a {
    color: ${({ theme }) => theme.colors.grayscale.dark1};
    border-bottom: none;
    transition: background-color ${({ theme }) => theme.transitionTiming}s;
    &:after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 50%;
      width: 0;
      height: 3px;
      opacity: 0;
      transform: translateX(-50%);
      transition: all ${({ theme }) => theme.transitionTiming}s;
      background-color: ${({ theme }) => theme.colors.primary.base};
    }
    &:focus {
      border-bottom: none;
      background-color: transparent;
      /* background-color: ${({ theme }) => theme.colors.primary.light5}; */
    }
    &:hover {
      color: ${({ theme }) => theme.colors.grayscale.dark1};
      background-color: ${({ theme }) => theme.colors.primary.light5};
      border-bottom: none;
      margin: 0;
      &:after {
        opacity: 1;
        width: 100%;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
  }

  .ant-menu {
    .ant-menu-item-group-title {
      padding-bottom: ${({ theme }) => theme.gridUnit}px;
    }
    .ant-menu-item {
      margin-bottom: ${({ theme }) => theme.gridUnit * 2}px;
    }
    .about-section {
      margin: ${({ theme }) => theme.gridUnit}px 0
        ${({ theme }) => theme.gridUnit * 2}px;
    }
  }
`;
