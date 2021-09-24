import {
  //   DefaultPortModel,
  NodeModel,
  PortModelAlignment,
} from '@projectstorm/react-diagrams';
import { ETLPortModel } from '~~components/ETLPort/ETLPortModel';

const INIT_PAYLOAD = [];

export class JoinNodeModel extends NodeModel {
  constructor(options = {}) {
    super({
      ...options,
      type: 'JoinNode',
    });

    this.portsOut = [];
    this.portsIn = [];
    this.validator = () => null;
    this.addOutPort('addOutPort');
    this.addInPort('addInPort');

    this.payload = [...INIT_PAYLOAD];
    this.editMode = false;
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
      portsInOrder: this.portsIn.map(port => port.getID()),
      portsOutOrder: this.portsOut.map(port => port.getID()),
      name: this.options.name,
      payload: this.payload,
      options: { key: this.options.key, locked: this.isLocked() },
    };
  }

  deserialize(ob, engine) {
    super.deserialize(ob, engine);
    this.options.name = ob.data.name;
    this.portsIn = ob.data.portsInOrder.map(id => this.getPortFromID(id));
    this.portsOut = ob.data.portsOutOrder.map(id => this.getPortFromID(id));
    this.options.key = ob.data.options.key;
    this.payload = ob.data.payload;
    this.editMode = true;
  }

  getInPorts() {
    return this.portsIn;
  }

  getOutPorts() {
    return this.portsOut;
  }

  getModalData() {
    return this.payload;
  }

  setModalData(data) {
    this.payload = data;
  }

  resetModalData(data) {
    this.payload = data || [...INIT_PAYLOAD];
  }

  setValidate(validator) {
    this.validator = validator;
  }

  validate() {
    return this.validator();
  }

  isEditMode() {
    return this.editMode;
  }

  cleanNode() {
    this.resetModalData();
  }
}
