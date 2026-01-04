import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import { ACHIEVEMENTS } from "../data/Achievements";
import GachaSystem from "../systems/GachaSystem";

export default class AchievementScene extends Phaser.Scene {
  constructor() {
    super("AchievementScene");
  }

  create() {
    this.gachaSystem = new GachaSystem(this);
    this.totalGameCards = 0;
    Object.keys(this.gachaSystem.cardPools).forEach((r) => {
      this.totalGameCards += this.gachaSystem.cardPools[r].length;
    });

    // --- CAMERA SCROLL ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- HEADER UI ---
    this.add
      .rectangle(640, 60, 1280, 120, 0x1a1a2e)
      .setScrollFactor(0)
      .setDepth(10);
    this.add
      .text(640, 60, "ACHIEVEMENTS", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    const backBtn = this.add
      .text(40, 60, "< BACK", {
        fontSize: "24px",
        backgroundColor: "#333",
        padding: { x: 15, y: 8 },
        color: "#fff",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11);

    backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // --- LIST CONTAINER ---
    this.listContainer = this.add.container(0, 160);
    this.renderList();
  }

  renderList() {
    const startX = 640;
    const startY = 70;
    const gapY = 140;

    ACHIEVEMENTS.forEach((ach, index) => {
      const isUnlocked = PlayerData.unlockedAchievements.includes(ach.id);
      const prog = PlayerData.getAchievementProgress(
        ach.type,
        ach.target,
        this.totalGameCards
      );
      let percent = prog.max > 0 ? prog.current / prog.max : 0;
      if (percent > 1) percent = 1;

      const y = startY + index * gapY;
      const itemContainer = this.add.container(startX, y);

      // 1. Background Box
      const boxColor = isUnlocked ? 0x224422 : 0x333333;
      const borderColor = isUnlocked ? 0x00ff00 : 0x555555;

      const bg = this.add
        .rectangle(0, 0, 900, 120, boxColor)
        .setStrokeStyle(2, borderColor);

      // --- PERBAIKAN POSISI ICON (UPDATE LAGI) ---
      // Y diubah dari 15 menjadi 30 agar benar-benar aman tidak terpotong.
      // Posisinya sekarang sejajar dengan progress bar.
      const iconText = isUnlocked ? "🏆" : "🔒";
      const icon = this.add
        .text(-400, 0, iconText, {
          fontSize: "40px",
          padding: { top: 20, bottom: 20 }, // MEMBERI RUANG EKSTRA ATAS-BAWAH
        })
        .setOrigin(0.5);

      // 3. Texts
      const titleColor = isUnlocked ? "#ffd700" : "#aaaaaa";
      const title = this.add
        .text(-350, -35, ach.title, {
          fontSize: "28px",
          fontStyle: "bold",
          color: titleColor,
        })
        .setOrigin(0, 0.5);

      const desc = this.add
        .text(-350, 0, ach.description, {
          fontSize: "18px",
          color: "#dddddd",
          fontStyle: "italic",
        })
        .setOrigin(0, 0.5);

      // 4. Progress Bar
      const barW = 350;
      const barH = 12;
      const barX = -350;
      const barY = 30;

      const barBg = this.add
        .rectangle(barX, barY, barW, barH, 0x000000)
        .setOrigin(0, 0.5);

      const fillColor = isUnlocked ? 0x00ff00 : 0x00aaff;
      const fillW = barW * percent;
      const barFill = this.add
        .rectangle(barX, barY, fillW, barH, fillColor)
        .setOrigin(0, 0.5);

      const progressTextStr =
        ach.type === "SPECIFIC_CARD"
          ? isUnlocked
            ? "Obtained"
            : "Not Obtained"
          : `${prog.current} / ${prog.max}`;

      const progressTxt = this.add
        .text(barX + barW + 15, barY, progressTextStr, {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      // 5. Status & Reward (Kanan)
      const statusString = isUnlocked ? "COMPLETED" : "LOCKED";
      const statusColor = isUnlocked ? "#00ff00" : "#ff4444";

      const statusTxt = this.add
        .text(430, -20, statusString, {
          fontSize: "20px",
          fontStyle: "bold",
          color: statusColor,
        })
        .setOrigin(1, 0.5); // Rata Kanan

      const rewardTxt = this.add
        .text(430, 20, `Reward: $${ach.reward}`, {
          fontSize: "18px",
          color: "#ffff00",
        })
        .setOrigin(1, 0.5); // Rata Kanan

      itemContainer.add([
        bg,
        icon,
        title,
        desc,
        statusTxt,
        rewardTxt,
        barBg,
        barFill,
        progressTxt,
      ]);
      this.listContainer.add(itemContainer);
    });

    const totalHeight = 160 + ACHIEVEMENTS.length * gapY + 100;
    this.cameras.main.setBounds(0, 0, 1280, Math.max(720, totalHeight));
  }
}
