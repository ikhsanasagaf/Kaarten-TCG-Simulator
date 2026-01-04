import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import GachaSystem from "../systems/GachaSystem";

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super("ProfileScene");
  }

  create() {
    this.gachaSystem = new GachaSystem(this);
    const stats = this.calculateStats();

    // --- 1. BACKGROUND LAYER ---
    this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e); // Background Layar

    // Header Bar
    this.add.rectangle(640, 60, 1280, 120, 0x000000, 0.5);
    this.add.text(50, 40, "MY PROFILE", {
      fontSize: "40px",
      fontStyle: "bold",
      color: "#fff",
    });

    // Tombol Close (Pojok Kanan Atas)
    const closeBtn = this.add
      .text(1230, 40, "Back", {
        fontSize: "24px",
        color: "#ff4444",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    closeBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // --- 2. KARTU PROFIL (Container Utama) ---
    const cardBg = this.add.container(640, 380);

    // Background Kotak Profil (Lebih Lebar sedikit)
    const bgRect = this.add
      .rectangle(0, 0, 900, 400, 0x222233)
      .setStrokeStyle(3, 0x4444ff);
    cardBg.add(bgRect);

    // --- 3. BAGIAN KIRI (NAMA & TITLE) ---
    // Posisi X relatif terhadap container (0 adalah tengah)
    const leftSectionX = -230;

    // Nama Player
    this.nameText = this.add
      .text(leftSectionX, -40, PlayerData.username, {
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffd700",
      })
      .setOrigin(0.5);

    // Tombol Edit Nama (Ikon Pensil Kecil)
    const editBtn = this.add
      .text(leftSectionX + this.nameText.width / 2 + 20, -40, "✎", {
        fontSize: "15px",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    editBtn.on("pointerdown", () => this.handleEditName());

    // Title (Pangkat)
    const titleText = this.add
      .text(leftSectionX, 10, `${stats.playerTitle}`, {
        fontSize: "20px",
        color: "#00ff00",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    cardBg.add([this.nameText, editBtn, titleText]);
    this.editBtn = editBtn; // Simpan referensi untuk update posisi nanti

    // --- 4. PEMISAH (GARIS VERTIKAL) ---
    const separator = this.add.rectangle(0, 0, 2, 300, 0x444455);
    cardBg.add(separator);

    // --- 5. BAGIAN KANAN (STATS) ---
    const rightX = 50;
    const startY = -100;
    const gapY = 70;

    // A. MONEY
    this.createStatRow(
      cardBg,
      rightX,
      startY,
      "Current Money",
      `$${PlayerData.getMoney()}`,
      "#ffd700"
    );

    // B. COLLECTION LEVEL
    this.createStatRow(
      cardBg,
      rightX,
      startY + gapY,
      "Collection Level",
      `${stats.collectionLevel}`,
      "#00ffff"
    );

    // C. ALBUM PROGRESS (Text & Bar)
    const albumY = startY + gapY * 2;

    // Label Album
    const albumLabel = this.add
      .text(rightX, albumY, "Album Completion", {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0, 0.5);

    // Text Angka (misal: 15 / 100)
    const albumValue = this.add
      .text(
        rightX + 320,
        albumY,
        `${stats.unlockedCount} / ${stats.totalGameCards}`,
        {
          fontSize: "20px",
          fontStyle: "bold",
          color: "#ffffff",
        }
      )
      .setOrigin(1, 0.5);

    // Progress Bar Container
    const barW = 280;
    const barH = 15;
    const barX = rightX;
    const barY = albumY + 35; // Di bawah tulisan Album

    // Background Bar (Abu gelap)
    const barBase = this.add
      .rectangle(barX, barY, barW, barH, 0x000000)
      .setOrigin(0, 0.5);

    // Fill Bar (Hijau)
    const fillW = (stats.completionRate / 100) * barW;
    const barFill = this.add
      .rectangle(barX, barY, fillW, barH, 0x00ff00)
      .setOrigin(0, 0.5);

    // Persentase Text (Di ujung kanan bar)
    const percentTxt = this.add
      .text(barX + barW + 10, barY, `${stats.completionRate}%`, {
        fontSize: "16px",
        color: "#aaa",
      })
      .setOrigin(0, 0.5);

    cardBg.add([albumLabel, albumValue, barBase, barFill, percentTxt]);
  }

  handleEditName() {
    // Menggunakan prompt browser bawaan (Simple & Efektif untuk Web Game)
    const newName = prompt(
      "Masukkan nama baru (Max 12 karakter):",
      PlayerData.username
    );

    if (newName && newName.trim().length > 0) {
      // Potong jika terlalu panjang
      const finalName = newName.trim().substring(0, 12);

      // Simpan ke PlayerData
      PlayerData.username = finalName;
      PlayerData.save();

      // Update Tampilan Text
      this.nameText.setText(finalName);

      // Update posisi tombol pensil agar selalu di samping nama
      this.editBtn.x = -200 + this.nameText.width / 2 + 25;
    }
  }

  createStatRow(container, x, y, label, value, valueColor) {
    // Label (Kiri)
    const labelTxt = this.add
      .text(x, y, label, {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0, 0.5);

    // Value (Kanan - Rata Kanan di x+320)
    const valueTxt = this.add
      .text(x + 320, y, value, {
        fontSize: "24px",
        fontStyle: "bold",
        color: valueColor,
      })
      .setOrigin(1, 0.5);

    container.add([labelTxt, valueTxt]);
  }

  calculateStats() {
    let totalGameCards = 0;
    const pools = this.gachaSystem.cardPools;
    Object.keys(pools).forEach((rarity) => {
      totalGameCards += pools[rarity].length;
    });

    const unlockedCount = PlayerData.obtainedCardNames.length;

    const completionRate =
      totalGameCards > 0
        ? Math.floor((unlockedCount / totalGameCards) * 100)
        : 0;

    const collectionLevel = PlayerData.level || 1;

    let playerTitle = "Newbie Collector";
    if (collectionLevel >= 10) playerTitle = "Novice Collector";
    if (collectionLevel >= 15) playerTitle = "Expert Collector";
    if (collectionLevel >= 20) playerTitle = "King of Cards";

    return {
      totalGameCards,
      unlockedCount,
      completionRate,
      collectionLevel, // Menggunakan nilai dari PlayerData
      playerTitle,
    };
  }
}
