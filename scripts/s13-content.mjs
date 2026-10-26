import {cpSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
export async function seedS13(app,directory){
 cpSync(resolve('plugins/vne-library-core'),join(directory,'wp-content/plugins/vne-library-core'),{recursive:true});
 cpSync(resolve('themes/vibelab'),join(directory,'wp-content/themes/vibelab'),{recursive:true});
 const code=readFileSync('scripts/fixtures/s13-integrated-seed.php','utf8').replace('<?php','<?php define("S13_CONTENT",'+JSON.stringify(readFileSync('docs/content-samples/S10-moc-studio-lesson.html','utf8'))+');define("S13_OBSERVATIONS",'+JSON.stringify(readFileSync('docs/acceptance/S02/source-observations.json','utf8'))+');');
 const r=await app.playground.run({code});if(r.errors||r.exitCode)throw new Error(r.errors||r.text);return JSON.parse(r.text);
}
