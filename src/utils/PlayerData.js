import { ACHIEVEMENTS } from "../data/Achievements";
import { MISSION_POOL, MISSION_TYPES } from "../data/MissionPool";

const SAVE_KEY = "kaarten_tcg_save_data_v6";

const PlayerData = {
  username: "Duelist",
  money: 20,
  level: 1,
  currentExp: 0,
  collection: [],
  obtainedCardNames: [],
  stats: {
    totalPacksOpened: 0,
    totalMoneySpent: 0,
  },
  unlockedAchievements: [],
  dailyMissions: [],
  lastLoginDate: null,

  // --- FUNGSI HITUNG LEVEL OTOMATIS ---
  calculateLevel: function () {
    // Rumus: Setiap 10 kartu unik = Level naik 1
    return Math.floor(this.obtainedCardNames.length / 10) + 1;
  },

  checkDailyLogin: function () {
    const today = new Date().toDateString();

    if (this.lastLoginDate !== today) {
      console.log("Hari baru! Reset Misi Harian...");
      this.lastLoginDate = today;
      this.generateDailyMissions();

      // Otomatis progress misi login jadi 1/1
      this.updateMissionProgress(MISSION_TYPES.LOGIN, 1);
    }
  },

  // Generate Misi Baru
  generateDailyMissions: function () {
    this.dailyMissions = [];

    // A. Buat salinan dari MISSION_POOL agar data asli tidak rusak
    let pool = [...MISSION_POOL];

    // B. Acak urutan array (Algoritma Fisher-Yates Shuffle)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // C. Ambil 3 Misi Teratas saja
    const selectedMissions = pool.slice(0, 3);

    // D. Masukkan ke dalam status pemain
    selectedMissions.forEach((template) => {
      this.dailyMissions.push({
        id: template.id,
        title: template.title,
        description: template.description,
        type: template.type,
        target: template.target,
        reward: template.reward,
        targetParam: template.targetParam,
        current: 0, // Reset progress
        isClaimed: false, // Reset status klaim
      });
    });

    console.log("Misi Harian Baru Tergenerate (3 Acak):", this.dailyMissions);
    this.save();
  },

  // Update Progress Misi Harian
  updateMissionProgress: function (type, amount = 1, param = null) {
    let isUpdated = false;

    this.dailyMissions.forEach((mission) => {
      if (
        mission.type === type &&
        !mission.isClaimed &&
        mission.current < mission.target
      ) {
        if (mission.targetParam) {
          if (mission.targetParam !== param) return;
        }

        mission.current += amount;

        // Clamp
        if (mission.current > mission.target) mission.current = mission.target;

        isUpdated = true;
        console.log(
          `Mission Progress: ${mission.title} -> ${mission.current}/${mission.target}`
        );
      }
    });

    if (isUpdated) this.save();
  },

  // Klaim Reward Misi Harian
  claimMissionReward: function (missionId) {
    const mission = this.dailyMissions.find((m) => m.id === missionId);

    if (mission && mission.current >= mission.target && !mission.isClaimed) {
      mission.isClaimed = true;
      this.money += mission.reward;
      this.save();
      return true;
    }
    return false;
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
        this.dailyMissions = savedData.dailyMissions || [];
        this.lastLoginDate = savedData.lastLoginDate || null;

        if (this.obtainedCardNames.length === 0 && this.collection.length > 0) {
          this.collection.forEach((c) => {
            if (!this.obtainedCardNames.includes(c.name)) {
              this.obtainedCardNames.push(c.name);
            }
          });
        }

        this.level = this.calculateLevel();
      } catch (e) {
        console.error("[PlayerData] Gagal memuat save data:", e);
        this.save();
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
      obtainedCardNames: this.obtainedCardNames,
      stats: this.stats,
      unlockedAchievements: this.unlockedAchievements,
      dailyMissions: this.dailyMissions,
      lastLoginDate: this.lastLoginDate,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  },

  // Helper Achievement Progress
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
    // this.checkAchievements(); // Opsional: Tidak perlu cek trigger karena sekarang manual claim
    this.save();
  },

  trackMoneySpent: function (amount) {
    this.stats.totalMoneySpent += amount;
    this.save();
  },

  // --- MODIFIKASI: HANYA CEK, JANGAN AUTO-CLAIM ---
  checkAchievements: function (gachaSystemInstance = null) {
    // Fungsi ini sekarang hanya untuk debugging atau notifikasi popup (jika ada).
    // Tidak lagi mengubah state unlocks secara otomatis.
    console.log(
      "[PlayerData] Data updated. Check Achievement menu to claim rewards."
    );
  },

  // --- FUNGSI BARU: MANUAL CLAIM ACHIEVEMENT ---
  claimAchievement: function (achId) {
    // 1. Cek apakah sudah pernah diklaim?
    if (this.unlockedAchievements.includes(achId)) return false;

    // 2. Cari data achievement
    const achData = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!achData) return false;

    // 3. Verifikasi apakah syarat benar-benar terpenuhi? (Double Check)
    //    Ini penting agar user tidak menembak fungsi ini via console
    //    Namun untuk simplifikasi, kita asumsikan UI hanya memanggil ini jika tombol aktif.

    // 4. Berikan Hadiah
    this.addMoney(achData.reward);

    // 5. Tandai sebagai "Claimed"
    this.unlockedAchievements.push(achId);
    this.save();

    console.log(`ACHIEVEMENT CLAIMED: ${achData.title} (+$${achData.reward})`);
    return true;
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

    this.level = this.calculateLevel();
    // this.checkAchievements(); // Tidak perlu auto-check
    this.save();
  },

  getCollectionSize: function () {
    return this.collection.length;
  },
};

PlayerData.load();
export default PlayerData;
