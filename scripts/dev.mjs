import {resolve} from 'node:path';
import {startSite} from './local-runtime.mjs';
const app=await startSite(resolve('.local/site'));
console.log('Local WordPress: http://127.0.0.1:9400');
console.log('Local database is retained in .local/site. This is a fresh site, not a copy of hosting.');
let closing=false;async function close(){if(closing)return;closing=true;await app[Symbol.asyncDispose]();process.exitCode=0;}
process.on('SIGINT',close);process.on('SIGTERM',close);
