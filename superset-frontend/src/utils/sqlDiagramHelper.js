// 拿到這個Link id下往前所有table
export const getTablesFromLinkId = (engine, linkid) => {
  const link = engine.model.getLink(linkid);
  const sourcePort = link && link.getSourcePort();
  const source = sourcePort && sourcePort.getNode();
  const nodeInPort = source && source.getInPorts()[0];
  const nodeInLinks = nodeInPort && Object.values(nodeInPort.getLinks());
  let tables = [];
  (nodeInLinks || []).forEach(lk => {
    tables = tables.concat(getTablesFromLinkId(engine, lk.getID()));
  });
  const thisNodeTable = source && source.getTable && source.getTable();
  return tables.concat(thisNodeTable);
};

// 拿到這個node id下往前所有table
export const getTablesFromNodeId = (engine, nodeId) => {
  const node = engine.model.getNode(nodeId);
  const inPort = node.getInPorts()[0];
  const links = inPort && Object.values(inPort.getLinks());
  let tables = [];
  links.forEach(link => {
    tables = tables
      .concat(getTablesFromLinkId(engine, link.getID()))
      .filter(table => table !== undefined);
  });
  return tables;
};

// 拿到這個Link object下往後所有node
export const getAfterNodesFromLink = link => {
  const targetPort = link && link.getTargetPort();
  const target = targetPort && targetPort.getNode();
  const nodeOutPort = target && target.getOutPorts()[0];
  const nodeOutLinks = nodeOutPort && Object.values(nodeOutPort.getLinks());
  let nodes = [];
  (nodeOutLinks || []).forEach(lk => {
    nodes = nodes.concat(getAfterNodesFromLink(lk));
  });
  return nodes.concat(target).filter(node => node !== undefined);
};

// 拿到這個node object下往後所有node
export const getAfterNodesFromNode = node => {
  const outPort = node.getOutPorts()[0];
  const links = outPort && Object.values(outPort.getLinks());
  let nodes = [];
  links.forEach(link => {
    nodes = nodes.concat(getAfterNodesFromLink(link));
  });
  return nodes.filter(table => table !== undefined);
};
