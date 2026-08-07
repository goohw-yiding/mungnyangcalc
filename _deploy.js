require('./_hostpatch.js');
const { execFileSync } = require('child_process');
const vercelBin = 'C:\\Users\\USER\\AppData\\Roaming\\npm\\node_modules\\vercel\\dist\\index.js';
execFileSync(process.execPath, ['-r', require('path').resolve(__dirname, '_hostpatch.js'), vercelBin, 'deploy', '--prod', '--yes'], {
  stdio: 'inherit',
  cwd: __dirname,
});
