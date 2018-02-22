
const md5file = require('md5-file');
const fs = require('fs');

const files = ['creatures', 'decor', 'effects', 'items', 'swimming', 'terrain', 'walls'];

const md5hash = {};

files.forEach(file => {
  const md5 = md5file.sync(`${__dirname}/../src/client/assets/${file}.png`);
  md5hash[file] = md5;
});

const content = `export const BUILDVARS = ${JSON.stringify(md5hash, null, 2)};`;

fs.writeFileSync(`${__dirname}/../src/client/environments/_vars.ts`, content, 'utf8');
