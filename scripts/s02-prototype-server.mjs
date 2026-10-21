import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,relative,isAbsolute,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve('prototype/s02');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
export function createPrototypeServer(port=9420){
 const server=createServer(async(req,res)=>{
  try{
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   const target=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
   const rel=relative(root,target),type=types[extname(target)];
   if(!rel||rel.startsWith('..')||isAbsolute(rel)||!type){res.writeHead(404);return res.end('Not found');}
   const entry=await stat(target);if(!entry.isFile()){res.writeHead(404);return res.end('Not found');}
   const data=await readFile(target);
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'self'; img-src 'self' data:; script-src 'self'; connect-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"});
   res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
 });
 return new Promise((done,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',()=>{server.off('error',fail);done(server);});});
}
export const closePrototypeServer=server=>new Promise((done,fail)=>{server.close(error=>error?fail(error):done());server.closeAllConnections();});
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const server=await createPrototypeServer();
 console.log('S02 prototype: http://127.0.0.1:9420 — preview only, no WordPress backend.');
 let stopping=false;
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;await closePrototypeServer(server);});
}
