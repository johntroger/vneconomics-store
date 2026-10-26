import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {sha256} from './release-lib.mjs';
const audit=JSON.parse(readFileSync('docs/acceptance/R2-pipeline/source-audit.json')),archives=[];
for(const file of audit.binaryInventory.filter(e=>e.path.endsWith('.zip'))){
 assert.equal(sha256(readFileSync(file.path)),file.sha256,'Working archive must match inventoried Git blob');
 const path=resolve(file.path).replaceAll("'","''");
 const ps=`Add-Type -AssemblyName System.IO.Compression.FileSystem
function Read-R2Zip($archive,$prefix) { foreach($entry in $archive.Entries) { if($entry.Length -gt 20000000) { throw 'Oversized archive entry' }; [pscustomobject]@{path=($prefix+$entry.FullName);bytes=$entry.Length}; if($entry.FullName.EndsWith('.zip')) { $stream=$entry.Open(); try { $nested=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read); try { Read-R2Zip $nested ($prefix+$entry.FullName+'!/') } finally { $nested.Dispose() } } finally { $stream.Dispose() } } } }
$archive=[IO.Compression.ZipFile]::OpenRead('${path}'); try { @(Read-R2Zip $archive '') | ConvertTo-Json -Compress } finally { $archive.Dispose() }`;
 const result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',ps],{encoding:'utf8',windowsHide:true,timeout:30000});assert.equal(result.status,0,result.stderr);
 const entries=JSON.parse(result.stdout);for(const e of entries){assert.ok(!/(?:^|\/)(?:\.env(?:\.|$)|wp-config\.php|id_rsa|[^/]*\.sqlite(?:$|-))|\.sql$/i.test(e.path),'Runtime config/database in '+file.path);assert.ok(!e.path.includes('../')&&!e.path.includes('..\\'),'Archive traversal');}
 archives.push({...file,entries});
}
writeFileSync('docs/acceptance/R2-pipeline/archive-audit.json',JSON.stringify({status:'PASS_ARCHIVE_PATH_INVENTORY',sourceSha:audit.sourceSha,archives,limits:['ZIP paths checked recursively in memory, including nested plugin ZIP; no extraction','Images are project website/trial evidence, separately inventoried; no claim of automated visual secret detection','Pattern/path checks do not prove absence of every sensitive value']},null,2)+'\n');console.log('PASS '+archives.length+' source-history ZIP inventories, including nested archives; no runtime config/database paths');
