import {resolve} from 'node:path';
import {startSite} from './local-runtime.mjs';
const app=await startSite(resolve('.local/site'),19401);
try{
 const result=await fetch('http://127.0.0.1:19401/',{signal:AbortSignal.timeout(30000)});
 if(result.status!==200)throw new Error('Local initialization HTTP '+result.status);
 console.log('Persistent local WordPress initialized in .local/site. Use npm run dev to start.');
}finally{await app[Symbol.asyncDispose]();}
