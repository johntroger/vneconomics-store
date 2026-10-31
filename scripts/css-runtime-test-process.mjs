// Test-only child process. Never a production transport or deployment endpoint.
import assert from 'node:assert/strict';
import {fork} from 'node:child_process';
import {readFileSync,lstatSync,realpathSync,readdirSync} from 'node:fs';
import {resolve,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';

function validateFixture(value){
 assert.ok(value&&Object.getPrototypeOf(value)===Object.prototype);
 assert.deepEqual(Object.keys(value).sort(),['fixture','token']);assert.match(value.token,/^[a-f0-9]{64}$/);assert.equal(value.token.length,64);
 const base=realpathSync('tmp/tests'),root=resolve(value.fixture),leaf=relative(base,root);
 assert.ok(!isAbsolute(leaf)&&/^css-production-runtime-[a-zA-Z0-9]+$/.test(leaf),'Owned runtime fixture required');
 assert.equal(realpathSync(root),root);assert.ok(!lstatSync(root).isSymbolicLink());
 assert.equal(readFileSync(join(root,'.runtime-test-owned'),'utf8'),value.token);
 for(const name of ['site','private','inbox','clone-state']){const path=join(root,name);assert.equal(realpathSync(path),path);assert.ok(lstatSync(path).isDirectory()&&!lstatSync(path).isSymbolicLink());}
 return root;
}
export async function startCssRuntimeTestProcess(value){
 validateFixture(value);
 const child=fork(fileURLToPath(import.meta.url),['--worker'],{cwd:process.cwd(),execArgv:[],windowsHide:true,stdio:['ignore','pipe','pipe','ipc']});
 child.stdout.pipe(process.stdout,{end:false});child.stderr.pipe(process.stderr,{end:false});
 let sequence=0,exited=false;const pending=new Map();
 const exit=new Promise(done=>child.once('exit',(code,signal)=>{exited=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Runtime test process exited: '+code+'/'+signal));}pending.clear();done({code,signal});}));
 child.on('message',m=>{const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error)):p.resolve(m.result);});
 child.on('error',error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();});
 const rpc=(type,data,timeout=180000)=>new Promise((resolveRequest,reject)=>{
  if(exited)return reject(new Error('Runtime test process already exited'));
  const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Runtime test process timeout: '+type));},timeout);
  pending.set(id,{resolve:resolveRequest,reject,timer});child.send({id,type,data},error=>{if(error){clearTimeout(timer);pending.delete(id);reject(error);}});
 });
 const kill=async()=>{if(!exited){assert.equal(child.kill(),true,'Cannot stop owned runtime process');await exit;}};
 try{await rpc('init',value);}catch(error){await kill();throw error;}
 return {
  pid:child.pid,
  playground:{run:async({code})=>rpc('run',{code})},
  crash:kill,
  [Symbol.asyncDispose]:async()=>{
   if(exited)return;
   try{await rpc('stop',null,30000);await Promise.race([exit,new Promise((_,reject)=>{const t=setTimeout(()=>reject(new Error('Runtime worker did not exit')),10000);t.unref();})]);}
   finally{if(!exited)await kill();}
  }
 };
}
async function workerMain(){
 assert.ok(process.send,'IPC-only fixture worker');assert.equal(process.argv.length,3);
 let app=null,busy=false,initialized=false,root;
 process.on('message',async m=>{
  if(busy){process.send({id:m.id,error:'Runtime worker busy'});return;}
  busy=true;
  try{
   if(m.type==='init'){
    assert.equal(initialized,false);root=validateFixture(m.data);initialized=true;
    const {startSite}=await import('./local-runtime.mjs');
    app=await startSite(join(root,'site'),19482,{workers:1,mounts:[{hostPath:join(root,'private'),vfsPath:'/adapter-fixture/control'},{hostPath:join(root,'inbox'),vfsPath:'/adapter-fixture/inbox'},{hostPath:join(root,'clone-state'),vfsPath:'/adapter-fixture/clone.git'}]});
    process.send({id:m.id,result:{ready:true,pid:process.pid}});
   }else if(m.type==='run'){
    assert.ok(app&&initialized);assert.deepEqual(Object.keys(m.data),['code']);assert.equal(typeof m.data.code,'string');
    const r=await app.playground.run({code:m.data.code});process.send({id:m.id,result:{exitCode:r.exitCode,errors:r.errors,text:r.text}});
   }else if(m.type==='stop'){
    assert.ok(app);await app[Symbol.asyncDispose]();app=null;
    process.send({id:m.id,result:{stopped:true}},()=>{process.disconnect();process.exit(0);});
   }else throw new Error('Unknown runtime fixture request');
  }catch(error){
   let diagnostic;
   if(m.type==='init'&&root){
    const directory=join(root,'site/wp-content/database');
    diagnostic={files:readdirSync(directory).map(name=>({name,bytes:lstatSync(join(directory,name)).size}))};
    try{const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(join(directory,'.ht.sqlite'),{readOnly:true});try{diagnostic.integrity=db.prepare('PRAGMA quick_check').all();}finally{db.close();}}catch(e){diagnostic.sqliteError=e.message;}
   }
   process.send({id:m.id,error:error.message+(diagnostic?' '+JSON.stringify(diagnostic):'')});
  }
  finally{busy=false;}
 });
 process.on('disconnect',()=>{process.exit(0);});
}
if(process.argv[2]==='--worker')await workerMain();
