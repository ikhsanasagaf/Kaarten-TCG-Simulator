import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // --- 1. SETUP UI LOADING BAR ---
    this.cameras.main.setBackgroundColor("#000000");

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Memuat Data...", {
        font: "20px monospace",
        fill: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    // Event Listener untuk Update Bar visual
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    // Update teks saat selesai
    this.load.on("complete", () => {
      loadingText.setText("Loading...");
      progressBar.destroy();
      progressBox.destroy();
    });

    // --- 2. LOAD ASET GAME ---

    // A. Load File CSV Lokal (PENTING: Lakukan ini sebelum setBaseURL)
    // Kita set path ke folder lokal dulu
    this.load.setPath('assets/data/');
    this.load.text('cardData', 'yugioh-cards.csv');
    this.load.setPath(''); // Reset path agar bersih kembali

    this.load.image('card_back', 'assets/sprites/card_back.png');
    this.load.image('main_menu_bg', 'assets/sprites/main_menu_bg.png');
    this.load.image('shop_bg', 'assets/sprites/shop_bg.png');
    this.load.image('gacha_bg', 'assets/sprites/gacha_bg.png');
    this.load.image('achievement_bg', 'assets/sprites/achievement.png');
    this.load.image('inventory_bg', 'assets/sprites/inventory.png');
    this.load.image('collection_bg', 'assets/sprites/colletion.png');

    // B. Load Audio
    this.load.audio('bgm_main_menu', 'assets/audio/main_menu.mp3');
    this.load.audio('bgm_shop', 'assets/audio/shop_scene.mp3');
    this.load.audio('bgm_gacha', 'assets/audio/gacha.mp3');
    this.load.audio('bgm_inventory', 'assets/audio/inventory.mp3');
    this.load.audio('bgm_achievement', 'assets/audio/achievement.mp3');
    this.load.audio('bgm_collection', 'assets/audio/collection.mp3');
  }

  create() {
    // Fungsi create() OTOMATIS dipanggil setelah preload() selesai 100%

    // --- 3. GENERATE TEXTURE KARTU (Grafik Manual) ---
    // Kita buat tekstur ini sekarang karena asset loading sudah kelar


    // Buat Depan Kartu (Warna-warni sesuai Rarity)
    this.createCardTexture('card_common', 0xaaaaaa);    // Abu-abu
    this.createCardTexture('card_uncommon', 0x00ff00);  // Hijau
    this.createCardTexture('card_rare', 0x0000ff);      // Biru
    this.createCardTexture('card_epic', 0x800080);      // Ungu
    this.createCardTexture('card_legendary', 0xffd700); // Emas

    // --- 4. KLIK UNTUK MULAI (Agar Audio Bisa Jalan) ---
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const startText = this.add.text(width / 2, height / 2, "CLICK TO START", {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Animasi kedip-kedip
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Interaction Input
    this.input.once('pointerdown', () => {
      this.scene.start("MainMenuScene");
    });
  }

  // Helper Function untuk membuat kotak warna
  createCardTexture(key, color) {
    const g = this.make.graphics();
    g.fillStyle(color);
    g.fillRect(0, 0, 150, 220);
    g.lineStyle(4, 0x000000);
    g.strokeRect(0, 0, 150, 220);
    g.generateTexture(key, 150, 220);
    g.destroy();
  }
}