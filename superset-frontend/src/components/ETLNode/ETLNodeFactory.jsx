import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { ETLNodeModel } from './ETLNodeModel';
import { ETLNodeWidget } from './ETLNodeWidget';

export class ETLNodeFactory extends AbstractReactFactory {
  constructor() {
    super('ETLNode');
  }

  generateModel() {
    return new ETLNodeModel();
  }

  generateReactWidget(event) {
    return <ETLNodeWidget engine={this.engine} node={event.model} />;
  }
}
