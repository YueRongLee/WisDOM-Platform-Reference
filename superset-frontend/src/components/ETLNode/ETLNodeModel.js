import {
  //   DefaultPortModel,
  NodeModel,
  PortModelAlignment,
} from '@projectstorm/react-diagrams';
import { ETLPortModel } from '~~components/ETLPort/ETLPortModel';

export class ETLNodeModel extends NodeModel {
  constructor(options = {}) {
    super({
      ...options,
      type: 'ETLNode',
    });
    this.color = options.color || { options: 'red' };

    this.portsOut = [];
    this.portsIn = [];
  }

  removePort(port) {
    super.removePort(port);
    if (port.getOptions().in) {
      this.portsIn.splice(this.portsIn.indexOf(port), 1);
    } else {
      this.portsOut.splice(this.portsOut.indexOf(port), 1);
    }
  }

  addPort(port) {
    super.addPort(port);
    if (port.getOptions().in) {
      if (this.portsIn.indexOf(port) === -1) {
        this.portsIn.push(port);
      }
    } else if (this.portsOut.indexOf(port) === -1) {
      this.portsOut.push(port);
    }
    return port;
  }

  addInPort(label, after = true) {
    const p = new ETLPortModel({
      in: true,
      name: label,
      label,
      alignment: PortModelAlignment.LEFT,
    });
    if (!after) {
      this.portsIn.splice(0, 0, p);
    }
    return this.addPort(p);
  }

  addOutPort(label, after = true) {
    const p = new ETLPortModel({
      in: false,
      name: label,
      label,
      alignment: PortModelAlignment.RIGHT,
      allowPort: [
        'OutputSettingNode',
        'JoinNode',
        'GroupNode',
        'CalculateNode',
        'WhereNode',
      ],
      maximumLinks: 1,
    });
    if (!after) {
      this.portsOut.splice(0, 0, p);
    }
    return this.addPort(p);
  }

  serialize() {
    return {
      ...super.serialize(),
      color: this.color,
      portsInOrder: this.portsIn.map(port => port.getID()),
      portsOutOrder: this.portsOut.map(port => port.getID()),
      name: this.options.name,
      options: { key: this.options.key, locked: this.isLocked() },
    };
  }

  deserialize(ob, engine) {
    super.deserialize(ob, engine);
    this.options.name = ob.data.name;
    this.portsIn = ob.data.portsInOrder.map(id => this.getPortFromID(id));
    this.portsOut = ob.data.portsOutOrder.map(id => this.getPortFromID(id));
    this.options.key = ob.data.options.key;
    this.color = ob.data.color;
  }

  getInPorts() {
    return this.portsIn;
  }

  getOutPorts() {
    return this.portsOut;
  }
}
