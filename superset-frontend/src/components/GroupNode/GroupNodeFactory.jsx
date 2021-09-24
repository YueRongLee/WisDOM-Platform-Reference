import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { GroupNodeModel } from './GroupNodeModel';
import { GroupNodeWidget } from './GroupNodeWidget';

export class GroupNodeFactory extends AbstractReactFactory {
  constructor() {
    super('GroupNode');
  }

  generateModel() {
    return new GroupNodeModel();
  }

  generateReactWidget(event) {
    return <GroupNodeWidget engine={this.engine} node={event.model} />;
  }
}
