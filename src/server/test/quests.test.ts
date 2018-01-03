
import test from 'ava-ts';

import * as Quests from '../quests';
import * as recurse from 'recursive-readdir';

test('All quests are represented in the Quests hash', async t => {

  const files = await recurse(`${__dirname}/../quests`);

  // -1 for index.ts
  t.is(Object.keys(Quests).length, files.length - 1, 'File count');
});
