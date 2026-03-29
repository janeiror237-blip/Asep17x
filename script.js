// --- DATABASE LOCAL STORAGE ---
let profilBase64 = localStorage.getItem('sep_profil') || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let lang = localStorage.getItem('sep_lang') || 'id';
let saldo = parseInt(localStorage.getItem('sep_saldo')) || 0;
let alarmTime = null;
let alarmInterval = null;
let countdownInterval = null;

// --- AUTO-SAVE SISTEM ---
function simpanData() {
    localStorage.setItem('sep_saldo', saldo);
    localStorage.setItem('sep_profil', profilBase64);
    localStorage.setItem('sep_lang', lang);
    localStorage.setItem('sep_chat_history', document.getElementById('box-chat').innerHTML);
    localStorage.setItem('sep_keuangan_history', document.getElementById('list-keuangan').innerHTML);
}

function muatData() {
    const chatH = localStorage.getItem('sep_chat_history');
    const keuH = localStorage.getItem('sep_keuangan_history');
    if(chatH) document.getElementById('box-chat').innerHTML = chatH;
    if(keuH) document.getElementById('list-keuangan').innerHTML = keuH;
    updateTampilanSaldo();
}

// --- SETUP AWAL ---
function previewAwal(input) {
    if (input.files && input.files[0]) {
        const r = new FileReader();
        r.onload = (e) => {
            profilBase64 = e.target.result;
            document.getElementById('preview-profil').src = profilBase64;
            localStorage.setItem('sep_profil', profilBase64);
        };
        r.readAsDataURL(input.files[0]);
    }
}

function mulaiLoading() {
    const nama = document.getElementById('inputnama').value;
    if (!nama) return alert("Isi nama dulu!");
    localStorage.setItem('sep_nama', nama);
    suaraKlik();
    document.getElementById('loading-screen').classList.add('flex');
    let p = 0;
    const inv = setInterval(() => {
        p += Math.floor(Math.random() * 12) + 1;
        if (p >= 100) {
            p = 100; clearInterval(inv);
            setTimeout(() => {
                document.getElementById('loading-screen').classList.remove('flex');
                document.getElementById('halaman-depan').classList.add('hidden');
                masukDashboard(nama);
            }, 500);
        }
        document.getElementById('progress-bar').style.width = p + '%';
        document.getElementById('percent').innerText = p + '%';
    }, 80);
}

function masukDashboard(nama) {
    document.getElementById('halaman-dashboard').classList.add('flex');
    document.getElementById('salam-user').innerText = nama;
    document.getElementById('nama-chat').innerText = nama;
    document.getElementById('profil-dash').src = profilBase64;
    document.getElementById('profil-chat').src = profilBase64;
    muatData();
    ambilCuaca();
}

// --- NAVIGASI ---
function bukaHalaman(h) {
    suaraKlik();
    document.getElementById('halaman-dashboard').classList.remove('flex');
    document.getElementById('halaman-dashboard').classList.add('hidden');
    if(h==='catatan') document.getElementById('halaman-catatan').classList.add('flex');
    if(h==='keuangan') document.getElementById('halaman-keuangan').classList.add('flex');
    if(h==='alarm') document.getElementById('halaman-alarm').classList.add('flex');
}

function kembaliDash() {
    suaraKlik();
    document.getElementById('halaman-catatan').classList.remove('flex');
    document.getElementById('halaman-keuangan').classList.remove('flex');
    document.getElementById('halaman-alarm').classList.remove('flex');
    document.getElementById('halaman-dashboard').classList.add('flex');
}

// --- CHAT SYSTEM ---
function toggleLampiran() {
    document.getElementById('menu-lampiran').classList.toggle('grid');
}

function pilihFile(id) {
    document.getElementById('menu-lampiran').classList.remove('grid');
    document.getElementById(id).click();
}

function kirimPesan() {
    const t = document.getElementById('input-chat').value;
    if (!t) return;
    buatBalon(t, 'teks');
    document.getElementById('input-chat').value = "";
    suaraKlik();
}

function buatBalon(konten, tipe) {
    const box = document.getElementById('box-chat');
    const b = document.createElement('div');
    b.className = 'bubble';
    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    if(tipe==='teks') b.innerHTML = konten;
    else if(tipe==='img') b.innerHTML = `<img src="${konten}" style="width:100%; border-radius:5px;">`;
    else if(tipe==='doc') b.innerHTML = `<div style="background:#fff; padding:10px; border-radius:5px; border:1px solid #ddd;"><i class="fas fa-file-alt"></i> ${konten}</div>`;
    else if(tipe==='loc') b.innerHTML = `<i class="fas fa-map-marker-alt"></i> <b>Lokasi:</b><br>${konten}`;

    b.innerHTML += `<small style="display:block; text-align:right; font-size:0.7em; color:#888; margin-top:5px;">${time}</small>`;
    box.appendChild(b);
    box.scrollTop = box.scrollHeight;
    simpanData();
}

function kirimMedia(input, tipe) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const r = new FileReader();
        r.onload = (e) => {
            if(tipe==='doc') buatBalon(file.name, 'doc');
            else buatBalon(e.target.result, 'img');
        };
        r.readAsDataURL(file);
    }
}

function ambilLokasi() {
    document.getElementById('menu-lampiran').classList.remove('grid');
    navigator.geolocation.getCurrentPosition(p => {
        buatBalon(`${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`, 'loc');
    }, () => alert("GPS Off!"));
}

// --- KEUANGAN ---
function tambahTransaksi() {
    const nom = parseInt(document.getElementById('nominal').value);
    const tipe = document.getElementById('tipe-transaksi').value;
    const ket = document.getElementById('ket-keuangan').value;
    if(!nom || !ket) return;

    if(tipe==='masuk') saldo += nom; else saldo -= nom;
    updateTampilanSaldo();
    
    const idItem = Date.now();
    const item = document.createElement('div');
    item.id = "item-" + idItem;
    item.style = `background:white; padding:10px; border-radius:10px; margin-bottom:5px; border-left:5px solid ${tipe==='masuk'?'green':'red'}; overflow:hidden;`;
    item.innerHTML = `<button class="btn-hapus" onclick="hapusTransaksi(${idItem}, ${nom}, '${tipe}')">Hapus</button><b>${ket}</b><br><span style="color:${tipe==='masuk'?'green':'red'}">${tipe==='masuk'?'+':'-'} Rp ${nom.toLocaleString('id-ID')}</span>`;
    document.getElementById('list-keuangan').prepend(item);
    document.getElementById('nominal').value = ""; document.getElementById('ket-keuangan').value = "";
    simpanData();
}

function hapusTransaksi(id, nom, tipe) {
    if(confirm("Hapus?")) {
        if(tipe==='masuk') saldo -= nom; else saldo += nom;
        updateTampilanSaldo();
        document.getElementById("item-"+id).remove();
        simpanData();
    }
}

function updateTampilanSaldo() {
    document.getElementById('total-saldo').innerText = "Rp " + saldo.toLocaleString('id-ID');
}

// --- ALARM COUNTDOWN ---
function setelAlarm() {
    alarmTime = document.getElementById('waktu-alarm').value;
    if(!alarmTime) return;
    document.getElementById('status-alarm').innerText = "Aktif: " + alarmTime;
    document.getElementById('box-countdown').classList.remove('hidden');
    if(alarmInterval) clearInterval(alarmInterval);
    if(countdownInterval) clearInterval(countdownInterval);
    alarmInterval = setInterval(() => {
        const skrg = new Date().toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit'});
        if(skrg === alarmTime) document.getElementById('ringtone').play(), document.getElementById('stop-alarm').classList.remove('hidden');
    }, 1000);
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if(!alarmTime) return;
    const skrg = new Date(); const target = new Date(); const [jam, menit] = alarmTime.split(':');
    target.setHours(jam, menit, 0); if (target <= skrg) target.setDate(target.getDate() + 1);
    const selisih = target - skrg;
    const h = Math.floor(selisih / 3600000); const m = Math.floor((selisih % 3600000) / 60000); const s = Math.floor((selisih % 60000) / 1000);
    document.getElementById('countdown-text').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function matikanAlarm() {
    document.getElementById('ringtone').pause(); document.getElementById('ringtone').currentTime = 0;
    document.getElementById('stop-alarm').classList.add('hidden');
    document.getElementById('status-alarm').innerText = "Alarm Mati";
    document.getElementById('box-countdown').classList.add('hidden');
    alarmTime = null; clearInterval(alarmInterval); clearInterval(countdownInterval);
}

// --- UTILITIES ---
function updateWaktu() {
    const d = new Date();
    document.getElementById('jam-digital').innerText = d.toLocaleTimeString('id-ID');
    document.getElementById('kalender').innerText = d.toLocaleDateString(lang==='id'?'id-ID':'en-US', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
}

function ambilCuaca() {
    navigator.geolocation.getCurrentPosition(p => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current_weather=true`)
        .then(res => res.json()).then(data => {
            document.getElementById('lokasi').innerText = "Aktif";
            document.getElementById('cuaca').innerText = data.current_weather.temperature + "°C";
        });
    });
}

function suaraKlik() {
    try { const c = new AudioContext(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(0.05, c.currentTime); o.start(); o.stop(c.currentTime + 0.1); } catch(e){}
}

function toggleModeMalam() { document.body.style.filter = document.body.style.filter === 'invert(1)' ? 'none' : 'invert(1)'; }

setInterval(updateWaktu, 1000);
updateWaktu();

// AUTO-LOGIN JIKA SUDAH ADA DATA
window.onload = () => {
    const savedName = localStorage.getItem('sep_nama');
    if(savedName) {
        document.getElementById('halaman-depan').classList.add('hidden');
        masukDashboard(savedName);
    }
};
