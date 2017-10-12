
var { emptyDirSync } = require('fs-extra');
var exec = require('child_process').exec;

exec('git add -f dist', (e) => {

  if(e) {
    console.error(e);
    process.exit(0);
  }

  exec('git commit dist/* -m "evennode dist"', (e) => {

    if(e) {
      console.error(e);
      process.exit(0);
    }

    exec('git push -f evennode master', (e) => {

      if(e) {
        console.error(e);
        process.exit(0);
      }

      exec('git reset --hard HEAD~1', (e) => {

        if(e) {
          console.error(e);
          process.exit(0);
        }

        emptyDirSync('dist');
      });
    });
  });
});
