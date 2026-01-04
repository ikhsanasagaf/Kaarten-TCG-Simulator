import { ACHIEVEMENTS } from "../data/Achievements";

const SAVE_KEY = "kaarten_tcg_save_data_v6";

const PlayerData = {
  username: "Duelist",
  money: 50,
  level: 1, // Level akan otomatis di-update oleh sistem
  currentExp: 0,
  collection: [],
  obtainedCardNames: [],
  stats: {
    totalPacksOpened: 0,
    totalMoneySpent: 0,
  },
  unlockedAchievements: [],

  // --- FUNGSI BARU: HITUNG LEVEL OTOMATIS ---
  calculateLevel: function () {
    // Rumus: Setiap 10 kartu unik = Level naik 1
    return Math.floor(this.obtainedCardNames.length / 10) + 1;
  },

  load: function () {
    const savedString = localStorage.getItem(SAVE_KEY);
    if (savedString) {
      try {
        const savedData = JSON.parse(savedString);
        this.username = savedData.username || "Duelist";
        this.money = savedData.money !== undefined ? savedData.money : 50;
        this.currentExp = savedData.currentExp || 0;
        this.collection = savedData.collection || [];
        this.obtainedCardNames = savedData.obtainedCardNames || [];
        this.stats = savedData.stats || {
          totalPacksOpened: 0,
          totalMoneySpent: 0,
        };
        this.unlockedAchievements = savedData.unlockedAchievements || [];

        // Backward Compatibility
        if (this.obtainedCardNames.length === 0 && this.collection.length > 0) {
          this.collection.forEach((c) => {
            if (!this.obtainedCardNames.includes(c.name)) {
              this.obtainedCardNames.push(c.name);
            }
          });
        }

        // PERBAIKAN BUG: Hitung ulang level saat Load agar sinkron dengan progress
        this.level = this.calculateLevel();
      } catch (e) {
        console.error("[PlayerData] Gagal memuat save data:", e);
      }
    } else {
      this.save();
    }
  },

  save: function () {
    const dataToSave = {
      username: this.username,
      money: this.money,
      level: this.level, // Simpan level yang sudah terhitung
      currentExp: this.currentExp,
      collection: this.collection,
      obtainedCardNames: this.obtainedCardNames,
      stats: this.stats,
      unlockedAchievements: this.unlockedAchievements,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  },

  // --- FUNGSI HELPER UNTUK ACHIEVEMENT SCENE ---
  getAchievementProgress: function (type, target, totalGameCards = 0) {
    let current = 0;
    let max = target;

    switch (type) {
      case "PACKS_OPENED":
        current = this.stats.totalPacksOpened;
        break;
      case "MONEY_SPENT":
        current = this.stats.totalMoneySpent;
        break;
      case "COLLECTION_LEVEL":
        // Gunakan fungsi kalkulasi agar konsisten
        current = this.calculateLevel();
        break;
      case "SPECIFIC_CARD":
        max = 1;
        current = this.obtainedCardNames.includes(target) ? 1 : 0;
        break;
      case "FULL_COLLECTION":
        if (totalGameCards > 0) {
          current = Math.floor(
            (this.obtainedCardNames.length / totalGameCards) * 100
          );
        } else {
          current = 0;
        }
        break;
    }
    return { current, max };
  },

  trackPackOpened: function (quantity) {
    this.stats.totalPacksOpened += quantity;
    this.checkAchievements();
    this.save();
  },

  trackMoneySpent: function (amount) {
    this.stats.totalMoneySpent += amount;
    this.checkAchievements();
    this.save();
  },

  checkAchievements: function (gachaSystemInstance = null) {
    let newUnlock = false;

    // Gunakan fungsi kalkulasi agar konsisten
    const collectionLevel = this.calculateLevel();

    let completionRate = 0;
    if (gachaSystemInstance) {
      let totalCards = 0;
      const pools = gachaSystemInstance.cardPools;
      Object.keys(pools).forEach((r) => (totalCards += pools[r].length));
      completionRate =
        totalCards > 0
          ? Math.floor((this.obtainedCardNames.length / totalCards) * 100)
          : 0;
    }

    ACHIEVEMENTS.forEach((ach) => {
      if (this.unlockedAchievements.includes(ach.id)) return;

      let passed = false;
      switch (ach.type) {
        case "PACKS_OPENED":
          if (this.stats.totalPacksOpened >= ach.target) passed = true;
          break;
        case "MONEY_SPENT":
          if (this.stats.totalMoneySpent >= ach.target) passed = true;
          break;
        case "SPECIFIC_CARD":
          if (this.obtainedCardNames.includes(ach.target)) passed = true;
          break;
        case "COLLECTION_LEVEL":
          if (collectionLevel >= ach.target) passed = true;
          break;
        case "FULL_COLLECTION":
          if (completionRate >= ach.target) passed = true;
          break;
      }

      if (passed) {
        this.unlockedAchievements.push(ach.id);
        newUnlock = true;
        if (ach.reward > 0) {
          this.addMoney(ach.reward);
        }
        console.log(`ACHIEVEMENT UNLOCKED: ${ach.title} (+$${ach.reward})`);
      }
    });

    if (newUnlock) this.save();
  },

  getMoney: function () {
    return this.money;
  },

  addMoney: function (amount) {
    this.money = parseFloat((this.money + amount).toFixed(2));
    this.save();
  },

  spendMoney: function (amount) {
    if (this.money >= amount) {
      this.money = parseFloat((this.money - amount).toFixed(2));
      this.trackMoneySpent(amount);
      return true;
    }
    return false;
  },

  sellCard: function (cardName) {
    const cardIndex = this.collection.findIndex((c) => c.name === cardName);
    if (cardIndex !== -1) {
      const card = this.collection[cardIndex];
      card.count--;
      if (card.count <= 0) {
        this.collection.splice(cardIndex, 1);
      }
      const sellValue = card.price || 0.1;
      this.addMoney(sellValue);
      return true;
    }
    return false;
  },

  addCards: function (cardsArray) {
    cardsArray.forEach((newCard) => {
      const existingCard = this.collection.find((c) => c.name === newCard.name);
      if (existingCard) {
        existingCard.count = (existingCard.count || 1) + 1;
      } else {
        this.collection.push({
          name: newCard.name,
          rarity: newCard.rarity,
          set_name: newCard.set_name || "Unknown",
          price: newCard.price || 0,
          count: 1,
        });
      }
      if (!this.obtainedCardNames.includes(newCard.name)) {
        this.obtainedCardNames.push(newCard.name);
      }
    });

    // PERBAIKAN BUG: Update level setiap kali dapat kartu baru
    this.level = this.calculateLevel();

    this.checkAchievements();
    this.save();
  },

  getCollectionSize: function () {
    return this.collection.length;
  },
};

PlayerData.load();
export default PlayerData;
