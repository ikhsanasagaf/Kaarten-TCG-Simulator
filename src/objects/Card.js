import Phaser from "phaser";

export default class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData) {
    super(scene, x, y);
    this.scene = scene;
    this.cardName = cardData.name;

    // Key texture depan adalah Nama Kartu
    this.frontTextureKey = cardData.name;
    this.fallbackTexture = `card_${cardData.rarity}`;

    // 1. Setup Sprite (Belakang)
    this.cardSprite = scene.add.sprite(0, 0, "card_back");
    this.cardSprite.setDisplaySize(150, 220);
    this.add(this.cardSprite);

    scene.add.existing(this);

    this.cardSprite.setInteractive();
    this.cardSprite.on("pointerdown", () => this.flip());
  }

  flip() {
    if (this.isFlipping) return;
    this.isFlipping = true;

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

        // 2. HITUNG SKALA PROPORSIONAL (Tanpa mengubah tampilan dulu)
        // Reset skala ke 1 untuk mendapatkan ukuran asli gambar
        this.cardSprite.setScale(1);

        // Hitung skala yang dibutuhkan agar lebarnya 150px
        // Rumus: Skala Baru = Lebar Target / Lebar Asli
        const targetScale = 150 / this.cardSprite.width;

        // Terapkan skala ke Y (Tinggi) agar proporsional
        this.cardSprite.scaleY = targetScale;

        // PENTING: Terapkan targetScale ke X TAPI set ke 0 dulu untuk animasi
        // Kita simpan targetScale di variabel, jangan langsung di-set ke sprite
        // atau sprite akan langsung muncul gepeng/lebar.

        this.cardSprite.scaleX = 0; // Pastikan mulai dari 0 lagi!

        // --- TAHAP 2: MEMBUKA KEMBALI (Scale X 0 -> targetScale) ---
        this.scene.tweens.add({
          targets: this.cardSprite,
          scaleX: targetScale, // Tujuan akhirnya adalah skala yang sudah dihitung tadi
          duration: 150,
          onComplete: () => {
            this.isFlipping = false;
          },
        });
      },
    });
  }
}
