import assert from 'node:assert/strict';
export const PIPELINE_REPOSITORY='johntroger/vneconomics-store';
export const PIPELINE_WORKFLOW='.github/workflows/pipeline-check.yml';
export const REQUIRED_PIPELINE_STEPS=Object.freeze([
 'Install locked dependencies',
 'Verify deterministic candidate',
 'Build candidate from the exact reviewed source',
 'Preserve candidate for approval'
]);
const positive=value=>Number.isSafeInteger(value)&&value>0;
const time=(value,label)=>{const n=typeof value==='string'?Date.parse(value):NaN;assert.ok(Number.isFinite(n),'Invalid '+label);return n;};
function collection(api,path,key){
 const items=[];let total=null;
 for(let page=1;page<=10;page++){
  const response=api(path+'?per_page=100&page='+page);
  assert.ok(Number.isSafeInteger(response.total_count)&&response.total_count>=0&&response.total_count<=1000,'Invalid/bounded '+key+' total');
  if(total===null)total=response.total_count;assert.equal(response.total_count,total,'Changed '+key+' total');
  assert.ok(Array.isArray(response[key])&&response[key].length<=100,'Invalid '+key+' page');items.push(...response[key]);
  assert.ok(items.length<=total,'Unexpected '+key+' count');if(items.length===total)break;
  assert.ok(response[key].length>0,'Incomplete '+key+' pagination');
 }
 assert.equal(items.length,total,'Incomplete '+key+' listing');const ids=items.map(i=>i.id);assert.ok(ids.every(positive)&&new Set(ids).size===ids.length,'Duplicate/invalid '+key+' IDs');return items;
}
function runSnapshot(run){return {id:run.id,workflow_id:run.workflow_id,path:run.path,head_sha:run.head_sha,run_attempt:run.run_attempt,status:run.status,conclusion:run.conclusion,repository:run.repository?.full_name,headRepository:run.head_repository?.full_name,event:run.event};}
export function assertPipelineCiRunCurrent(evidence,api,{now=Date.now()}={}){
 const latest=api(evidence.runPath);assert.deepEqual(runSnapshot(latest),runSnapshot(evidence.run),'CI run changed during verification; inspect/retry');
 assert.ok(time(evidence.artifact.expires_at,'artifact expiry')>now,'Pipeline artifact expired');return latest;
}
export function verifyPipelineCi({runId,sourceSha,api,now=Date.now()}){
 assert.match(String(runId),/^[1-9][0-9]*$/);assert.match(sourceSha,/^[a-f0-9]{40}$/);assert.ok(Number.isFinite(now));
 const root='repos/'+PIPELINE_REPOSITORY,workflow=api(root+'/actions/workflows/pipeline-check.yml');
 assert.ok(positive(workflow.id),'Invalid expected workflow ID');assert.equal(workflow.path,PIPELINE_WORKFLOW,'Unexpected expected workflow path');assert.equal(workflow.state,'active','Pipeline workflow is not active');
 const runPath=root+'/actions/runs/'+runId,run=api(runPath);
 assert.ok(positive(run.id)&&String(run.id)===String(runId),'Wrong CI run ID');assert.equal(run.workflow_id,workflow.id,'Unexpected CI workflow ID');assert.equal(run.path,PIPELINE_WORKFLOW,'Unexpected CI workflow path');
 assert.equal(run.repository?.full_name,PIPELINE_REPOSITORY,'Unexpected CI repository');assert.equal(run.head_repository?.full_name,PIPELINE_REPOSITORY,'Unexpected CI source repository');
 assert.ok(positive(run.repository?.id)&&positive(run.head_repository?.id),'Missing repository identity');assert.equal(run.head_sha,sourceSha,'CI source SHA differs');
 assert.equal(run.status,'completed','CI is not complete');assert.equal(run.conclusion,'success','CI did not pass');assert.equal(run.event,'workflow_dispatch','Unexpected CI event');assert.ok(positive(run.run_attempt),'Missing CI attempt');
 const jobs=collection(api,runPath+'/attempts/'+run.run_attempt+'/jobs','jobs'),matching=jobs.filter(j=>j.name==='payload');assert.equal(matching.length,1,'Missing/ambiguous payload job');const job=matching[0];
 assert.equal(job.run_id,run.id,'Job run differs');assert.equal(job.run_attempt,run.run_attempt,'Job attempt differs');assert.equal(job.head_sha,sourceSha,'Job source differs');assert.equal(job.status,'completed','Payload job incomplete');assert.equal(job.conclusion,'success','Payload job failed/skipped');assert.ok(Array.isArray(job.steps),'Missing payload steps');
 const steps=REQUIRED_PIPELINE_STEPS.map(name=>{const found=job.steps.filter(s=>s.name===name);assert.equal(found.length,1,'Missing/ambiguous required step: '+name);const s=found[0];assert.equal(s.status,'completed','Required step incomplete: '+name);assert.equal(s.conclusion,'success','Required step failed/skipped: '+name);assert.ok(positive(s.number),'Missing step order');assert.ok(time(s.completed_at,'step completion')>=time(s.started_at,'step start'),'Invalid step interval');return s;});
 for(let i=1;i<steps.length;i++){assert.ok(steps[i].number>steps[i-1].number,'Required step order differs');assert.ok(time(steps[i].started_at,'step start')>=time(steps[i-1].completed_at,'step completion'),'Required steps overlap/out of order');}
 const artifacts=collection(api,runPath+'/artifacts','artifacts'),named=artifacts.filter(a=>a.name==='pipeline-'+sourceSha);assert.equal(named.length,1,'Missing/ambiguous pipeline artifact');const artifact=named[0];
 assert.equal(artifact.expired,false,'Pipeline artifact expired/unknown');assert.ok(positive(artifact.size_in_bytes),'Pipeline artifact is empty');assert.match(artifact.digest??'',/^sha256:[a-f0-9]{64}$/,'Missing artifact digest');
 assert.equal(artifact.workflow_run?.id,run.id,'Artifact run differs');assert.equal(artifact.workflow_run?.head_sha,sourceSha,'Artifact source differs');assert.equal(artifact.workflow_run?.repository_id,run.repository.id,'Artifact repository differs');assert.equal(artifact.workflow_run?.head_repository_id,run.head_repository.id,'Artifact source repository differs');
 const upload=steps.at(-1),created=time(artifact.created_at,'artifact creation');assert.ok(created>=time(upload.started_at,'upload start')&&created<=time(upload.completed_at,'upload completion'),'Artifact is not from the successful upload attempt');assert.ok(time(artifact.expires_at,'artifact expiry')>Math.max(now,created),'Pipeline artifact expired');
 const evidence={runPath,workflow,run,jobs,job,artifact};assertPipelineCiRunCurrent(evidence,api,{now});return evidence;
}
export function pipelineCiSummary(evidence){return {workflowPath:evidence.workflow.path,workflowId:evidence.workflow.id,runId:evidence.run.id,runAttempt:evidence.run.run_attempt,jobId:evidence.job.id,artifactId:evidence.artifact.id,artifactDigest:evidence.artifact.digest,artifactExpiresAt:evidence.artifact.expires_at};}
