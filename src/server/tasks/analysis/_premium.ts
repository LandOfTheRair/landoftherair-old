
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../../database';
import { get, some } from 'lodash';

import * as CLITable from 'cli-table';

export const drawPremium = async () => {
  await DB.init();

  const allAccounts = await DB.$accounts.find({}, { silver: 1, silverPurchases: 1 }).toArray();

  const avgHash = {};
  const totalHash = {};

  const allSilvers = [
    'MorePotions',
    'MoreCharacters',
    'BiggerBelt',
    'BiggerSack',
    'MagicPouch',
    'SharedLockers',
    'FestivalXP',
    'FestivalGold',
    'FestivalTrait',
    'FestivalSkill'
  ];

  const purchasingAccounts = allAccounts.filter(acc => some(allSilvers, p => get(acc, `silverPurchases.${p}`)));

  const table = new CLITable({
    head: ['Silver Item', '# Purchases', 'Avg. Purchases'],
    colWidths: [20, 20, 20]
  });

  allSilvers.forEach(silverPurchase => {
    avgHash[silverPurchase] = avgHash[silverPurchase] || 0;
    totalHash[silverPurchase] = totalHash[silverPurchase] || 0;

    purchasingAccounts.forEach(acc => {
      totalHash[silverPurchase] += get(acc, `silverPurchases.${silverPurchase}`, 0);
    });

    avgHash[silverPurchase] = totalHash[silverPurchase] / purchasingAccounts.length;

    table.push([silverPurchase, totalHash[silverPurchase], avgHash[silverPurchase]]);
  });

  return table.toString();
};
