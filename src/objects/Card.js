import Phaser from "phaser";

export default class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cardData) {
    super(scene, x, y);
    this.scene = scene;
    this.rarity = cardData.rarity; // Store Rarity

    // Status Kartu
    this.isFlipped = false; // Apakah kartu sudah terbuka?
    this.isFlipping = false; // Apakah sedang animasi?

    // Key texture depan adalah Nama Kartu
    this.frontTextureKey = cardData.name;

    // Convert "Ultra Rare" -> "ultra_rare" for fallback key
    const safeRarity = cardData.rarity.toLowerCase().replace(/ /g, "_");
    this.fallbackTexture = `card_${safeRarity}`;

    // 1. Setup Sprite (Belakang)
    this.cardSprite = scene.add.sprite(0, 0, "card_back");
    this.cardSprite.setDisplaySize(150, 220);
    this.add(this.cardSprite);

    scene.add.existing(this);

    this.cardSprite.setInteractive({ useHandCursor: true });

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
          this.scene.showZoom(this.cardName, this.fallbackTexture, this.rarity);
        }
      }
    });
  }

  showAura() {
    // 1. Common / Rare: No Effect
    if (this.rarity === "Common" || this.rarity === "Rare") return;

    // 2. Super Rare (Purple Pulse)
    if (this.rarity === "Super Rare") {
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xaa00ff, 0.6); // Purple
      glow.fillRoundedRect(-85, -120, 170, 240, 15);
      this.addAt(glow, 0); // Put behind card

      this.scene.tweens.add({
        targets: glow,
        alpha: 0.2,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }

    // 3. Ultra Rare (Gold God Rays)
    if (this.rarity === "Ultra Rare") {
      // A. Static Glow
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xffd700, 0.5); // Gold
      glow.fillRoundedRect(-85, -120, 170, 240, 15);
      this.addAt(glow, 0);

      // B. Rotating Rays
      const rays = this.scene.add.graphics();
      rays.fillStyle(0xffd700, 0.3); // Gold Rays
      // Draw a star/sun shape manually
      for (let i = 0; i < 8; i++) {
        rays.fillTriangle(0, 0, -20, -150, 20, -150);
        rays.rotateCanvas(Math.PI / 4);
      }
      this.addAt(rays, 0);

      this.scene.tweens.add({
        targets: rays,
        angle: 360,
        duration: 6000,
        repeat: -1
      });

      this.scene.tweens.add({
        targets: glow,
        alpha: 0.8,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    // 4. Secret Rare (Red Lightning / Chaos)
    if (this.rarity === "Secret Rare") {
      const glow = this.scene.add.graphics();
      const color = 0xff0000; // Red

      this.addAt(glow, 0);

      // Chaotic Tween
      this.scene.tweens.addCounter({
        from: 0,
        to: 100,
        duration: 100,
        repeat: -1,
        onUpdate: () => {
          glow.clear();
          glow.lineStyle(4, color, Math.random());
          glow.strokeRect(-80 - Math.random() * 10, -115 - Math.random() * 10, 160 + Math.random() * 20, 230 + Math.random() * 20);

          glow.fillStyle(color, 0.2);
          glow.fillRoundedRect(-85, -120, 170, 240, 15);
        }
      });
    }
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

        // 2. Trigger Aura Logic here
        this.showAura();

        // 3. HITUNG SKALA PROPORSIONAL
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
