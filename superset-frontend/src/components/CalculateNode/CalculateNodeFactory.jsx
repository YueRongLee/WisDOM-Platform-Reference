import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { CalculateNodeModel } from './CalculateNodeModel';
import { CalculateNodeWidget } from './CalculateNodeWidget';

export class CalculateNodeFactory extends AbstractReactFactory {
  constructor() {
    super('CalculateNode');
  }

  generateModel() {
    return new CalculateNodeModel();
  }

  generateReactWidget(event) {
    return <CalculateNodeWidget engine={this.engine} node={event.model} />;
  }
}
