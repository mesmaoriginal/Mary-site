const supabaseUrl = 'https://blqgecadnzcyixltrfhl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscWdlY2FkbnpjeWl4bHRyZmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzAxMjUsImV4cCI6MjA4MTkwNjEyNX0.tCyhX1CW0dEX_gTylZ1N96QQkLpbFGsHylysrTMtJfo';
const db = supabase.createClient(supabaseUrl, supabaseKey);

// عناصر
const select = document.getElementById('sideSelect');
const form = document.getElementById('sendLetterForm');
const textarea = document.getElementById('messageText');
const modal = document.getElementById('viewModal');
const modalContent = modal.querySelector('.modal-content');
const closeBtn = modal.querySelector('.close');

// جایی که پیام‌ها نمایش داده می‌شن
let messagesContainer;

// تابع بارگذاری و نمایش پیام‌ها
async function loadMessages() {
  const { data, error } = await db
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    modalContent.innerHTML = `
      <span class="close">&times;</span>
      <p style="text-align:center;color:red;padding:20px;">خطا در بارگذاری نامه‌ها: ${error.message}</p>
    `;
    attachCloseEvents();
    return;
  }

  // ساختن کانتینر پیام‌ها
  modalContent.innerHTML = `
    <span class="close">&times;</span>
    <h2 style="text-align:center; padding:20px 0; color:#333;">نامه‌ها 📬</h2>
    <div id="messagesContainer" style="max-height:60vh; overflow-y:auto; padding:0 20px;"></div>
  `;

  messagesContainer = document.getElementById('messagesContainer');
  attachCloseEvents();

  if (data.length === 0) {
    messagesContainer.innerHTML = '<p style="text-align:center; color:#888; font-style:italic; padding:40px;">هنوز هیچ نامه‌ای ارسال نشده 😿<br>اولین نفر شما باشید!</p>';
    return;
  }

  // ساختن ساختار threaded
  const messagesMap = new Map();
  const roots = [];

  data.forEach(msg => {
    messagesMap.set(msg.id, { ...msg, replies: [] });
  });

  data.forEach(msg => {
    if (!msg.parent_id) {
      roots.push(messagesMap.get(msg.id));
    } else if (messagesMap.has(msg.parent_id)) {
      messagesMap.get(msg.parent_id).replies.push(messagesMap.get(msg.id));
    }
  });

  // رندر کردن پیام‌ها
  function renderMessage(msg, indent = 0) {
    const div = document.createElement('div');
    div.style.cssText = `
      background: ${msg.is_admin ? '#fff0f0' : '#f8fdff'};
      border-right: ${msg.is_admin ? '6px solid #ff6b6b' : '5px solid #1fa8f5'};
      border-radius: 12px;
      padding: 16px;
      margin: 12px ${indent * 40}px 12px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      direction: rtl;
    `;

    div.innerHTML = `
      ${msg.is_admin ? '<div style="text-align:center; margin-bottom:12px; font-weight:bold; color:#d63031;">💌 پاسخ نامه شما</div>' : ''}
      <p style="margin:0 0 10px 0; line-height:1.6; font-size:16px;">${msg.text.replace(/\n/g, '<br>')}</p>
      <small style="color:#666; font-size:13px;">${new Date(msg.created_at).toLocaleString('fa-IR')}</small>
    `;

    messagesContainer.appendChild(div);

    // ریپلای‌ها
    if (msg.replies.length > 0) {
      msg.replies
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .forEach(reply => renderMessage(reply, indent + 1));
    }
  }

  // نمایش پیام‌های اصلی (جدید به قدیمی)
  roots.forEach(root => renderMessage(root));
}

// بستن مودال
function attachCloseEvents() {
  modal.querySelector('.close').onclick = () => modal.style.display = 'none';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// تغییر سلکت
select.addEventListener('change', async function() {
  if (this.value === 'send') {
    form.style.display = 'block';
    gsap.to(form, { duration: 0.5, opacity: 1, height: 'auto', ease: "back.out(1.3)" });
    textarea.focus();
  } else if (this.value === 'view') {
    modal.style.display = 'block';
    gsap.from(modalContent, { duration: 0.6, opacity: 0, scale: 0.9, ease: "back.out(1.7)" });
    await loadMessages();
  }
  this.value = '';
});

// تنظیمات textarea
textarea.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});
textarea.addEventListener('focus', () => textarea.style.backgroundColor = 'yellow');
textarea.addEventListener('blur', () => textarea.style.backgroundColor = 'white');

// لغو
document.getElementById('cancelButton').onclick = () => {
  gsap.to(form, { duration: 0.4, opacity: 0, height: 0, onComplete: () => form.style.display = 'none' });
  textarea.value = '';
  textarea.style.height = 'auto';
};

// ارسال نامه
document.getElementById('submitButton').onclick = async () => {
  const text = textarea.value.trim();
  if (!text) return alert('نامه‌ای ننوشتی! 😿');

  const { error } = await db.from('messages').insert({ text });

  if (error) {
    alert('خطا در ارسال: ' + error.message);
  } else {
    textarea.value = '';
    textarea.style.height = 'auto';
    gsap.to(form, { duration: 0.4, opacity: 0, height: 0, onComplete: () => form.style.display = 'none' });
    alert('نامه‌ات با موفقیت ارسال شد! 🖤🐱');
  }
};

// ریل‌تایم کامل (همیشه فعال باشه)
db.channel('messages_channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
    if (modal.style.display === 'block') {
      await loadMessages();
    }
  })
  .subscribe();
