import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {git,resolveRef,sha256} from './release-lib.mjs';
const ref=resolveRef(process.argv[2]||'HEAD'),base=resolveRef('origin/codex/s12-cache-consistency'),commits=git(['rev-list',base+'..'+ref]).toString().trim().split('\n').filter(Boolean),seen=new Set(),findings=[],binary=[];let textBlobs=0;
const patterns=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['provider-key',/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],['hosting-webhook-token',/https:\/\/[^\s"'<>]*cloudnetwork\.vn[^\s"'<>]*\/(?:web-hook|webhook)[^\s"'<>]+/]];
for(const commit of commits){for(const row of git(['ls-tree','-rz',commit]).toString().split('\0').filter(Boolean)){
 const [meta,path]=row.split('\t'),[,type,oid]=meta.split(' ');if(type!=='blob'||seen.has(oid))continue;seen.add(oid);
 if(/(?:^|\/)(?:\.env(?!\.example$)|wp-config\.php|id_rsa|[^/]+\.sqlite(?:$|-))/.test(path)||/\.sql$/i.test(path))findings.push({commit,path,kind:'runtime-config-or-database-path'});
 const data=git(['cat-file','blob',oid]);if(/\.(?:png|jpe?g|zip|pdf|gif|webp|ico)$/i.test(path)||data.includes(0)){binary.push({path,sha256:sha256(data),bytes:data.length});continue;}
 textBlobs++;const text=data.toString('utf8');for(const [kind,pattern]of patterns){const m=pattern.exec(text);if(m)findings.push({commit,path,kind,line:text.slice(0,m.index).split('\n').length});}
}}
mkdirSync('docs/acceptance/R2-pipeline',{recursive:true});const report={status:findings.length?'REVIEW_REQUIRED':'PASS_TEXT_PATTERN_SCAN',sourceSha:ref,baseSha:base,commits:commits.length,uniqueBlobs:seen.size,textBlobs,findings,binaryInventory:binary,limits:['Pattern scan is not proof that all sensitive information is absent','Binary/visual evidence requires review when approving the source push; runtime payload has a separate strict allowlist','No remote push, permission change or secret value output']};writeFileSync(resolve('docs/acceptance/R2-pipeline/source-audit.json'),JSON.stringify(report,null,2)+'\n');assert.equal(findings.length,0,'Review redacted findings before any push');console.log('PASS text pattern scan '+textBlobs+' blobs / '+commits.length+' commits; '+binary.length+' binary blobs inventoried separately');
