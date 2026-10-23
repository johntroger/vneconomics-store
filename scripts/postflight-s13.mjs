import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=resolve('.'),dir=resolve('docs/acceptance/S13');
const read=p=>JSON.parse(readFileSync(join(dir,p),'utf8'));
function hashes(path,pattern,relative=''){
 const out={};for(const e of readdirSync(join(path,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
 const file=join(relative,e.name);if(e.isDirectory())Object.assign(out,hashes(path,pattern,file));
 else if(pattern.test(e.name))out[file.replaceAll('\\','/')]=createHash('sha256').update(readFileSync(join(path,file))).digest('hex');
 }return out;
}
const theme=hashes(resolve('themes/vibelab'),/\.(php|css|js|svg|html)$/),plugin=hashes(resolve('plugins/vne-library-core'),/\.php$/);
const main=read('functional-results.json'),wasm=read('test-results.json'),native=read('native-performance.json');assert.equal(main.functionalStatus,'PASS');assert.equal(main.checks.length,122);assert.equal(wasm.performance.length,12);assert.equal(native.metrics.length,12);assert.deepEqual(native.testedThemeHashes,theme);assert.deepEqual(native.testedPluginHashes,plugin);assert.ok(native.checks.length>=18);const race=read('lock-race-after-fix.json');assert.deepEqual(race.testedPluginHashes,plugin);assert.equal(race.lockRace.content.winners,1);assert.equal(race.lockRace.report.winners,1);assert.equal(main.errors.length,0);assert.equal(main.external.length,0);
const results={integrated:{functional:main.functionalStatus,checks:main.checks.length,labNativeStatus:native.status,allNativeCLSWithinBudget:native.budget.every(x=>x.clsPass),allNativeLCPWithinBudget:native.budget.every(x=>x.lcpPass),historicalWasmStatus:wasm.status}};
const suites=[['S06',59],['S05',50],['S09',74],['S10',55],['S11',61],['S12',225]];
for(const [name,minimum]of suites){
 const r=read(name+'-regression/test-results.json');
 if(r.testedThemeHashes)assert.deepEqual(r.testedThemeHashes,theme,name+' tested current theme');
 assert.deepEqual(r.testedPluginHashes,plugin,name+' tested current plugin');
 assert.ok(r.checks.length>=minimum,name+' expected checks');
 if(r.errors)assert.equal(r.errors.length,0);
 results[name]={checks:r.checks.length,themeVerified:!!r.testedThemeHashes,pluginVerified:true};
 if(name==='S05'){assert.equal(r.regression.length,69);assert.equal(r.stateRegression.length,265);assert.equal(r.matrix.length,54);Object.assign(results[name],{model:69,state:265,matrixRows:54});}
 if(name==='S09'){assert.equal(r.queries.length,20);assert.equal(r.fixtureChecks.length,28);Object.assign(results[name],{queries:20,fixture:28});}
 if(name==='S10'){assert.equal(r.walkResults.length,2);results[name].shellReplays=2;}
 if(name==='S11'){assert.equal(r.backendChecks.length,37);results[name].backend=37;}
}
assert.deepEqual(main.testedThemeHashes,theme);assert.deepEqual(main.testedPluginHashes,plugin);
assert.deepEqual(wasm.testedThemeHashes,theme,'WASM historical profile uses unchanged final theme');const changedSinceWasm=Object.keys(plugin).filter(k=>plugin[k]!==wasm.testedPluginHashes[k]).sort();assert.ok(changedSinceWasm.every(k=>['reports.php','revisions.php','vne-library-core.php'].includes(k)),'historical WASM differs only by lock patch/version; exact reruns are also valid');
const protectedExpected={
 '.local/site/wp-content/database/.ht.sqlite':'f2a35e44c395fb790e6ea5524b21f2525d49f75d19ff129e8e3894fa08721fd8',
 '.local/site/wp-config.php':'b2b3f3fe6dbf560b38db952a868df3120fff14bb39ba96ea34e2f26b5c2892f8'
};
for(const [p,expected]of Object.entries(protectedExpected))assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),expected,'original '+p+' unchanged');
const history=spawnSync('git',['diff','--name-only','4e80391','--','docs/acceptance'],{encoding:'utf8'});assert.equal(history.status,0);
assert.deepEqual(history.stdout.trim().split(/\r?\n/).filter(Boolean).filter(p=>!p.startsWith('docs/acceptance/S13')),[],'old acceptance evidence unchanged');
const fixtures=existsSync('tmp/tests')?readdirSync('tmp/tests'):[];assert.deepEqual(fixtures,[]);
const transient=existsSync('tmp')?readdirSync('tmp').filter(n=>n.startsWith('transient-run-')):[];
const own=basename(process.env.TEMP||'');assert.deepEqual(transient,[own],'only current postflight wrapper cache may be active');
writeFileSync(join(dir,'postflight.json'),JSON.stringify({date:new Date().toISOString(),results,sourceThemeFiles:Object.keys(theme).length,sourcePluginPHPFiles:Object.keys(plugin).length,protectedHashes:protectedExpected,originalFilesUnchanged:true,oldAcceptanceEvidenceUnchanged:true,fixturesRemaining:fixtures,temporaryRuntime:'Only current postflight wrapper; wrapper cleans after this script exits',qualityGate:{S13:native.status==='PASS_NATIVE_LAB'?'AWAITING_OWNER_REVIEW':'NOT_ACCEPTED_LAB_FAILURE',nativeLab:native.status,historicalWasmLab:wasm.status,changedPluginFilesSinceWasm:changedSinceWasm,performanceScope:'native PHP8.3 Windows only; no hosting certificate',ownerReview:'pending',S14:'not authorized'},testedThemeHashes:theme,testedPluginHashes:plugin},null,2)+'\n');
console.log('PASS S13 source/preservation/regression postflight; overall S13 native lab '+native.status+'; owner review pending; historical WASM failure retained.');
