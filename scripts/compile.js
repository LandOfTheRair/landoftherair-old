
var { copy, removeSync } = require('fs-extra');

var exec = require('child_process').exec;

removeSync('dist');

exec('tsc', (e) => {

  removeSync('dist/client');

  if(e) {
    console.error(e);
    process.exit(-1);
  }

  var copySilentDev =   copy('src/server/silent-dev.html', 'dist/server/silent-dev.html');
  var copySilentProd =  copy('src/server/silent-production.html', 'dist/server/silent-production.html');
  var copyMaps =        copy('src/server/maps', 'dist/server/maps');

  Promise.all([
    copySilentDev,
    copySilentProd,
    copyMaps
  ]).then(() => {
    console.log('Done compiling.');
  });

});
