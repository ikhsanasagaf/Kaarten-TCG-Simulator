import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import ShopScene from './scenes/ShopScene';
import GachaScene from './scenes/GachaScene';
import CollectionScene from './scenes/CollectionScene';
import InventoryScene from './scenes/InventoryScene';
import ProfileScene from './scenes/ProfileScene';


// Konfigurasi Game
const config = {
    type: Phaser.AUTO, // Otomatis pilih WebGL atau Canvas
    width: 1280,       // Resolusi HD (Landscape)
    height: 720,
    parent: 'app',     // ID div di index.html
    backgroundColor: '#1a1a2e', // Warna background gelap (elegan)
    scale: {
        mode: Phaser.Scale.FIT, // Agar responsif di HP & PC [cite: 165]
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // Set true jika ingin melihat hitbox
        }
    },
    // Urutan Scene penting! Yang pertama diload duluan.
    scene: [
        BootScene,      
        PreloadScene,  
        MainMenuScene,  
        ShopScene,    
        GachaScene,     
        CollectionScene,
        InventoryScene,
        ProfileScene
    ]
};

Phaser.Loader.LoaderPlugin.prototype.crossOrigin = 'anonymous';
const game = new Phaser.Game(config);