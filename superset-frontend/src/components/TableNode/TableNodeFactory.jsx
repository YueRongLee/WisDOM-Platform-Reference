import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { TableNodeModel } from './TableNodeModel';
import { TableNodeWidget } from './TableNodeWidget';

export class TableNodeFactory extends AbstractReactFactory {
  constructor() {
    super('TableNode');
  }

  generateModel() {
    return new TableNodeModel();
  }

  generateReactWidget(event) {
    return <TableNodeWidget engine={this.engine} node={event.model} />;
  }
}
