import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
export const localRuntimeUserHome=homedir();
const home=resolve('.local/home');mkdirSync(home,{recursive:true});
process.env.USERPROFILE=home;
export async function startSite(directory,port=9400,{workers=6,mounts=[]}={}){
 const {existsSync}=await import('node:fs');
 const {runCLI}=await import('@wp-playground/cli');
 mkdirSync(resolve(directory,'wp-content/database'),{recursive:true});
 const app=await runCLI({command:'server',php:'8.3',wp:'7.1.3',port,workers,login:false,'define-bool':{WP_HTTP_BLOCK_EXTERNAL:true,DISABLE_WP_CRON:true},define:{DB_DIR:'/wordpress/wp-content/database/',DB_FILE:'.ht.sqlite'},'site-url':`http://127.0.0.1:${port}`,'mount-before-install':[{hostPath:directory,vfsPath:'/wordpress'},...mounts],wordpressInstallMode:existsSync(resolve(directory,'wp-load.php'))?'install-from-existing-files-if-needed':'download-and-install'});
 await new Promise((done,fail)=>{app.server.close(error=>error?fail(error):done());app.server.closeAllConnections();});
 await new Promise((done,fail)=>app.server.once('error',fail).listen(port,'127.0.0.1',done));
 return app;
}
