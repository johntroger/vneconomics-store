import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

function files(root){return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(root,entry.name)):/\.(?:c?js|mjs)$/.test(entry.name)?[join(root,entry.name)]:[]);}
const targets=[...files('scripts'),...files('tests')].sort();
for(const file of targets){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr||`Syntax check failed: ${file}`);}
console.log(`PASS JavaScript syntax ${targets.length} files`);
