import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import GachaSystem from "../systems/GachaSystem";

export default class CollectionScene extends Phaser.Scene {
  constructor() {
    super("CollectionScene");
    this.currentSetIndex = 0;
    this.isZooming = false;
  }

  create() {
    this.gachaSystem = new GachaSystem(this);
    this.availableSets = this.gachaSystem.getSetList();

    // --- CAMERA SCROLL ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (this.isZooming) return; // Stop scroll saat zoom
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- HEADER UI ---
    this.add
      .rectangle(640, 80, 1280, 160, 0x1a1a2e)
      .setScrollFactor(0)
      .setDepth(10);
    this.add
      .text(640, 35, "MY ALBUM", {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    const backBtn = this.add
      .text(40, 35, "< BACK", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11);

    backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // --- ZOOM CONTAINER ---
    this.createZoomContainer();

    // --- CONTAINER KARTU ---
    this.cardsContainer = this.add.container(0, 320);

    this.createSetNavigation();
    this.renderSet();
  }

  createZoomContainer() {
    // PERBAIKAN 1: Hapus setScrollFactor(0)
    // Kita akan menggerakkan container ini secara manual mengikuti kamera
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
      .text(640, 650, "Klik di mana saja untuk tutup", {
        fontSize: "20px",
        color: "#aaa",
      })
      .setOrigin(0.5);

    // Logic Tutup
    bg.on("pointerdown", () => this.hideZoom());
    this.zoomedImage.on("pointerdown", () => this.hideZoom());

    this.zoomContainer.add([bg, this.zoomedImage, closeText]);
  }

  showZoom(textureKey) {
    this.isZooming = true; // Kunci interaksi lain

    // PERBAIKAN 2: Pindahkan Container ke Posisi Kamera Saat Ini
    // Ini menjamin Hit Area background berada tepat di layar user
    const camX = this.cameras.main.scrollX;
    const camY = this.cameras.main.scrollY;
    this.zoomContainer.setPosition(camX, camY);

    this.zoomedImage.setTexture(textureKey);
    this.zoomedImage.setScale(1);
    const targetHeight = 440;
    const scale = targetHeight / this.zoomedImage.height;
    this.zoomedImage.setScale(scale);

    this.zoomContainer.setVisible(true);
  }

  hideZoom() {
    // Beri jeda sedikit agar klik tidak tembus
    this.time.delayedCall(50, () => {
      this.zoomContainer.setVisible(false);
      this.isZooming = false; // Buka kunci interaksi
    });
  }

  createSetNavigation() {
    const navY = 100;

    this.add
      .text(100, navY, "< PREV", {
        fontSize: "24px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11)
      .on("pointerdown", () => this.changeSet(-1));

    this.add
      .text(1180, navY, "NEXT >", {
        fontSize: "24px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11)
      .on("pointerdown", () => this.changeSet(1));

    this.setTitle = this.add
      .text(640, navY, "", {
        fontSize: "26px",
        color: "#ffff00",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 800 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    this.progressText = this.add
      .text(640, navY + 40, "", {
        fontSize: "18px",
        color: "#aaaaaa",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);
  }

  changeSet(direction) {
    this.currentSetIndex += direction;
    if (this.currentSetIndex < 0)
      this.currentSetIndex = this.availableSets.length - 1;
    if (this.currentSetIndex >= this.availableSets.length)
      this.currentSetIndex = 0;
    this.renderSet();
  }

  getAllCardsInSet(targetSet) {
    const allCards = [];
    const pools = this.gachaSystem.cardPools;
    Object.keys(pools).forEach((rarityKey) => {
      const cardsInRarity = pools[rarityKey];
      cardsInRarity.forEach((card) => {
        if (card.set_name === targetSet) allCards.push(card);
      });
    });
    return allCards.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderSet() {
    this.cardsContainer.removeAll(true);
    this.cameras.main.scrollY = 0;

    const currentSetName = this.availableSets[this.currentSetIndex];
    this.setTitle.setText(currentSetName);
    const masterList = this.getAllCardsInSet(currentSetName);

    let unlockedCount = 0;

    const cardW = 150;
    const cardH = 219;
    const cols = 5;
    const startX = 220;
    const gapX = 210;
    const gapY = 260;

    masterList.forEach((masterCard, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * gapX;
      const y = row * gapY;

      const isUnlocked = PlayerData.obtainedCardNames.includes(masterCard.name);
      const currentInventory = PlayerData.collection.find(
        (c) => c.name === masterCard.name
      );
      const isCurrentlyOwned = !!currentInventory;

      if (isUnlocked) unlockedCount++;

      const cardItem = this.add.container(x, y);

      if (isUnlocked) {
        let textureKey = masterCard.name;
        let img;
        if (!this.textures.exists(textureKey)) {
          const placeholder = this.add
            .sprite(0, 0, "card_back")
            .setDisplaySize(cardW, cardH);
          this.loadCardImageOnDemand(masterCard.name, placeholder);
          img = placeholder;
        } else {
          img = this.add.image(0, 0, textureKey).setDisplaySize(cardW, cardH);
        }

        img.setInteractive({ useHandCursor: true });
        img.on("pointerdown", () => {
          this.showZoom(masterCard.name);
        });

        if (!isCurrentlyOwned) {
          img.setTint(0x888888);
        }
        cardItem.add(img);
      } else {
        const cardBack = this.add
          .image(0, 0, "card_back")
          .setDisplaySize(cardW, cardH)
          .setTint(0x222222);
        const unknownText = this.add
          .text(0, 0, "?", {
            fontSize: "60px",
            color: "#ffffff",
            fontStyle: "bold",
          })
          .setOrigin(0.5);
        cardItem.add([cardBack, unknownText]);
      }

      const nameColor = isUnlocked ? "#ffffff" : "#555555";
      const nameTxt = this.add
        .text(0, 120, masterCard.name, {
          fontSize: "14px",
          align: "center",
          wordWrap: { width: 140 },
          color: nameColor,
        })
        .setOrigin(0.5, 0);
      cardItem.add(nameTxt);

      this.cardsContainer.add(cardItem);
    });

    const percentage = Math.floor((unlockedCount / masterList.length) * 100);
    this.progressText.setText(
      `Unlocked: ${unlockedCount} / ${masterList.length} (${percentage}%)`
    );

    const totalRows = Math.ceil(masterList.length / cols);
    const contentHeight = 320 + totalRows * gapY + 200;
    this.cameras.main.setBounds(0, 0, 1280, Math.max(720, contentHeight));
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
