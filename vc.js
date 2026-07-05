// Vercel CLI wrapper: overrides os.hostname() to avoid non-ASCII HTTP header bug
const os = require('os');
os.hostname = () => 'msi-laptop';
process.argv = [process.argv[0], 'vercel', ...process.argv.slice(2)];
require(process.env.APPDATA + '/npm/node_modules/vercel/dist/index.js');
