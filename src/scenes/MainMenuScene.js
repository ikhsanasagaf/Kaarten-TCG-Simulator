import Phaser from "phaser";
import PlayerData from "../utils/PlayerData"; // <--- PENTING: Import PlayerData

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    // --- 1. LOGIK MISI HARIAN ---
    // Pastikan data ter-load dan cek apakah hari sudah berganti
    PlayerData.load();
    PlayerData.checkDailyLogin();

    // --- 2. JUDUL GAME ---
    this.add
      .text(640, 80, "KAARTEN", {
        fontSize: "60px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // --- 3. MENU BUTTONS ---
    const startY = 220;
    const gapY = 80;

    // SHOP
    this.createMenuButton(640, startY, "Shop", () => {
      this.scene.start("ShopScene");
    });

    // ACHIEVEMENTS
    this.createMenuButton(640, startY + gapY, "Achievements", () => {
      this.scene.start("AchievementScene");
    });

    // INVENTORY
    this.createMenuButton(640, startY + gapY * 2, "Inventory", () => {
      this.scene.start("InventoryScene");
    });

    // COLLECTION (ALBUM)
    this.createMenuButton(640, startY + gapY * 3, "Collection", () => {
      this.scene.start("CollectionScene");
    });

    // PROFILE
    this.createMenuButton(640, startY + gapY * 4, "Profile", () => {
      this.scene.start("ProfileScene");
    });

    // --- 4. FLOATING MISSION BUTTON ---
    const floatX = 1180;
    const floatY = 250;

    // Container tombol
    const missionBtnContainer = this.add.container(floatX, floatY);
    missionBtnContainer.setScrollFactor(0).setDepth(100);

    // a. Background Putih
    const calendarBg = this.add
      .rectangle(0, 10, 80, 90, 0xffffff)
      .setStrokeStyle(3, 0x333333);

    // b. Header Merah
    const calendarHeader = this.add.rectangle(0, -35, 80, 25, 0xff4444);

    // c. Teks "MISSION"
    const headerText = this.add
      .text(0, -35, "MISSION", {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // d. Ikon Scroll
    const bodyIcon = this.add
      .text(0, 15, "📜", {
        fontSize: "35px",
      })
      .setOrigin(0.5);

    // Masukkan ke container
    missionBtnContainer.add([calendarBg, calendarHeader, headerText, bodyIcon]);

    // --- INTERAKSI TOMBOL MISI ---
    calendarBg.setInteractive({ useHandCursor: true });

    // Efek Klik -> Buka DailyMissionScene
    calendarBg.on("pointerdown", () => {
      this.scene.start("DailyMissionScene"); // Pastikan nama scene ini nanti sesuai
    });

    // Efek Hover (Membesar)
    calendarBg.on("pointerover", () => {
      this.tweens.add({
        targets: missionBtnContainer,
        scale: 1.1,
        duration: 100,
        ease: "Power1",
      });
    });

    // Efek Out (Mengecil)
    calendarBg.on("pointerout", () => {
      this.tweens.add({
        targets: missionBtnContainer,
        scale: 1,
        duration: 100,
        ease: "Power1",
      });
    });
  }

  createMenuButton(x, y, text, callback) {
    const btn = this.add
      .text(x, y, text, {
        fontSize: "32px",
        color: "#00ff00",
        backgroundColor: "#222",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () =>
      btn.setStyle({ color: "#000", backgroundColor: "#00ff00" })
    );
    btn.on("pointerout", () =>
      btn.setStyle({ color: "#00ff00", backgroundColor: "#222" })
    );
    btn.on("pointerdown", callback);
  }
}
