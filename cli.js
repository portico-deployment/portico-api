import { init } from './setup.js';
import { startBackend } from './server.js';
import { startUI } from './ui.js';

// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;
console.log(__dirname);
console.log(process.cwd());

// use args to trigger the setup
const cmd = (process.argv[2] && process.argv[2].trim());
// replace possible trailing slash
const custompath = process.argv[3] ?
    process.argv[3] :
    ((__dirname.startsWith("/snapshot")) ? process.cwd() : __dirname).replace(/\/+$/, '');

switch( cmd ) {
    case 'setup':
        init(custompath).catch(console.log);
        break;
    case 'clean':
        break;
    default:


        startBackend(custompath);
        startUI(`${custompath}/build`);
};