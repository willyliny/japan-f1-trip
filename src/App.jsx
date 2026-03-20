import { useState, useEffect } from "react";
import * as api from "./api.js";

// ─── Data ───────────────────────────────────────────────────────────────────
const MEMBERS = ["Willy", "小明", "阿凱", "小美", "阿翔", "小花"];

const DEFAULT_JPY_TO_TWD = 0.22;

const ITINERARY = [
  {
    day: 1, date: "3/25 (二)", title: "抵達名古屋", color: "#E8673C",
    spots: [
      { time: "14:00", name: "中部國際機場 抵達", note: "入境、領取行李、買名鐵票", lat: 34.8584, lng: 136.8125, icon: "✈️" },
      { time: "16:00", name: "名古屋車站", note: "Check-in 飯店放行李", lat: 35.1709, lng: 136.8815, icon: "🏨" },
      { time: "17:30", name: "名古屋驛前商圈", note: "BicCamera / 驛前地下街逛逛", lat: 35.1706, lng: 136.8826, icon: "🛍️" },
      { time: "19:00", name: "矢場とん 名駅店", note: "名古屋名物：味噌炸豬排", lat: 35.1703, lng: 136.884, icon: "🍽️" },
    ],
  },
  {
    day: 2, date: "3/26 (三)", title: "名古屋市區一日遊", color: "#3C8CE8",
    spots: [
      { time: "09:00", name: "熱田神宮", note: "日本三大神宮之一，供奉草薙劍", lat: 35.1282, lng: 136.9089, icon: "⛩️" },
      { time: "11:00", name: "大須觀音 / 大須商店街", note: "名古屋的秋葉原＋美食天堂", lat: 35.1584, lng: 136.9025, icon: "🏮" },
      { time: "13:00", name: "コメダ珈琲 (Komeda)", note: "名古屋式早餐文化體驗", lat: 35.1612, lng: 136.9065, icon: "☕" },
      { time: "14:30", name: "名古屋城", note: "金鯱城，本丸御殿必看", lat: 35.1856, lng: 136.8991, icon: "🏯" },
      { time: "17:00", name: "榮 / OASIS 21", note: "水の宇宙船，購物＋夜景", lat: 35.1691, lng: 136.909, icon: "🛍️" },
      { time: "19:30", name: "世界の山ちゃん", note: "名古屋名物：手羽先（辣雞翅）", lat: 35.1688, lng: 136.8848, icon: "🍗" },
    ],
  },
  {
    day: 3, date: "3/27 (四)", title: "🏎️ F1 鈴鹿 — Track Walk", color: "#E52020",
    spots: [
      { time: "07:00", name: "名古屋站 → 白子站", note: "近鐵特急約45分鐘", lat: 34.7747, lng: 136.6214, icon: "🚃" },
      { time: "08:30", name: "鈴鹿賽道 Main Gate", note: "8:30開門，先去排Track Walk", lat: 34.8432, lng: 136.5407, icon: "🏁" },
      { time: "09:00", name: "Pit Lane Walk & Track Walk", note: "9:00-12:00 走賽道＋Pit Lane！三日票免費", lat: 34.8432, lng: 136.5407, icon: "🏎️" },
      { time: "12:30", name: "GP Square Fanzone", note: "周邊商品、展示、美食攤位", lat: 34.844, lng: 136.542, icon: "🎪" },
      { time: "14:00", name: "摩天輪 & 遊樂園", note: "鈴鹿賽道內遊樂園，三日票可免費搭摩天輪", lat: 34.8445, lng: 136.5395, icon: "🎡" },
      { time: "17:00", name: "返回名古屋", note: "白子站搭近鐵回名古屋", lat: 34.7747, lng: 136.6214, icon: "🚃" },
    ],
  },
  {
    day: 4, date: "3/28 (五)", title: "🏎️ F1 練習賽", color: "#E52020",
    spots: [
      { time: "07:00", name: "名古屋 → 白子站", note: "近鐵特急", lat: 34.7747, lng: 136.6214, icon: "🚃" },
      { time: "09:30", name: "鈴鹿賽道入場", note: "週五自由席日，可到處探索不同看台", lat: 34.8432, lng: 136.5407, icon: "🏁" },
      { time: "11:30", name: "FP1 自由練習賽 1", note: "第一次看F1賽車飛馳！感受引擎聲浪", lat: 34.8432, lng: 136.5407, icon: "🏎️" },
      { time: "15:00", name: "FP2 自由練習賽 2", note: "下午場，車隊會做更多race simulation", lat: 34.8432, lng: 136.5407, icon: "🏎️" },
      { time: "17:30", name: "賽道周邊＆晚餐", note: "白子/四日市吃晚餐", lat: 34.7747, lng: 136.6214, icon: "🍜" },
    ],
  },
  {
    day: 5, date: "3/29 (六)", title: "🏎️ F1 排位賽", color: "#E52020",
    spots: [
      { time: "08:00", name: "鈴鹿賽道", note: "早到佔好位，今天座位有指定", lat: 34.8432, lng: 136.5407, icon: "🏁" },
      { time: "11:30", name: "FP3 自由練習賽 3", note: "最後的自由練習", lat: 34.8432, lng: 136.5407, icon: "🏎️" },
      { time: "15:00", name: "排位賽 Qualifying", note: "Q1→Q2→Q3，決定明天正賽起跑順序！", lat: 34.8432, lng: 136.5407, icon: "🏎️" },
      { time: "18:10", name: "Night Pit & Straight Walk", note: "夜間Pit Lane Walk！18:10-19:10", lat: 34.8432, lng: 136.5407, icon: "🌙" },
    ],
  },
  {
    day: 6, date: "3/30 (日)", title: "吉卜力公園 🌿", color: "#4CAF50",
    spots: [
      { time: "09:00", name: "名古屋 → 愛・地球博記念公園", note: "地鐵東山線→リニモ，約1小時", lat: 35.1785, lng: 137.0866, icon: "🚃" },
      { time: "10:00", name: "吉卜力公園", note: "吉卜力大倉庫、青春之丘必看！需預約門票", lat: 35.1785, lng: 137.0866, icon: "🌿" },
      { time: "15:00", name: "常滑市 やきもの散步道", note: "招き猫之城，陶瓷器小鎮散步", lat: 34.8889, lng: 136.8316, icon: "🐱" },
      { time: "18:00", name: "AEON 常滑 / 永旺夢樂城", note: "機場旁的大型購物中心，最後採購", lat: 34.8701, lng: 136.8283, icon: "🛍️" },
    ],
  },
  {
    day: 7, date: "3/31 (一)", title: "高山老街 → 回程", color: "#9C27B0",
    spots: [
      { time: "07:00", name: "名古屋 → 高山", note: "JR特急ワイドビューひだ，約2.5小時", lat: 36.1461, lng: 137.2522, icon: "🚃" },
      { time: "09:30", name: "高山老街（三町古街）", note: "江戶時代街景，飛驒牛串、團子、味噌", lat: 36.14, lng: 137.255, icon: "🏮" },
      { time: "11:30", name: "宮川朝市", note: "如果還有開，逛逛在地市場", lat: 36.1419, lng: 137.2545, icon: "🥬" },
      { time: "12:30", name: "飛驒牛午餐", note: "高山必吃！A5飛驒牛", lat: 36.1405, lng: 137.254, icon: "🥩" },
      { time: "14:00", name: "高山 → 名古屋 → 中部國際機場", note: "JR特急回名古屋＋名鐵到機場", lat: 34.8584, lng: 136.8125, icon: "✈️" },
    ],
  },
];

const CATEGORIES = [
  { id: "food", label: "餐飲", icon: "🍽️", color: "#E8673C" },
  { id: "transport", label: "交通", icon: "🚃", color: "#3C8CE8" },
  { id: "ticket", label: "門票", icon: "🎫", color: "#9C27B0" },
  { id: "shopping", label: "購物", icon: "🛍️", color: "#4CAF50" },
  { id: "hotel", label: "住宿", icon: "🏨", color: "#FF9800" },
  { id: "other", label: "其他", icon: "📌", color: "#607D8B" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
}

function calcSettlement(expenses, members) {
  const balance = {};
  members.forEach((m) => (balance[m] = 0));
  expenses.forEach((exp) => {
    const splitAmong = exp.splitAmong.length > 0 ? exp.splitAmong : members;
    const perPerson = exp.amount / splitAmong.length;
    balance[exp.paidBy] = (balance[exp.paidBy] || 0) + exp.amount;
    splitAmong.forEach((m) => {
      balance[m] = (balance[m] || 0) - perPerson;
    });
  });
  const debtors = [];
  const creditors = [];
  Object.entries(balance).forEach(([name, amt]) => {
    if (amt < -0.5) debtors.push({ name, amount: -amt });
    else if (amt > 0.5) creditors.push({ name, amount: amt });
  });
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const payment = Math.min(debtors[i].amount, creditors[j].amount);
    if (payment > 0.5) {
      transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(payment) });
    }
    debtors[i].amount -= payment;
    creditors[j].amount -= payment;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }
  return transactions;
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap');
  :root {
    --bg: #0D0D0F;
    --surface: #17171B;
    --surface2: #1E1E24;
    --surface3: #26262E;
    --border: #2A2A34;
    --text: #F0EDE8;
    --text2: #9C9AA0;
    --text3: #6B6970;
    --accent: #E52020;
    --accent2: #FF6B35;
    --green: #22C55E;
    --blue: #3B82F6;
    --font: 'Noto Sans TC', 'Zen Maru Gothic', sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    padding-bottom: 80px;
  }

  /* Header */
  .header {
    padding: 20px 20px 16px;
    background: linear-gradient(135deg, #E52020 0%, #C41818 50%, #8B0000 100%);
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 120px; height: 120px;
    background: rgba(255,255,255,0.06);
    border-radius: 50%;
  }
  .header::after {
    content: '🏁';
    position: absolute;
    top: 12px; right: 16px;
    font-size: 36px;
    opacity: 0.3;
  }
  .header h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.3; }
  .header p { font-size: 13px; opacity: 0.8; margin-top: 4px; font-weight: 400; }
  .rate-badge {
    position: absolute;
    bottom: 12px; right: 16px;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    font-size: 11px; font-weight: 600;
    padding: 5px 10px;
    border-radius: 20px;
    cursor: pointer;
    font-family: var(--font);
    transition: background 0.2s;
  }
  .rate-badge:active { background: rgba(0,0,0,0.5); }

  /* Tab Bar */
  .tab-bar {
    display: flex;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .tab {
    flex: 1; padding: 14px 0 12px;
    text-align: center; font-size: 13px; font-weight: 500;
    color: var(--text3);
    border: none; background: none; cursor: pointer;
    position: relative; transition: color 0.2s;
  }
  .tab.active { color: var(--text); }
  .tab.active::after {
    content: '';
    position: absolute; bottom: 0; left: 20%; width: 60%;
    height: 2.5px; background: var(--accent); border-radius: 2px;
  }
  .tab-icon { font-size: 18px; display: block; margin-bottom: 3px; }

  /* Day Selector */
  .day-scroll {
    display: flex; gap: 8px; padding: 16px 20px;
    overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
  }
  .day-scroll::-webkit-scrollbar { display: none; }
  .day-chip {
    flex-shrink: 0; padding: 8px 14px; border-radius: 20px;
    background: var(--surface2); border: 1.5px solid var(--border);
    color: var(--text2); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .day-chip.active { color: #fff; border-color: transparent; }
  .day-chip .day-num { font-weight: 700; font-size: 13px; }

  /* Spot Card */
  .spots-list { padding: 0 20px 20px; }
  .spot-card {
    display: flex; gap: 12px; padding: 14px 0;
    border-bottom: 1px solid var(--border);
    animation: fadeUp 0.3s ease both;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .spot-time-col { width: 48px; flex-shrink: 0; text-align: center; }
  .spot-time { font-size: 12px; font-weight: 700; color: var(--text2); }
  .spot-icon { font-size: 20px; margin-top: 4px; }
  .spot-body { flex: 1; min-width: 0; }
  .spot-name { font-size: 15px; font-weight: 700; line-height: 1.3; margin-bottom: 3px; }
  .spot-note { font-size: 12px; color: var(--text2); line-height: 1.5; }
  .spot-nav {
    flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px;
    background: var(--surface2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; transition: all 0.2s;
    text-decoration: none; align-self: center;
  }
  .spot-nav:hover, .spot-nav:active { background: var(--accent); border-color: var(--accent); transform: scale(1.08); }
  .day-header { padding: 0 20px 12px; }
  .day-header h2 { font-size: 20px; font-weight: 900; }
  .day-header .day-date { font-size: 13px; color: var(--text2); margin-top: 2px; }

  /* Expense */
  .expense-section { padding: 20px; }
  .expense-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .summary-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .summary-card .label { font-size: 11px; color: var(--text3); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-card .value { font-size: 22px; font-weight: 900; margin-top: 4px; }
  .summary-card .sub { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .add-btn {
    width: 100%; padding: 14px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
    color: white; font-size: 15px; font-weight: 700;
    border: none; cursor: pointer; font-family: var(--font);
    transition: opacity 0.2s; margin-bottom: 16px;
  }
  .add-btn:active { opacity: 0.85; }

  /* Form */
  .form-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200;
    display: flex; align-items: flex-end; justify-content: center;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .form-sheet {
    background: var(--surface); width: 100%; max-width: 430px;
    border-radius: 20px 20px 0 0; padding: 24px 20px 36px;
    animation: slideUp 0.3s ease; max-height: 90vh; overflow-y: auto;
  }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  .form-sheet h3 { font-size: 18px; font-weight: 900; margin-bottom: 20px; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 6px; display: block; }
  .form-input {
    width: 100%; padding: 12px 14px; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: 12px;
    color: var(--text); font-size: 15px; font-family: var(--font);
    outline: none; transition: border-color 0.2s;
  }
  .form-input:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--text3); }
  .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    padding: 8px 14px; border-radius: 20px; background: var(--surface2);
    border: 1.5px solid var(--border); font-size: 13px; color: var(--text2);
    cursor: pointer; transition: all 0.15s; font-family: var(--font);
  }
  .chip.selected { border-color: var(--accent); color: var(--text); background: rgba(229,32,32,0.15); }
  .form-actions { display: flex; gap: 10px; margin-top: 20px; }
  .btn-cancel {
    flex: 1; padding: 14px; border-radius: 12px; background: var(--surface2);
    border: 1px solid var(--border); color: var(--text2); font-size: 15px;
    font-weight: 600; cursor: pointer; font-family: var(--font);
  }
  .btn-save {
    flex: 2; padding: 14px; border-radius: 12px; background: var(--accent);
    border: none; color: white; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: var(--font);
  }

  /* Expense List */
  .expense-list { display: flex; flex-direction: column; gap: 8px; }
  .expense-item {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px;
    display: flex; align-items: center; gap: 12px;
    animation: fadeUp 0.3s ease both;
  }
  .expense-cat-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .expense-info { flex: 1; min-width: 0; }
  .expense-desc { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .expense-meta { font-size: 11px; color: var(--text3); margin-top: 2px; }
  .expense-amount { font-size: 16px; font-weight: 900; text-align: right; flex-shrink: 0; }
  .expense-amount .yen { font-size: 11px; color: var(--text3); font-weight: 500; }
  .delete-btn {
    background: none; border: none; color: var(--text3); font-size: 16px;
    cursor: pointer; padding: 4px; opacity: 0.5; transition: opacity 0.2s;
  }
  .delete-btn:hover { opacity: 1; color: var(--accent); }

  /* Currency Toggle */
  .currency-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .currency-btn {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 12px 10px; border-radius: 14px; background: var(--surface2);
    border: 2px solid var(--border); color: var(--text2); font-size: 14px;
    font-weight: 600; cursor: pointer; font-family: var(--font); transition: all 0.2s;
  }
  .currency-btn .currency-flag { font-size: 22px; margin-bottom: 2px; }
  .currency-btn .currency-sub { font-size: 10px; color: var(--text3); font-weight: 400; }
  .currency-btn.active-jpy { border-color: #E52020; background: rgba(229,32,32,0.12); color: var(--text); }
  .currency-btn.active-jpy .currency-sub { color: #E52020; }
  .currency-btn.active-twd { border-color: #3B82F6; background: rgba(59,130,246,0.12); color: var(--text); }
  .currency-btn.active-twd .currency-sub { color: #3B82F6; }

  /* Settlement */
  .settle-section { padding: 20px; }
  .settle-title { font-size: 20px; font-weight: 900; }
  .settle-subtitle { font-size: 13px; color: var(--text2); margin-bottom: 20px; }
  .balance-list { margin-bottom: 24px; }
  .balance-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px; }
  .balance-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .balance-name { flex: 1; font-size: 14px; font-weight: 600; }
  .balance-paid { font-size: 12px; color: var(--text3); text-align: right; }
  .balance-amt { font-size: 15px; font-weight: 800; text-align: right; min-width: 70px; }
  .positive { color: var(--green); }
  .negative { color: var(--accent); }
  .settle-arrow-section { background: var(--surface2); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
  .settle-arrow-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .settle-tx { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .settle-tx:last-child { border-bottom: none; }
  .settle-from, .settle-to { font-size: 14px; font-weight: 700; min-width: 40px; }
  .settle-arrow { color: var(--accent); font-size: 18px; flex-shrink: 0; }
  .settle-tx-amt { margin-left: auto; font-size: 15px; font-weight: 900; color: var(--accent2); }
  .no-expenses { text-align: center; padding: 60px 20px; color: var(--text3); }
  .no-expenses .big-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 14px; }

  /* Sync */
  .sync-bar {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 8px; font-size: 11px; color: var(--text3);
    background: var(--surface); border-bottom: 1px solid var(--border);
  }
  .sync-bar button {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text2); font-size: 11px; padding: 4px 10px;
    border-radius: 8px; cursor: pointer; font-family: var(--font);
  }
  .sync-bar button:active { background: var(--surface3); }
  .sync-dot { width: 6px; height: 6px; border-radius: 50%; }
  .sync-dot.ok { background: var(--green); }
  .sync-dot.loading { background: #F59E0B; animation: pulse 1s infinite; }
  .sync-dot.error { background: var(--accent); }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* Loading overlay */
  .loading-overlay {
    position: fixed; inset: 0; background: var(--bg);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    z-index: 999;
  }
  .loading-overlay .spinner {
    width: 32px; height: 32px; border: 3px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-overlay p { margin-top: 12px; font-size: 13px; color: var(--text2); }
`;

// ─── Components ─────────────────────────────────────────────────────────────

function ItineraryTab() {
  const [selectedDay, setSelectedDay] = useState(0);
  const day = ITINERARY[selectedDay];
  return (
    <div>
      <div className="day-scroll">
        {ITINERARY.map((d, i) => (
          <button
            key={i}
            className={`day-chip ${i === selectedDay ? "active" : ""}`}
            style={i === selectedDay ? { background: d.color, borderColor: d.color, color: "#fff" } : {}}
            onClick={() => setSelectedDay(i)}
          >
            <span className="day-num">D{d.day}</span> {d.date.split(" ")[0]}
          </button>
        ))}
      </div>
      <div className="day-header">
        <h2 style={{ color: day.color }}>{day.title}</h2>
        <div className="day-date">{day.date}</div>
      </div>
      <div className="spots-list">
        {day.spots.map((spot, i) => (
          <div key={i} className="spot-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="spot-time-col">
              <div className="spot-time">{spot.time}</div>
              <div className="spot-icon">{spot.icon}</div>
            </div>
            <div className="spot-body">
              <div className="spot-name">{spot.name}</div>
              <div className="spot-note">{spot.note}</div>
            </div>
            <a className="spot-nav" href={googleMapsUrl(spot.lat, spot.lng)} target="_blank" rel="noopener noreferrer">📍</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseForm({ onSave, onCancel, jpyToTwd }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [paidBy, setPaidBy] = useState(MEMBERS[0]);
  const [category, setCategory] = useState("food");
  const [splitAmong, setSplitAmong] = useState([...MEMBERS]);
  const twdToJpy = 1 / jpyToTwd;

  const toggleSplit = (m) => setSplitAmong((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const handleSave = () => {
    if (!desc || !amount) return;
    const raw = parseInt(amount);
    const amountJPY = currency === "TWD" ? Math.round(raw * twdToJpy) : raw;
    onSave({ id: generateId(), desc, amount: amountJPY, originalAmount: raw, currency, paidBy, category, splitAmong, date: new Date().toLocaleDateString("zh-TW") });
  };

  const preview = amount
    ? currency === "JPY"
      ? `≈ NT$${Math.round(parseInt(amount) * jpyToTwd).toLocaleString()}`
      : `≈ ¥${Math.round(parseInt(amount) * twdToJpy).toLocaleString()}`
    : "";

  return (
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>新增花費 💴</h3>
        <div className="form-group">
          <label className="form-label">花了什麼</label>
          <input className="form-input" placeholder="例：拉麵午餐" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">幣別</label>
          <div className="currency-toggle">
            <button className={`currency-btn ${currency === "JPY" ? "active-jpy" : ""}`} onClick={() => setCurrency("JPY")}>
              <span className="currency-flag">🇯🇵</span><span>¥ 日圓</span><span className="currency-sub">現金</span>
            </button>
            <button className={`currency-btn ${currency === "TWD" ? "active-twd" : ""}`} onClick={() => setCurrency("TWD")}>
              <span className="currency-flag">🇹🇼</span><span>NT$ 台幣</span><span className="currency-sub">刷卡</span>
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">金額（{currency === "JPY" ? "¥ 日圓" : "NT$ 台幣"}）</label>
          <input className="form-input" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {preview && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6 }}>{preview}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">分類</label>
          <div className="chip-group">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={`chip ${category === c.id ? "selected" : ""}`} onClick={() => setCategory(c.id)}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">誰付的</label>
          <div className="chip-group">
            {MEMBERS.map((m) => (
              <button key={m} className={`chip ${paidBy === m ? "selected" : ""}`} onClick={() => setPaidBy(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">分攤給誰（點擊取消勾選）</label>
          <div className="chip-group">
            {MEMBERS.map((m) => (
              <button key={m} className={`chip ${splitAmong.includes(m) ? "selected" : ""}`} onClick={() => toggleSplit(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onCancel}>取消</button>
          <button className="btn-save" onClick={handleSave}>儲存</button>
        </div>
      </div>
    </div>
  );
}

function ExpenseTab({ expenses, onAdd, onDelete, jpyToTwd }) {
  const [showForm, setShowForm] = useState(false);
  const totalJPY = expenses.reduce((s, e) => s + e.amount, 0);
  const totalTWD = Math.round(totalJPY * jpyToTwd);
  const perPersonJPY = expenses.length > 0 ? Math.round(totalJPY / MEMBERS.length) : 0;
  const perPersonTWD = Math.round(perPersonJPY * jpyToTwd);

  const handleSave = (exp) => { onAdd(exp); setShowForm(false); };

  return (
    <div className="expense-section">
      <div className="expense-summary">
        <div className="summary-card">
          <div className="label">總花費</div>
          <div className="value">¥{totalJPY.toLocaleString()}</div>
          <div className="sub">≈ NT${totalTWD.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="label">人均</div>
          <div className="value">¥{perPersonJPY.toLocaleString()}</div>
          <div className="sub">≈ NT${perPersonTWD.toLocaleString()}</div>
        </div>
      </div>
      <button className="add-btn" onClick={() => setShowForm(true)}>＋ 新增花費</button>
      {expenses.length === 0 ? (
        <div className="no-expenses">
          <div className="big-icon">🧾</div>
          <div>還沒有花費紀錄</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>點擊上方按鈕開始記帳</div>
        </div>
      ) : (
        <div className="expense-list">
          {expenses.map((exp) => {
            const cat = CATEGORIES.find((c) => c.id === exp.category) || CATEGORIES[5];
            const isJPY = (exp.currency || "JPY") === "JPY";
            const displayAmt = exp.originalAmount || exp.amount;
            const displaySymbol = isJPY ? "¥" : "NT$";
            const convertedAmt = isJPY
              ? `≈ NT$${Math.round(exp.amount * jpyToTwd).toLocaleString()}`
              : `≈ ¥${exp.amount.toLocaleString()}`;
            return (
              <div key={exp.id} className="expense-item">
                <div className="expense-cat-icon" style={{ background: cat.color + "22" }}>{cat.icon}</div>
                <div className="expense-info">
                  <div className="expense-desc">{exp.desc}</div>
                  <div className="expense-meta">{exp.paidBy} 付 · {exp.splitAmong.length}人分 · {isJPY ? "🇯🇵現金" : "🇹🇼刷卡"}</div>
                </div>
                <div className="expense-amount">
                  {displaySymbol}{displayAmt.toLocaleString()}
                  <div className="yen">{convertedAmt}</div>
                </div>
                <button className="delete-btn" onClick={() => onDelete(exp.id)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
      {showForm && <ExpenseForm onSave={handleSave} onCancel={() => setShowForm(false)} jpyToTwd={jpyToTwd} />}
    </div>
  );
}

const AVATAR_COLORS = ["#E52020", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"];

function SettleTab({ expenses, jpyToTwd }) {
  const [settleCurrency, setSettleCurrency] = useState("JPY");
  const balanceMap = {};
  const paidMap = {};
  MEMBERS.forEach((m) => { balanceMap[m] = 0; paidMap[m] = 0; });
  expenses.forEach((exp) => {
    const splitAmong = exp.splitAmong.length > 0 ? exp.splitAmong : MEMBERS;
    const perPerson = exp.amount / splitAmong.length;
    paidMap[exp.paidBy] = (paidMap[exp.paidBy] || 0) + exp.amount;
    balanceMap[exp.paidBy] = (balanceMap[exp.paidBy] || 0) + exp.amount;
    splitAmong.forEach((m) => { balanceMap[m] = (balanceMap[m] || 0) - perPerson; });
  });
  const transactions = calcSettlement(expenses, MEMBERS);
  const sym = settleCurrency === "JPY" ? "¥" : "NT$";
  const conv = (v) => settleCurrency === "JPY" ? Math.round(v) : Math.round(v * jpyToTwd);

  if (expenses.length === 0) {
    return (
      <div className="settle-section">
        <div className="settle-title">結算</div>
        <div className="no-expenses"><div className="big-icon">🤝</div><div>記帳後才能結算</div></div>
      </div>
    );
  }
  return (
    <div className="settle-section">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div className="settle-title">結算</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className={`chip ${settleCurrency === "JPY" ? "selected" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setSettleCurrency("JPY")}>🇯🇵 ¥</button>
          <button className={`chip ${settleCurrency === "TWD" ? "selected" : ""}`} style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setSettleCurrency("TWD")}>🇹🇼 NT$</button>
        </div>
      </div>
      <div className="settle-subtitle">每人餘額一覽（{settleCurrency === "JPY" ? "日圓" : "台幣"}）</div>
      <div className="balance-list">
        {MEMBERS.map((m, i) => (
          <div key={m} className="balance-item">
            <div className="balance-avatar" style={{ background: AVATAR_COLORS[i] }}>{m[0]}</div>
            <div className="balance-name">{m}</div>
            <div className="balance-paid">已付 {sym}{conv(paidMap[m] || 0).toLocaleString()}</div>
            <div className={`balance-amt ${balanceMap[m] >= 0 ? "positive" : "negative"}`}>
              {balanceMap[m] >= 0 ? "+" : ""}{sym}{conv(balanceMap[m]).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="settle-arrow-section">
        <div className="settle-arrow-title"><span>💸</span> 最少轉帳路徑</div>
        {transactions.length === 0 ? (
          <div className="empty-state">所有人都已結清！</div>
        ) : (
          transactions.map((tx, i) => (
            <div key={i} className="settle-tx">
              <div className="settle-from">{tx.from}</div>
              <div className="settle-arrow">→</div>
              <div className="settle-to">{tx.to}</div>
              <div className="settle-tx-amt">{sym}{conv(tx.amount).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("itinerary");
  const [expenses, setExpenses] = useState([]);
  const [jpyToTwd, setJpyToTwd] = useState(DEFAULT_JPY_TO_TWD);
  const [syncStatus, setSyncStatus] = useState("loading"); // ok | loading | error
  const [lastSync, setLastSync] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateInput, setRateInput] = useState(String(DEFAULT_JPY_TO_TWD));
  const [initialLoading, setInitialLoading] = useState(true);

  // ── Initial load from Google Sheets ──
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setSyncStatus("loading");
    try {
      const data = await api.fetchAll();
      setExpenses(data.expenses || []);
      if (data.settings?.jpyToTwd) {
        const rate = parseFloat(data.settings.jpyToTwd);
        if (rate > 0) {
          setJpyToTwd(rate);
          setRateInput(String(rate));
        }
      }
      setSyncStatus("ok");
      setLastSync(new Date());
    } catch (err) {
      console.error("Load failed:", err);
      setSyncStatus("error");
    } finally {
      setInitialLoading(false);
    }
  };

  // ── Add expense → API + local ──
  const handleAddExpense = async (exp) => {
    setExpenses((prev) => [exp, ...prev]);
    try {
      await api.addExpense(exp);
      setSyncStatus("ok");
      setLastSync(new Date());
    } catch (err) {
      console.error("Add failed:", err);
      setSyncStatus("error");
    }
  };

  // ── Delete expense → API + local ──
  const handleDeleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteExpense(id);
      setSyncStatus("ok");
      setLastSync(new Date());
    } catch (err) {
      console.error("Delete failed:", err);
      setSyncStatus("error");
    }
  };

  // ── Update rate → API + local ──
  const handleRateSave = async () => {
    const val = parseFloat(rateInput);
    if (val > 0 && val < 10) {
      setJpyToTwd(val);
      setShowRateModal(false);
      try {
        await api.updateSetting("jpyToTwd", val);
        setSyncStatus("ok");
        setLastSync(new Date());
      } catch (err) {
        console.error("Rate update failed:", err);
        setSyncStatus("error");
      }
    }
  };

  if (initialLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="loading-overlay">
          <div className="spinner" />
          <p>載入資料中...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <h1>🇯🇵 名古屋 × 鈴鹿 F1 之旅</h1>
          <p>3/25 - 3/31 · 7天6夜 · {MEMBERS.length}人</p>
          <button className="rate-badge" onClick={() => { setRateInput(String(jpyToTwd)); setShowRateModal(true); }}>
            ¥1 = NT${jpyToTwd} ⚙️
          </button>
        </div>

        {/* Sync status bar */}
        <div className="sync-bar">
          <div className={`sync-dot ${syncStatus}`} />
          <span>
            {syncStatus === "ok" && lastSync && `已同步 ${lastSync.toLocaleTimeString("zh-TW")}`}
            {syncStatus === "loading" && "同步中..."}
            {syncStatus === "error" && "同步失敗"}
          </span>
          <button onClick={loadData}>🔄 重新整理</button>
        </div>

        <div className="tab-bar">
          <button className={`tab ${tab === "itinerary" ? "active" : ""}`} onClick={() => setTab("itinerary")}>
            <span className="tab-icon">📍</span>行程
          </button>
          <button className={`tab ${tab === "expense" ? "active" : ""}`} onClick={() => setTab("expense")}>
            <span className="tab-icon">💴</span>記帳
          </button>
          <button className={`tab ${tab === "settle" ? "active" : ""}`} onClick={() => setTab("settle")}>
            <span className="tab-icon">🤝</span>結算
          </button>
        </div>

        {tab === "itinerary" && <ItineraryTab />}
        {tab === "expense" && <ExpenseTab expenses={expenses} onAdd={handleAddExpense} onDelete={handleDeleteExpense} jpyToTwd={jpyToTwd} />}
        {tab === "settle" && <SettleTab expenses={expenses} jpyToTwd={jpyToTwd} />}
      </div>

      {showRateModal && (
        <div className="form-overlay" onClick={() => setShowRateModal(false)}>
          <div className="form-sheet" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 28 }}>
            <h3>⚙️ 匯率設定</h3>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16, lineHeight: 1.6 }}>
              大家結算時統一採用的匯率。<br />
              例如 0.22 表示 ¥1 = NT$0.22（即 ¥100 = NT$22）
            </p>
            <div className="form-group">
              <label className="form-label">¥1 日圓 = NT$ ?</label>
              <input className="form-input" type="number" step="0.001" value={rateInput} onChange={(e) => setRateInput(e.target.value)} style={{ fontSize: 22, fontWeight: 900, textAlign: "center" }} />
            </div>
            {rateInput && parseFloat(rateInput) > 0 && (
              <div style={{ background: "var(--surface2)", borderRadius: 12, padding: 14, marginBottom: 16, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div><div style={{ fontSize: 11, color: "var(--text3)" }}>¥1,000</div><div style={{ fontSize: 16, fontWeight: 700 }}>NT${Math.round(1000 * parseFloat(rateInput)).toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11, color: "var(--text3)" }}>¥10,000</div><div style={{ fontSize: 16, fontWeight: 700 }}>NT${Math.round(10000 * parseFloat(rateInput)).toLocaleString()}</div></div>
                <div><div style={{ fontSize: 11, color: "var(--text3)" }}>¥50,000</div><div style={{ fontSize: 16, fontWeight: 700 }}>NT${Math.round(50000 * parseFloat(rateInput)).toLocaleString()}</div></div>
              </div>
            )}
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowRateModal(false)}>取消</button>
              <button className="btn-save" onClick={handleRateSave}>確認</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
