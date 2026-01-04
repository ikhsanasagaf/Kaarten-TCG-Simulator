import Phaser from "phaser";

export default class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData) {
    super(scene, x, y);
    this.scene = scene;
    this.cardName = cardData.name;

    // Status Kartu
    this.isFlipped = false; // Apakah kartu sudah terbuka?
    this.isFlipping = false; // Apakah sedang animasi?

    // Key texture depan adalah Nama Kartu
    this.frontTextureKey = cardData.name;
    this.fallbackTexture = `card_${cardData.rarity}`;

    // 1. Setup Sprite (Belakang)
    this.cardSprite = scene.add.sprite(0, 0, "card_back");
    this.cardSprite.setDisplaySize(150, 220);
    this.add(this.cardSprite);

    scene.add.existing(this);

    this.cardSprite.setInteractive({ useHandCursor: true });

    this.cardSprite.setInteractive();

    // --- LOGIKA KLIK (FLIP vs ZOOM) ---
    this.cardSprite.on("pointerdown", () => {
      // Jika sedang animasi, abaikan klik
      if (this.isFlipping) return;

      if (!this.isFlipped) {
        // KONDISI 1: Kartu Tertutup -> FLIP
        this.flip();

        // Panggil fungsi di Scene untuk memunculkan tombol Jual
        if (this.scene.onCardOpened) {
          this.scene.onCardOpened(this);
        }
      } else {
        // KONDISI 2: Kartu Sudah Terbuka -> ZOOM
        if (this.scene.showZoom) {
          this.scene.showZoom(this.cardName);
        }
      }
    });
  }

  flip() {
    // Cegah double flip
    if (this.isFlipped || this.isFlipping) return;

    this.isFlipping = true;
    this.isFlipped = true; // Set TRUE di awal agar aman dari tombol 'Buka Semua'

    // TAHAP 1: MENUTUP KARTU (Scale X -> 0)
    this.scene.tweens.add({
      targets: this.cardSprite,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        // --- SAAT KARTU TERTUTUP (TITIK TENGAH) ---

        // 1. Ganti Texture ke Gambar Asli
        if (this.scene.textures.exists(this.frontTextureKey)) {
          this.cardSprite.setTexture(this.frontTextureKey);
        } else {
          this.cardSprite.setTexture(this.fallbackTexture);
        }

        // 2. HITUNG SKALA PROPORSIONAL
        this.cardSprite.setScale(1); // Reset scale asli

        // Hitung skala baru (Target Lebar 150px)
        const targetScale = 150 / this.cardSprite.width;

        // Terapkan ke Y (Tinggi)
        this.cardSprite.scaleY = targetScale;

        // Reset X ke 0 untuk animasi buka
        this.cardSprite.scaleX = 0;

        // --- TAHAP 2: MEMBUKA KEMBALI (Scale X 0 -> targetScale) ---
        this.scene.tweens.add({
          targets: this.cardSprite,
          scaleX: targetScale,
          duration: 150,
          onComplete: () => {
            this.isFlipping = false;
          },
        });
      },
    });
  }
}
