import Phaser from "phaser";
import GachaSystem from "../systems/GachaSystem";
import Card from "../objects/Card";
import PlayerData from "../utils/PlayerData";
import { MISSION_TYPES } from "../data/MissionPool";

export default class GachaScene extends Phaser.Scene {
  constructor() {
    super("GachaScene");
    this.displayedCards = [];
    this.displayedButtons = [];
    this.currentSet = null;

    // Variabel untuk tombol agar bisa diakses global di scene ini
    this.revealAllBtn = null;
    this.sellAllBtn = null;
    this.backBtn = null;
  }

  init(data) {
    this.currentSet = data.selectedSet || null;
    this.displayedCards = [];
    this.displayedButtons = [];
  }

  create() {
    this.gachaSystem = new GachaSystem(this);

    // --- AUDIO ---
    this.sound.stopAll();
    this.sound.play('bgm_gacha', { loop: true, volume: 0.6 });

    // --- BACKGROUND IMAGE ---
    const bg = this.add.image(640, 360, 'gacha_bg');
    bg.setDisplaySize(1280, 720);
    bg.setDepth(-10);

    // HEADER UI
    this.moneyText = this.add
      .text(1230, 50, `Money: $${PlayerData.getMoney()}`, {
        fontSize: "28px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5);

    const titleText = this.currentSet ? `${this.currentSet}` : "Random Pack";
    this.add
      .text(640, 50, titleText, { fontSize: "28px", color: "#ffff00" })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(640, 360, "Loading card pack...", {
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.createZoomContainer();
    this.createBottomButtons();

    this.time.delayedCall(500, () => {
      this.openPackVisual();
    });
  }

  createBottomButtons() {
    const yPos = 680;

    // Tombol KEMBALI
    this.backBtn = this.add
      .text(200, yPos, "< Back", {
        fontSize: "24px",
        backgroundColor: "#333",
        padding: { x: 20, y: 10 },
        color: "#fff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);

    this.backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // Tombol JUAL SEMUA (Awalnya Hidden & Non-Interactive)
    this.sellAllBtn = this.add
      .text(1080, yPos, "SELL ALL", {
        fontSize: "24px",
        backgroundColor: "#880000",
        padding: { x: 20, y: 10 },
        color: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0)
      .setVisible(false);

    this.sellAllBtn.on("pointerdown", () => this.handleSellAll());
  }

  createZoomContainer() {
    this.zoomContainer = this.add
      .container(0, 0)
      .setDepth(100)
      .setVisible(false);

    // Background Gelap
    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.85)
      .setInteractive({ useHandCursor: true });

    // Gambar Zoom
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

  showZoom(textureKey) {
    this.zoomedImage.setTexture(textureKey);
    this.zoomedImage.setScale(1);
    const targetHeight = 440;
    const scale = targetHeight / this.zoomedImage.height;
    this.zoomedImage.setScale(scale);
    this.zoomContainer.setVisible(true);
  }

  hideZoom() {
    this.time.delayedCall(50, () => {
      this.zoomContainer.setVisible(false);
    });
  }

  // --- LOGIC UTAMA PENGECEKAN KARTU ---
  onCardOpened(cardInstance) {
    const index = this.displayedCards.findIndex(
      (item) => item.card === cardInstance
    );
    if (index !== -1) {
      const sellBtn = this.displayedButtons[index];
      if (sellBtn) {
        this.tweens.add({
          targets: sellBtn,
          alpha: 1,
          duration: 300,
          delay: 200,
        });
      }
    }

    this.checkAllCardsOpened();
  }

  checkAllCardsOpened() {
    const isAllOpen = this.displayedCards.every(
      (item) => item.card && item.card.isFlipped
    );

    if (isAllOpen) {
      if (!this.sellAllBtn.visible) {
        this.sellAllBtn.setVisible(true);
        this.sellAllBtn.setInteractive({ useHandCursor: true });
        this.tweens.add({ targets: this.sellAllBtn, alpha: 1, duration: 500 });
      }

      if (this.revealAllBtn && this.revealAllBtn.visible) {
        this.revealAllBtn.disableInteractive();
        this.tweens.add({
          targets: this.revealAllBtn,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            this.revealAllBtn.setVisible(false);
          },
        });
      }
    }
  }

  openPackVisual() {
    this.displayedCards.forEach((item) => {
      if (item.card) item.card.destroy();
    });
    this.displayedButtons.forEach((btn) => btn.destroy());
    this.displayedCards = [];
    this.displayedButtons = [];

    if (this.sellAllBtn) {
      this.sellAllBtn.setAlpha(0).setVisible(false).disableInteractive();
    }
    if (this.revealAllBtn) {
      this.revealAllBtn.destroy();
      this.revealAllBtn = null;
    }

    // --- SYSTEM ACHIEVEMENT ---
    PlayerData.trackPackOpened(1);

    // Misi "Open Pack" & "Get Rarity" sudah ditangani otomatis oleh GachaSystem ini:
    const results = this.gachaSystem.openPack(1, this.currentSet);

    PlayerData.addCards(results);
    PlayerData.checkAchievements(this.gachaSystem);

    let filesToLoad = 0;
    results.forEach((cardData) => {
      const textureKey = cardData.name;
      if (!this.textures.exists(textureKey)) {
        let cleanName = cardData.name
          .replace(/[^\w\s-]/gi, "")
          .replace(/ /g, "_");
        const localPath = `assets/cards/${cleanName}.jpg`;
        this.load.image(textureKey, localPath);
        filesToLoad++;
      }
    });

    if (filesToLoad === 0) {
      this.displayCards(results);
    } else {
      this.statusText.setText("Loading card images...");
      this.load.once("complete", () => {
        this.displayCards(results);
      });
      this.load.start();
    }
  }

  displayCards(results) {
    this.statusText.setVisible(false);

    const cardW = 150;
    const gapX = 40;
    const rowHeight = 280;
    const startY = 200;
    const centerX = 1280 / 2;

    results.forEach((cardData, index) => {
      let row, col, maxColsInRow;
      if (index < 5) {
        row = 0;
        col = index;
        maxColsInRow = 5;
      } else {
        row = 1;
        col = index - 5;
        maxColsInRow = 4;
      }
      const totalRowWidth = maxColsInRow * cardW + (maxColsInRow - 1) * gapX;
      const rowStartX = centerX - totalRowWidth / 2 + cardW / 2;
      const x = rowStartX + col * (cardW + gapX);
      const y = startY + row * rowHeight;

      const card = new Card(this, x, y, cardData);
      this.displayedCards.push({ card, data: cardData, sold: false });

      const sellPrice = cardData.price || 0.1;
      const sellBtn = this.add
        .text(x, y + 125, `SELL $${sellPrice}`, {
          fontSize: "14px",
          backgroundColor: "#006600",
          color: "#fff",
          padding: { x: 5, y: 2 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0);

      this.displayedButtons.push(sellBtn);

      sellBtn.on("pointerdown", () => {
        this.handleSingleSell(index, sellPrice);
      });

      card.y += 800;
      card.alpha = 0;
      this.tweens.add({
        targets: card,
        y: y,
        alpha: 1,
        duration: 500,
        ease: "Back.out",
        delay: index * 50,
      });
    });

    this.time.delayedCall(1200, () => {
      this.createRevealAllButton();
      this.tweens.add({ targets: this.backBtn, alpha: 1, duration: 500 });
    });
  }

  handleSingleSell(index, price) {
    const item = this.displayedCards[index];
    const btn = this.displayedButtons[index];
    if (item.sold) return;

    const success = PlayerData.sellCard(item.data.name);
    if (success) {
      item.sold = true;
      this.moneyText.setText(`Money: $${PlayerData.getMoney()}`);

      // --- 2. UPDATE PROGRESS MISI SAAT JUAL KARTU ---
      PlayerData.updateMissionProgress(MISSION_TYPES.SELL_CARD, 1);
      PlayerData.updateMissionProgress(MISSION_TYPES.EARN_MONEY, price);

      this.tweens.add({
        targets: [item.card, btn],
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => {
          item.card.setVisible(false);
          btn.setVisible(false);
        },
      });
    }
  }

  handleSellAll() {
    let soldCount = 0;
    this.displayedCards.forEach((item, index) => {
      if (!item.sold) {
        const price = item.data.price || 0.1;
        this.handleSingleSell(index, price);
        soldCount++;
      }
    });

    if (soldCount > 0) {
      this.input.enabled = false;
      this.time.delayedCall(900, () => {
        this.input.enabled = true;
        this.scene.start("ShopScene");
      });
    }
  }

  createRevealAllButton() {
    this.statusText.setVisible(false);

    this.revealAllBtn = this.add
      .text(640, 680, "Open All", {
        fontSize: "24px",
        backgroundColor: "#ff8800",
        color: "#ffffff",
        padding: { x: 30, y: 10 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.revealAllBtn.on("pointerdown", () => {
      this.revealAllBtn.disableInteractive();
      this.tweens.add({ targets: this.revealAllBtn, alpha: 0, duration: 300 });

      this.displayedCards.forEach((item, index) => {
        if (!item.sold && item.card && item.card.scene) {
          if (!item.card.isFlipped) {
            this.time.delayedCall(index * 100, () => {
              if (item.card && !item.card.isFlipped) {
                item.card.flip();
                this.onCardOpened(item.card);
              }
            });
          }
        }
      });
    });
  }
}
