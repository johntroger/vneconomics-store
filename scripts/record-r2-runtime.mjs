import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {sha256} from './release-lib.mjs';
const hash=path=>sha256(readFileSync(path)),site=resolve('.local/site'),php=resolve('.local/php-8.3.36-nts-x64'),core=[];
for(const dir of ['wp-admin','wp-includes'])for(const e of readdirSync(join(site,dir),{recursive:true,withFileTypes:true}))if(e.isFile())core.push(join(e.parentPath,e.name));
for(const e of readdirSync(site,{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.php')&&e.name!=='wp-config.php')core.push(join(site,e.name));
const coreRecords=core.map(p=>({path:p.slice(site.length+1).replaceAll('\\','/'),sha256:hash(p)})).sort((a,b)=>a.path.localeCompare(b.path));
const runtimeFiles=[];for(const e of readdirSync(php,{recursive:true,withFileTypes:true}))if(e.isFile()&&/\.(?:dll|exe)$/i.test(e.name)){const p=join(e.parentPath,e.name);runtimeFiles.push({path:p.slice(php.length+1).replaceAll('\\','/'),sha256:hash(p)});}
const playwright=join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const edge=join(process.env['ProgramFiles(x86)'],'Microsoft/Edge/Application/msedge.exe');
const edgeVersion=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"(Get-Item -LiteralPath '"+edge.replaceAll("'","''")+"').VersionInfo.ProductVersion"],{encoding:'utf8',windowsHide:true});if(edgeVersion.status!==0)throw new Error('Edge version unavailable');
const lock=JSON.parse(readFileSync('package-lock.json'));
const report={observedAt:new Date().toISOString(),node:process.version,wordpress:readFileSync(join(site,'wp-includes/version.php'),'utf8').match(/\$wp_version\s*=\s*'([^']+)'/)[1],coreFiles:coreRecords.length,coreTreeSha256:sha256(Buffer.from(JSON.stringify(coreRecords))),phpFiles:runtimeFiles,sqliteZipSha256:hash('node_modules/@wp-playground/cli/sqlite-database-integration.zip'),playground:{version:lock.packages['node_modules/@wp-playground/cli'].version,integrity:lock.packages['node_modules/@wp-playground/cli'].integrity},packageLockSha256:hash('package-lock.json'),playwright:JSON.parse(readFileSync(playwright)).version,edge:{version:edgeVersion.stdout.trim(),sha256:hash(edge)},limits:['Existing local dependencies only; no download/install in R2','Native fixture copies core only, excludes wp-config and live DB','CI package checks require none of these WordPress/PHP/browser dependencies']};
writeFileSync('docs/acceptance/R2-pipeline/runtime-inventory.json',JSON.stringify(report,null,2)+'\n');console.log('Recorded runtime versions/checksums; no credentials or database copied');
