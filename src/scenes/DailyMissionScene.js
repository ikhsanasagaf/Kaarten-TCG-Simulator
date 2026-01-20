import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";
import { MISSION_TYPES } from "../data/MissionPool";

export default class DailyMissionScene extends Phaser.Scene {
  constructor() {
    super("DailyMissionScene");
  }

  create() {
    // --- 1. SETUP DATA ---
    // Kita tidak butuh gachaSystem di sini, cukup load data player
    PlayerData.load();

    // --- AUDIO ---
    let music = this.sound.get('bgm_main_menu');

    if (!music) {
      music = this.sound.add('bgm_main_menu', { loop: true, volume: 0.5 });
    }

    if (!music.isPlaying) {
      this.sound.stopAll();
      music.play();
    }

    // --- 2. CAMERA SCROLL (Sama persis dengan Achievement) ---
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      this.cameras.main.scrollY += deltaY * 0.5;
    });

    // --- 3. HEADER UI ---
    this.add
      .rectangle(640, 60, 1280, 120, 0x1a1a2e)
      .setScrollFactor(0)
      .setDepth(10);

    this.add
      .text(640, 60, "DAILY MISSIONS", {
        fontSize: "40px",
        fontStyle: "bold",
        color: "#fff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    // Teks Uang di Header (Agar player lihat uang nambah pas claim)
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

    PlayerData.dailyMissions.forEach((mission, index) => {
      const isFinished = mission.current >= mission.target;
      const isClaimed = mission.isClaimed;

      // Logic Clamp untuk Progress Bar & Text
      const displayCurrent = Math.min(mission.current, mission.target);
      let percent = mission.target > 0 ? mission.current / mission.target : 0;
      if (percent > 1) percent = 1;

      const y = startY + index * gapY;
      const itemContainer = this.add.container(startX, y);

      // --- 1. Background Box ---
      // Jika Claimed: Hijau Gelap (Mirip Achievement Unlocked)
      // Jika Belum: Abu Gelap
      const boxColor = isClaimed ? 0x224422 : 0x333333;
      const borderColor = isFinished || isClaimed ? 0x00ff00 : 0x555555;

      const bg = this.add
        .rectangle(0, 0, 900, 120, boxColor)
        .setStrokeStyle(2, borderColor);

      // --- 2. Icon (Dinamis sesuai tipe) ---
      let iconChar = "📜";
      if (mission.type === MISSION_TYPES.LOGIN) iconChar = "📅";
      if (mission.type === MISSION_TYPES.OPEN_PACK) iconChar = "📦";
      if (mission.type === MISSION_TYPES.GET_RARITY) iconChar = "✨";
      if (mission.type === MISSION_TYPES.SELL_CARD) iconChar = "💰";
      if (mission.type === MISSION_TYPES.EARN_MONEY) iconChar = "💵";

      // Jika sudah diklaim, ganti jadi Centang
      if (isClaimed) iconChar = "✅";

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
        .text(-350, -35, mission.title, {
          fontSize: "28px",
          fontStyle: "bold",
          color: titleColor,
        })
        .setOrigin(0, 0.5);

      const desc = this.add
        .text(-350, 0, mission.description, {
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

      const progressTxt = this.add
        .text(barX + barW + 15, barY, `${displayCurrent} / ${mission.target}`, {
          fontSize: "16px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);

      // --- 5. Status / Button (Kanan) ---
      // Ini bagian yang membedakan Misi dengan Achievement

      itemContainer.add([bg, icon, title, desc, barBg, barFill, progressTxt]);

      if (isClaimed) {
        // A. JIKA SUDAH DIKLAIM (Teks COMPLETED)
        const statusTxt = this.add
          .text(430, 0, "COMPLETED", {
            fontSize: "20px",
            fontStyle: "bold",
            color: "#00ff00",
          })
          .setOrigin(1, 0.5);
        itemContainer.add(statusTxt);
      } else if (isFinished) {
        // B. JIKA SELESAI TAPI BELUM KLAIM (Tombol CLAIM)
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

        // Efek Denyut
        this.tweens.add({
          targets: claimBtn,
          scale: 1.1,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });

        // Interaksi Klik Claim
        claimBtn.on("pointerdown", () => {
          const success = PlayerData.claimMissionReward(mission.id);
          if (success) {
            // Update Uang di Header
            this.moneyText.setText(`$${PlayerData.getMoney()}`);
            // Refresh List agar tombol berubah
            this.renderList();
          }
        });

        itemContainer.add(claimBtn);
      } else {
        // C. JIKA BELUM SELESAI (Info Reward)
        const rewardTxt = this.add
          .text(430, 0, `Reward: $${mission.reward}`, {
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
    const totalHeight = 160 + PlayerData.dailyMissions.length * gapY + 100;
    this.cameras.main.setBounds(0, 0, 1280, Math.max(720, totalHeight));
  }
}
