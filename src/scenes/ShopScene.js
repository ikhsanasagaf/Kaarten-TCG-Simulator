import Phaser from "phaser";
import GachaSystem from "../systems/GachaSystem";
import PlayerData from "../utils/PlayerData";

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");

    // --- KONFIGURASI HARGA (Pack 1, 2, 3) ---
    this.packPrices = {
      "LEGEND OF BLUE EYES WHITE DRAGON": 10,
      "PHARAONIC GUARDIAN": 4,
      "INVASION OF CHAOS": 6,
    };

    this.defaultPrice = 5;
  }

  create() {
    const sys = new GachaSystem(this);
    const setList = sys.getSetList();

    // --- AUDIO ---
    this.sound.stopAll();
    this.sound.play('bgm_shop', { loop: true, volume: 0.5 });

    // --- BACKGROUND IMAGE ---
    const bg = this.add.image(640, 360, 'shop_bg');
    bg.setDisplaySize(1280, 720);
    bg.setDepth(-10);

    // --- HEADER UI (Glassmorphic Style) ---

    // 1. Translucent Header Bar (Glassmorphism)
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x000000, 0.4); // Semi-transparent black
    headerBg.fillRect(0, 0, 1280, 120);
    headerBg.setDepth(10);

    // Optional: Add subtle border at bottom
    headerBg.lineStyle(1, 0xffffff, 0.1);
    headerBg.lineBetween(0, 120, 1280, 120);

    // 2. Judul "SHOP" (Tengah)
    this.add
      .text(640, 60, "SHOP", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(11);

    // 3. Tombol Kembali (Kiri Atas - Rapi dengan Background)
    const backBtn = this.add
      .text(40, 60, "< BACK", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0, 0.5) // Anchor Kiri-Tengah
      .setInteractive({ useHandCursor: true })
      .setDepth(11);

    backBtn.on("pointerover", () =>
      backBtn.setStyle({ backgroundColor: "#555" })
    );
    backBtn.on("pointerout", () =>
      backBtn.setStyle({ backgroundColor: "#333" })
    );
    backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // 4. Tampilkan Uang Player (Kanan Atas)
    this.createMoneyDisplay();

    // --- LOGIKA LOAD PACK ---
    const packImageMap = {
      "LEGEND OF BLUE EYES WHITE DRAGON":
        "LEGEND_OF_BLUE_EYES_WHITE_DRAGON.png",
      "PHARAONIC GUARDIAN": "PHARAONIC_GUARDIAN.png",
      "INVASION OF CHAOS": "INVASION_OF_CHAOS.png",
    };

    let startX = 300;
    let filesToLoad = 0;

    // Load Assets
    setList.forEach((setName, index) => {
      const filename =
        packImageMap[setName] || setName.replace(/ /g, "_") + ".png";
      const fullPath = `assets/packs/${filename}`;
      const packKey = `pack_${index}`;

      if (!this.textures.exists(packKey)) {
        this.load.image(packKey, fullPath);
        filesToLoad++;
      }
    });

    // Create Buttons Callback
    const createButtons = () => {
      setList.forEach((setName, index) => {
        const packKey = `pack_${index}`;
        const price = this.packPrices[setName] || this.defaultPrice;

        if (this.textures.exists(packKey)) {
          this.createPackButton(
            startX + index * 350,
            360,
            packKey,
            setName,
            price
          );
        } else {
          this.createFallbackButton(startX + index * 350, 360, setName, price);
        }
      });
    };

    if (filesToLoad > 0) {
      this.load.once("complete", createButtons);
      this.load.start();
    } else {
      createButtons();
    }
  }

  createMoneyDisplay() {
    const currentMoney = PlayerData.getMoney();

    // Update posisi agar masuk ke dalam Header Bar (y: 60)
    this.moneyText = this.add
      .text(1230, 60, `Money: $${currentMoney}`, {
        fontSize: "30px",
        color: "#ffd700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5)
      .setDepth(11);
  }

  // --- LOGIKA TRANSAKSI ---
  attemptBuyPack(setName, price, packKey) {
    const isSuccess = PlayerData.spendMoney(price);

    if (isSuccess) {
      console.log(`[Shop] Sukses membeli ${setName} seharga $${price}`);
      this.moneyText.setText(`Money: $${PlayerData.getMoney()}`);
      this.scene.start("GachaScene", { selectedSet: setName, packKey: packKey });
    } else {
      console.log("[Shop] Uang tidak cukup!");
      this.tweens.add({
        targets: this.moneyText,
        x: this.moneyText.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onStart: () => this.moneyText.setColor("#ff0000"),
        onComplete: () => this.moneyText.setColor("#ffd700"),
      });
    }
  }

  // --- TOMBOL FALLBACK ---
  createFallbackButton(x, y, setName, price) {
    const container = this.add.container(x, y);
    const rect = this.add.rectangle(0, 0, 200, 300, 0x6600cc).setInteractive({ useHandCursor: true });

    const label = this.add
      .text(0, -50, "NO IMAGE", { fontSize: "24px" })
      .setOrigin(0.5);
    const nameText = this.add
      .text(0, 150, setName, {
        fontSize: "18px",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);

    const priceText = this.add
      .text(0, 180, `$${price}`, {
        fontSize: "24px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    container.add([rect, label, nameText, priceText]);

    rect.on("pointerdown", () => {
      this.attemptBuyPack(setName, price, null);
    });
  }

  // --- TOMBOL GAMBAR PACK ---
  createPackButton(x, y, key, setName, price) {
    const container = this.add.container(x, y);

    const img = this.add.image(0, 0, key).setInteractive({ useHandCursor: true });
    img.setDisplaySize(200, 300);

    const baseScaleX = img.scaleX;
    const baseScaleY = img.scaleY;

    const nameText = this.add
      .text(0, 170, setName, {
        fontSize: "16px",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5, 0);

    const priceText = this.add
      .text(0, 210, `$${price}`, {
        fontSize: "28px",
        color: "#00ff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    container.add([img, nameText, priceText]);

    img.on("pointerover", () => {
      this.tweens.killTweensOf(img);
      this.tweens.add({
        targets: img,
        scaleX: baseScaleX * 1.05,
        scaleY: baseScaleY * 1.05,
        duration: 100,
        ease: "Linear",
      });
    });

    img.on("pointerout", () => {
      this.tweens.killTweensOf(img);
      this.tweens.add({
        targets: img,
        scaleX: baseScaleX,
        scaleY: baseScaleY,
        duration: 100,
        ease: "Linear",
      });
    });

    img.on("pointerdown", () => {
      this.attemptBuyPack(setName, price, key);
    });
  }
}
