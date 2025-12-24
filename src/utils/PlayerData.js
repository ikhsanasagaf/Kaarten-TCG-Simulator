// Singleton sederhana untuk menyimpan data pemain
// Nanti di sini kita juga bisa pasang fitur Save/Load ke LocalStorage

const PlayerData = {
    // Modal awal (sesuai GDD nanti bisa dikurangi saat beli pack)
    money: 5000, 
    
    // Array untuk menyimpan semua kartu yang dimiliki
    // Format: [{ name: "Blue-Eyes", rarity: "Ultra Rare", set: "LOB", count: 1 }, ...]
    collection: [],

    /**
     * Menambahkan kartu ke inventory
     */
    addCards: function(cardsArray) {
        cardsArray.forEach(newCard => {
            // Cek apakah pemain sudah punya kartu ini?
            const existingCard = this.collection.find(c => c.name === newCard.name);
            
            if (existingCard) {
                // Kalau sudah punya, tambah jumlahnya (Duplicate logic)
                existingCard.count = (existingCard.count || 1) + 1;
            } else {
                // Kalau belum, masukkan sebagai data baru
                this.collection.push({
                    name: newCard.name,
                    rarity: newCard.rarity,
                    set_name: newCard.set_name,
                    count: 1
                });
            }
        });
        
        console.log("Inventory saat ini:", this.collection);
        this.save(); // Opsional: Persiapan save ke browser
    },

    save: function() {
        // Nanti kita isi ini untuk LocalStorage
    }
};

export default PlayerData;