# 🎴 Kaarten TCG - Gacha Card Simulator

**Kaarten TCG** adalah game simulasi *Trading Card Game* (TCG) berbasis web yang dibangun menggunakan **Phaser 3**. Game ini berfokus pada pengalaman membuka *booster pack*, mengoleksi kartu langka, manajemen ekonomi, dan penyelesaian misi.

## ✨ Fitur Utama

### 📦 Sistem Gacha & Shop
* **Realistic Probability:** Sistem gacha dengan tingkatan rarity (*Common* hingga *Secret Rare*) dan peluang *foil* yang realistis.
* **Multiple Packs:** Tersedia berbagai jenis *booster pack* (contoh: *Legend of Blue Eyes*, *Invasion of Chaos*) dengan harga berbeda.
* **Visual Effect:** Animasi *shake*, *flash*, dan *reveal* saat membuka pack.

### 🎒 Inventory Canggih
* **Color Coding Rarity:** Kartu memiliki efek cahaya (*glow*) dan warna teks yang berbeda sesuai tingkat kelangkaannya (⚪ Common, 🔵 Rare, 🟣 Super Rare, 🟡 Ultra Rare, 🔴 Secret Rare).
* **Sorting Otomatis:** Kartu otomatis diurutkan berdasarkan Rarity tertinggi, kemudian Abjad.
* **Zoom & Sell:** Fitur zoom untuk melihat detail kartu dan opsi jual kartu (satuan atau *Sell All*) untuk mendapatkan uang.

### 🎯 Misi & Achievement
* **Daily Random Missions:** Sistem misi harian yang direset setiap hari. Pemain mendapatkan **3 misi acak** setiap harinya untuk menjaga permainan tetap segar.
* **Achievement System:** Pencapaian jangka panjang (misal: "Kumpulkan 100 Kartu", "Buka 50 Pack") dengan tombol **Claim Reward** interaktif.

### 👤 Profil & Progresi
* **Leveling System:** Level pemain naik berdasarkan jumlah kartu unik yang dikoleksi.
* **Player Titles:** Gelar khusus (misal: *King of Cards*) yang berubah seiring kenaikan level.
* **Save Data:** Progress permainan disimpan secara lokal menggunakan `LocalStorage`.

## 🛠️ Teknologi yang Digunakan

* **Game Engine:** [Phaser 3](https://phaser.io/)
* **Language:** JavaScript (ES6+)
* **Bundler:** Vite / Webpack (Tergantung setup awal kamu)
* **Storage:** Browser LocalStorage

## 📂 Struktur Project

```text
src/
├── assets/          # Gambar kartu, background, audio, dan data CSV
├── data/            # Data statis (MissionPool.js, Achievements.js)
├── objects/         # Class objek game (Card.js)
├── scenes/          # Scene Phaser (MainMenu, Gacha, Inventory, Profile, dll)
├── systems/         # Logika sistem (GachaSystem.js)
├── utils/           # Utilitas & State Management (PlayerData.js)
└── main.js          # Entry point game config

```

## 🚀 Cara Menjalankan (Local Development)

Pastikan kamu sudah menginstall [Node.js](https://nodejs.org/).

1. **Clone repository ini:**
```bash
git clone [https://github.com/username-kamu/kaarten-tcg.git](https://github.com/username-kamu/kaarten-tcg.git)
cd kaarten-tcg

```


2. **Install dependencies:**
```bash
npm install

```


3. **Jalankan server lokal:**
```bash
npm run dev
# atau
npm start

```


4. Buka browser dan akses alamat yang muncul (biasanya `http://localhost:8000` atau `http://localhost:5173`).

## 🎮 Kontrol

* **Mouse / Touch:** Seluruh interaksi menggunakan klik (Tap).
* **Scroll:** Gunakan scroll wheel untuk menavigasi halaman Inventory, Misi, dan Achievement.