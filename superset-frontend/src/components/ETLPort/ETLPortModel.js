import { PortModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { LinkNodeModel } from 'src/components/LinkNode/LinkNodeModel';

export class ETLPortModel extends PortModel {
  constructor(options) {
    super({
      label: options.label || options.name,
      alignment: options.in
        ? PortModelAlignment.LEFT
        : PortModelAlignment.RIGHT,
      type: 'ETLPort',
      ...options,
    });
  }

  deserialize(event) {
    super.deserialize(event);
    this.options.in = event.data.in;
    this.options.label = event.data.label;
    this.options.allowPort = event.data.allowPort;
  }

  serialize() {
    return {
      ...super.serialize(),
      in: this.options.in,
      label: this.options.label,
      allowPort: this.options.allowPort,
    };
  }

  link(port, factory) {
    const link = this.createLinkModel(factory);
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link;
  }

  canLinkToPort(port) {
    if (port instanceof ETLPortModel) {
      return this.options.in !== port.getOptions().in;
    }
    return true;
  }

  createLinkModel() {
    return new LinkNodeModel();
  }
}
