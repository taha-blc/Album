// ==========================================
// 1) Supabase Yapılandırması 🚀
// ==========================================
const SUPABASE_URL = 'https://jvmpcbrfapyjekzmllqc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bXBjYnJmYXB5amVrem1sbHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MzE3MTYsImV4cCI6MjA4NzIwNzcxNn0.Yu0zFLhjpX-NZkUTCvHJY6spuirChD2eRXypBEm_Wb0';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



// ==========================================
// 2) Sabitler ve Veri Sepeti
// ==========================================
const HER_NAME = "Lamra";
const YOUR_NAME = "Korkmaz";
const ANNIVERSARY = "15.10.2026";

let MEMORIES = [
    { title: "İlk Sosyal Buluşmamız", text: "İlk defa sosyal bi ortamda bulunmuştuk yüzüme bakmıyordun 😉", img: "image/1.jpeg" },
    { title: "En Çok Sırıttığımız Fotik", text: "Yüzümüzdeki kocaman tebessüme bak namnoş 😂", img: "image/2.jpeg" },
    { title: "İlk Photoshoplu Fotiğimiz", text: "Çok yakışmıyor muyuzzzz yavvvv 🤍", img: "image/3.jpeg" }
];

let HANGMAN_QUESTIONS = [
    { word: "SU YEŞİLİ", hint: "🎨 Namnanın En Sevdiği Renk" },
    { word: "BEYAZLARI", hint: "Takonun namnada en sevdiği detay" },
    { word: "TİLKİ", hint: "Takoya benzeyen animasyon karakteri" },
    { word: "DAVŞAN", hint: "Namnanın benzeyen animasyon karakteri" },
    { word: "ORMAN MEYVESİ", hint: "Lamranın en sevdiği meyve" }
];

let UPLOADED_PHOTOS = [];
let editingPhotoId = null;

// ==========================================
// 📖 Günlük Verileri - Supabase
// ==========================================
let DIARY = [];

async function loadDiary() {
    const { data, error } = await supabaseClient
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Günlükler çekilemedi:", error);
        return;
    }

    DIARY = data.map(d => {
        const dt = new Date(d.created_at);

        return {
            id: d.id,
            date: dt.toLocaleString("tr-TR", {
                timeZone: "Europe/Istanbul",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            text: d.text
        };
    });
}

// ==========================================
// 3) Supabase Veri Çekme Logic'i
// ==========================================
async function syncData() {
    try {
        const { data: photos, error: photoErr } = await supabaseClient
            .from('uploaded_photos')
            .select('*')
            .order('created_at', { ascending: false });

        if (!photoErr && photos) {
            UPLOADED_PHOTOS = photos.map(p => ({
                id: p.id,
                src: p.url,
                name: p.title || "İsimsiz Foto",
                desc: p.description || "Bulutta Güvende ☁️",
                storagePath: p.storage_path
            }));
        }

        const { data: questions, error: qErr } = await supabaseClient
            .from('hangman_questions')
            .select('*');

        if (!qErr && questions && questions.length > 0) {
            HANGMAN_QUESTIONS = questions.map(q => ({
                word: q.word,
                hint: q.hint
            }));
        }

        const { data: memories, error: mErr } = await supabaseClient
            .from('memories')
            .select('*');

        if (!mErr && memories && memories.length > 0) {
            MEMORIES = memories.map(m => ({
                title: m.title,
                text: m.text,
                img: m.img
            }));
        }

    } catch (e) {
        console.error("Senkronizasyon hatası:", e);
    }
}

// ==========================================
// 4) Saat / Tarih
// ==========================================
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");

function pad(n) {
    return String(n).padStart(2, "0");
}

function tick() {
    const d = new Date();

    if (clockEl) {
        clockEl.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    if (dateEl) {
        dateEl.textContent = d.toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

tick();
setInterval(tick, 1000);

// ==========================================
// 5) Typing Efekti
// ==========================================
const typingEl = document.getElementById("typing");

const TYPING_LINES = [
    `Merhaba Kadınım… 💖`,
    `Bir Tilkide Bize Bir Armağan 🦊`,
    "Sana Küçük Bir Sürprüzzzz Yaptım Lamram.",
    "Arka Bahçemdeki En Güzel Çiçeğimsin 🌷",
    "Ay Tenli Kadınım 🌙",
    "Kanatlarını Göremiyorsun Ama Ben Görüyorum 🪽",
    "Kendin Ol Zaten Herkes Sana Hayran Kalacak Uğurböceğim 🐞"
];

let li = 0;
let ci = 0;
let deleting = false;

function typeLoop() {
    if (!typingEl) return;

    const current = TYPING_LINES[li];

    if (!deleting) {
        ci++;
        typingEl.textContent = current.slice(0, ci);

        if (ci === current.length) {
            deleting = true;
            setTimeout(typeLoop, 950);
            return;
        }
    } else {
        ci--;
        typingEl.textContent = current.slice(0, ci);

        if (ci === 0) {
            deleting = false;
            li = (li + 1) % TYPING_LINES.length;
        }
    }

    setTimeout(typeLoop, deleting ? 30 : 45);
}

typeLoop();

// ==========================================
// 6) Mood Metni
// ==========================================
const moodEl = document.getElementById("moodText");

const moodOptions = [
    `Bugün seni daha çok sevmek için özel bir gün değil… ben her gün aynıyım 😌💖`,
    `Bazen tek bir mesajın bile günümü güzelleştiriyor.`,
    `Gülüşün: en sevdiğim şarkı gibi.`,
    `Yanımda olmasan bile, aklımda hep sen varsın Kadınım`
];

if (moodEl) {
    moodEl.textContent =
        moodOptions[Math.floor(Math.random() * moodOptions.length)] +
        ` (Tarih: ${new Date().toLocaleDateString("tr-TR")})`;
}

// ==========================================
// 7) Modal Helpers
// ==========================================
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

if (modalClose) {
    modalClose.addEventListener("click", () => modal.classList.remove("show"));
}

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
});

function openModal(title, html) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = html;
    if (modal) modal.classList.add("show");
}

// ==========================================
// 8) Mektup
// ==========================================
document.getElementById("btnLetter").addEventListener("click", () => {
    openModal("💌 Mektup", `
        <p class="muted">
            Lamram,<br><br>
            Bazen kelimeler yetersiz kalıyor ama yine de kalbim denemek istiyor, Bebeğim...<br><br>
            Seninle konuşmak ayrı güzel, gülmek ayrı, hatta yan yana susmak bile başka bir huzur.<br>
            Utandığında dudaklarının aldığı o masum şekil var ya… işte orada dünya bir anlığına duruyor benim için.<br><br>
            Bazen gözlerini kaçırıyorsun — camdan bakarken kaçırdığına eminim ama ispatlayamam — ama ben her bakışında yeniden yakalanıyorum sana.<br><br>
            Sana baktığımda içimden hep aynı cümle geçiyor: “Gerçekten böyle güzel bir kadına sahip olabilir miyim?”<br>
            Ay tenin, gecenin karanlığında en parlak ışığım oluyor.<br>
            Kokun… dünyadaki en huzurlu yer gibi.<br><br>
            İyi ki varsın.<br>
            İyi ki kalbim seni seçmiş.<br>
            İyi ki benimsin. 💖<br><br>
            <b>— Takoşşş</b>
        </p>
    `);
});

// ==========================================
// 📖 8.5) Günlük Sistemi - Supabase
// ==========================================
function buildDiaryModal() {
    const entries = DIARY.map(d => {
        const shortText = d.text.length > 95 ? d.text.slice(0, 95) + "..." : d.text;

        return `
            <div class="diary-card" onclick="openDiaryDetail('${d.id}')" style="
                margin-bottom:14px;
                padding:14px;
                border-radius:16px;
                background:rgba(255,255,255,0.055);
                border:1px solid rgba(255,255,255,0.09);
                cursor:pointer;
                transition:0.2s ease;
            ">
                <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
                    <b style="color:#ff4d8d;">${d.date}</b>

                    <button onclick="event.stopPropagation(); deleteDiary('${d.id}')" style="
                        padding:6px 9px;
                        border-radius:10px;
                        font-size:12px;
                    ">
                        🗑️
                    </button>
                </div>

                <p style="
                    margin:8px 0 6px;
                    color:var(--muted);
                    line-height:1.65;
                ">
                    ${shortText}
                </p>

                <span style="
                    display:inline-block;
                    margin-top:4px;
                    font-size:12px;
                    color:#ff4d8d;
                    font-weight:600;
                ">
                    Detaylı oku 💖
                </span>
            </div>
        `;
    }).join("");

    openModal("📖 Bizim Günlüğümüz", `
        <div style="
            padding:14px;
            border-radius:18px;
            background:rgba(255,77,141,0.06);
            border:1px solid rgba(255,77,141,0.22);
            margin-bottom:16px;
        ">
            <b style="display:block; margin-bottom:8px; color:#fff;">Bugünden bir not bırak 💭</b>

            <textarea 
                id="diaryInput"
                placeholder="Bugün Lamra için ne hissettin... 💖"
                style="
                    width:100%;
                    min-height:90px;
                    resize:vertical;
                    border-radius:14px;
                    border:1px solid rgba(255,255,255,0.14);
                    background:rgba(255,255,255,0.06);
                    color:#fff;
                    padding:12px;
                    outline:none;
                    font-family:Inter, sans-serif;
                    margin-bottom:10px;
                "
            ></textarea>

            <button class="primary" onclick="addDiary()">Kaydet 💾</button>
        </div>

        <div>
            ${entries || `<p class="muted">O ellerin benim için bu ekrana tıklaması kadar güzel bi şey yok Lamra 💖</p>`}
        </div>
    `);
}

function openDiaryDetail(id) {
    const entry = DIARY.find(d => d.id == id);
    if (!entry) return;

    openModal("📖 Günlük Detayı", `
        <div style="
            padding:18px;
            border-radius:18px;
            background:rgba(255,77,141,0.06);
            border:1px solid rgba(255,77,141,0.22);
        ">
            <b style="
                color:#ff4d8d;
                display:block;
                margin-bottom:12px;
                font-size:14px;
            ">
                ${entry.date}
            </b>

            <p style="
                line-height:1.85;
                color:#fff;
                font-size:15px;
                white-space:pre-line;
                margin:0;
            ">
                ${entry.text}
            </p>

            <button onclick="buildDiaryModal()" style="margin-top:18px;">
                ← Günlüğe Dön
            </button>
        </div>
    `);
}
async function addDiary() {
    const input = document.getElementById("diaryInput");
    if (!input) return;

    const val = input.value.trim();

    if (!val) {
        Swal.fire({
            title: "Boş bırakma Takoş 😄",
            text: "Lamra için minik de olsa bir şey yaz.",
            icon: "info",
            background: "linear-gradient(160deg, #0f172a, #1a0a2e)",
            color: "#e5e7eb",
            confirmButtonColor: "#ff4d8d"
        });
        return;
    }

    const { error } = await supabaseClient
        .from("diary_entries")
        .insert([{ text: val }]);

    if (error) {
        console.error("Günlük kaydedilemedi:", error);
        Swal.fire({
            title: "Kaydedilemedi 😢",
            text: "Supabase tarafında bir hata oluştu.",
            icon: "error",
            background: "linear-gradient(160deg, #0f172a, #1a0a2e)",
            color: "#e5e7eb",
            confirmButtonColor: "#ff4d8d"
        });
        return;
    }

    await loadDiary();

    Swal.fire({
        title: "Kaydettim Ömrüm 💖",
        text: "Notunuz Bilici Holding (Kocan) Tarafından Kaydedilmiştir Asayiş Berkemal 🫡",
        icon: "success",
        background: "linear-gradient(160deg, #0f172a, #1a0a2e)",
        color: "#e5e7eb",
        confirmButtonColor: "#ff4d8d"
    });

    buildDiaryModal();
}

async function deleteDiary(id) {
    const result = await Swal.fire({
        title: "Siliyorum Keçi?",
        text: "Notunuz Bilici Holding (Kocan) Tarafından Silinecektir Emin Misiniz ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Evet Sil Kocam",
        cancelButtonText: "Hayır Silme Kocam",
        background: "linear-gradient(160deg, #0f172a, #1a0a2e)",
        color: "#e5e7eb",
        confirmButtonColor: "#ff4d8d",
        cancelButtonColor: "rgba(255,255,255,0.12)"
    });

    if (result.isConfirmed) {
        await supabaseClient
            .from("diary_entries")
            .delete()
            .eq("id", id);

        await loadDiary();
        buildDiaryModal();
    }
}

const diaryBtn = document.getElementById("btnDiary");

if (diaryBtn) {
    diaryBtn.addEventListener("click", async () => {
        await loadDiary();
        buildDiaryModal();
    });
}

// ==========================================
// 9) Anılar & Supabase Galeri
// ==========================================
let lbIndex = 0;

function getAllMemories() {
    const uploaded = UPLOADED_PHOTOS.map(p => ({
        title: p.name,
        text: p.desc,
        img: p.src
    }));

    return [...MEMORIES, ...uploaded];
}

async function handleFiles(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (arr.length === 0) return;

    const uploadLabel = document.querySelector(".upload-label");
    const originalContent = uploadLabel.innerHTML;

    uploadLabel.innerHTML = "<b>Yükleniyor...</b><br><span>Anılar buluta uçuyor, ay tenlim bekle ☁️✨</span>";
    document.body.style.cursor = "wait";

    for (const file of arr) {
        const cleanName = file.name
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '');

        const fileName = `${Date.now()}-${cleanName}`;

        const { error } = await supabaseClient.storage
            .from('fotograflar')
            .upload(fileName, file, { upsert: true });

        if (error) continue;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('fotograflar')
            .getPublicUrl(fileName);

        await supabaseClient.from('uploaded_photos').insert([{
            url: publicUrl,
            title: file.name.replace(/\.[^.]+$/, ""),
            description: "Bulutta Güvende ☁️",
            storage_path: fileName
        }]);
    }

    document.body.style.cursor = "default";
    uploadLabel.innerHTML = originalContent;

    await syncData();
    buildMemoriesModal();
}

async function deletePhoto(dbId, storagePath) {
    const result = await Swal.fire({
        title: 'Emin misin Ay Tenlim? 🌙',
        text: "Bu anıyı sonsuza dek buluttan siliyoruz, geri getiremeyiz...(Şaka şaka tekrar yükleyebilirsin :* )",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d8d',
        cancelButtonColor: 'rgba(255,255,255,0.1)',
        confirmButtonText: 'Evet, Sil Gitsin',
        cancelButtonText: 'Hayır, Kalsın',
        background: 'linear-gradient(160deg, #0f172a, #1a0a2e)',
        color: '#e5e7eb',
        backdrop: `rgba(0,0,123,0.4)`
    });

    if (result.isConfirmed) {
        const { error: dbErr } = await supabaseClient
            .from('uploaded_photos')
            .delete()
            .eq('id', dbId);

        if (!dbErr && storagePath) {
            await supabaseClient.storage
                .from('fotograflar')
                .remove([storagePath]);
        }

        await syncData();
        buildMemoriesModal();

        Swal.fire({
            title: 'Silindi!',
            text: 'Sildim Kuşum',
            icon: 'success',
            background: 'linear-gradient(160deg, #0f172a, #1a0a2e)',
            color: '#e5e7eb',
            confirmButtonColor: '#ff4d8d'
        });
    }
}

function openEditModal(idx) {
    const photo = UPLOADED_PHOTOS[idx];
    if (!photo) return;

    editingPhotoId = photo.id;

    document.getElementById("editPhotoPreview").src = photo.src;
    document.getElementById("editPhotoName").value = photo.name;
    document.getElementById("editPhotoDesc").value = photo.desc;
    document.getElementById("editPhotoModal").classList.add("show");
}

document.getElementById("editSaveBtn").onclick = async () => {
    const newName = document.getElementById("editPhotoName").value;
    const newDesc = document.getElementById("editPhotoDesc").value;

    const { error } = await supabaseClient
        .from('uploaded_photos')
        .update({
            title: newName,
            description: newDesc
        })
        .eq('id', editingPhotoId);

    if (!error) {
        document.getElementById("editPhotoModal").classList.remove("show");
        await syncData();
        buildMemoriesModal();
    }
};

document.getElementById("editCancelBtn").onclick = () => {
    document.getElementById("editPhotoModal").classList.remove("show");
};

function buildMemoriesModal() {
    const staticCards = MEMORIES.map((m, idx) => `
        <div class="gal-item" data-idx="${idx}">
            <img src="${m.img}" loading="lazy">
            <div class="gal-overlay">
                <b>${m.title}</b>
                <span>${m.text}</span>
            </div>
        </div>
    `).join("");

    const uploadedCards = UPLOADED_PHOTOS.map((p, idx) => `
        <div class="gal-item uploadedPhoto" data-idx="${MEMORIES.length + idx}">
            <img src="${p.src}" loading="lazy">

            <div class="gal-action-btns">
                <button class="gal-edit-btn" onclick="event.stopPropagation(); openEditModal(${idx})">✏️</button>
                <button class="gal-delete-btn" onclick="event.stopPropagation(); deletePhoto(${p.id}, '${p.storagePath}')">🗑️</button>
            </div>

            <div class="gal-overlay">
                <b>${p.name}</b>
                <span>${p.desc}</span>
            </div>
        </div>
    `).join("");

    openModal("📸 Minik Anılar", `
        <div class="upload-zone" id="uploadZone">
            <input type="file" id="photoFileInput" accept="image/*" multiple>
            <span class="upload-icon">📤</span>
            <div class="upload-label">
                <b>Fotoğraf Yükle</b><br>
                <span>Supabase Bulutuna Kaydet ☁️</span>
            </div>
        </div>

        <div class="gallery">${staticCards}${uploadedCards}</div>
    `);

    document.getElementById("photoFileInput").onchange = (e) => handleFiles(e.target.files);

    document.querySelectorAll(".gal-item").forEach(el => {
        el.onclick = () => openLightbox(parseInt(el.dataset.idx));
    });
}

document.getElementById("btnMemories").addEventListener("click", buildMemoriesModal);

// ==========================================
// 10) Lightbox
// ==========================================
function openLightbox(idx) {
    lbIndex = idx;
    updateLightbox();
    document.getElementById("lightbox").classList.add("show");
}

function updateLightbox() {
    const all = getAllMemories();

    if (lbIndex < 0) lbIndex = all.length - 1;
    if (lbIndex >= all.length) lbIndex = 0;

    const m = all[lbIndex];

    if (m) {
        document.getElementById("lbImg").src = m.img || "";
        document.getElementById("lbTitle").textContent = m.title;
        document.getElementById("lbText").textContent = m.text;
    }
}

document.getElementById("lbClose").onclick = () => {
    document.getElementById("lightbox").classList.remove("show");
};

document.getElementById("lbPrev").onclick = () => {
    lbIndex--;
    updateLightbox();
};

document.getElementById("lbNext").onclick = () => {
    lbIndex++;
    updateLightbox();
};

// ==========================================
// 11) Adam Asmaca
// ==========================================
const MAX_WRONG = 6;
let hmWord = "";
let hmHint = "";
let hmGuessed = new Set();
let hmWrong = 0;
let hmGameOver = false;

const ALPHABET = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

function hmDrawSVG(wrong) {
    const parts = [
        `<circle cx="100" cy="45" r="14" stroke="#ff4d8d" stroke-width="2.5" fill="none"/>`,
        `<line x1="100" y1="59" x2="100" y2="105" stroke="#ff4d8d" stroke-width="2.5"/>`,
        `<line x1="100" y1="72" x2="78" y2="90" stroke="#ff4d8d" stroke-width="2.5"/>`,
        `<line x1="100" y1="72" x2="122" y2="90" stroke="#ff4d8d" stroke-width="2.5"/>`,
        `<line x1="100" y1="105" x2="80" y2="128" stroke="#ff4d8d" stroke-width="2.5"/>`,
        `<line x1="100" y1="105" x2="120" y2="128" stroke="#ff4d8d" stroke-width="2.5"/>`
    ];

    const scaffold = `
        <line x1="30" y1="150" x2="140" y2="150" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/>
        <line x1="60" y1="150" x2="60" y2="10" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/>
        <line x1="60" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/>
        <line x1="100" y1="10" x2="100" y2="31" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/>
    `;

    return `
        <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            ${scaffold}
            ${parts.slice(0, wrong).join("")}
        </svg>
    `;
}

function hmRender() {
    document.getElementById("hmSvg").innerHTML = hmDrawSVG(hmWrong);

    document.getElementById("hmWord").innerHTML = hmWord.split("").map(ch => {
        if (ch === " ") return `<div style="width:20px;"></div>`;

        return `
            <div class="hm-letter${hmGuessed.has(ch) ? " revealed" : ""}">
                ${hmGuessed.has(ch) ? ch : ""}
            </div>
        `;
    }).join("");

    document.getElementById("hmLives").innerHTML = Array.from({ length: MAX_WRONG }, (_, i) => `
        <span class="hm-life${i >= (MAX_WRONG - hmWrong) ? " gone" : ""}">💖</span>
    `).join("");

    document.querySelectorAll(".key-btn").forEach(btn => {
        if (hmGuessed.has(btn.dataset.ch)) {
            btn.disabled = true;
            btn.classList.add(hmWord.includes(btn.dataset.ch) ? "correct" : "wrong");
        }
    });

    const allRevealed = hmWord
        .replace(/ /g, "")
        .split("")
        .every(ch => hmGuessed.has(ch));

    if (allRevealed) {
        document.getElementById("hmStatus").innerHTML =
            `<span style="color:#22c55e;">🎉 Kazandın! 🎊</span>`;
        launchConfetti();
        hmGameOver = true;
    } else if (hmWrong >= MAX_WRONG) {
        document.getElementById("hmStatus").innerHTML =
            `<span style="color:#ef4444;">💔 Kelime: ${hmWord}</span>`;
        hmGameOver = true;
    }
}

function startHangman() {
    const q = HANGMAN_QUESTIONS[Math.floor(Math.random() * HANGMAN_QUESTIONS.length)];

    hmWord = q.word.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();
    hmHint = q.hint;
    hmGuessed = new Set();
    hmWrong = 0;
    hmGameOver = false;

    openModal("🎮 Adam Asmaca", `
        <div class="hangman-wrap">
            <div class="hm-scene" id="hmSvg"></div>
            <div class="hm-hint">💡 ${hmHint}</div>
            <div class="hm-word" id="hmWord"></div>
            <div class="hm-lives" id="hmLives"></div>
            <div class="hm-status" id="hmStatus"></div>

            <div class="hm-keyboard">
                ${ALPHABET.map(ch => `<button class="key-btn" data-ch="${ch}">${ch}</button>`).join("")}
            </div>

            <button onclick="startHangman()" class="primary" style="margin-top:15px;">
                🔄 Yeni Kelime
            </button>
        </div>
    `);

    document.querySelectorAll(".key-btn").forEach(btn => {
        btn.onclick = () => {
            if (!hmGameOver && !hmGuessed.has(btn.dataset.ch)) {
                hmGuessed.add(btn.dataset.ch);

                if (!hmWord.includes(btn.dataset.ch)) {
                    hmWrong++;
                }

                hmRender();
            }
        };
    });

    hmRender();
}

document.getElementById("btnGame").onclick = startHangman;

// ==========================================
// 12) Efektler
// ==========================================
function launchConfetti() {
    const confetti = document.getElementById("confetti");

    confetti.innerHTML = "";
    confetti.classList.add("show");

    for (let i = 0; i < 130; i++) {
        const p = document.createElement("i");

        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (2 + Math.random() * 2) + "s";
        p.style.background = ["#ff4d8d", "#7c3aed", "#22c55e", "#38bdf8", "#f59e0b"][Math.floor(Math.random() * 5)];

        confetti.appendChild(p);
    }

    setTimeout(() => confetti.classList.remove("show"), 4000);
}

const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

let W;
let H;
let hearts;

function resize() {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;

    hearts = Array.from({ length: 55 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: (0.7 + Math.random() * 1.8) * devicePixelRatio,
        vy: (0.35 + Math.random() * 1.1) * devicePixelRatio,
        vx: (-0.25 + Math.random() * 0.5) * devicePixelRatio,
        a: 0.35 + Math.random() * 0.55
    }));
}

window.onresize = resize;

function loop() {
    ctx.clearRect(0, 0, W, H);

    hearts.forEach(h => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.scale(h.s, h.s);
        ctx.globalAlpha = h.a;
        ctx.fillStyle = "#ff4d8d";

        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.bezierCurveTo(-10, -4, -14, 10, 0, 16);
        ctx.bezierCurveTo(14, 10, 10, -4, 0, 6);
        ctx.fill();

        ctx.restore();

        h.y += h.vy;
        h.x += h.vx;

        if (h.y > H + 20) h.y = -20;
    });

    requestAnimationFrame(loop);
}

resize();
loop();

// ==========================================
// 13) Evet/Hayır & Init
// ==========================================
document.getElementById("btnYes").onclick = () => {
    const msg = document.getElementById("finalMsg");

    msg.style.display = "block";
    msg.innerHTML = "O zaman konfetiiiiiiler şana gelsinnnnn 💐✨";

    launchConfetti();
};

document.getElementById("btnNo").onmouseenter = function () {
    this.style.position = "absolute";
    this.style.left = Math.random() * 80 + "%";
    this.style.top = Math.random() * 80 + "%";
};

syncData().then(async () => {
    await loadDiary();
    console.log("Sistem hazır! 🚀");
});

// ==========================================
// 14) Fiziksel Klavye Desteği ⌨️
// ==========================================
window.addEventListener("keydown", (e) => {
    const isModalOpen = modal && modal.classList.contains("show");
    const isHangmanActive = document.querySelector(".hangman-wrap") !== null;

    if (isModalOpen && isHangmanActive && !hmGameOver) {
        const key = e.key.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase();

        if (ALPHABET.includes(key)) {
            if (!hmGuessed.has(key)) {
                hmGuessed.add(key);

                if (!hmWord.includes(key)) {
                    hmWrong++;
                }

                hmRender();
            }
        }
    }
});