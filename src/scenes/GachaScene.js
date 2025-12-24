import Phaser from "phaser";
import GachaSystem from "../systems/GachaSystem";
import Card from '../objects/Card';
import PlayerData from '../utils/PlayerData';

export default class GachaScene extends Phaser.Scene {
    constructor() {
        super("GachaScene");
        this.displayedCards = [];
        this.currentSet = null;
    }

    init(data) {
        // data.selectedSet dikirim dari ShopScene
        this.currentSet = data.selectedSet || null; 
        console.log("Scene Gacha dimulai untuk Set:", this.currentSet);
    }

    create() {
        // Init System dengan passing Scene ini
        this.gachaSystem = new GachaSystem(this);

        // 1. Tombol KEMBALI
        this.add.text(50, 50, "< KEMBALI", { fontSize: "24px", color: "#fff" })
            .setInteractive()
            .on("pointerdown", () => this.scene.start("MainMenuScene"));

        // 2. Tombol BUKA PACK
        const openBtn = this.add.text(640, 650, "BUKA PACK", {
                fontSize: "32px",
                backgroundColor: "#0f0",
                color: "#000",
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive();

        // 3. Teks Status
        this.statusText = this.add.text(640, 200, "Siap membuka pack...", {
                fontSize: "24px",
                color: "#ffffff",
                align: "center",
            }).setOrigin(0.5);

        const titleText = this.currentSet ? `Buka Pack: ${this.currentSet}` : "Buka Pack: Random";
        this.add.text(640, 100, titleText, { fontSize: '28px', color: '#ffff00' }).setOrigin(0.5);

        openBtn.on("pointerdown", () => {
            this.openPackVisual();
        });
    }

    openPackVisual() {
        // 1. Bersihkan kartu lama dari layar
        this.displayedCards.forEach((card) => card.destroy());
        this.displayedCards = [];

        // 2. Tarik Data Gacha
        const results = this.gachaSystem.openPack(5, this.currentSet);
        PlayerData.addCards(results);
        console.log("Mendapatkan kartu:", results);

        // Update status teks
        this.statusText.setText("Menyiapkan kartu...");
        
        let filesToLoad = 0;

        // 3. LOGIC DYNAMIC LOADING (Sinkron dengan Python)
        results.forEach((cardData) => {
            const textureKey = cardData.name; // Key texture tetap nama asli ("Blue-Eyes White Dragon")

            // Cek apakah texture ini SUDAH ada di memori Phaser?
            if (!this.textures.exists(textureKey)) {
                
                // --- PENTING: Logic ini harus sama dengan script Python ---
                // 1. Hapus simbol aneh (kecuali huruf, angka, spasi, strip)
                let cleanName = cardData.name.replace(/[^\w\s-]/gi, '');
                // 2. Ganti spasi dengan underscore
                cleanName = cleanName.replace(/ /g, '_');
                // 3. Tambah ekstensi .jpg
                const localFilename = `${cleanName}.jpg`;
                
                const localPath = `assets/cards/${localFilename}`;

                // Load file lokal
                this.load.image(textureKey, localPath);
                filesToLoad++;
            }
        });

        // 4. Tampilkan Kartu
        if (filesToLoad === 0) {
            // Jika semua gambar sudah di-load sebelumnya, langsung tampilkan
            this.displayCards(results);
        } else {
            // Jika ada download baru, tunggu sampai selesai ('complete')
            this.load.once('complete', () => {
                this.displayCards(results);
            });
            this.load.start(); // Jalankan loader
        }
    }

    displayCards(results) {
        this.statusText.setText("Silakan klik kartu!");
        
        const startX = 250;
        const gap = 200;

        results.forEach((cardData, index) => {
            // Kirim data lengkap ke object Card
            const card = new Card(this, startX + index * gap, 360, cardData);
            this.displayedCards.push(card);

            // Animasi Masuk
            card.y = 800;
            this.tweens.add({
                targets: card,
                y: 360,
                duration: 500,
                ease: "Back.out",
                delay: index * 100,
            });

            card.on("pointerdown", () => {
                card.flip();
            });
        });
    }
}