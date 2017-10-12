
var { emptyDirSync } = require('fs-extra');
var exec = require('child_process').exec;

exec('git add -f dist', () => {
  exec('git commit -am "evennode dist"', () => {
    exec('git push evennode master', () => {
      exec('git reset --hard HEAD~1', () => {
        emptyDirSync('dist');
      });
    });
  });
});
