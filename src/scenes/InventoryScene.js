import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import { MISSION_TYPES } from "../data/MissionPool";

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super("InventoryScene");
    this.isZooming = false;
  }

  create() {
    // --- SETUP CAMERA SCROLL ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (this.isZooming) return;
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- AUDIO ---
    this.sound.stopAll();
    this.sound.play('bgm_inventory', { loop: true, volume: 0.5 });

    // --- BACKGROUND IMAGE ---
    const bg = this.add.image(640, 360, 'inventory_bg');
    bg.setDisplaySize(1280, 720);
    bg.setScrollFactor(0);
    bg.setDepth(-10);

    // --- HEADER UI (Glassmorphic) ---
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x000000, 0.5);
    headerBg.fillRect(0, 0, 1280, 120);
    headerBg.lineStyle(1, 0x00ff88, 0.3);
    headerBg.lineBetween(0, 120, 1280, 120);
    headerBg.setScrollFactor(0);
    headerBg.setDepth(10);

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
    this.zoomContainer = this.add
      .container(0, 0)
      .setDepth(100)
      .setVisible(false);

    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.85)
      .setInteractive({ useHandCursor: true });

    this.zoomedImage = this.add
      .image(640, 360, "card_back")
      .setInteractive({ useHandCursor: true });

    const closeText = this.add
      .text(640, 650, "Click anywhere to close", {
        fontSize: "20px",
        color: "#aaa",
      })
      .setOrigin(0.5);

    bg.on("pointerdown", () => this.hideZoom());
    this.zoomedImage.on("pointerdown", () => this.hideZoom());

    this.zoomContainer.add([bg, this.zoomedImage, closeText]);
  }

  showZoom(textureKey, fallbackKey = 'card_back') {
    this.isZooming = true;
    this.zoomContainer.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );

    if (this.textures.exists(textureKey)) {
      this.zoomedImage.setTexture(textureKey);
    } else {
      this.zoomedImage.setTexture(fallbackKey);
    }
    this.zoomedImage.setScale(1);
    const targetHeight = 440;
    const scale = targetHeight / this.zoomedImage.height;
    this.zoomedImage.setScale(scale);
    this.zoomContainer.setVisible(true);
  }

  hideZoom() {
    this.time.delayedCall(50, () => {
      this.zoomContainer.setVisible(false);
      this.isZooming = false;
    });
  }

  // --- BAGIAN INI YANG DIROMBAK TOTAL UNTUK COLOR CODING ---
  renderInventory() {
    const previousScrollY = this.cameras.main.scrollY;
    this.cardsContainer.removeAll(true);

    // 1. Definisikan Bobot dan Warna Rarity
    const RARITY_CONFIG = {
      "Secret Rare": { weight: 5, color: 0xff0000 }, // Merah
      "Ultra Rare": { weight: 4, color: 0xffd700 }, // Emas
      "Super Rare": { weight: 3, color: 0xaa00ff }, // Ungu Neon
      Rare: { weight: 2, color: 0x0088ff }, // Biru Neon
      Common: { weight: 1, color: 0xaaaaaa }, // Abu-abu
    };

    // 2. Sorting Logic: Rarity Tinggi dulu, baru Abjad A-Z
    const myCards = PlayerData.collection.sort((a, b) => {
      const wA = RARITY_CONFIG[a.rarity]?.weight || 0;
      const wB = RARITY_CONFIG[b.rarity]?.weight || 0;

      if (wB !== wA) {
        return wB - wA; // Descending (Besar ke Kecil)
      }
      return a.name.localeCompare(b.name); // Ascending (A ke Z)
    });

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

      // --- VISUAL EFEK GLOW ---
      const rarityInfo =
        RARITY_CONFIG[cardData.rarity] || RARITY_CONFIG["Common"];
      const glowColor = rarityInfo.color;

      // Buat kotak glow di belakang kartu (sedikit lebih besar)
      const borderGlow = this.add
        .rectangle(0, 0, cardW + 10, cardH + 10, glowColor)
        .setOrigin(0.5)
        .setAlpha(0.6); // Transparan agar jadi efek cahaya

      // Animasi Denyut untuk kartu mahal (Ultra & Secret)
      if (rarityInfo.weight >= 4) {
        this.tweens.add({
          targets: borderGlow,
          alpha: 0.2,
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
      }

      cardItem.add(borderGlow);

      // --- GAMBAR KARTU ---
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
        if (this.isZooming) return;
        this.showZoom(cardData.name);
      });
      cardItem.add(img);

      // --- BADGE JUMLAH ---
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

      // --- NAMA KARTU (WARNA SESUAI RARITY) ---
      // Konversi integer color (0xff0000) ke string hex ("#ff0000")
      const hexColorStr = "#" + glowColor.toString(16).padStart(6, "0");

      const nameTxt = this.add
        .text(0, 125, cardData.name, {
          fontSize: "14px",
          align: "center",
          wordWrap: { width: 140 },
          fontStyle: "bold",
          color: hexColorStr, // Pakai warna rarity
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0);

      // --- TOMBOL JUAL ---
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
        if (this.isZooming) return;

        const success = PlayerData.sellCard(cardData.name);
        if (success) {
          this.moneyText.setText(`Money: $${PlayerData.getMoney()}`);

          PlayerData.updateMissionProgress(MISSION_TYPES.SELL_CARD, 1);
          PlayerData.updateMissionProgress(MISSION_TYPES.EARN_MONEY, sellPrice);

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
