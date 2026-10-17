import {spawnSync} from 'node:child_process';
const credential=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'},timeout:20000});
if(credential.status!==0){console.log('GitHub authentication unavailable; interactive sign-in required.');process.exitCode=2;}else{
 const fields=Object.fromEntries(credential.stdout.trim().split(/\r?\n/).map(line=>{const at=line.indexOf('=');return [line.slice(0,at),line.slice(at+1)];}));
 if(!fields.password)throw new Error('No GitHub credential available');
 const headers={Authorization:`Bearer ${fields.password}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'VneconomicsStore-setup'};
 const call=(path,options={})=>fetch('https://api.github.com'+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(20000)});
 const who=await call('/user');if(!who.ok)throw new Error(`GitHub authentication HTTP ${who.status}`);
 const account=await who.json();console.log('Authenticated GitHub account: '+account.login);
 if(account.login.toLowerCase()!=='johntroger')throw new Error('Account differs from existing project owner; setup stopped.');
 const path='/repos/'+account.login+'/vneconomics-store';let response=await call(path);
 if(response.status===404){response=await call('/user/repos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'vneconomics-store',private:true,description:'Custom WordPress development for store.vneconomics.com',auto_init:false})});}
 if(!response.ok)throw new Error(`Repository setup HTTP ${response.status}; account may need additional authorization.`);
 const repo=await response.json();if(!repo.private)throw new Error('Existing repository is not private; stopped.');
 console.log('Private repository: '+repo.html_url);
 const current=spawnSync('git',['remote','get-url','origin'],{encoding:'utf8'});
 if(current.status===0){if(current.stdout.trim()!==repo.clone_url)throw new Error('Existing origin differs; stopped.');}else{const added=spawnSync('git',['remote','add','origin',repo.clone_url],{stdio:'inherit'});if(added.status!==0)process.exitCode=added.status;}
}
