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

    // Rasio Foil Slot (Probabilitas dalam desimal)
    // 1 in 6 = ~0.166, 1 in 12 = ~0.083, 1 in 31 = ~0.032
    this.foilOdds = {
      [RARITY.SECRET_RARE]: 1 / 31,
      [RARITY.ULTRA_RARE]: 1 / 12,
      [RARITY.SUPER_RARE]: 1 / 6,
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

      // Asumsi Format CSV:
      // [0]Name, [1]Rarity, [2]Price, [3]Set, [4]Image
      const columns = line.split(",");

      const rawName = columns[0];
      const rawRarityStr = columns[1] ? columns[1].trim() : "";
      const rawPrice = columns[2] ? columns[2].trim() : "0"; // Ambil Harga
      const setName = columns[3] ? columns[3].trim() : "Unknown Set";
      const imageUrl = columns[4];

      if (!rawName || !rawRarityStr) continue;

      // Filter Data Sampah
      if (
        !setName ||
        setName === "Unknown Set" ||
        !isNaN(parseFloat(setName))
      ) {
        continue;
      }

      this.availableSets.add(setName);

      // Bersihkan format harga (misal "$2.50" -> 2.50)
      let price = parseFloat(rawPrice.replace(/[^0-9.]/g, ""));
      if (isNaN(price)) price = 0.1; // Default jika error

      // Mapping Rarity
      let gameRarity = RARITY.COMMON;
      if (rawRarityStr.includes("Secret")) gameRarity = RARITY.SECRET_RARE;
      else if (rawRarityStr.includes("Ultra")) gameRarity = RARITY.ULTRA_RARE;
      else if (rawRarityStr.includes("Super")) gameRarity = RARITY.SUPER_RARE;
      else if (rawRarityStr.includes("Rare")) gameRarity = RARITY.RARE;

      if (this.cardPools[gameRarity]) {
        this.cardPools[gameRarity].push({
          name: rawName,
          rarity: gameRarity,
          set_name: setName,
          price: price, // Simpan harga
          image: imageUrl,
        });
      }
    }
  }

  getSetList() {
    return Array.from(this.availableSets);
  }

  /**
   * Helper: Ambil kartu acak dari pool & set tertentu
   */
  getRandomCard(rarity, targetSet) {
    let pool = this.cardPools[rarity];

    // Filter by Set
    if (targetSet) {
      const filtered = pool.filter((c) => c.set_name === targetSet);
      if (filtered.length > 0) pool = filtered;
      else {
        // Fallback: Jika set ini tidak punya rarity tsb, ambil Common dari set yg sama
        pool = this.cardPools[RARITY.COMMON].filter(
          (c) => c.set_name === targetSet
        );
      }
    }

    if (!pool || pool.length === 0) {
      // Emergency Fallback jika pool benar-benar kosong
      return { name: "MissingNo", rarity: RARITY.COMMON, price: 0 };
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Buka Pack (Logic 9 Kartu Realistis)
   */
  openPack(amountIgnored, targetSet = null) {
    const results = [];

    // --- STRUKTUR PACK (Total 9 Kartu) ---

    // 1. 7 Kartu Guaranteed Common
    for (let i = 0; i < 7; i++) {
      results.push(this.getRandomCard(RARITY.COMMON, targetSet));
    }

    // 2. 1 Kartu Guaranteed Rare
    results.push(this.getRandomCard(RARITY.RARE, targetSet));

    // 3. 1 Kartu "Foil Slot" (Wildcard)
    // Cek RNG dari yang terlangka dulu (Waterfall logic)
    const rand = Math.random();

    if (rand < this.foilOdds[RARITY.SECRET_RARE]) {
      // Dapat Secret Rare (1 in 31)
      results.push(this.getRandomCard(RARITY.SECRET_RARE, targetSet));
    } else if (rand < this.foilOdds[RARITY.ULTRA_RARE]) {
      // Dapat Ultra Rare (1 in 12)
      results.push(this.getRandomCard(RARITY.ULTRA_RARE, targetSet));
    } else if (rand < this.foilOdds[RARITY.SUPER_RARE]) {
      // Dapat Super Rare (1 in 6)
      results.push(this.getRandomCard(RARITY.SUPER_RARE, targetSet));
    } else {
      // Apes, dapat Common lagi
      results.push(this.getRandomCard(RARITY.COMMON, targetSet));
    }

    return results;
  }
}
