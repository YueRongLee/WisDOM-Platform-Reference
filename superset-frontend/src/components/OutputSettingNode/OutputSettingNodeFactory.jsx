import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { OutputSettingNodeModel } from './OutputSettingNodeModel';
import { OutputSettingNodeWidget } from './OutputSettingNodeWidget';

export class OutputSettingNodeFactory extends AbstractReactFactory {
  constructor() {
    super('OutputSettingNode');
  }

  generateModel() {
    return new OutputSettingNodeModel();
  }

  generateReactWidget(event) {
    return <OutputSettingNodeWidget engine={this.engine} node={event.model} />;
  }
}
