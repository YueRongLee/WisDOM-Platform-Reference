import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { JoinNodeModel } from './JoinNodeModel';
import { JoinNodeWidget } from './JoinNodeWidget';

export class JoinNodeFactory extends AbstractReactFactory {
  constructor() {
    super('JoinNode');
  }

  generateModel() {
    return new JoinNodeModel();
  }

  generateReactWidget(event) {
    return <JoinNodeWidget engine={this.engine} node={event.model} />;
  }
}
