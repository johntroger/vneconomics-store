const clone=value=>JSON.parse(JSON.stringify(value));
function fixture(source,stepNames,now=Date.now()){
 const stamp=offset=>new Date(now+offset).toISOString(),id=123456789,repository={id:42,full_name:'johntroger/vneconomics-store'};
 const starts=stepNames.map((_,i)=>-60000+i*12000),ends=starts.map(value=>value+10000);
 return {now,requestedId:id,workflow:{id:77,path:'.github/workflows/pipeline-check.yml',state:'active'},run:{id,workflow_id:77,path:'.github/workflows/pipeline-check.yml',head_sha:source,status:'completed',conclusion:'success',event:'workflow_dispatch',run_attempt:1,repository,head_repository:repository,html_url:'https://example.invalid/mock-ci'},jobs:[{id:901,name:'payload',run_id:id,run_attempt:1,head_sha:source,status:'completed',conclusion:'success',steps:stepNames.map((name,i)=>({name,number:i+1,status:'completed',conclusion:'success',started_at:stamp(starts[i]),completed_at:stamp(ends[i])}))}],artifacts:[{id:501,name:'pipeline-'+source,expired:false,size_in_bytes:1234,digest:'sha256:'+'a'.repeat(64),created_at:stamp(starts.at(-1)+5000),expires_at:stamp(21*86400000),workflow_run:{id,head_sha:source,repository_id:42,head_repository_id:42}}]};
}
function apiFor(data){return path=>{
 const [url,query]=path.split('?'),root='repos/johntroger/vneconomics-store',run=root+'/actions/runs/'+data.requestedId;
 if(url===root+'/actions/workflows/pipeline-check.yml')return clone(data.workflow);
 if(url===run)return clone(data.run);
 const page=new URLSearchParams(query).get('page')??'1',offset=(Number(page)-1)*100;
 if(url===run+'/attempts/'+data.run.run_attempt+'/jobs')return {total_count:data.jobs.length,jobs:clone(data.jobs.slice(offset,offset+100))};
 if(url===run+'/artifacts')return {total_count:data.artifacts.length,artifacts:clone(data.artifacts.slice(offset,offset+100))};
 throw Error('Unexpected API request blocked: '+path);
};}
module.exports={fixture,apiFor,clone};
