<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Student Mood & Behavior Tracker — GitHub Pages</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    :root{--bg:#f7fbff;--card:#ffffff;--muted:#6b7280}
    body{font-family:'Sarabun',sans-serif;background:linear-gradient(135deg,#f4eaff 0%,#d3ecfd 100%);margin:0;color:#0f172a}
    .wrap{max-width:920px;margin:48px auto;padding:28px;background:var(--card);border-radius:12px;box-shadow:0 8px 30px rgba(15,23,42,0.08)}
    header{display:flex;gap:16px;align-items:center}
    h1{margin:0;font-size:20px}
    p.lead{margin:10px 0 18px;color:var(--muted)}
    pre.cmd{background:#0b1220;color:#e6eef8;padding:12px;border-radius:8px;overflow:auto}
    .grid{display:grid;grid-template-columns:1fr 280px;gap:18px}
    .card{padding:14px;border-radius:10px;background:#fbfdff;border:1px solid rgba(15,23,42,0.03)}
    a.btn{display:inline-block;padding:10px 12px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none}
    .note{font-size:13px;color:#334155}
    footer{margin-top:18px;font-size:13px;color:var(--muted)}
    code,kbd{background:#eef2ff;padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
  <main class="wrap">
    <header>
      <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2v6'></path><path d='M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8'></path><path d='M8 10h8'></path></svg>" alt="logo" width="64" height="64">
      <div>
        <h1>Student Mood &amp; Behavior Tracker — GitHub Pages helper</h1>
        <p class="lead">ไฟล์โปรเจกต์ที่คุณอัปโหลดเป็นแอป React + TypeScript (Vite). เบื้องต้นต้อง <strong>build</strong> ก่อนจึงจะใช้งานผ่าน GitHub Pages ได้ — ด้านล่างมีไฟล์ <code>index.html</code> ต้นแบบสำหรับวางเป็นหน้า landing หรือใช้เป็น fallback เมื่อยังไม่ได้ build</p>
      </div>
    </header>

    <section class="grid" style="margin-top:18px">
      <div>
        <div class="card">
          <h3>ไฟล์ index.html (landing / fallback)</h3>
          <p class="note">วางไฟล์นี้ที่ root ของ repository หรือใน branch/pages เพื่อให้หน้าแสดงบน GitHub Pages หากคุณยังไม่ได้ run <code>npm run build</code>.</p>
          <pre class="cmd">&lt;!-- ถ้าใน repo มีไฟล์ build เช่น /docs/index.html หรือ /dist/index.html ให้ใช้ไฟล์นั้นแทน --&gt;
&lt;a href="./README.md" class="btn">Open README</a></pre>

          <h4 style="margin-top:12px">ถ้าต้องการลงบน GitHub Pages แบบพร้อมใช้งาน (แนะนำ)</h4>
          <ol>
            <li>บนเครื่องของคุณ ให้รัน: <pre class="cmd">npm install
npm run build</pre></li>
            <li>คัดลอกผลลัพธ์จาก <code>dist/</code> (หรือแก้ค่า output เป็น <code>docs/</code>) ไปไว้ใน branch <code>gh-pages</code> หรือโฟลเดอร์ <code>docs/</code> ของ main branch</li>
            <li>เปิด GitHub repo &gt; Settings &gt; Pages เลือก branch/โฟลเดอร์ แล้วบันทึก</li>
          </ol>

          <p class="note">ถ้าคุณต้องการ ฉันสามารถสร้างไฟล์ <code>index.html</code> แบบสำเร็จรูป (ฝังสคริปต์ bundle) ให้ — แต่จะต้องมีไฟล์ build (.js/.css) ที่สร้างจากโปรเจกต์ของคุณ</p>
        </div>

        <div class="card" style="margin-top:12px">
          <h3>Scripts ที่แนะนำ</h3>
          <pre class="cmd"># build และวางใน docs/ (ตัวอย่าง)
npm run build
# ถ้า Vite สร้างเป็น dist/ ให้คัดลอกไปยัง docs/ หรือใช้ action ต่อไปนี้</pre>
          <p class="note">หากต้องการ ฉันช่วยสร้าง GitHub Actions workflow เพื่อ build และ deploy อัตโนมัติได้</p>
        </div>
      </div>

      <aside>
        <div class="card">
          <h4>ตรวจพบในไฟล์ ZIP</h4>
          <ul>
            <li>React + TypeScript + Vite project</li>
            <li>มีไฟล์ <code>index.tsx</code>, <code>index.html</code>, <code>package.json</code></li>
            <li>ไฟล์ README บอกการตั้งค่า Gemini / Google AI keys</li>
          </ul>
        </div>

        <div class="card" style="margin-top:12px">
          <h4>ตัวเลือกต่อไป</h4>
          <ol>
            <li>ฉันจะสร้าง <code>index.html</code> landing ที่เรียบง่ายให้ (ทำแล้ว) — ตรงนี้เป็นไฟล์ที่คุณสามารถคัดลอกไปวางใน repo</li>
            <li>ฉันสามารถสร้าง GitHub Actions workflow ที่จะ <code>npm run build</code> และ deploy ไปที่ <code>gh-pages</code> branch อัตโนมัติ</li>
            <li>หรือฉันจะแปลงโปรเจกต์เป็น static single-file (embed JS) — แต่ต้องให้ไฟล์ build (.js/.css) มาให้</li>
          </ol>
        </div>
      </aside>
    </section>

    <footer>
      <strong>ไฟล์ index.html ที่ให้ไว้เป็น landing/fallback เท่านั้น</strong><br>
      หากต้องการไฟล์ HTML ที่รันแอปได้ตรง ๆ กรุณารัน <code>npm run build</code> แล้วอัพโหลดโฟลเดอร์ build มาให้ฉัน ฉันจะสร้างไฟล์ HTML พร้อม bundle ให้เรียบร้อย
    </footer>
  </main>
</body>
</html>
