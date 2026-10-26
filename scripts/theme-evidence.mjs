import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';

// Validate that the fixture exercised the current runtime files, not an older copy.
export function themeEvidence(fixture){
 const source=resolve('themes/vibelab'),copy=join(fixture,'wp-content/themes/vibelab');
 function hashes(root,relative=''){
  const result={};
  for(const entry of readdirSync(join(root,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
   const file=join(relative,entry.name);
   if(entry.isDirectory())Object.assign(result,hashes(root,file));
   else if(/\.(php|css|js|svg|html)$/.test(entry.name))result[file.replaceAll('\\','/')]=createHash('sha256').update(readFileSync(join(root,file))).digest('hex');
  }
  return result;
 }
 const expected=hashes(source),actual=hashes(copy);
 assert.deepEqual(actual,expected,'Runtime theme in fixture must match source at acceptance');
 return actual;
}

export function pluginEvidence(fixture){
 const source=resolve('plugins/vne-library-core'),copy=join(fixture,'wp-content/plugins/vne-library-core');
 function hashes(root,relative=''){
  const result={};
  for(const entry of readdirSync(join(root,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
   const file=join(relative,entry.name);
   if(entry.isDirectory())Object.assign(result,hashes(root,file));
   else if(entry.name.endsWith('.php'))result[file.replaceAll('\\','/')]=createHash('sha256').update(readFileSync(join(root,file))).digest('hex');
  }
  return result;
 }
 const expected=hashes(source),actual=hashes(copy);
 assert.deepEqual(actual,expected,'Runtime plugin in fixture must match current source');
 return actual;
}
