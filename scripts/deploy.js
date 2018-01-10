
var { removeSync } = require('fs-extra');
var exec = require('child_process').exec;

exec('git add -f dist', (e, stdout, stderr) => {

  console.log('Added dist files');

  if(e) {
    console.log(stdout, stderr);
    console.error(e);
    process.exit(-1);
  }

  exec('git commit dist/shared/* dist/server/* -m "dokku dist"', (e, stdout, stderr) => {

    console.log('Committed dist files');

    if(e) {
      console.log(stdout, stderr);
      console.error(e);
      process.exit(-1);
    }

    exec('git push -f dokku master', (e, stdout, stderr) => {

      console.log('Pushed dist files');

      if(e) {
        console.log(stdout, stderr);
        console.error(e);
        process.exit(-1);
      }

      exec('git reset --hard HEAD~1', (e, stdout, stderr) => {

        console.log('Reset dist files');

        if(e) {
          console.log(stdout, stderr);
          console.error(e);
          process.exit(-1);
        }

        removeSync('dist');

        exec('npm run runseed:prod', (e, stdout, stderr) => {

          console.log('Seeded prod DB');

          if(e) {
            console.log(stdout, stderr);
            console.error(e);
            process.exit(-1);
          }
        });
      });
    });
  });
});
