
import test from 'ava-ts';

import { includes } from 'lodash';

import * as Effects from '../effects';
import * as recurse from 'recursive-readdir';

test('All effects are represented in the Effects hash', async t => {

  const files = await recurse(`${__dirname}/../effects`);

  // -1 for index.ts
  const validEffects = Object.keys(Effects).filter(key => !includes(key, 'Recently'));
  t.is(validEffects.length, files.length - 1, 'File count');
});
