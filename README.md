<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>StarTrack - Local Demo (Student/Teacher/Admin)</title>

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <style>
    body { font-family: 'Sarabun', sans-serif; background: linear-gradient(135deg,#f4eaff 0%,#d3ecfd 100%); color:#222; }
    .card { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
    .small { font-size: .85rem; color: #555; }
    .muted { color: #666; font-size: .9rem; }
  </style>
</head>
<body class="min-h-screen p-6">

  <div class="max-w-5xl mx-auto">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-center mb-2">StarTrack DEMO</h1>
      <p class="text-center muted">ระบบจำลองสำหรับนักเรียน / ครู / ผู้บริหาร (เก็บข้อมูลในเครื่องด้วย LocalStorage)</p>
    </header>

    <main id="app"></main>

    <footer class="text-center text-sm text-gray-500 mt-8">
      Demo only — ข้อมูลเก็บในเครื่อง (localStorage). ไม่ควรใช้ในงานจริงโดยไม่มี backend ที่ปลอดภัย
    </footer>
  </div>

<script>
/* ===========================
   Storage keys & utils
   =========================== */
const KEY_USERS = 'st_users_v1';
const KEY_MOOD  = 'st_mood_v1';
const KEY_CLASS = 'st_class_v1';

/* helper */
const nowTH = ()=> new Date().toLocaleString('th-TH');
const uid = ()=> 'id_' + Math.random().toString(36).slice(2,9);

function getUsers(){ return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
function saveUsers(u){ localStorage.setItem(KEY_USERS, JSON.stringify(u)); }
function getMood(){ return JSON.parse(localStorage.getItem(KEY_MOOD) || '[]'); }
function saveMood(m){ localStorage.setItem(KEY_MOOD, JSON.stringify(m)); }
function getClasses(){ return JSON.parse(localStorage.getItem(KEY_CLASS) || '[]'); }
function saveClasses(c){ localStorage.setItem(KEY_CLASS, JSON.stringify(c)); }

/* seed initial data if empty */
(function seedIfEmpty(){
  if (getUsers().length === 0){
    const seedUsers = [
      { id: uid(), username: 'admin', password: 'admin', role: 'admin', displayName: 'ผู้บริหาร (Admin)' },
      { id: uid(), username: 'teacher1', password: 'teacher1', role: 'teacher', displayName: 'ครู สมชาย' },
      { id: uid(), username: 'student1', password: 'student1', role: 'student', displayName: 'นักเรียน นรินทร์', classId: 'class_a' },
      { id: uid(), username: 'student2', password: 'student2', role: 'student', displayName: 'นักเรียน ปวีณา', classId: 'class_b' },
    ];
    saveUsers(seedUsers);
  }
  if (getClasses().length === 0){
    const classes = [
      { id: 'class_a', name: 'ม.1/1' },
      { id: 'class_b', name: 'ม.1/2' }
    ];
    saveClasses(classes);
  }
})();

/* ===========================
   App state
   =========================== */
let currentUser = null; // {id, username, role, ...}

/* ===========================
   Render: root app
   =========================== */
const app = document.getElementById('app');
function renderHome(){
  app.innerHTML = `
    <div class="grid gap-6 md:grid-cols-2">
      <div class="card">
        <h2 class="text-lg font-semibold mb-2">เข้าสู่ระบบ / ลงทะเบียน</h2>
        <div id="authArea"></div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-2">ข้อมูลระบบด่วน</h2>
        <div class="small">
          <p>ผู้ใช้ทั้งหมด: <strong id="statUsers">0</strong></p>
          <p>เรคคอร์ดอารมณ์ทั้งหมด: <strong id="statMoods">0</strong></p>
          <p>ชั้นเรียน: <strong id="statClasses">0</strong></p>
        </div>
        <hr class="my-4">
        <div>
          <h3 class="font-medium mb-2">ตัวอย่างผู้ใช้เริ่มต้น</h3>
          <ul class="small list-disc ml-5">
            <li>Admin: <code>admin / admin</code></li>
            <li>Teacher: <code>teacher1 / teacher1</code></li>
            <li>Student: <code>student1 / student1</code>, <code>student2 / student2</code></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-6 card">
      <h3 class="font-semibold mb-2">ฟีเจอร์เพิ่มเติม</h3>
      <div class="small">
        <p>- ลงทะเบียนผู้ใช้ใหม่ (ทุกบทบาท)</p>
        <p>- ระบบแบ่งชั้นเรียน (เพิ่มเติมได้)</p>
        <p>- ครูสามารถดูประวัติของนักเรียนทั้งชั้น</p>
        <p>- ผู้บริหารสามารถจัดการบัญชีและส่งออกข้อมูล (CSV)</p>
      </div>
    </div>
  `;

  document.getElementById('statUsers').innerText = getUsers().length;
  document.getElementById('statMoods').innerText = getMood().length;
  document.getElementById('statClasses').innerText = getClasses().length;

  renderAuthArea();
}

/* ===========================
   Auth area: login + register
   =========================== */
function renderAuthArea(){
  app.querySelector('#authArea').innerHTML = `
    <div class="grid gap-3 md:grid-cols-2">
      <div>
        <label class="block small mb-1">ชื่อผู้ใช้</label>
        <input id="loginUser" class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block small mb-1">รหัสผ่าน</label>
        <input id="loginPass" type="password" class="w-full p-2 border rounded" />
      </div>
    </div>
    <div class="flex gap-2 mt-3">
      <button class="px-4 py-2 bg-blue-600 text-white rounded" onclick="doLogin()">เข้าสู่ระบบ</button>
      <button class="px-4 py-2 bg-gray-200 rounded" onclick="showRegister()">ลงทะเบียน</button>
      <button class="px-4 py-2 bg-green-600 text-white rounded" onclick="demoLogout()" id="btnDemoLogout" style="display:none">ออกจากระบบ</button>
    </div>
    <p class="mt-2 small muted">หมายเหตุ: ระบบนี้เก็บข้อมูลในเครื่อง (localStorage) สำหรับเดโมเท่านั้น</p>
  `;

  if (currentUser) {
    document.getElementById('loginUser').value = currentUser.username;
    document.getElementById('loginPass').value = '';
    document.getElementById('btnDemoLogout').style.display = 'inline-block';
    document.querySelector('#loginUser').disabled = true;
    document.querySelector('#loginPass').placeholder = 'ใส่รหัสเพื่อยืนยัน (หรือเว้นว่าง)';
  }
}

function doLogin(){
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  if (!u) return alert('กรุณากรอกชื่อผู้ใช้');

  const users = getUsers();
  const user = users.find(x => x.username === u && x.password === p);
  if (!user) return alert('เข้าสู่ระบบไม่สำเร็จ: ตรวจสอบชื่อผู้ใช้หรือรหัสผ่าน');

  currentUser = user;
  renderDashboardForRole();
}

/* quick logout */
function demoLogout(){
  currentUser = null;
  renderHome();
}

/* ===========================
   Register user (client-side)
   =========================== */
function showRegister(){
  app.querySelector('#authArea').innerHTML = `
    <div class="grid gap-3 md:grid-cols-2">
      <div>
        <label class="block small mb-1">ชื่อผู้ใช้ (username)</label>
        <input id="regUser" class="w-full p-2 border rounded" />
      </div>
      <div>
        <label class="block small mb-1">รหัสผ่าน</label>
        <input id="regPass" type="password" class="w-full p-2 border rounded" />
      </div>

      <div>
        <label class="block small mb-1">ชื่อที่แสดง (Display name)</label>
        <input id="regDisplay" class="w-full p-2 border rounded" placeholder="เช่น นางสาว สมหญิง" />
      </div>

      <div>
        <label class="block small mb-1">บทบาท</label>
        <select id="regRole" class="w-full p-2 border rounded" onchange="onRoleChangeReg()">
          <option value="student">นักเรียน</option>
          <option value="teacher">ครู</option>
          <option value="admin">ผู้บริหาร</option>
        </select>
      </div>

      <div id="classSelectArea">
        <label class="block small mb-1">ชั้นเรียน (สำหรับนักเรียน)</label>
        <select id="regClass" class="w-full p-2 border rounded"></select>
      </div>
    </div>

    <div class="flex gap-2 mt-3">
      <button class="px-4 py-2 bg-green-600 text-white rounded" onclick="doRegister()">สร้างบัญชี</button>
      <button class="px-4 py-2 bg-gray-200 rounded" onclick="renderAuthArea()">ยกเลิก</button>
    </div>
  `;
  refreshClassOptions();
}

function onRoleChangeReg(){
  const r = document.getElementById('regRole').value;
  document.getElementById('classSelectArea').style.display = r === 'student' ? 'block' : 'none';
}

function refreshClassOptions(){
  const cls = getClasses();
  const sel = document.getElementById('regClass');
  if (!sel) return;
  sel.innerHTML = cls.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function doRegister(){
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  const displayName = document.getElementById('regDisplay').value.trim() || username;
  const role = document.getElementById('regRole').value;
  const classId = document.getElementById('regClass') ? document.getElementById('regClass').value : null;

  if (!username || !password) return alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');

  const users = getUsers();
  if (users.some(u => u.username === username)) return alert('ชื่อผู้ใช้นี้ถูกใช้แล้ว');

  const newUser = { id: uid(), username, password, role, displayName, classId };
  users.push(newUser);
  saveUsers(users);
  alert('ลงทะเบียนสำเร็จ');
  renderAuthArea();
  document.getElementById('statUsers').innerText = getUsers().length;
}

/* ===========================
   Dashboard routing by role
   =========================== */
function renderDashboardForRole(){
  if (!currentUser) return renderHome();
  if (currentUser.role === 'student') return studentView();
  if (currentUser.role === 'teacher') return teacherView();
  if (currentUser.role === 'admin') return adminView();
  renderHome();
}

/* ===========================
   Student view
   =========================== */
function studentView(){
  const myName = currentUser.displayName || currentUser.username;
  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">นักเรียน: ${myName}</h2>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-gray-200 rounded" onclick="demoLogout()">ออกจากระบบ</button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="card">
        <h3 class="font-semibold mb-2">บันทึกอารมณ์ใหม่</h3>
        <label class="block small mb-1">อารมณ์</label>
        <select id="mood_select" class="w-full p-2 border rounded mb-3">
          <option value="">-- เลือกอารมณ์ --</option>
          <option value="ดีมาก 😊">ดีมาก 😊</option>
          <option value="ดี 🙂">ดี 🙂</option>
          <option value="เฉย ๆ 😐">เฉย ๆ 😐</option>
          <option value="ไม่ค่อยดี 🙁">ไม่ค่อยดี 🙁</option>
          <option value="แย่มาก 😢">แย่มาก 😢</option>
        </select>

        <label class="block small mb-1">บันทึก (ไม่บังคับ)</label>
        <textarea id="mood_note" rows="4" class="w-full p-2 border rounded mb-3" placeholder="เขียนความรู้สึกสั้น ๆ..."></textarea>

        <button class="px-4 py-2 bg-blue-600 text-white rounded" onclick="studentSaveMood()">บันทึกอารมณ์</button>
      </div>

      <div class="card">
        <h3 class="font-semibold mb-2">สถิติของฉัน (ตัวอย่าง)</h3>
        <div id="stuStats" class="small"></div>
      </div>
    </div>

    <div class="card mt-6">
      <h3 class="font-semibold mb-2">ประวัติอารมณ์ของฉัน</h3>
      <div id="stuHistory"></div>
    </div>
  `;

  refreshStudentHistory();
  refreshStudentStats();
}

function studentSaveMood(){
  const mood = document.getElementById('mood_select').value;
  const note = document.getElementById('mood_note').value.trim();
  if (!mood) return alert('กรุณาเลือกอารมณ์');

  const record = { id: uid(), userId: currentUser.id, username: currentUser.username, displayName: currentUser.displayName, mood, note, time: nowTH() };
  const m = getMood(); m.push(record); saveMood(m);
  alert('บันทึกเรียบร้อย');
  document.getElementById('mood_select').value = '';
  document.getElementById('mood_note').value = '';
  refreshStudentHistory();
  refreshStudentStats();
}

function refreshStudentHistory(){
  const list = getMood().filter(x => x.userId === currentUser.id).reverse();
  const el = document.getElementById('stuHistory');
  if (!el) return;
  el.innerHTML = list.length ? list.map(r => `
    <div class="p-3 border rounded mb-2">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-semibold">${r.mood}</div>
          <div class="small text-gray-600">${r.note || '-'}</div>
        </div>
        <div class="text-xs text-gray-400">${r.time}</div>
      </div>
    </div>
  `).join('') : '<p class="muted">ยังไม่มีการบันทึก</p>';
}

function refreshStudentStats(){
  const list = getMood().filter(x => x.userId === currentUser.id);
  const counts = { good:0, neutral:0, bad:0 };
  list.forEach(r=>{
    if (r.mood.includes('ดีมาก')||r.mood.includes('ดี')) counts.good++;
    else if (r.mood.includes('เฉย')) counts.neutral++;
    else counts.bad++;
  });
  const el = document.getElementById('stuStats');
  if (!el) return;
  el.innerHTML = `<p>บันทึกทั้งหมด: <strong>${list.length}</strong></p>
                  <p>ดี: ${counts.good} • เฉย: ${counts.neutral} • แย่: ${counts.bad}</p>`;
}

/* ===========================
   Teacher view
   =========================== */
function teacherView(){
  const myName = currentUser.displayName || currentUser.username;
  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">ครู: ${myName}</h2>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-gray-200 rounded" onclick="demoLogout()">ออกจากระบบ</button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <div class="card md:col-span-1">
        <label class="small mb-1 block">เลือกชั้นเรียน</label>
        <select id="teacherClassSel" class="w-full p-2 border rounded mb-3" onchange="teacherRefreshList()"></select>

        <label class="small mb-1 block">ค้นหาชื่อนักเรียน</label>
        <input id="teacherSearch" class="w-full p-2 border rounded mb-3" placeholder="ค้นหา username หรือ display name" oninput="teacherRefreshList()" />
      </div>

      <div class="card md:col-span-2">
        <h3 class="font-semibold mb-2">ประวัติอารมณ์ของนักเรียน (กรองได้)</h3>
        <div id="teacherList"></div>
      </div>
    </div>
  `;
  refreshTeacherClassOptions();
  teacherRefreshList();
}

function refreshTeacherClassOptions(){
  const sel = document.getElementById('teacherClassSel');
  const classes = getClasses();
  sel.innerHTML = `<option value="">-- ทุกชั้นเรียน --</option>` + classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function teacherRefreshList(){
  const classId = document.getElementById('teacherClassSel').value;
  const q = document.getElementById('teacherSearch').value.trim().toLowerCase();
  const users = getUsers().filter(u => u.role === 'student' && (!classId || u.classId === classId));
  const moods = getMood();

  const listHtml = users.map(u => {
    const userMoods = moods.filter(m => m.userId === u.id).slice(-5).reverse();
    const filtered = (u.username + ' ' + (u.displayName||'')).toLowerCase().includes(q);
    if (!filtered) return '';
    return `
      <div class="p-3 border rounded mb-2">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-semibold">${u.displayName || u.username} <span class="small text-gray-500">(${u.username})</span></div>
            <div class="small text-gray-600">ชั้น: ${getClasses().find(c=>c.id===u.classId)?.name || '-'}</div>
          </div>
          <div class="text-xs text-gray-400">${userMoods.length ? userMoods[0].time : ''}</div>
        </div>
        <div class="mt-2 space-y-1">
          ${userMoods.length ? userMoods.map(m => `<div class="p-2 bg-gray-50 rounded"><strong>${m.mood}</strong> <div class="small text-gray-600">${m.note||'-'}</div></div>`).join('') : '<div class="muted">ไม่พบบันทึก</div>'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('teacherList').innerHTML = listHtml || '<p class="muted">ไม่พบข้อมูล</p>';
}

/* ===========================
   Admin view: user mgmt + stats + export
   =========================== */
function adminView(){
  const myName = currentUser.displayName || currentUser.username;
  app.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">ผู้บริหาร: ${myName}</h2>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-gray-200 rounded" onclick="demoLogout()">ออกจากระบบ</button>
      </div>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <div class="card">
        <h3 class="font-semibold mb-2">สถิติภาพรวม</h3>
        <div id="adminStats" class="small"></div>
        <hr class="my-3">
        <button class="px-3 py-2 bg-indigo-600 text-white rounded" onclick="exportAllCSV()">ส่งออก CSV (ทั้งระบบ)</button>
      </div>

      <div class="card md:col-span-2">
        <h3 class="font-semibold mb-2">จัดการผู้ใช้</h3>
        <div class="flex gap-2 mb-3">
          <button class="px-3 py-2 bg-green-600 text-white rounded" onclick="showAddUserForm()">เพิ่มผู้ใช้</button>
          <button class="px-3 py-2 bg-yellow-500 text-white rounded" onclick="showManageClasses()">จัดการชั้นเรียน</button>
        </div>
        <div id="adminUserList"></div>
      </div>
    </div>
  `;
  refreshAdminStats();
  renderAdminUserList();
}

/* Admin utilities */
function refreshAdminStats(){
  const users = getUsers();
  const moods = getMood();
  const classes = getClasses();

  const totalUsers = users.length;
  const students = users.filter(u=>u.role==='student').length;
  const teachers = users.filter(u=>u.role==='teacher').length;
  const moodsTotal = moods.length;

  document.getElementById('adminStats').innerHTML = `
    <p>ผู้ใช้ทั้งหมด: <strong>${totalUsers}</strong> (นักเรียน ${students}, ครู ${teachers})</p>
    <p>บันทึกอารมณ์ทั้งหมด: <strong>${moodsTotal}</strong></p>
    <p>ชั้นเรียน: <strong>${classes.length}</strong></p>
  `;
}

function renderAdminUserList(){
  const users = getUsers();
  const list = users.map(u => `
    <div class="p-3 border rounded mb-2 flex justify-between items-start">
      <div>
        <div class="font-semibold">${u.displayName || u.username} <span class="small text-gray-500">(${u.username})</span></div>
        <div class="small text-gray-600">Role: ${u.role} • Class: ${getClasses().find(c=>c.id===u.classId)?.name || '-'}</div>
      </div>
      <div class="flex gap-2">
        <button class="px-2 py-1 bg-blue-500 text-white rounded small" onclick="showEditUser('${u.id}')">แก้ไข</button>
        <button class="px-2 py-1 bg-red-500 text-white rounded small" onclick="deleteUserConfirm('${u.id}')">ลบ</button>
      </div>
    </div>
  `).join('');
  document.getElementById('adminUserList').innerHTML = list || '<p class="muted">ยังไม่มีผู้ใช้</p>';
}

/* add user form */
function showAddUserForm(){
  app.querySelector('#adminUserList').innerHTML = `
    <div class="p-3 border rounded mb-3">
      <h4 class="font-semibold mb-2">สร้างผู้ใช้ใหม่</h4>
      <div class="grid gap-2 md:grid-cols-2">
        <input id="newU_username" placeholder="username" class="p-2 border rounded" />
        <input id="newU_pass" placeholder="password" class="p-2 border rounded" />
        <input id="newU_display" placeholder="display name" class="p-2 border rounded" />
        <select id="newU_role" class="p-2 border rounded" onchange="onNewUserRoleChange()">
          <option value="student">student</option>
          <option value="teacher">teacher</option>
          <option value="admin">admin</option>
        </select>
        <select id="newU_class" class="p-2 border rounded"></select>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="px-3 py-2 bg-green-600 text-white rounded" onclick="adminCreateUser()">สร้าง</button>
        <button class="px-3 py-2 bg-gray-200 rounded" onclick="renderAdminUserList(); refreshAdminStats()">ยกเลิก</button>
      </div>
    </div>
  `;
  refreshClassSelector('#newU_class');
  onNewUserRoleChange();
}

/* edit user */
function showEditUser(id){
  const u = getUsers().find(x=>x.id===id);
  if (!u) return alert('ไม่พบผู้ใช้');
  app.querySelector('#adminUserList').innerHTML = `
    <div class="p-3 border rounded mb-3">
      <h4 class="font-semibold mb-2">แก้ไขผู้ใช้: ${u.username}</h4>
      <div class="grid gap-2 md:grid-cols-2">
        <input id="edit_username" value="${u.username}" class="p-2 border rounded" />
        <input id="edit_pass" placeholder="ระบุเพื่อเปลี่ยนรหัสผ่าน (ปล่อยว่างเพื่อคงเดิม)" class="p-2 border rounded" />
        <input id="edit_display" value="${u.displayName||''}" class="p-2 border rounded" />
        <select id="edit_role" class="p-2 border rounded" onchange="onEditRoleChange()">
          <option ${u.role==='student'?'selected':''} value="student">student</option>
          <option ${u.role==='teacher'?'selected':''} value="teacher">teacher</option>
          <option ${u.role==='admin'?'selected':''} value="admin">admin</option>
        </select>
        <select id="edit_class" class="p-2 border rounded"></select>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="px-3 py-2 bg-blue-600 text-white rounded" onclick="adminSaveEdit('${u.id}')">บันทึก</button>
        <button class="px-3 py-2 bg-gray-200 rounded" onclick="renderAdminUserList(); refreshAdminStats()">ยกเลิก</button>
      </div>
    </div>
  `;
  refreshClassSelector('#edit_class');
  document.getElementById('edit_class').value = u.classId || '';
  onEditRoleChange();
}

function onNewUserRoleChange(){
  const r = document.getElementById('newU_role').value;
  document.getElementById('newU_class').style.display = r==='student' ? 'block' : 'none';
}
function onEditRoleChange(){
  const r = document.getElementById('edit_role').value;
  document.getElementById('edit_class').style.display = r==='student' ? 'block' : 'none';
}

function refreshClassSelector(selector){
  const sel = document.querySelector(selector);
  const classes = getClasses();
  if (sel) sel.innerHTML = `<option value="">- ไม่มี -</option>` + classes.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

/* create user */
function adminCreateUser(){
  const username = document.getElementById('newU_username').value.trim();
  const pass = document.getElementById('newU_pass').value;
  const display = document.getElementById('newU_display').value.trim() || username;
  const role = document.getElementById('newU_role').value;
  const classId = document.getElementById('newU_class').value || '';

  if (!username || !pass) return alert('กรุณากรอก username และ password');
  const users = getUsers();
  if (users.some(u=>u.username===username)) return alert('username นี้มีแล้ว');
  users.push({ id: uid(), username, password: pass, displayName: display, role, classId });
  saveUsers(users);
  alert('สร้างผู้ใช้เรียบร้อย');
  renderAdminUserList();
  refreshAdminStats();
}

/* save edit */
function adminSaveEdit(id){
  const users = getUsers();
  const idx = users.findIndex(u=>u.id===id);
  if (idx<0) return alert('ไม่พบผู้ใช้');
  const username = document.getElementById('edit_username').value.trim();
  const pass = document.getElementById('edit_pass').value;
  const display = document.getElementById('edit_display').value.trim() || username;
  const role = document.getElementById('edit_role').value;
  const classId = document.getElementById('edit_class').value || '';

  // username uniqueness
  if (users.some((u,i)=>u.username===username && i!==idx)) return alert('username นี้มีผู้ใช้แล้ว');

  users[idx].username = username;
  if (pass) users[idx].password = pass;
  users[idx].displayName = display;
  users[idx].role = role;
  users[idx].classId = classId;
  saveUsers(users);
  alert('บันทึกเรียบร้อย');
  renderAdminUserList();
  refreshAdminStats();
}

/* delete user */
function deleteUserConfirm(id){
  if (!confirm('ต้องการลบผู้ใช้นี้ใช่หรือไม่? (ข้อมูลบันทึกของผู้ใช้อาจยังอยู่)')) return;
  let users = getUsers();
  users = users.filter(u=>u.id!==id);
  saveUsers(users);
  alert('ลบแล้ว');
  renderAdminUserList();
  refreshAdminStats();
}

/* manage classes */
function showManageClasses(){
  const classes = getClasses();
  app.querySelector('#adminUserList').innerHTML = `
    <div class="p-3 border rounded mb-3">
      <h4 class="font-semibold mb-2">จัดการชั้นเรียน</h4>
      <div class="grid gap-2 md:grid-cols-3 mb-3">
        <input id="newClassName" placeholder="ชื่อชั้นเรียน เช่น ม.1/3" class="p-2 border rounded" />
        <button class="px-3 py-2 bg-green-600 text-white rounded" onclick="addClass()">เพิ่ม</button>
      </div>
      <div id="classListArea"></div>
      <div class="mt-3"><button class="px-3 py-2 bg-gray-200 rounded" onclick="renderAdminUserList(); refreshAdminStats()">กลับ</button></div>
    </div>
  `;
  renderClassList();
}

function renderClassList(){
  const classes = getClasses();
  const html = classes.map(c => `
    <div class="p-2 border rounded mb-2 flex justify-between items-center">
      <div>${c.name}</div>
      <div class="flex gap-2">
        <button class="px-2 py-1 bg-yellow-400 rounded" onclick="editClassPrompt('${c.id}')">แก้ไข</button>
        <button class="px-2 py-1 bg-red-500 text-white rounded" onclick="deleteClass('${c.id}')">ลบ</button>
      </div>
    </div>
  `).join('');
  document.getElementById('classListArea').innerHTML = html || '<p class="muted">ยังไม่มีชั้นเรียน</p>';
}

function addClass(){
  const name = document.getElementById('newClassName').value.trim();
  if (!name) return alert('กรุณากรอกชื่อชั้นเรียน');
  const classes = getClasses();
  const id = 'class_' + Math.random().toString(36).slice(2,8);
  classes.push({ id, name });
  saveClasses(classes);
  document.getElementById('newClassName').value = '';
  renderClassList();
  refreshClassSelector('#newU_class');
  refreshClassSelector('#edit_class');
  refreshTeacherClassOptions();
  alert('เพิ่มชั้นเรียนเรียบร้อย');
}

function editClassPrompt(id){
  const classes = getClasses();
  const c = classes.find(x=>x.id===id);
  const newName = prompt('แก้ไขชื่อชั้นเรียน', c.name);
  if (!newName) return;
  c.name = newName;
  saveClasses(classes);
  renderClassList();
  refreshClassSelector('#newU_class'); refreshClassSelector('#edit_class');
  refreshTeacherClassOptions();
}

function deleteClass(id){
  if (!confirm('ลบชั้นเรียนนี้? นักเรียนที่อยู่ภายใต้ชั้นเรียนนี้จะไม่มีชั้นเรียนระบุ')) return;
  let classes = getClasses();
  classes = classes.filter(x=>x.id!==id);
  saveClasses(classes);
  // clear classId from users
  const users = getUsers().map(u => { if (u.classId === id) u.classId = ''; return u; });
  saveUsers(users);
  renderClassList();
  refreshClassSelector('#newU_class'); refreshClassSelector('#edit_class');
  refreshTeacherClassOptions();
  alert('ลบเรียบร้อย');
}

/* ===========================
   CSV export
   =========================== */
function exportAllCSV(){
  const users = getUsers();
  const moods = getMood();

  // users CSV
  const userCSV = [
    ['id','username','displayName','role','classId'].join(','),
    ...users.map(u => [u.id, u.username, `"${(u.displayName||'').replace(/"/g,'""')}"`, u.role, u.classId || ''].join(','))
  ].join('\n');

  // mood CSV
  const moodCSV = [
    ['id','userId','username','displayName','mood','note','time'].join(','),
    ...moods.map(m => [m.id, m.userId, m.username, `"${(m.displayName||'').replace(/"/g,'""')}"`, `"${(m.mood||'').replace(/"/g,'""')}"`, `"${(m.note||'').replace(/"/g,'""')}"`, `"${m.time}"`].join(','))
  ].join('\n');

  downloadFile('st_users.csv', userCSV);
  downloadFile('st_moods.csv', moodCSV);
}

/* download helper */
function downloadFile(filename, content){
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/* ===========================
   Init: render home
   =========================== */
renderHome();
</script>

</body>
</html>
