import {
  //   DefaultPortModel,
  NodeModel,
  PortModelAlignment,
} from '@projectstorm/react-diagrams';
import { ETLPortModel } from '~~components/ETLPort/ETLPortModel';
import { OUTPUT_TYPE } from '~~constants/index';

const DEFAULT_SELECTED = false; // 預設全不選

const INIT_VALUE = OUTPUT_TYPE.getOptionList().map(type => ({
  ...type,
  selected: DEFAULT_SELECTED,
}));

export class OutputNodeModel extends NodeModel {
  constructor(options = {}) {
    super({
      ...options,
      type: 'OutputNode',
    });

    this.portsOut = [];
    this.portsIn = [];
    this.addInPort('addInPort');

    this.payload = [].concat(INIT_VALUE.map(value => ({ ...value })));
    this.validator = () => null;
    this.editMode = false;

    this.registerListener({
      entityRemoved: e => {
        e.stopPropagation();
      },
    });
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
      allowPort: ['OutputSettingNode'],
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

  getAllOutputType() {
    return INIT_VALUE.map(type => ({
      ...type,
      ...this.payload.find(value => value.key === type.key),
    }));
  }

  setAllOutputType(newPayload) {
    this.payload = newPayload;
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

  setEditMode(newEditMode) {
    this.editMode = newEditMode;
  }
}
