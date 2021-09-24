import * as React from 'react';
import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
// import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { LinkNodeModel } from './LinkNodeModel';
import { LinkNodeWidget } from './LinkNodeWidget';

export class LinkNodeFactory extends DefaultLinkFactory {
  constructor() {
    super('LinkNode'); // <-- this matches with the link model above
  }

  generateModel() {
    return new LinkNodeModel(); // <-- this is how we get new instances
  }

  // generateLinkSegment(event) {
  //     return <LinkNodeWidget engine={this.engine} node={event.model} />;
  // }

  generateLink(model, path) {
    return <LinkNodeWidget model={model} path={path} />;
  }
}
