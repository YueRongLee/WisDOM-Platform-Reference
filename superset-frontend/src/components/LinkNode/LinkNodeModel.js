import { DefaultLinkModel } from '@projectstorm/react-diagrams';

export class LinkNodeModel extends DefaultLinkModel {
  constructor() {
    super({
      type: 'LinkNode',
      width: 2,
    });

    this.registerListener({
      targetPortChanged: () => {
        if (this.getSourcePort() !== null) {
          const allowPorts = this.getSourcePort().options.allowPort;
          const target = this.getTargetPort();
          const source = this.getSourcePort();
          const link1 = Object.values(this.getSourcePort().links);
          const link2 = Object.values(this.getTargetPort().links); // 反向
          const Idx =
            allowPorts !== undefined || allowPorts === null
              ? allowPorts.findIndex(
                  sel => sel === target.getParent().options.type,
                )
              : 0; // 無白名單都可拉

          const newLinkID = [target.getID(), source.getID()];

          // 重複
          if (target !== null && source !== null) {
            const repeat = link1.filter(
              e =>
                newLinkID.indexOf(
                  e.getSourcePort() && e.getSourcePort().getID(),
                ) > -1,
            );

            const repeat2 = link1.filter(
              e =>
                newLinkID.indexOf(
                  e.getTargetPort() && e.getTargetPort().getID(),
                ) > -1,
            );

            if (repeat.length >= 2 && repeat2.length >= 2) this.remove();
          }

          // 白名單
          if (Idx === -1) this.remove();

          // maxlimit
          const limit =
            this.getSourcePort().options.maximumLinks === undefined
              ? 50
              : this.getSourcePort().options.maximumLinks;
          const limit2 =
            this.getTargetPort().options.maximumLinks === undefined
              ? 50
              : this.getTargetPort().options.maximumLinks;
          if (link1.length > limit || link2.length > limit2) {
            this.remove();
          }
        }
      },
      //   sourcePortChanged: () => {
      //   },
    });
  }
}
