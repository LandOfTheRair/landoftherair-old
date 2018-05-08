
const md5file = require('md5-file');
const { gitDescribeSync } = require('git-describe');
const fs = require('fs');

const files = ['creatures', 'decor', 'effects', 'items', 'swimming', 'terrain', 'walls'];

const md5hash = {};

files.forEach(file => {
  const md5 = md5file.sync(`${__dirname}/../src/client/assets/spritesheets/${file}.png`);
  md5hash[file] = md5;
});

const gitRev = gitDescribeSync({
  dirtyMark: false,
  dirtySemver: false
});

gitRev._head = process.env.HEAD;
gitRev._branch = process.env.BRANCH;

const allVars = {
  hashes: md5hash,
  version: gitRev
};

const content = `export const BUILDVARS = ${JSON.stringify(allVars, null, 2)};`;

fs.writeFileSync(`${__dirname}/../src/client/environments/_vars.ts`, content, 'utf8');
