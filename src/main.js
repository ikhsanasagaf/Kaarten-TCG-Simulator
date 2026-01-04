import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import MainMenuScene from "./scenes/MainMenuScene";
import ShopScene from "./scenes/ShopScene";
import GachaScene from "./scenes/GachaScene";
import CollectionScene from "./scenes/CollectionScene";
import InventoryScene from "./scenes/InventoryScene";
import ProfileScene from "./scenes/ProfileScene";

// Konfigurasi Game
const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "app",
  backgroundColor: "#1a1a2e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    ShopScene,
    GachaScene,
    CollectionScene,
    InventoryScene,
    ProfileScene,
  ],
};

Phaser.Loader.LoaderPlugin.prototype.crossOrigin = "anonymous";
const game = new Phaser.Game(config);
