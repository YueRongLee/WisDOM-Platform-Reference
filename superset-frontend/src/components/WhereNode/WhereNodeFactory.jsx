import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { WhereNodeModel } from './WhereNodeModel';
import { WhereNodeWidget } from './WhereNodeWidget';

export class WhereNodeFactory extends AbstractReactFactory {
  constructor() {
    super('WhereNode');
  }

  generateModel() {
    return new WhereNodeModel();
  }

  generateReactWidget(event) {
    return <WhereNodeWidget engine={this.engine} node={event.model} />;
  }
}
