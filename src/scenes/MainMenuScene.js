import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    // Tampilkan Background
    this.add.rectangle(640, 360, 1280, 720, 0x222222);

    // Judul Game
    this.add
      .text(640, 100, "KAARTEN", {
        fontSize: "64px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Tombol Shop (Navigasi ke ShopScene)
    const shopBtn = this.add
      .text(640, 300, "SHOP (BELI PACK)", {
        fontSize: "32px",
        color: "#00ff00",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Event Klik
    shopBtn.on("pointerdown", () => {
      this.scene.start("ShopScene"); // Arahkan ke Shop dulu!
    });

    const collectionBtn = this.add
      .text(640, 400, "MY COLLECTION", {
        fontSize: "32px",
        color: "#00ffff",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    collectionBtn.on("pointerdown", () => {
      this.scene.start("CollectionScene");
    });

    // Efek Hover Mouse
    shopBtn.on("pointerover", () => shopBtn.setStyle({ color: "#ffff00" }));
    shopBtn.on("pointerout", () => shopBtn.setStyle({ color: "#00ff00" }));
  }
}
