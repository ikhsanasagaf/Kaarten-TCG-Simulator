// src/data/MissionPool.js

export const MISSION_TYPES = {
  LOGIN: "LOGIN",
  OPEN_PACK: "OPEN_PACK",
  GET_RARITY: "GET_RARITY",
  SELL_CARD: "SELL_CARD",
  EARN_MONEY: "EARN_MONEY",
};

export const MISSION_POOL = [
  {
    id: "daily_login",
    title: "Daily Login",
    description: "Attend the game today by logging in.",
    type: MISSION_TYPES.LOGIN,
    target: 1,
    reward: 5,
    targetParam: null,
  },
  {
    id: "open_3_pack",
    title: "Gacha Mania",
    description: "Open 3 Card Packs",
    type: MISSION_TYPES.OPEN_PACK,
    target: 3,
    reward: 5,
    targetParam: null, // Semua pack bisa
  },
  {
    id: "get_super_rare",
    title: "Rare Hunter",
    description: "Obtain a Super Rare card",
    type: MISSION_TYPES.GET_RARITY,
    target: 1,
    reward: 10,
    targetParam: "Super Rare",
  },
  {
    id: "sell_15_cards",
    title: "Merchant's Way",
    description: "Sell 15 Cards",
    type: MISSION_TYPES.SELL_CARD,
    target: 15,
    reward: 5,
    targetParam: null,
  },
  {
    id: "open_legend_pack",
    title: "Legend Seeker",
    description: "Open the 'Legend of Blue Eyes White Dragon' Pack",
    type: MISSION_TYPES.OPEN_PACK,
    target: 1,
    reward: 5,
    targetParam: "LEGEND OF BLUE EYES WHITE DRAGON",
  },
];
