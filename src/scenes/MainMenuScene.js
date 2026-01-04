import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    // Judul Game
    this.add
      .text(640, 80, "KAARTEN TCG", {
        // Naikkan sedikit Y nya
        fontSize: "60px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // --- MENU BUTTONS ---
    const startY = 220;
    const gapY = 80;

    // 0. PROFILE (NEW)
    this.createMenuButton(640, startY, "Shop", () => {
      this.scene.start("ShopScene");
    });

    // 1. SHOP (Gacha)
    this.createMenuButton(640, startY + gapY, "Inventory", () => {
      this.scene.start("InventoryScene");
    });

    // 2. ALBUM (Checklist)
    this.createMenuButton(640, startY + gapY * 2, "Collection", () => {
      this.scene.start("CollectionScene");
    });

    // 3. INVENTORY (Sell)
    this.createMenuButton(640, startY + gapY * 3, "Profile", () => {
      this.scene.start("ProfileScene");
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
