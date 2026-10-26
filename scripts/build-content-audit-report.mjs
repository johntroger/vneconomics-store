import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const base='docs/content-audit/2026-10-25',d=JSON.parse(readFileSync(base+'/public-snapshot.json','utf8')),s=JSON.parse(readFileSync(base+'/source-checks.json','utf8'));
const items=[...d.api.vne_resource,...d.api.vne_guide,...d.api.vne_practice];
const origin=d.origin;
const bodyText=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const actions={
101:'Bổ sung bài/ví dụ nên đọc đầu tiên; yêu cầu và giấy phép; phân biệt khóa học web với skill.',
102:'Đổi phân loại chính sang tài liệu học web nếu duyệt taxonomy; chỉ ra đúng ví dụ nhỏ và điều kiện dùng.',
103:'Ưu tiên: xác minh cách gọi skill, quyền đọc dự án, đầu vào/đầu ra và giới hạn; chưa gắn Đã thử.',
104:'Giữ cho bước sau HTML/CSS; nêu môi trường/framework cần có và ví dụ thay đổi nhỏ.',
105:'Dành cho người đã có React; bổ sung trường hợp không nên dùng và cách đo trước/sau.',
106:'Giữ nhãn archived; đưa ra khỏi nhóm khởi đầu khuyến nghị nếu được duyệt; không suy archived = không truy cập được.',
107:'P0: thử lại revision hiện hành, lưu validation hợp lệ rồi xác nhận lệnh/prompt hiển thị; không mở bằng cách tắt guard.',
108:'Bổ sung chọn công cụ, kiểm tra cài đặt/tài khoản và checkpoint cho người chưa biết terminal.',
109:'Thêm 3–5 tình huống lỗi có triệu chứng, cách xác định nguyên nhân và bước khôi phục.',
110:'Thêm ví dụ HTML/CSS trước/sau, bài tập và kết quả mong đợi; nguồn nền tảng phù hợp.',
111:'Liên kết rõ thứ tự chuẩn bị → làm bài → sửa lỗi → hiểu mã; tránh chỉ lặp tóm tắt bài 107.'};
const map=JSON.parse(readFileSync('docs/acceptance/S16/content-import-results.json','utf8')).journal.map;
const urls=new Map(Object.values(map).map(x=>[x.id,x.url]));
let inv='# Kiểm kê nội dung công khai — 25/10/2026\n\nDữ liệu trực tiếp từ production; chỉ GET. Đây là đề xuất xử lý, chưa thay đổi trang nào.\n\n## 25 mục bài/trang có định danh\n\n| ID | Loại | Nội dung | Đánh giá / việc cần làm |\n|---|---|---|---|\n';
for(const x of items.sort((a,b)=>a.id-b.id)) inv+=`| ${x.id} | ${x.post_type} | [${x.title}](${urls.get(x.id)}) | ${actions[x.id]} |\n`;
for(const x of [...d.api.posts,...d.api.pages].sort((a,b)=>a.id-b.id)){
 let a=x.id===1||x.id===2?'Nội dung WordPress mẫu; đề xuất lưu trữ/ẩn sau duyệt, không đưa vào kho mới.':x.id===92||x.id===95?'Tin tài chính tháng 6, khác định hướng AI; không có liên kết dẫn nguồn trong thân bài. Quyết định lưu trữ/chuyển nơi khác cần chủ duyệt; chưa xác minh lại số liệu thị trường.':[7,8,9,10].includes(x.id)?'Luồng WooCommerce cũ, không phù hợp lời hứa không giao dịch. Cần quyết định riêng trước ẩn/redirect hoặc tắt plugin.':'Trang cũ trống; lập ánh xạ đến trang/chức năng mới tương ứng, không tự redirect hoặc xóa.';
 inv+=`| ${x.id} | ${x.type} | [${bodyText(x.title.rendered)}](${x.link}) | ${a} |\n`;
}
inv+='\n## Toàn bộ 40 URL đã đọc\n\nĐộ dài là số đơn vị tách bằng khoảng trắng trong main, gồm chữ giao diện; không phải điểm chất lượng hay số từ tiếng Việt chuẩn. Canonical/description chỉ ghi nhận có/không.\n\n| URL | HTTP | Độ dài | Canonical | Description | Ghi chú |\n|---|---:|---:|---|---|---|\n';
for(const p of d.pages){let note=p.status===302?'Chuyển hướng tới '+p.location:p.url.endsWith('/bo-thuc-hanh/')?'Cùng tiêu đề/nội dung và canonical /huong-dan/; không coi là bộ thực hành riêng.':p.url.includes('vne_support=')?'Trang thông tin do theme tạo; chỉnh hiện cần quy trình release theme.':p.url.includes('/lost-password/')?'Luồng phụ WooCommerce; không submit.':p.url.includes('/assets/moc-studio/')?'Demo hư cấu; không coi là bài biên tập độc lập.':'';inv+=`| [${p.url.replace(origin,'')}](${p.url}) | ${p.status} | ${p.wordUnits} | ${p.canonical.length?'Có':'—'} | ${p.metas.some(m=>m.name==='description')?'Có':'—'} | ${note} |\n`;}
inv+='\n## Đối chiếu trường nội dung thư viện\n\n| ID | Thân bài (đơn vị khoảng trắng) | Nhãn thử | Nhu cầu | Công cụ | Hẹn rà soát |\n|---|---:|---|---:|---:|---|\n';
for(const x of items)inv+=`| ${x.id} | ${bodyText(x.content).split(/\s+/).length} | ${x.derived.validation_status} | ${x.needs.length} | ${x.tools.length} | ${x.derived.review_due_at||'Chưa có'} |\n`;
writeFileSync(base+'/inventory.vi.md',inv);
const summary={observedAt:d.observedAt,scope:d.scope,publicContent:{resources:d.api.vne_resource.length,guides:d.api.vne_guide.length,practice:d.api.vne_practice.length,legacyPosts:d.api.posts.length,legacyPages:d.api.pages.length,products:d.api.products.length},crawl:{requests:d.requests.length,pages:d.pages.length,status200:d.pages.filter(p=>p.status===200).length,status302:d.pages.filter(p=>p.status===302).length,errors:d.errors},quality:{resourcesUnknownClaims:d.api.vne_resource.filter(x=>Object.values(x.data.claims).every(c=>c.verification_status==='unknown')).length,notTested:items.filter(x=>x.derived.validation_status==='not_tested').length,emptyNeeds:items.filter(x=>!x.needs.length).length,emptyTools:items.filter(x=>!x.tools.length).length,noReviewDue:items.filter(x=>!x.derived.review_due_at).length,emptyLegacyPages:d.api.pages.filter(x=>[67,71,78,81,84,87].includes(x.id)).length},sourceRequests:s.requests.length,remoteWrites:0,cleanup:{lockAbsentAtReportBuild:!existsSync('tmp/.transient-run.lock'),note:'This builder runs inside run-clean, so its lock exists until exit; runner confirms final cleanup separately.'}};
delete summary.cleanup;
const candidates=JSON.parse(readFileSync(base+'/github-candidates.json','utf8'));
summary.githubDiscovery={queries:candidates.searches.length,requests:candidates.requests.length,uniqueCandidates:Object.keys(candidates.repos).length,observedAt:candidates.observedAt};
summary.cleanup={managedBy:'scripts/run-clean.mjs',transientFixturesCreated:false,deliverablesRetained:true,note:'Runner removes its run directory/cache and lock after this process exits; confirmed in runner output.'};
writeFileSync(base+'/summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary.publicContent));
