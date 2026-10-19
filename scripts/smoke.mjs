import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {startSite} from './local-runtime.mjs';
// Bound a stuck bootstrap; process exit closes workers before run-clean removes fixtures.
const deadline=setTimeout(()=>{console.error('FAIL: smoke exceeded 300-second deadline');process.exit(1);},300000);
deadline.unref();
mkdirSync('tmp/tests',{recursive:true});
const fixture=mkdtempSync(resolve('tmp/tests/wordpress-'));
for(let boot=1;boot<=2;boot++){
 let app;
 try{
  console.log(`START: boot ${boot}`);
  app=await startSite(fixture,19400);
  for(const route of ['/','/wp-login.php','/wp-json/']){
   const result=await fetch(`http://127.0.0.1:19400${route}`,{signal:AbortSignal.timeout(30000)});
   assert.equal(result.status,200,`${route} boot ${boot}`);
   const body=await result.text();assert.ok(body.length>100);
   assert.doesNotMatch(body,/Fatal error:|Error establishing a database connection/);
  }
  assert.ok(existsSync(join(fixture,'wp-load.php')),'WordPress persisted');
  assert.ok(existsSync(join(fixture,'wp-content/database/.ht.sqlite')),'SQLite persisted');
  const saved=await app.playground.run({code:boot===1?"<?php require '/wordpress/wp-load.php'; update_option('vne_local_persistence_probe', 'retained'); echo get_option('vne_local_persistence_probe');":"<?php require '/wordpress/wp-load.php'; echo get_option('vne_local_persistence_probe');"});
  assert.equal(saved.text.trim(),'retained','WordPress option survives restart');
  console.log(`PASS: boot ${boot}: homepage, login, REST API, persistent WordPress and database`);
 }finally{if(app)await app[Symbol.asyncDispose]();}
}

clearTimeout(deadline);
