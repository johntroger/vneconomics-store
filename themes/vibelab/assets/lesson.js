(()=>{
'use strict';
const root=document.querySelector('[data-lesson]');if(!root)return;
const status=document.getElementById('lesson-copy-status');
root.querySelectorAll('[data-copy-target]').forEach(button=>{
 button.hidden=false;
 button.addEventListener('click',async()=>{
  const pre=document.getElementById(button.dataset.copyTarget);if(!pre)return;
  try{
   if(!navigator.clipboard?.writeText)throw new Error('unavailable');
   await navigator.clipboard.writeText(pre.textContent);
   status.textContent='Đã sao chép. Bạn vẫn cần tự chạy hoặc gửi nội dung đúng nơi rồi kiểm tra kết quả.';
  }catch{
   const selection=getSelection(),range=document.createRange();range.selectNodeContents(pre);selection.removeAllRanges();selection.addRange(range);pre.focus();
   status.textContent='Chưa sao chép được. Nội dung đã được chọn; nhấn Ctrl+C để sao chép thủ công.';
  }
 });
});
const checks=[...root.querySelectorAll('[data-lesson-check]')];
if(!checks.length)return;
const progress=document.getElementById('lesson-progress'),notice=document.getElementById('lesson-storage'),reset=document.getElementById('lesson-reset');
const revision=root.dataset.lessonRevision,key='vibelab:lesson:'+root.dataset.lesson;
let storage=true;
const selected=()=>checks.filter(x=>x.checked).map(x=>x.dataset.lessonCheck);
const render=()=>{progress.textContent=selected().length+'/'+checks.length+' mục bạn tự đánh dấu — chưa xác nhận hoàn thành.';};
try{
 const saved=JSON.parse(localStorage.getItem(key)||'null');
 if(saved?.revision===revision&&Array.isArray(saved.selected)&&saved.selected.length<=checks.length){
  checks.forEach(x=>x.checked=saved.selected.includes(x.dataset.lessonCheck));
  notice.textContent='Ghi chú tự kiểm tra lưu trên trình duyệt này; không gửi lên website.';
 }else{
  checks.forEach(x=>x.checked=false);
  notice.textContent=saved?'Bài đã đổi phiên bản. Các dấu cũ không được áp dụng; hãy kiểm tra lại.':'Ghi chú tự kiểm tra lưu trên trình duyệt này; không gửi lên website.';
  localStorage.setItem(key,JSON.stringify({revision,selected:[]}));
 }
}catch{storage=false;notice.textContent='Không lưu được trên trình duyệt này. Dấu chọn chỉ giữ trong trang đang mở.';}
const persist=()=>{
 render();
 if(storage)try{localStorage.setItem(key,JSON.stringify({revision,selected:selected()}));}catch{storage=false;notice.textContent='Không lưu được trên trình duyệt này. Dấu chọn chỉ giữ trong trang đang mở.';}
};
checks.forEach(x=>x.addEventListener('change',persist));
reset.hidden=false;reset.addEventListener('click',()=>{checks.forEach(x=>x.checked=false);persist();notice.textContent=storage?'Đã bỏ dấu tự kiểm tra trên trình duyệt này.':'Đã bỏ dấu; trình duyệt không lưu được tiến độ.';});
window.addEventListener('pageshow',()=>{render();});render();
})();
