(()=>{
const form=document.getElementById('resource-report-form');if(!form)return;
const button=form.querySelector('button[type=submit]'),status=document.getElementById('report-submit-state');
form.addEventListener('submit',()=>{button.disabled=true;button.textContent='Đang gửi…';status.textContent='Đang yêu cầu lưu báo cáo. Chờ trang xác nhận kết quả.';});
window.addEventListener('pageshow',()=>{button.disabled=false;button.textContent='Gửi báo lỗi';status.textContent='';});
})();