
import test from 'ava-ts';
import * as recurse from 'recursive-readdir';

import { includes } from 'lodash';

test('All macro metadata blobs have the correct syntax', async t => {
  const commands = await recurse(`${__dirname}/../scripts/commands`);

  commands.forEach(command => {
    if(includes(command, 'index')) return;
    const cmd = require(command);
    const meta = cmd[Object.keys(cmd)[0]].macroMetadata;
    meta.requiresLearn = !meta.requiresBaseClass && includes(command, 'spell');
    if(!meta.name || !meta.requiresLearn) return;

    t.false(includes(meta.name, ' '), `${meta.name} has a space in it`);
  });
});
