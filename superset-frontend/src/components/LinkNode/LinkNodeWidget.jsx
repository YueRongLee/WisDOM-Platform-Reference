import * as React from 'react';
// import { Modal, Tooltip } from 'antd';
// import { DiagramModel } from '@projectstorm/react-diagrams';
// import SelectableButton from '../SelectableButton/SelectableButton';
// import './LinkNodeStyle.less';

export class LinkNodeWidget extends React.Component {
  constructor(props) {
    super(props);
    this.percent = 0;
  }

  // eslint-disable-next-line react/state-in-constructor
  // state = {
  //   path: this.props || {},
  //   circle: this.props.path || {},
  //   callback: undefined,
  //   percent: 0,
  //   handle: undefined,
  //   mounted: false,
  // };

  componentDidMount() {
    this.mounted = true;
    this.callback = () => {
      if (!this.circle || !this.path) {
        return;
      }

      this.percent += 2;
      if (this.percent > 100) {
        this.percent = 0;
      }

      const point = this.path.getPointAtLength(
        this.path.getTotalLength() * (this.percent / 100.0),
      );

      this.circle.setAttribute('cx', `${point.x}`);
      this.circle.setAttribute('cy', `${point.y}`);

      if (this.mounted) {
        requestAnimationFrame(this.callback);
      }
    };
    requestAnimationFrame(this.callback);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    return (
      <>
        <path
          fill="none"
          ref={ref => {
            this.path = ref;
          }}
          strokeWidth={this.props.model.getOptions().width}
          stroke="rgba(255,0,0,0.5)"
          d={this.props.path}
        />
        <circle
          ref={ref => {
            this.circle = ref;
          }}
          r={10}
          fill="orange"
        />
      </>
    );
  }
}
