
import * as _ from 'lodash';
import * as CLITable from 'cli-table';

import { AllTrees } from '../../../shared/generated/skilltrees';

Object.keys(AllTrees).forEach(prof => {
  const skillTreeData = AllTrees[prof];

  const clusterStats = [];

  _(skillTreeData)
    .values()
    .groupBy('cluster')
    .forEach((skills, clusterId) => {
      clusterStats[clusterId] = {
        nodes: skills.length,
        totalCost: _.sumBy(skills, 'cost'),
        title: _.find(skills, { root: true }).name,
        traits: _.filter(skills, skill => skill.traitName).length,
        skills: _.filter(skills, skill => !skill.traitName).length
      };
    });

  console.log(`${prof} Skill Tree Stats:`);

  const table = new CLITable({
    head: ['Tree Branch', '# Nodes', '# Skills', '# Traits', 'Total Cost'],
    colWidths: [15, 10, 10, 10, 12]
  });

  const totals = ['Total', 0, 0, 0, 0];

  clusterStats.forEach(({ nodes, totalCost, title, skills, traits }) => {
    table.push([title, nodes, skills, traits, totalCost]);
    totals[1] += nodes;
    totals[2] += skills;
    totals[3] += traits;
    totals[4] += totalCost;
  });

  table.push(totals);

  console.log(table.toString());
});
