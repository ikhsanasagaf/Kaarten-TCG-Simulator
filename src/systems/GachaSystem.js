import Phaser from "phaser";

export const RARITY = {
  COMMON: "Common",
  RARE: "Rare",
  SUPER_RARE: "Super Rare",
  ULTRA_RARE: "Ultra Rare",
  SECRET_RARE: "Secret Rare",
};

export default class GachaSystem {
  constructor(scene) {
    this.scene = scene;

    this.cardPools = {
      [RARITY.COMMON]: [],
      [RARITY.RARE]: [],
      [RARITY.SUPER_RARE]: [],
      [RARITY.ULTRA_RARE]: [],
      [RARITY.SECRET_RARE]: [],
    };

    // Konfigurasi Drop Rate (Total 100%)
    this.rates = {
      [RARITY.COMMON]: 55,
      [RARITY.RARE]: 25,
      [RARITY.SUPER_RARE]: 12,
      [RARITY.ULTRA_RARE]: 6,
      [RARITY.SECRET_RARE]: 2,
    };

    this.processCSVData();
  }

  processCSVData() {
    const csvData = this.scene.cache.text.get("cardData");
    if (!csvData) return;

    const lines = csvData.split("\n");
    this.availableSets = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const columns = line.split(",");

      const rawName = columns[0];
      const rawRarityStr = columns[1] ? columns[1].trim() : "";
      const setName = columns[3] ? columns[3].trim() : "Unknown Set";
      const imageUrl = columns[4];

      if (!rawName || !rawRarityStr) continue;

      // --- PERBAIKAN DI SINI: FILTER SET ---

      // 1. Cek apakah setName kosong?
      if (!setName || setName === "Unknown Set") continue;

      // 2. Cek apakah setName adalah ANGKA (seperti "0.12")?
      // isNaN(parseFloat("0.12")) -> false (artinya itu angka)
      // isNaN(parseFloat("Metal Raiders")) -> true (artinya itu teks)
      if (!isNaN(parseFloat(setName))) {
        // Jika itu angka, berarti salah kolom (itu harga), jadi kita SKIP
        continue;
      }

      // Jika lolos filter, simpan ke daftar set
      this.availableSets.add(setName);

      // ... (Logic Mapping Rarity SAMA SEPERTI SEBELUMNYA) ...
      // Copy logic if/else rarity dari kode terakhir Anda di sini
      let gameRarity = RARITY.COMMON;
      if (rawRarityStr.includes("Secret")) gameRarity = RARITY.SECRET_RARE;
      else if (rawRarityStr.includes("Ultra")) gameRarity = RARITY.ULTRA_RARE;
      else if (rawRarityStr.includes("Super")) gameRarity = RARITY.SUPER_RARE;
      else if (rawRarityStr.includes("Rare")) gameRarity = RARITY.RARE;

      // MASUKKAN KE POOL (Update: Tambahkan property set_name)
      if (this.cardPools[gameRarity]) {
        this.cardPools[gameRarity].push({
          name: rawName,
          rarity: gameRarity,
          set_name: setName, // <--- TAMBAHAN PENTING
          image: imageUrl,
        });
      }
    }
  }

  /**
   * Ambil daftar nama set unik untuk ditampilkan di Shop
   */
  getSetList() {
    return Array.from(this.availableSets);
  }

  /**
   * Buka Pack dengan Filter Set Tertentu
   */
  openPack(amount = 5, targetSet = null) {
    const results = [];
    const tiers = [
      RARITY.COMMON,
      RARITY.RARE,
      RARITY.SUPER_RARE,
      RARITY.ULTRA_RARE,
      RARITY.SECRET_RARE,
    ];

    for (let i = 0; i < amount; i++) {
      const rand = Math.random() * 100;
      let selectedRarity = RARITY.COMMON;
      let cumulative = 0;

      for (const tier of tiers) {
        cumulative += this.rates[tier];
        if (rand <= cumulative) {
          selectedRarity = tier;
          break;
        }
      }

      // AMBIL POOL AWAL
      let pool = this.cardPools[selectedRarity];

      // FILTER BERDASARKAN SET (Jika targetSet dipilih)
      if (targetSet) {
        const filteredPool = pool.filter((card) => card.set_name === targetSet);

        // Jika hasil filter ada isinya, pakai itu.
        // Jika kosong (misal: Set ini tidak punya Secret Rare), kembali ke pool umum atau turunkan rarity.
        if (filteredPool.length > 0) {
          pool = filteredPool;
        } else {
          // Fallback cerdas: Jika set ini tidak punya rarity terpilih,
          // paksa ambil Common dari set yang sama
          pool = this.cardPools[RARITY.COMMON].filter(
            (card) => card.set_name === targetSet
          );
        }
      }

      if (pool.length > 0) {
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        results.push(randomCard);
      } else {
        results.push({ name: "Error Card", rarity: RARITY.COMMON });
      }
    }
    return results;
  }
}
