import assert from 'node:assert/strict';
import {policy} from './release-policy.mjs';
// Historical manifests/contracts stay immutable. A version selects its own exact tree.
export function componentProfile(kind,version){
 const p=policy[kind];assert.ok(p,'Unknown component');
 if(kind==='plugin'){assert.equal(version,'0.4.2','Unknown plugin profile');return {version,files:[...p.files]};}
 assert.ok(['0.6.0','0.7.0','0.7.1','0.7.2'].includes(version),'Unknown theme profile');
 const excluded=version==='0.7.2'?[]:['guides.php','archive-vne_guide.php',...(version==='0.6.0'?['seo.php']:[])];
 return {version,files:p.files.filter(f=>!excluded.includes(f))};
}
export const pipelineProfile=Object.freeze({id:'vne-072-042-schema3',theme:'0.7.2',plugin:'0.4.2',schema:3});
