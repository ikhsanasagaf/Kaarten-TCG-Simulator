import Phaser from "phaser";
import PlayerData from "../utils/PlayerData";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    // --- 1. LOGIK MISI HARIAN ---
    PlayerData.load();
    PlayerData.checkDailyLogin();

    // --- 1.5. AUDIO BACKGROUND ---
    let music = this.sound.get('bgm_main_menu');

    // Jika belum ada instance sama sekali, buat baru
    if (!music) {
      music = this.sound.add('bgm_main_menu', { loop: true, volume: 0.5 });
    }

    if (music.isPlaying) {
      // Jika sedang main, biarkan (Seamless)
    } else {
      // Jika tidak main (mungkin baru balik dari Shop), stop lagu lain dan mainkan ini
      this.sound.stopAll();
      music.play();
    }

    // --- 2. BACKGROUND IMAGE ---
    const bg = this.add.image(640, 360, 'main_menu_bg');
    bg.setDisplaySize(1280, 720);
    bg.setDepth(-10);

    // --- 3. BACKGROUND PARTICLES ---
    this.createBackgroundParticles();

    // --- 4. ANIMATED TITLE ---
    const title = this.add
      .text(640, 80, "KAARTEN", {
        fontSize: "72px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#4a0080",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Title floating animation
    this.tweens.add({
      targets: title,
      y: 70,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Title scale pulse
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- 5. MENU BUTTONS WITH STAGGERED ENTRANCE ---
    const startY = 240;
    const gapY = 80;
    const buttons = [];

    const buttonConfigs = [
      { text: "Shop", callback: () => this.scene.start("ShopScene") },
      { text: "Achievements", callback: () => this.scene.start("AchievementScene") },
      { text: "Inventory", callback: () => this.scene.start("InventoryScene") },
      { text: "Collection", callback: () => this.scene.start("CollectionScene") },
      { text: "Profile", callback: () => this.scene.start("ProfileScene") }
    ];

    buttonConfigs.forEach((config, index) => {
      const btn = this.createAnimatedMenuButton(
        640,
        startY + index * gapY,
        config.text,
        config.callback,
        index
      );
      buttons.push(btn);
    });

    // --- 6. ENHANCED MISSION BUTTON ---
    this.createEnhancedMissionButton();
  }

  createBackgroundParticles() {
    const symbols = ['♠', '♥', '♦', '♣', '✨'];

    for (let i = 0; i < 15; i++) {
      const symbol = Phaser.Utils.Array.GetRandom(symbols);
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 720);

      const particle = this.add.text(x, y, symbol, {
        fontSize: '24px',
        color: '#ffffff',
        alpha: 0.15
      }).setDepth(-5);

      // Floating animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(8000, 15000),
        ease: 'Linear',
        repeat: -1,
        onRepeat: () => {
          particle.y = 720 + 50;
          particle.x = Phaser.Math.Between(0, 1280);
          particle.alpha = 0.15;
        }
      });

      // Gentle sway
      this.tweens.add({
        targets: particle,
        x: `+=${Phaser.Math.Between(-30, 30)}`,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createAnimatedMenuButton(x, y, text, callback, index) {
    // Container for button
    const btnContainer = this.add.container(x, y + 50);
    btnContainer.setAlpha(0).setDepth(10);

    // Glassmorphic background (semi-transparent with border)
    const bgWidth = 280;
    const bgHeight = 60;

    const glassBackground = this.add.graphics();
    glassBackground.fillStyle(0x000000, 0.3); // Dark translucent
    glassBackground.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

    // Border glow
    glassBackground.lineStyle(2, 0x00ff88, 0.8);
    glassBackground.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

    // Inner subtle highlight (top edge for glass effect)
    const highlight = this.add.graphics();
    highlight.lineStyle(1, 0xffffff, 0.2);
    highlight.strokeRoundedRect(-bgWidth / 2 + 2, -bgHeight / 2 + 2, bgWidth - 4, bgHeight / 2, 12);

    // Button text
    const btnText = this.add
      .text(0, 0, text, {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#00ff88",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Add all to container
    btnContainer.add([glassBackground, highlight, btnText]);
    btnContainer.setSize(bgWidth, bgHeight);
    btnContainer.setInteractive({ useHandCursor: true });

    // Staggered entrance animation
    this.tweens.add({
      targets: btnContainer,
      y: y,
      alpha: 1,
      duration: 600,
      delay: index * 100,
      ease: 'Back.easeOut'
    });

    // Idle subtle pulse
    this.tweens.add({
      targets: btnContainer,
      scale: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: index * 200
    });

    // Hover effects
    btnContainer.on("pointerover", () => {
      // Redraw with brighter glow
      glassBackground.clear();
      glassBackground.fillStyle(0x00ff88, 0.2); // Brighter on hover
      glassBackground.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
      glassBackground.lineStyle(3, 0x00ff88, 1); // Thicker, brighter border
      glassBackground.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

      btnText.setStyle({ color: "#ffffff" });

      this.tweens.add({
        targets: btnContainer,
        scale: 1.1,
        duration: 200,
        ease: 'Back.easeOut'
      });

      // Add glow effect
      this.tweens.add({
        targets: glassBackground,
        alpha: 1.2,
        duration: 200,
        yoyo: true,
        repeat: 0
      });
    });

    btnContainer.on("pointerout", () => {
      // Restore original style
      glassBackground.clear();
      glassBackground.fillStyle(0x000000, 0.3);
      glassBackground.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
      glassBackground.lineStyle(2, 0x00ff88, 0.8);
      glassBackground.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

      btnText.setStyle({ color: "#00ff88" });

      this.tweens.add({
        targets: btnContainer,
        scale: 1,
        duration: 200,
        ease: 'Back.easeIn'
      });
    });

    btnContainer.on("pointerdown", () => {
      // Click animation
      this.tweens.add({
        targets: btnContainer,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: callback
      });
    });

    return btnContainer;
  }

  createEnhancedMissionButton() {
    const floatX = 1180;
    const floatY = 250;

    const missionBtnContainer = this.add.container(floatX, floatY);
    missionBtnContainer.setScrollFactor(0).setDepth(100);

    // Background
    const calendarBg = this.add
      .rectangle(0, 10, 80, 90, 0xffffff)
      .setStrokeStyle(3, 0x333333);

    // Header
    const calendarHeader = this.add.rectangle(0, -35, 80, 25, 0xff4444);

    // Text
    const headerText = this.add
      .text(0, -35, "MISSION", {
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Icon
    const bodyIcon = this.add
      .text(0, 15, "📜", {
        fontSize: "35px",
      })
      .setOrigin(0.5);

    missionBtnContainer.add([calendarBg, calendarHeader, headerText, bodyIcon]);

    // Idle bobbing animation
    this.tweens.add({
      targets: missionBtnContainer,
      y: floatY - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Check if there are claimable missions
    const hasClaimable = PlayerData.dailyMissions.some(m =>
      m.current >= m.target && !m.isClaimed
    );

    if (hasClaimable) {
      // Add notification badge
      const badge = this.add.circle(35, -30, 8, 0xff0000);
      const badgeText = this.add.text(35, -30, '!', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);

      missionBtnContainer.add([badge, badgeText]);

      // Pulsing glow effect
      this.tweens.add({
        targets: calendarBg,
        alpha: 0.7,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }

    // Interactions
    calendarBg.setInteractive({ useHandCursor: true });

    calendarBg.on("pointerdown", () => {
      this.scene.start("DailyMissionScene");
    });

    calendarBg.on("pointerover", () => {
      this.tweens.add({
        targets: missionBtnContainer,
        scale: 1.15,
        rotation: 0.05,
        duration: 150,
        ease: "Back.easeOut",
      });
    });

    calendarBg.on("pointerout", () => {
      this.tweens.add({
        targets: missionBtnContainer,
        scale: 1,
        rotation: 0,
        duration: 150,
        ease: "Back.easeIn",
      });
    });
  }
}
