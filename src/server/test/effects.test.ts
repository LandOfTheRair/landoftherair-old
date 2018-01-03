
import test from 'ava-ts';

import * as Effects from '../effects';
import * as recurse from 'recursive-readdir';

test('All effects are represented in the Effects hash', async t => {

  const files = await recurse(`${__dirname}/../effects`);

  // -1 for index.ts
  t.is(Object.keys(Effects).length, files.length - 1, 'File count');
});
