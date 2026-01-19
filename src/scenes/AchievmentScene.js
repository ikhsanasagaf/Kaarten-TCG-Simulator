import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import { ACHIEVEMENTS } from "../data/Achievements";
import GachaSystem from "../systems/GachaSystem";

export default class AchievementScene extends Phaser.Scene {
  constructor() {
    super("AchievementScene");
  }

  create() {
    // --- 1. SETUP DATA ---
    this.gachaSystem = new GachaSystem(this);
    this.totalGameCards = 0;

    // Hitung total kartu dalam game untuk achievement progress
    Object.keys(this.gachaSystem.cardPools).forEach((r) => {
      this.totalGameCards += this.gachaSystem.cardPools[r].length;
    });

    // --- AUDIO ---
    this.sound.stopAll();
    this.sound.play('bgm_achievement', { loop: true, volume: 0.5 });

    // --- 2. CAMERA SCROLL ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- 3. HEADER UI ---
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

    // Teks Uang di Header
    this.moneyText = this.add
      .text(1230, 60, `$${PlayerData.getMoney()}`, {
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
        color: "#fff",
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(11);

    backBtn.on("pointerdown", () => this.scene.start("MainMenuScene"));

    // --- 4. LIST CONTAINER ---
    this.listContainer = this.add.container(0, 160);
    this.renderList();
  }

  renderList() {
    // Bersihkan container jika me-render ulang (setelah claim)
    this.listContainer.removeAll(true);

    const startX = 640;
    const startY = 70;
    const gapY = 140;

    ACHIEVEMENTS.forEach((ach, index) => {
      // Ambil data progress Achievement
      const prog = PlayerData.getAchievementProgress(
        ach.type,
        ach.target,
        this.totalGameCards
      );

      const isClaimed = PlayerData.unlockedAchievements.includes(ach.id);
      const isFinished = prog.current >= prog.max;

      // Logic Clamp untuk Progress Bar & Text
      const displayCurrent = Math.min(prog.current, prog.max);
      let percent = prog.max > 0 ? prog.current / prog.max : 0;
      if (percent > 1) percent = 1;

      const y = startY + index * gapY;
      const itemContainer = this.add.container(startX, y);

      // --- 1. Background Box ---
      // Jika Claimed: Hijau Gelap, Jika Belum: Abu Gelap
      const boxColor = isClaimed ? 0x224422 : 0x333333;
      const borderColor = isFinished || isClaimed ? 0x00ff00 : 0x555555;

      const bg = this.add
        .rectangle(0, 0, 900, 120, boxColor)
        .setStrokeStyle(2, borderColor);

      // --- 2. Icon ---
      // Achievement biasanya pakai Trophy (Selesai) atau Gembok (Belum)
      let iconChar = "🔒";
      if (isFinished) iconChar = "🏆";
      if (isClaimed) iconChar = "✅"; // Mengikuti gaya 'Centang' jika sudah diklaim

      const icon = this.add
        .text(-400, 0, iconChar, {
          fontSize: "40px",
          padding: { top: 20, bottom: 20 },
        })
        .setOrigin(0.5);

      // --- 3. Texts (Title & Desc) ---
      // Warna Judul: Emas jika selesai/diklaim, Abu jika belum
      const titleColor = isFinished || isClaimed ? "#ffd700" : "#aaaaaa";

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

      // --- 4. Progress Bar ---
      const barW = 350;
      const barH = 12;
      const barX = -350;
      const barY = 30;

      const barBg = this.add
        .rectangle(barX, barY, barW, barH, 0x000000)
        .setOrigin(0, 0.5);

      // Warna Bar: Hijau jika selesai, Biru jika progress
      const fillColor = isFinished ? 0x00ff00 : 0x00aaff;
      const fillW = barW * percent;

      const barFill = this.add
        .rectangle(barX, barY, fillW, barH, fillColor)
        .setOrigin(0, 0.5);

      // Text angka progress
      const progressTextStr =
        ach.type === "SPECIFIC_CARD"
          ? isFinished || isClaimed
            ? "Obtained"
            : "Not Obtained"
          : `${displayCurrent} / ${prog.max}`;

      const progressTxt = this.add
        .text(barX + barW + 15, barY, progressTextStr, {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      // --- 5. Status / Button (Kanan) ---

      itemContainer.add([bg, icon, title, desc, barBg, barFill, progressTxt]);

      if (isClaimed) {
        // A. SUDAH DIKLAIM -> Teks COMPLETED
        const statusTxt = this.add
          .text(430, 0, "COMPLETED", {
            fontSize: "20px",
            fontStyle: "bold",
            color: "#00ff00",
          })
          .setOrigin(1, 0.5);
        itemContainer.add(statusTxt);
      } else if (isFinished) {
        // B. SIAP KLAIM -> Tombol CLAIM
        const claimBtn = this.add
          .text(430, 0, " CLAIM ", {
            fontSize: "22px",
            color: "#000000",
            backgroundColor: "#ffff00", // Kuning
            padding: { x: 15, y: 8 },
            fontStyle: "bold",
          })
          .setOrigin(1, 0.5)
          .setInteractive({ useHandCursor: true });

        // Animasi Denyut
        this.tweens.add({
          targets: claimBtn,
          scale: 1.1,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });

        // Interaksi Klik Claim
        claimBtn.on("pointerdown", () => {
          const success = PlayerData.claimAchievement(ach.id);
          if (success) {
            this.moneyText.setText(`$${PlayerData.getMoney()}`);
            this.renderList();
          }
        });

        itemContainer.add(claimBtn);
      } else {
        // C. BELUM SELESAI -> Info Reward (Tanpa tulisan Locked)
        const rewardTxt = this.add
          .text(430, 0, `Reward: $${ach.reward}`, {
            fontSize: "20px",
            color: "#ffff00",
            fontStyle: "bold",
          })
          .setOrigin(1, 0.5);

        itemContainer.add([rewardTxt]);
      }

      this.listContainer.add(itemContainer);
    });

    // Set Bounds Camera sesuai panjang list
    const totalHeight = 160 + ACHIEVEMENTS.length * gapY + 100;
    this.cameras.main.setBounds(0, 0, 1280, Math.max(720, totalHeight));
  }
}
