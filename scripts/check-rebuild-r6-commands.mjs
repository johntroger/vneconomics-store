import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const directory='docs/acceptance/R6-rebuild', checks=[],closeout=process.argv.includes('--closeout');
for(const name of closeout?['complete-command.txt']:['private-verify-command.txt','native-install-command.txt','activate-command.txt']){
 const text=readFileSync(directory+'/'+name,'utf8').trim(),match=text.match(/^eval '([^']+)' --user=1$/s);assert.ok(match,'Command quoting: '+name);
 const code=match[1];for(const pin of ['fa4c67821008e0fcc4307fedf202bcdf95b85bb6','1f77dd2b82aa621c2d7cc586601de3697dab491b15bcea24bc26224a7912ebc2','a095f2cf4637a655f6a025ddf03b372a422b8a50cc608f7ac4db3400649ccc28'])assert.ok(code.includes(pin),'Missing release pin');
 const result=spawnSync(resolve('.local/php-8.3.36-nts-x64/php.exe'),['-n','-l'],{input:'<?php '+code,encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr||result.stdout);checks.push({name,syntax:'PASS',quoting:'PASS',releasePins:'PASS'});
}
writeFileSync(directory+(closeout?'/closeout-command-checks.json':'/command-checks.json'),JSON.stringify({status:'PASS_R6_OPERATOR_COMMAND_SYNTAX',checks,limits:['Syntax and exact release pins only','Native ZIP/install/maintenance/activation operations rehearsed at R5.2; live effects require postflight']},null,2)+'\n');console.log('PASS R6 '+checks.length+' operator commands: PHP8.3 syntax, quoting and release pins');
