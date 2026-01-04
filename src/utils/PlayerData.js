const SAVE_KEY = "kaarten_tcg_save_data_v3"; // Ganti versi agar save data bersih

const PlayerData = {
  username: "Duelist",
  money: 50,
  level: 1,
  currentExp: 0,

  // Inventory saat ini (bisa berkurang jika dijual)
  collection: [],

  // RIWAYAT BARU: Daftar nama kartu yang PERNAH didapatkan (tidak bisa hilang)
  obtainedCardNames: [],

  load: function () {
    const savedString = localStorage.getItem(SAVE_KEY);
    if (savedString) {
      try {
        const savedData = JSON.parse(savedString);
        this.username = savedData.username || "Duelist";
        this.money = savedData.money !== undefined ? savedData.money : 50;
        this.level = savedData.level || 1;
        this.currentExp = savedData.currentExp || 0;
        this.collection = savedData.collection || [];

        // Load riwayat, atau inisialisasi dari collection yang ada (Backward Compatibility)
        this.obtainedCardNames = savedData.obtainedCardNames || [];

        // Jika save lama belum punya obtainedCardNames, kita isi dari inventory yang ada
        if (this.obtainedCardNames.length === 0 && this.collection.length > 0) {
          this.collection.forEach((c) => {
            if (!this.obtainedCardNames.includes(c.name)) {
              this.obtainedCardNames.push(c.name);
            }
          });
        }
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
      level: this.level,
      currentExp: this.currentExp,
      collection: this.collection,
      obtainedCardNames: this.obtainedCardNames, // Simpan riwayat
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
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
      this.save();
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

      // CATATAN: Kita TIDAK menghapus dari obtainedCardNames saat menjual
      return true;
    }
    return false;
  },

  addCards: function (cardsArray) {
    cardsArray.forEach((newCard) => {
      // 1. Tambah ke Inventory (untuk dijual/deck)
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

      // 2. Tambah ke Riwayat Album (Jika belum pernah dapat)
      if (!this.obtainedCardNames.includes(newCard.name)) {
        this.obtainedCardNames.push(newCard.name);
      }
    });
    this.save();
  },

  getCollectionSize: function () {
    return this.collection.length;
  },
};

PlayerData.load();
export default PlayerData;
