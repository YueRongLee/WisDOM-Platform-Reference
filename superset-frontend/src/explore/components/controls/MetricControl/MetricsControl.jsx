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
import React from 'react';
import PropTypes from 'prop-types';
import { t, withTheme } from '@superset-ui/core';
import { isEqual } from 'lodash';
import ControlHeader from 'src/explore/components/ControlHeader';
import columnType from 'src/explore/propTypes/columnType';
import {
  AGGREGATES_OPTIONS,
  sqlaAutoGeneratedMetricNameRegex,
  druidAutoGeneratedMetricRegex,
} from 'src/explore/constants';
import Icon from 'src/components/Icon';
import {
  AddIconButton,
  AddControlLabel,
  HeaderContainer,
  LabelsContainer,
} from 'src/explore/components/OptionControls';
import MetricDefinitionOption from './MetricDefinitionOption';
import MetricDefinitionValue from './MetricDefinitionValue';
import AdhocMetric from './AdhocMetric';
import savedMetricType from './savedMetricType';
import adhocMetricType from './adhocMetricType';
import AdhocMetricPopoverTrigger from './AdhocMetricPopoverTrigger';

const propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, adhocMetricType])),
    PropTypes.oneOfType([PropTypes.string, adhocMetricType]),
  ]),
  columns: PropTypes.arrayOf(columnType),
  savedMetrics: PropTypes.arrayOf(savedMetricType),
  isLoading: PropTypes.bool,
  multi: PropTypes.bool,
  clearable: PropTypes.bool,
  datasourceType: PropTypes.string,
};

const defaultProps = {
  onChange: () => {},
  clearable: true,
  savedMetrics: [],
  columns: [],
};

function getOptionsForSavedMetrics(
  savedMetrics,
  currentMetricValues,
  currentMetric,
) {
  return (
    savedMetrics?.filter(savedMetric =>
      Array.isArray(currentMetricValues)
        ? !currentMetricValues.includes(savedMetric.metric_name) ||
          savedMetric.metric_name === currentMetric
        : savedMetric,
    ) ?? []
  );
}

function isDictionaryForAdhocMetric(value) {
  return value && !(value instanceof AdhocMetric) && value.expressionType;
}

function columnsContainAllMetrics(value, nextProps) {
  const columnNames = new Set(
    [...(nextProps.columns || []), ...(nextProps.savedMetrics || [])]
      // eslint-disable-next-line camelcase
      .map(({ column_name, metric_name }) => column_name || metric_name),
  );

  return (
    (Array.isArray(value) ? value : [value])
      .filter(metric => metric)
      // find column names
      .map(metric =>
        metric.column
          ? metric.column.column_name
          : metric.column_name || metric,
      )
      .filter(name => name && typeof name === 'string')
      .every(name => columnNames.has(name))
  );
}

// adhoc metrics are stored as dictionaries in URL params. We convert them back into the
// AdhocMetric class for typechecking, consistency and instance method access.
function coerceAdhocMetrics(value) {
  if (!value) {
    return [];
  }
  if (!Array.isArray(value)) {
    if (isDictionaryForAdhocMetric(value)) {
      return [new AdhocMetric(value)];
    }
    return [value];
  }
  return value.map(val => {
    if (isDictionaryForAdhocMetric(val)) {
      return new AdhocMetric(val);
    }
    return val;
  });
}

class MetricsControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.onMetricEdit = this.onMetricEdit.bind(this);
    this.onNewMetric = this.onNewMetric.bind(this);
    this.onRemoveMetric = this.onRemoveMetric.bind(this);
    this.moveLabel = this.moveLabel.bind(this);
    this.checkIfAggregateInInput = this.checkIfAggregateInInput.bind(this);
    this.optionsForSelect = this.optionsForSelect.bind(this);
    this.selectFilterOption = this.selectFilterOption.bind(this);
    this.isAutoGeneratedMetric = this.isAutoGeneratedMetric.bind(this);
    this.optionRenderer = option => <MetricDefinitionOption option={option} />;
    this.valueRenderer = (option, index) => (
      <MetricDefinitionValue
        key={index}
        index={index}
        option={option}
        onMetricEdit={this.onMetricEdit}
        onRemoveMetric={() => this.onRemoveMetric(index)}
        columns={this.props.columns}
        datasource={this.props.datasource}
        savedMetrics={this.props.savedMetrics}
        savedMetricsOptions={getOptionsForSavedMetrics(
          this.props.savedMetrics,
          this.props.value,
          this.props.value?.[index],
        )}
        datasourceType={this.props.datasourceType}
        onMoveLabel={this.moveLabel}
        onDropLabel={() => this.props.onChange(this.state.value)}
      />
    );
    this.select = null;
    this.selectRef = ref => {
      if (ref) {
        this.select = ref.select;
      } else {
        this.select = null;
      }
    };
    this.state = {
      aggregateInInput: null,
      options: this.optionsForSelect(this.props),
      value: coerceAdhocMetrics(this.props.value),
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (
      !isEqual(this.props.columns, nextProps.columns) ||
      !isEqual(this.props.savedMetrics, nextProps.savedMetrics)
    ) {
      this.setState({ options: this.optionsForSelect(nextProps) });

      // Remove all metrics if selected value no longer a valid column
      // in the dataset. Must use `nextProps` here because Redux reducers may
      // have already updated the value for this control.
      if (!columnsContainAllMetrics(nextProps.value, nextProps)) {
        this.props.onChange([]);
      }
    }
    if (value !== nextProps.value) {
      this.setState({ value: coerceAdhocMetrics(nextProps.value) });
    }
  }

  onNewMetric(newMetric) {
    this.setState(
      prevState => ({
        ...prevState,
        value: [...prevState.value, newMetric],
      }),
      () => {
        this.onChange(this.state.value);
      },
    );
  }

  onMetricEdit(changedMetric, oldMetric) {
    this.setState(
      prevState => ({
        value: prevState.value.map(value => {
          if (
            // compare saved metrics
            value === oldMetric.metric_name ||
            // compare adhoc metrics
            typeof value.optionName !== 'undefined'
              ? value.optionName === oldMetric.optionName
              : false
          ) {
            return changedMetric;
          }
          return value;
        }),
      }),
      () => {
        this.onChange(this.state.value);
      },
    );
  }

  onRemoveMetric(index) {
    if (!Array.isArray(this.state.value)) {
      return;
    }
    const valuesCopy = [...this.state.value];
    valuesCopy.splice(index, 1);
    this.setState(prevState => ({
      ...prevState,
      value: valuesCopy,
    }));
    this.props.onChange(valuesCopy);
  }

  onChange(opts) {
    // if clear out options
    if (opts === null) {
      this.props.onChange(null);
      return;
    }

    let transformedOpts;
    if (Array.isArray(opts)) {
      transformedOpts = opts;
    } else {
      transformedOpts = opts ? [opts] : [];
    }
    const optionValues = transformedOpts
      .map(option => {
        // pre-defined metric
        if (option.metric_name) {
          return option.metric_name;
        }
        return option;
      })
      .filter(option => option);
    this.props.onChange(this.props.multi ? optionValues : optionValues[0]);
  }

  moveLabel(dragIndex, hoverIndex) {
    const { value } = this.state;

    const newValues = [...value];
    [newValues[hoverIndex], newValues[dragIndex]] = [
      newValues[dragIndex],
      newValues[hoverIndex],
    ];
    this.setState({ value: newValues });
  }

  isAddNewMetricDisabled() {
    return !this.props.multi && this.state.value.length > 0;
  }

  addNewMetricPopoverTrigger(trigger) {
    if (this.isAddNewMetricDisabled()) {
      return trigger;
    }
    return (
      <AdhocMetricPopoverTrigger
        adhocMetric={new AdhocMetric({ isNew: true })}
        onMetricEdit={this.onNewMetric}
        columns={this.props.columns}
        savedMetricsOptions={getOptionsForSavedMetrics(
          this.props.savedMetrics,
          this.props.value,
          null,
        )}
        datasource={this.props.datasource}
        savedMetric={{}}
        datasourceType={this.props.datasourceType}
        createNew
      >
        {trigger}
      </AdhocMetricPopoverTrigger>
    );
  }

  checkIfAggregateInInput(input) {
    const lowercaseInput = input.toLowerCase();
    const aggregateInInput =
      AGGREGATES_OPTIONS.find(x =>
        lowercaseInput.startsWith(`${x.toLowerCase()}(`),
      ) || null;
    this.clearedAggregateInInput = this.state.aggregateInInput;
    this.setState({ aggregateInInput });
  }

  optionsForSelect(props) {
    const { columns, savedMetrics } = props;
    const aggregates =
      columns && columns.length
        ? AGGREGATES_OPTIONS.map(aggregate => ({
            aggregate_name: aggregate,
          }))
        : [];
    const options = [
      ...(columns || []),
      ...aggregates,
      ...(savedMetrics || []),
    ];

    return options.reduce((results, option) => {
      if (option.metric_name) {
        results.push({ ...option, optionName: option.metric_name });
      } else if (option.column_name) {
        results.push({ ...option, optionName: `_col_${option.column_name}` });
      } else if (option.aggregate_name) {
        results.push({
          ...option,
          optionName: `_aggregate_${option.aggregate_name}`,
        });
      }
      return results;
    }, []);
  }

  isAutoGeneratedMetric(savedMetric) {
    if (this.props.datasourceType === 'druid') {
      return druidAutoGeneratedMetricRegex.test(savedMetric.verbose_name);
    }
    return sqlaAutoGeneratedMetricNameRegex.test(savedMetric.metric_name);
  }

  selectFilterOption({ data: option }, filterValue) {
    if (this.state.aggregateInInput) {
      let endIndex = filterValue.length;
      if (filterValue.endsWith(')')) {
        endIndex = filterValue.length - 1;
      }
      const valueAfterAggregate = filterValue.substring(
        filterValue.indexOf('(') + 1,
        endIndex,
      );
      return (
        option.column_name &&
        option.column_name.toLowerCase().indexOf(valueAfterAggregate) >= 0
      );
    }
    return (
      option.optionName &&
      (!option.metric_name ||
        !this.isAutoGeneratedMetric(option) ||
        option.verbose_name) &&
      (option.optionName.toLowerCase().indexOf(filterValue) >= 0 ||
        (option.verbose_name &&
          option.verbose_name.toLowerCase().indexOf(filterValue) >= 0))
    );
  }

  render() {
    const { theme } = this.props;
    return (
      <div className="metrics-select">
        <HeaderContainer>
          <ControlHeader {...this.props} />
          {this.addNewMetricPopoverTrigger(
            <AddIconButton
              disabled={this.isAddNewMetricDisabled()}
              data-test="add-metric-button"
            >
              <Icon
                name="plus-large"
                width={theme.gridUnit * 3}
                height={theme.gridUnit * 3}
                color={theme.colors.grayscale.light5}
              />
            </AddIconButton>,
          )}
        </HeaderContainer>
        <LabelsContainer>
          {this.state.value.length > 0
            ? this.state.value.map((value, index) =>
                this.valueRenderer(value, index),
              )
            : this.addNewMetricPopoverTrigger(
                <AddControlLabel>
                  <Icon
                    name="plus-small"
                    color={theme.colors.grayscale.light1}
                  />
                  {t('Add metric')}
                </AddControlLabel>,
              )}
        </LabelsContainer>
      </div>
    );
  }
}

MetricsControl.propTypes = propTypes;
MetricsControl.defaultProps = defaultProps;

export default withTheme(MetricsControl);
