
import { Player } from '../../models/player';
import { set, startsWith } from 'lodash';

export abstract class Command {

  static macroMetadata: any = {};
  abstract name: string|string[];
  format = '';

  abstract execute(player: Player, args);

  getMergeObjectFromArgs(args) {
    const matches = args.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);

    const mergeObj = matches.reduce((obj, prop) => {
      const propData = prop.split('=');
      const key = propData[0];
      let val = propData[1];

      if(!val) return obj;

      val = val.trim();

      if(!isNaN(+val)) {
        val = +val;
      } else if(startsWith(val, '"')) {
        val = val.substring(1, val.length - 1);
      }

      set(obj, key.trim(), val);
      return obj;
    }, {});

    return mergeObj;
  }
}
