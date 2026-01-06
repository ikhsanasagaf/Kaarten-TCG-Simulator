import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import { MISSION_TYPES } from "../data/MissionPool"; // <--- 1. TAMBAHKAN IMPORT INI

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
    this.isZooming = false; // Flag untuk mencegah interaksi saat zoom
  }

  create() {
    // --- SETUP CAMERA SCROLL ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // LOGIKA BARU: Cek flag isZooming
      if (this.isZooming) {
        return; // Hentikan fungsi, jangan scroll!
      }

      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- HEADER UI ---
    this.add
      .rectangle(640, 60, 1280, 120, 0x222222)
      .setScrollFactor(0)
      .setDepth(10);

    this.add
      .text(640, 60, "MY INVENTORY", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    this.moneyText = this.add
      .text(1230, 60, `Money: $${PlayerData.getMoney()}`, {
        fontSize: "28px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(11);

    const backBtn = this.add
      .text(40, 60, "< BACK", {
        fontSize: "24px",
        backgroundColor: "#333",
        padding: { x: 15, y: 8 },
        color: "#ffffff",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11);

    backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // --- ZOOM CONTAINER ---
    this.createZoomContainer();

    // --- CONTAINER KARTU ---
    this.cardsContainer = this.add.container(0, 280);
    this.renderInventory();
  }

  createZoomContainer() {
    // Container Zoom
    this.zoomContainer = this.add
      .container(0, 0)
      .setDepth(100)
      .setVisible(false);

    // Background Gelap (Dimmer) - KLIK UNTUK TUTUP
    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.85)
      .setInteractive({ useHandCursor: true });

    // Gambar Zoom - KLIK UNTUK TUTUP
    this.zoomedImage = this.add
      .image(640, 360, "card_back")
      .setInteractive({ useHandCursor: true });

    // Teks Instruksi
    const closeText = this.add
      .text(640, 650, "Click anywhere to close", {
        fontSize: "20px",
        color: "#aaa",
      })
      .setOrigin(0.5);

    // Event Listeners
    bg.on("pointerdown", () => this.hideZoom());
    this.zoomedImage.on("pointerdown", () => this.hideZoom());

    this.zoomContainer.add([bg, this.zoomedImage, closeText]);
  }

  showZoom(textureKey) {
    this.isZooming = true; // Kunci scroll dan interaksi lain

    this.zoomContainer.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );

    this.zoomedImage.setTexture(textureKey);
    this.zoomedImage.setScale(1);
    const targetHeight = 440;
    const scale = targetHeight / this.zoomedImage.height;
    this.zoomedImage.setScale(scale);
    this.zoomContainer.setVisible(true);
  }

  hideZoom() {
    // Mencegah "Ghost Click" (klik tembus ke kartu di bawahnya saat menutup)
    this.time.delayedCall(50, () => {
      this.zoomContainer.setVisible(false);
      this.isZooming = false; // Buka kunci
    });
  }

  renderInventory() {
    const previousScrollY = this.cameras.main.scrollY;
    this.cardsContainer.removeAll(true);
    const myCards = PlayerData.collection.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (myCards.length === 0) {
      const emptyText = this.add
        .text(640, 200, "No card has been obtained yet", {
          fontSize: "24px",
          color: "#aaa",
        })
        .setOrigin(0.5);
      this.cardsContainer.add(emptyText);
      return;
    }

    const cardW = 150;
    const cardH = 219;
    const cols = 5;
    const startX = 220;
    const gapX = 210;
    const gapY = 320;

    myCards.forEach((cardData, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * gapX;
      const y = row * gapY;
      const cardItem = this.add.container(x, y);

      let textureKey = cardData.name;
      let img;
      if (!this.textures.exists(textureKey)) {
        img = this.add.sprite(0, 0, "card_back").setDisplaySize(cardW, cardH);
        this.loadCardImageOnDemand(cardData.name, img);
      } else {
        img = this.add.image(0, 0, textureKey).setDisplaySize(cardW, cardH);
      }

      img.setInteractive({ useHandCursor: true });
      img.on("pointerdown", () => {
        // Cek flag isZooming agar tidak bisa klik kartu di bawah saat sedang zoom
        if (this.isZooming) return;
        this.showZoom(cardData.name);
      });
      cardItem.add(img);

      const badgeBg = this.add
        .rectangle(55, -95, 30, 20, 0x000000, 0.7)
        .setStrokeStyle(1, 0xffffff, 0.5)
        .setOrigin(0.5);
      const badgeText = this.add
        .text(55, -95, `x${cardData.count}`, {
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);
      cardItem.add([badgeBg, badgeText]);

      const nameTxt = this.add
        .text(0, 120, cardData.name, {
          fontSize: "14px",
          align: "center",
          wordWrap: { width: 140 },
          color: "#fff",
        })
        .setOrigin(0.5, 0);

      const sellPrice = cardData.price || 0.1;
      const btnSell = this.add
        .text(0, 180, `SELL $${sellPrice}`, {
          fontSize: "16px",
          backgroundColor: "#006600",
          padding: { x: 10, y: 5 },
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      cardItem.add([nameTxt, btnSell]);
      this.cardsContainer.add(cardItem);

      btnSell.on("pointerover", () =>
        btnSell.setStyle({ backgroundColor: "#00aa00" })
      );
      btnSell.on("pointerout", () =>
        btnSell.setStyle({ backgroundColor: "#006600" })
      );

      btnSell.on("pointerdown", () => {
        // Cek flag juga untuk tombol sell
        if (this.isZooming) return;

        const success = PlayerData.sellCard(cardData.name);
        if (success) {
          this.moneyText.setText(`Money: $${PlayerData.getMoney()}`);

          // --- 2. UPDATE PROGRESS MISI (Tambahan Baru) ---
          PlayerData.updateMissionProgress(MISSION_TYPES.SELL_CARD, 1);
          PlayerData.updateMissionProgress(MISSION_TYPES.EARN_MONEY, sellPrice);
          // ------------------------------------------------

          this.renderInventory();
        }
      });
    });

    const totalRows = Math.ceil(myCards.length / cols);
    const contentHeight = 280 + totalRows * gapY + 200;
    this.cameras.main.setBounds(0, 0, 1280, Math.max(720, contentHeight));
    const maxScroll = Math.max(0, contentHeight - 720);
    this.cameras.main.scrollY = Math.min(previousScrollY, maxScroll);
  }

  loadCardImageOnDemand(cardName, spriteObj) {
    let cleanName = cardName.replace(/[^\w\s-]/gi, "").replace(/ /g, "_");
    const localPath = `assets/cards/${cleanName}.jpg`;
    this.load.image(cardName, localPath);
    this.load.once("complete", () => {
      if (spriteObj && spriteObj.scene) {
        spriteObj.setTexture(cardName);
        spriteObj.setDisplaySize(150, 219);
      }
    });
    this.load.start();
  }
}
