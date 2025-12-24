import Phaser from "phaser";
import GachaSystem from "../systems/GachaSystem";

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
  }

  create() {
    const sys = new GachaSystem(this);
    const setList = sys.getSetList();

    this.add
      .text(640, 50, "SHOP - PILIH PACK", {
        fontSize: "40px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const packImageMap = {
      "LEGEND OF BLUE EYES WHITE DRAGON":
        "LEGEND_OF_BLUE_EYES_WHITE_DRAGON.png",
      "PHARAONIC GUARDIAN": "PHARAONIC_GUARDIAN.png",
      "INVASION OF CHAOS": "INVASION_OF_CHAOS.png",
    };

    let startX = 300;
    let filesToLoad = 0;

    setList.forEach((setName, index) => {
      // 1. Tentukan Nama File
      // Jika ada di kamus map, pakai itu. Jika tidak, pakai cara otomatis (spasi jadi underscore)
      const filename =
        packImageMap[setName] || setName.replace(/ /g, "_") + ".png";
      const fullPath = `assets/packs/${filename}`;
      const packKey = `pack_${index}`;

      console.log(`[Shop] Set: "${setName}" -> Mencari gambar: "${fullPath}"`);

      // 2. Cek apakah texture sudah ada?
      if (!this.textures.exists(packKey)) {
        this.load.image(packKey, fullPath);
        filesToLoad++;
      }
    });

    // 3. Fungsi membuat tombol (dijalankan setelah load selesai atau langsung)
    const createButtons = () => {
      setList.forEach((setName, index) => {
        const packKey = `pack_${index}`;
        // Cek lagi apakah texture berhasil di-load?
        if (this.textures.exists(packKey)) {
          this.createPackButton(startX + index * 350, 360, packKey, setName);
        } else {
          // FALLBACK: Jika gambar gagal load (masih 404), buat Kotak Warna saja
          // Supaya tidak muncul gambar silang
          this.createFallbackButton(startX + index * 350, 360, setName);
        }
      });
    };

    if (filesToLoad > 0) {
      this.load.once("complete", createButtons);
      this.load.start();
    } else {
      createButtons();
    }

    // Tombol Kembali
    this.add
      .text(50, 50, "< BACK", { fontSize: "24px" })
      .setInteractive()
      .on("pointerdown", () => this.scene.start("MainMenuScene"));
  }

  // Fungsi tambahan untuk menangani gambar yang hilang (Fallback)
  createFallbackButton(x, y, setName) {
    const container = this.add.container(x, y);

    // Buat Kotak Ungu sebagai pengganti gambar
    const rect = this.add.rectangle(0, 0, 200, 300, 0x6600cc).setInteractive();
    const label = this.add
      .text(0, 0, "NO IMAGE", { fontSize: "24px" })
      .setOrigin(0.5);

    const text = this.add
      .text(0, 180, setName, {
        fontSize: "20px",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);

    container.add([rect, label, text]);

    rect.on("pointerdown", () => {
      console.log(`Memilih set (Fallback): ${setName}`);
      this.scene.start("GachaScene", { selectedSet: setName });
    });
  }

  createPackButton(x, y, key, setName) {
    const container = this.add.container(x, y); // Gambar Pack

    const img = this.add.image(0, 0, key).setInteractive(); // 1. Atur ukuran visual pack
    img.setDisplaySize(200, 300); // 2. SIMPAN skala hasil kalkulasi setDisplaySize

    // Ini penting karena kita tidak tahu nilai aslinya berapa (bisa 0.5, 0.2, dll)
    const baseScaleX = img.scaleX;
    const baseScaleY = img.scaleY; // Teks Nama Set

    const text = this.add
      .text(0, 180, setName, {
        fontSize: "20px",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);

    container.add([img, text]); // 3. Efek Hover menggunakan TWEEN (Animasi Halus)

    img.on("pointerover", () => {
      // Hentikan tween sebelumnya jika ada biar gak tumpang tindih
      this.tweens.killTweensOf(img);

      this.tweens.add({
        targets: img,
        scaleX: baseScaleX * 1.1, // Membesar 10% dari skala base
        scaleY: baseScaleY * 1.1,
        duration: 100, // Durasi animasi dalam milidetik
        ease: "Linear",
      });
    });

    img.on("pointerout", () => {
      this.tweens.killTweensOf(img);

      this.tweens.add({
        targets: img,
        scaleX: baseScaleX, // Kembali ke skala base (sesuai ukuran 200x300)
        scaleY: baseScaleY,
        duration: 100,
        ease: "Linear",
      });
    }); // KLIK: Masuk ke GachaScene dengan membawa DATA SET

    img.on("pointerdown", () => {
      console.log(`Memilih set: ${setName}`);
      this.scene.start("GachaScene", { selectedSet: setName });
    });
  }
}
