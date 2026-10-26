import {catalog} from './content-100-catalog.mjs';
import {reviews} from './content-100-reviews.mjs';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const batch=Number(process.argv[2]),base='docs/content-production/2026-10-25',dir=base+'/batch-'+String(batch).padStart(2,'0');
assert(Number.isInteger(batch)&&batch>=1&&batch<=10);
mkdirSync(dir+'/articles',{recursive:true});
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const hash=x=>createHash('sha256').update(x).digest('hex');
const slug=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d').replaceAll('Đ','D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const checks=[],items=[];
const check=(v,name)=>{assert(v,name);checks.push(name);};
for(const c of catalog.filter(x=>x.batch===batch)){
 const r=reviews[c.key];check(!!r,'editorial source review exists '+c.key);
 const s=JSON.parse(readFileSync(base+'/research/'+String(c.key).padStart(3,'0')+'.json','utf8'));
 check(s.readme.sha256===hash(s.readme.text),'source snapshot hash '+c.key);check(s.stars>=5000&&!s.disabled,'popular accessible candidate '+c.key);
 check(r.steps.length===3&&r.fact.length>=100&&r.requirements.length>=50,'specific editorial brief '+c.key);
 const date=s.observedAt.slice(0,10),source=s.url,readme=source+'/blob/'+s.branch+'/'+s.readme.path;
 const title=c.name+': '+c.angle.charAt(0).toLowerCase()+c.angle.slice(1),excerpt=c.angle+'. '+c.boundary+'.';
 const archive=s.archived?'<p><strong>Repo đã archived tại lần quan sát.</strong> Bài giữ để giải thích công dụng và giới hạn, không đề xuất bắt đầu dự án mới từ repo này.</p>':'';
 const license=s.license&&!['NOASSERTION','OTHER'].includes(s.license)?'GitHub nhận diện giấy phép '+s.license+' tại lần đọc metadata. Đây là thông tin để tiếp tục đối chiếu LICENSE và thành phần đi kèm, không phải kết luận mọi cách sử dụng đều được phép.':'Chưa kết luận giấy phép từ metadata GitHub. Đọc mục License và điều khoản từng thành phần trước khi dùng hoặc phân phối lại.';
 const body='<p>'+esc(c.angle)+'. '+esc(r.fact)+'</p>'+archive+
 '<h2>Việc nào đáng dùng để tìm hiểu?</h2><p>'+esc(c.example)+'. Đây là tình huống biên tập đề xuất, chưa phải kết quả đã chạy thử.</p>'+
 '<h2>Điều kiện trước khi bắt đầu</h2><p>'+esc(r.requirements)+'</p>'+
 '<h2>Lối bắt đầu cho người mới</h2><ol>'+r.steps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>'+
 '<h2>Giới hạn cần biết</h2><p>'+esc(c.boundary)+'. '+esc(r.caution)+'</p>'+
 '<h2>Sao GitHub và tình trạng nguồn</h2><p>Repo của <strong>'+esc(s.repo.split('/')[0])+'</strong> có <strong>'+s.stars.toLocaleString('vi-VN')+' sao GitHub</strong> tại lần quan sát '+date+'. Số sao là tín hiệu được quan tâm, không phải điểm đánh giá chất lượng hoặc bằng chứng đã dùng thử. Chưa có lịch sử để kết luận tốc độ tăng sao.</p>'+
 '<h2>Giấy phép và chi phí</h2><p>'+esc(license)+' Phí dịch vụ, model/API hoặc hạ tầng nếu có cần xem riêng; website không cấp tài khoản hay hạn mức dùng công cụ.</p>'+
 '<h2>Nguồn và phạm vi biên tập</h2><p>Đối chiếu <a href="'+esc(readme)+'" target="_blank" rel="noopener noreferrer">README của tác giả</a> và <a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">repo gốc</a> ngày '+date+'. Bài giới thiệu do AI nghiên cứu và duyệt biên tập; chưa cài/chạy repo, chưa xác minh tương thích trên máy người đọc.</p>';
 check(Buffer.byteLength(title)<=240,'title schema length '+c.key);check(Buffer.byteLength(body)<=60000,'content schema length '+c.key);
 check(body.replace(/<[^>]+>/g,' ').trim().split(/\s+/).length>=250,'article has meaningful reading length '+c.key);
 check(!/<(?:script|iframe|form|pre)\b|\bon\w+\s*=/i.test(body),'no active or untested executable content '+c.key);
 const claim=(value,note,known=true)=>({value:known?value:null,verification_status:known?'upstream_claimed':'unknown',source_url:known?readme:null,observed_at:known?date:null,note,conflict_sources:[]});
 const payload={post_type:'vne_resource',title,excerpt,content:body,status:'publish',primary_category:0,categories:[],needs:[],tools:[],editorial_note:'AI duyệt biên tập từ README ngày '+date+'. Đợt 100 bài/lô '+batch+', key '+c.key+'. Chưa cài/chạy thử; không tạo validation. Snapshot sao '+s.stars+'; repo_id '+s.repoId+'; README SHA256 '+s.readme.sha256+'.',data:{resource_type:c.batch===6?'learn':'tool',source_url:source,repo_id:s.repoId,source_path:'',source_revision:'README-SHA256:'+s.readme.sha256,source_verified:true,observed_at:date,claims:{cost:claim(null,'Chưa xác minh tổng chi phí theo cách triển khai; xem phí phần mềm/dịch vụ/model/hạ tầng riêng.',false),license:claim(null,'Thông tin nhận diện giấy phép GitHub được giải thích trong bài; chưa đối chiếu đầy đủ phạm vi LICENSE/phụ thuộc.',false),requirements:claim(r.requirements,'Theo README đã đọc; chưa chứng nhận cài/chạy trong môi trường người đọc.'),permissions:claim(null,r.caution,false),compatibility:claim(null,'Chưa kiểm chứng tương thích; đọc đúng phiên bản và môi trường trong README.',false)}}};
 const state={source_access:{status:'available',source_url:readme,observed_at:date,note:'README chính thức trả HTTP200, đã lưu snapshot và tự duyệt mô tả.'},maintenance:{status:s.archived?'archived':'unknown',source_url:s.archived?source:'',observed_at:s.archived?date:'',note:s.archived?'GitHub metadata ghi archived=true.':r.maintenanceNote??'Không suy tình trạng duy trì chỉ từ số sao hoặc một lần truy cập.'},recommendation:{status:'normal',reason:s.archived?'Giữ bài giới thiệu tham khảo, không đề xuất repo archived cho dự án mới.':r.maintenanceNote??''},review:{needed:false,reason:'',reviewed_at:date,review_due_at:'2026-11-08'}};
 const name=String(c.key).padStart(3,'0')+'-'+slug(c.name);
 writeFileSync(dir+'/articles/'+name+'.html','<!doctype html><html lang="vi"><meta charset="utf-8"><title>'+esc(title)+'</title><main><h1>'+esc(title)+'</h1>'+body+'</main></html>\n');
 items.push({key:c.key,batch,slug:slug(c.name),category:c.category,need:c.need,payload,state,evidence:{repo:s.repo,stars:s.stars,observedAt:s.observedAt,readmeUrl:s.readme.url,readmeSha256:s.readme.sha256,reviewer:'AI editorial review, not independent human review',runtimeValidated:false},contentHash:hash(body)});
}
check(items.length===10,'ten items in batch');check(new Set(items.map(x=>x.payload.title)).size===10,'unique titles');check(new Set(items.map(x=>x.payload.data.repo_id)).size===10,'unique repo IDs');
const data={format:1,campaign:'github-100-20261025',batch,scope:'Owner-approved new production introductions; no runtime validation claims',items};
const bytes=JSON.stringify(data,null,2)+'\n';writeFileSync(dir+'/content.json',bytes);
writeFileSync(dir+'/review.json',JSON.stringify({status:'PASS_LOCAL_EDITORIAL_AND_STRUCTURE_GATE',batch,observedAt:new Date().toISOString(),payloadSha256:hash(bytes),checks,items:items.map(x=>({key:x.key,title:x.payload.title,repo:x.evidence.repo,contentHash:x.contentHash})),limits:['Introductions and source-reading guidance; repositories not installed/executed','Structure checks support editorial review; they do not prove every factual claim','Production dry-run, import and HTTP checks are separate gates']},null,2)+'\n');
console.log('PASS batch '+batch+': '+items.length+' articles / '+checks.length+' checks / '+hash(bytes));
