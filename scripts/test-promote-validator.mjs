import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';

mkdirSync('tmp/tests',{recursive:true});const repo=mkdtempSync(resolve('tmp/tests/payload-validator-')),validator=resolve('scripts/validate-payload-commit.mjs'),source='b'.repeat(40),profile='fixture-profile-1';
const run=(command,args,{ok=true}={})=>{const result=spawnSync(command,args,{cwd:repo,encoding:'utf8',windowsHide:true});if(ok)assert.equal(result.status,0,result.stderr);else assert.notEqual(result.status,0,'Expected rejection');return result;};
const git=(...args)=>run('git',args).stdout.trim();
git('init');git('config','user.name','R0B Fixture');git('config','user.email','fixture@example.invalid');writeFileSync(join(repo,'old.txt'),'old\n');git('add','.');git('commit','-m','baseline');const parent=git('rev-parse','HEAD');
rmSync(join(repo,'old.txt'));const payload=Buffer.from('candidate bytes\n');writeFileSync(join(repo,'theme.zip'),payload);const manifest={format:1,profile,sourceSha:source,files:[{path:'theme.zip',sha256:sha256(payload),bytes:payload.length}]};writeFileSync(join(repo,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');git('add','-A');git('commit','-m','candidate');const candidate=git('rev-parse','HEAD');
const accepted=run(process.execPath,[validator,candidate,source,parent,profile]);assert.match(accepted.stdout,/VERIFIED_PAYLOAD_COMMIT/);
run(process.execPath,[validator,candidate,'c'.repeat(40),parent,profile],{ok:false});
run(process.execPath,[validator,candidate,source,'d'.repeat(40),profile],{ok:false});
run(process.execPath,[validator,candidate,source,parent,'wrong-profile'],{ok:false});
console.log('PASS promote payload validator accepts exact commit and rejects source/parent/profile drift');
