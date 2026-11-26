const $ = s => document.querySelector(s);
let db = null, auth = null, storage = null, currentUser = null, currentAdmin = null;
const cfg = window.FIREBASE_CONFIG || {};
const configured = !!(cfg.apiKey && !cfg.apiKey.startsWith('PASTE_') && cfg.projectId && !cfg.projectId.startsWith('PASTE_'));

document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.panel').forEach(x => x.classList.toggle('active', x.id === b.dataset.tab));
}));
function msg(el, t, cls = '') { if (el) { el.textContent = ''; const p = document.createElement('p'); p.className = cls; p.textContent = t; el.appendChild(p); } }
function escapeHtml(s = '') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function setBusy(form, busy) { const b = form.querySelector('button[type="submit"],button:not([type])'); if (b) { b.disabled = busy; b.dataset.oldText ||= b.textContent; b.textContent = busy ? 'कृपया प्रतीक्षा करें…' : b.dataset.oldText; } }
if (configured) {
  try {
    firebase.initializeApp(cfg); auth = firebase.auth(); db = firebase.firestore();
    if (firebase.storage) storage = firebase.storage();
    auth.onAuthStateChanged(async u => { currentUser = u; if (u) await loadAdmin(); else { $('#adminArea').hidden = true; $('#loginForm').hidden = false; } });
    $('#notice').textContent = 'Firebase कॉन्फ़िगरेशन मिला। ऑनलाइन सुविधाएँ उपलब्ध हैं।';
  } catch (e) { $('#notice').textContent = 'Firebase शुरू नहीं हो पाया: ' + e.message; }
}

// सदस्य फोटो का छोटा, JPEG रूप बनाएं ताकि मोबाइल से अपलोड आसान हो।
async function compressPhoto(file) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('कृपया JPG या PNG फोटो चुनें।');
  if (file.size > 8 * 1024 * 1024) throw new Error('फोटो 8 MB से छोटी चुनें।');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url; });
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(resolve => c.toBlob(resolve, 'image/jpeg', .78));
  } finally { URL.revokeObjectURL(url); }
}
const photoInput = $('#photo');
if (photoInput) photoInput.addEventListener('change', () => {
  const file = photoInput.files[0]; const preview = $('#photoPreview');
  if (preview) { preview.innerHTML = ''; if (file) { const img = document.createElement('img'); img.alt = 'फोटो पूर्वावलोकन'; img.src = URL.createObjectURL(file); preview.appendChild(img); } }
});

$('#memberForm').addEventListener('submit', async e => {
  e.preventDefault(); const form = e.target; const out = $('#registerMsg');
  if (!db) { msg(out, 'अभी Firebase Config जोड़ना बाकी है। आवेदन ऑनलाइन जमा नहीं हुआ।', 'error'); return; }
  setBusy(form, true);
  try {
    const d = Object.fromEntries(new FormData(form));
    d.name = (d.name || '').trim(); d.phone = (d.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(d.phone)) throw new Error('सही 10 अंकों का मोबाइल नंबर भरें।');
    const file = photoInput?.files?.[0];
    if (file) {
      if (!storage) throw new Error('फोटो अपलोड के लिए Firebase Storage चालू करना बाकी है।');
      const blob = await compressPhoto(file); const path = 'application-photos/' + Date.now() + '-' + d.phone + '.jpg';
      const ref = storage.ref(path); await ref.put(blob, {contentType:'image/jpeg'}); d.photoPath = path;
    }
    delete d.photo;
    d.status = 'pending'; d.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('applications').add(d);
    form.reset(); if ($('#photoPreview')) $('#photoPreview').innerHTML = '';
    msg(out, 'आपका आवेदन सफलतापूर्वक जमा हो गया है। एडमिन की जाँच और मंजूरी के बाद सदस्यता सक्रिय होगी।', 'success');
  } catch (err) { msg(out, 'आवेदन जमा नहीं हुआ: ' + (err.message || 'कृपया पुनः प्रयास करें।'), 'error'); }
  finally { setBusy(form, false); }
});

async function verifyMember(id) {
  const out = $('#verifyResult');
  if (!db) return msg(out, 'ऑनलाइन सत्यापन Firebase जोड़ने के बाद चालू होगा।', 'error');
  try {
    const snap = await db.collection('publicMembers').doc(id).get();
    if (!snap.exists || snap.data().status !== 'active') return msg(out, 'यह आईडी रिकॉर्ड में नहीं मिली या सक्रिय नहीं है।', 'error');
    const m = snap.data(); out.innerHTML = `<div class="member"><b class="success">✓ सक्रिय सदस्य</b><p>नाम: ${escapeHtml(m.name)}</p><p>आईडी: ${escapeHtml(m.memberId)}</p><p>जिला: ${escapeHtml(m.district || '—')}</p><p>पद: ${escapeHtml(m.position || 'सदस्य')}</p></div>`;
  } catch (err) { msg(out, 'जाँच नहीं हो सकी: ' + err.message, 'error'); }
}
$('#verifyForm').addEventListener('submit', async e => { e.preventDefault(); await verifyMember(new FormData(e.target).get('id').trim().toUpperCase()); });

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); if (!auth) return msg($('#adminMsg'), 'Firebase Config जोड़ना बाकी है।', 'error');
  const form = e.target; setBusy(form, true); const d = Object.fromEntries(new FormData(form));
  try { await auth.signInWithEmailAndPassword(d.email.trim(), d.password); msg($('#adminMsg'), 'लॉगिन सफल।', 'success'); }
  catch (err) { msg($('#adminMsg'), 'लॉगिन नहीं हुआ: ' + err.message, 'error'); }
  finally { setBusy(form, false); }
});
$('#logoutBtn').addEventListener('click', () => auth && auth.signOut());

async function loadAdmin() {
  if (!currentUser || !db) return;
  const email = (currentUser.email || '').toLowerCase();
  const mainEmail = (window.MAIN_ADMIN_EMAIL || '').toLowerCase();
  const presidentEmail = (window.PRESIDENT_ADMIN_EMAIL || '').toLowerCase();
  const isMain = email === mainEmail;
  const isPresident = !!presidentEmail && email === presidentEmail;
  if (!isMain && !isPresident) { await auth.signOut(); msg($('#adminMsg'), 'इस ईमेल को एडमिन अनुमति नहीं है।', 'error'); return; }
  currentAdmin = {isMain, isPresident}; $('#adminArea').hidden = false; $('#loginForm').hidden = true;
  $('#adminIdentity').textContent = (isMain ? 'मुख्य एडमिन' : 'प्रदेश अध्यक्ष एडमिन') + ' : ' + currentUser.email;
  await refreshLists(isMain);
}
async function refreshLists(canApprove) {
  try {
    const [p, a] = await Promise.all([
      db.collection('applications').where('status', '==', 'pending').get(),
      db.collection('members').where('status', '==', 'active').get()
    ]);
    $('#stats').innerHTML = `<div>लंबित आवेदन: <b>${p.size}</b></div><div>सक्रिय सदस्य: <b>${a.size}</b></div>`;
    $('#pendingList').innerHTML = ''; if (p.empty) $('#pendingList').textContent = 'कोई लंबित आवेदन नहीं।';
    p.forEach(doc => {
      const m = doc.data(), div = document.createElement('div'); div.className = 'member';
      const title = document.createElement('b'); title.textContent = m.name || 'नाम उपलब्ध नहीं'; div.appendChild(title);
      if (m.photoPath && storage) { const photo=document.createElement('img'); photo.alt='आवेदक फोटो'; photo.className='admin-photo'; storage.ref(m.photoPath).getDownloadURL().then(u=>photo.src=u).catch(()=>{}); div.appendChild(photo); }
      [['मोबाइल',m.phone],['जिला',m.district],['तहसील',m.tehsil],['ग्राम',m.village],['पद',m.position]].forEach(([k,v]) => { if(v) { const p=document.createElement('p'); p.textContent=k+': '+v; div.appendChild(p); } });
      if (canApprove) { const btn=document.createElement('button'); btn.className='primary'; btn.textContent='मंजूर करें और आईडी बनाएँ'; btn.addEventListener('click',()=>approve(doc.id,m)); div.appendChild(btn); }
      $('#pendingList').appendChild(div);
    });
    $('#activeList').innerHTML = ''; if (a.empty) $('#activeList').textContent = 'अभी सक्रिय सदस्य नहीं।';
    a.forEach(doc => {
      const m=doc.data(), div=document.createElement('div'); div.className='member';
      const b=document.createElement('b'); b.textContent=m.name || 'सदस्य'; div.appendChild(b);
      const p=document.createElement('p'); p.textContent='आईडी: '+(m.memberId||'—'); div.appendChild(p);
      const d=document.createElement('p'); d.textContent='जिला: '+(m.district||'—'); div.appendChild(d);
      const qr=document.createElement('div'); qr.className='qr'; div.appendChild(qr);
      const url=location.origin+location.pathname+'?verify='+encodeURIComponent(m.memberId||'');
      if(window.QRCode && m.memberId) new QRCode(qr,{text:url,width:112,height:112});
      const print=document.createElement('button'); print.className='secondary'; print.textContent='आईडी प्रिंट करें'; print.addEventListener('click',()=>printMember(m)); div.appendChild(print);
      $('#activeList').appendChild(div);
    });
  } catch (err) { msg($('#adminMsg'), 'सूची लोड नहीं हुई: '+err.message, 'error'); }
}
async function approve(id, m) {
  if (!currentAdmin?.isMain) return alert('केवल मुख्य एडमिन सदस्य मंजूर कर सकता है।');
  if (!confirm((m.name || 'इस आवेदन') + ' को मंजूर करके सदस्य आईडी बनानी है?')) return;
  const memberId='JASMA-'+Date.now().toString().slice(-8);
  try {
    const record={name:m.name||'',father:m.father||'',phone:m.phone||'',district:m.district||'',tehsil:m.tehsil||'',village:m.village||'',position:m.position||'सदस्य',photoPath:m.photoPath||'',memberId,status:'active',approvedAt:firebase.firestore.FieldValue.serverTimestamp()};
    await db.collection('members').doc(memberId).set(record);
    // सार्वजनिक सत्यापन में केवल न्यूनतम गैर-संवेदनशील विवरण उपलब्ध होगा।
    await db.collection('publicMembers').doc(memberId).set({name:record.name,district:record.district,position:record.position,memberId,status:'active'});
    await db.collection('applications').doc(id).update({status:'approved',memberId,approvedAt:firebase.firestore.FieldValue.serverTimestamp()});
    await refreshLists(true); alert('सदस्य मंजूर हुआ। आईडी: '+memberId);
  } catch(e) { alert('कार्रवाई असफल: '+e.message); }
}
async function printMember(m) {
  let photoHtml=''; if(m.photoPath && storage) { try { const u=await storage.ref(m.photoPath).getDownloadURL(); photoHtml=`<img src="${u}" style="width:92px;height:112px;object-fit:cover;border:1px solid #ddd;border-radius:8px">`; } catch(e) {} }
  const w=window.open('','_blank','width=520,height=650'); if(!w) return alert('आईडी प्रिंट करने के लिए ब्राउज़र में पॉप-अप अनुमति दें।');
  w.document.write(`<!doctype html><html lang="hi"><meta charset="utf-8"><title>डिजिटल सदस्य आईडी</title><style>body{font-family:Arial,sans-serif;padding:24px}.card{border:3px solid #e87516;border-radius:16px;padding:22px;max-width:390px;margin:auto;text-align:center}h2{color:#a84a00}p{margin:10px}</style><div class="card"><h2>श्री राष्ट्रीय जसमा सेना परिवार</h2><b>मध्य प्रदेश</b><hr><h3>सदस्य पहचान पत्र</h3>${photoHtml}<p>नाम: ${escapeHtml(m.name)}</p><p>आईडी: ${escapeHtml(m.memberId)}</p><p>जिला: ${escapeHtml(m.district||'—')}</p><p>पद: ${escapeHtml(m.position||'सदस्य')}</p><p>वैधता: पद पर रहने तक</p><p><b>जय मां जसमा</b></p></div><script>window.onload=()=>window.print()<\/script></html>`); w.document.close();
}
window.addEventListener('load', () => { const v=new URLSearchParams(location.search).get('verify'); if(v) { document.querySelector('[data-tab="verify"]').click(); $('#verifyForm input[name="id"]').value=v; verifyMember(v); } });
