import assert from 'node:assert/strict';
import {policy} from './release-policy.mjs';
// Historical manifests/contracts stay immutable. A version selects its own exact tree.
export function componentProfile(kind,version){
 const p=policy[kind];assert.ok(p,'Unknown component');
 if(kind==='plugin'){assert.ok(['0.4.2','0.4.3'].includes(version),'Unknown plugin profile');return {version,files:[...p.files,...(version==='0.4.3'?['stars.php']:[])].sort()};}
 assert.ok(['0.6.0','0.7.0','0.7.1','0.7.2','0.7.3'].includes(version),'Unknown theme profile');
 const excluded=['0.7.2','0.7.3'].includes(version)?[]:['guides.php','archive-vne_guide.php',...(version==='0.6.0'?['seo.php']:[])];
 return {version,files:p.files.filter(f=>!excluded.includes(f))};
}
export const pipelineProfile=Object.freeze({id:'vne-072-042-schema3',theme:'0.7.2',plugin:'0.4.2',schema:3});
