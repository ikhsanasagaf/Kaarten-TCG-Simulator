import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // Lanjut ke Preload
        this.scene.start('PreloadScene');
    }
}