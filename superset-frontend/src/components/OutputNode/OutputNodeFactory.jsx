import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { OutputNodeModel } from './OutputNodeModel';
import { OutputNodeWidget } from './OutputNodeWidget';

export class OutputNodeFactory extends AbstractReactFactory {
  constructor() {
    super('OutputNode');
  }

  generateModel() {
    return new OutputNodeModel();
  }

  generateReactWidget(event) {
    return <OutputNodeWidget engine={this.engine} node={event.model} />;
  }
}
