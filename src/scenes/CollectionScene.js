import Phaser from 'phaser';
import PlayerData from '../utils/PlayerData';
import Card from '../objects/Card'; // Kita pakai ulang object Card yang canggih itu

export default class CollectionScene extends Phaser.Scene {
    constructor() {
        super('CollectionScene');
    }

    create() {
        // Background
        this.add.rectangle(640, 360, 1280, 720, 0x222222);
        
        // Judul
        this.add.text(640, 50, 'MY COLLECTION', { fontSize: '40px', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(640, 90, `Total Kartu Unik: ${PlayerData.collection.length}`, { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0.5);

        // Tombol Kembali
        this.add.text(50, 50, '< BACK', { fontSize: '24px' })
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainMenuScene'));

        // --- GRID LAYOUT KARTU ---
        this.displayCollection();
    }

    displayCollection() {
        // Config Grid
        const startX = 140;
        const startY = 200;
        const colGap = 160; // Jarak horizontal
        const rowGap = 240; // Jarak vertikal
        const cols = 7;     // Jumlah kartu per baris

        // Ambil data dari PlayerData
        const myCards = PlayerData.collection;

        if (myCards.length === 0) {
            this.add.text(640, 360, "Belum ada kartu.\nPergi ke Shop untuk Gacha!", { 
                align: 'center', fontSize: '30px', color: '#888' 
            }).setOrigin(0.5);
            return;
        }

        myCards.forEach((data, index) => {
            // Hitung posisi baris & kolom
            const col = index % cols;
            const row = Math.floor(index / cols);

            const x = startX + (col * colGap);
            const y = startY + (row * rowGap);

            // Tampilkan Kartu (Kecil)
            // Kita pakai object Card tapi kita matikan fitur flip animasinya
            const card = this.add.sprite(x, y, data.name);
            
            // Cek texture (safety)
            if (!this.textures.exists(data.name)) {
                // Jika gambar belum di-load (karena ini scene baru), pakai card_back dulu
                // Note: Idealnya di Collection kita load ulang atau pakai placeholder
                card.setTexture('card_back'); 
                
                // Logic load on demand untuk collection (Opsional tingkat lanjut)
                this.loadCardImageOnDemand(data.name, card);
            } else {
                card.setDisplaySize(140, 200);
            }
            
            card.setDisplaySize(100, 146); // Ukuran Thumbnail (lebih kecil dari Gacha)

            // Tampilkan Jumlah (x2, x3 dst)
            if (data.count > 1) {
                this.add.text(x + 30, y + 50, `x${data.count}`, {
                    fontSize: '16px', backgroundColor: '#000', padding: { x:4, y:2 }
                }).setOrigin(0.5);
            }
        });
    }

    // Helper untuk load gambar di collection jika belum ada di cache
    loadCardImageOnDemand(cardName, spriteObj) {
        let cleanName = cardName.replace(/[^\w\s-]/gi, '').replace(/ /g, '_');
        const localPath = `assets/cards/${cleanName}.jpg`;
        
        this.load.image(cardName, localPath);
        this.load.once('complete', () => {
            spriteObj.setTexture(cardName);
            spriteObj.setDisplaySize(100, 146);
        });
        this.load.start();
    }
}