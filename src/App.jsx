import { useState, useEffect, useRef } from "react";
import {
  subscribeExpenses,
  subscribeSettings,
  addExpense as fbAddExpense,
  deleteExpense as fbDeleteExpense,
  updateSetting,
} from "./firebase.js";

const MEMBERS = ["鈺翔", "嘉銘", "承翰", "冠崴", "律豪"];
const NAGOYA_ITINERARY = [
  { day:1, date:"3/25 (三)", realDate:"2026-03-25", title:"抵達名古屋", color:"#E8673C", spots:[
    { time:"15:35", name:"中部國際機場 抵達", note:"CX530・入境+領行李約30-40分", lat:34.8584, lng:136.8125, icon:"✈️" },
    { time:"16:45", name:"機場租車 取車", note:"Access Plaza 租車櫃台・7-8人座", lat:34.8584, lng:136.8125, icon:"🚗" },
    { time:"17:45", name:"住宿 Check-in", note:"鈴鹿附近・放行李休息", lat:35.064, lng:136.696, icon:"🏨" },
    { time:"18:30", name:"開車前往榮商圈", note:"約50分鐘車程", lat:35.1691, lng:136.909, icon:"🚗" },
    { time:"19:30", name:"榮地下街 晚餐＋逛街", note:"矢場とん / 世界の山ちゃん / 驛前地下街", lat:35.1691, lng:136.909, icon:"🍽️" },
    { time:"21:30", name:"回飯店", note:"約50分鐘回程", lat:35.064, lng:136.696, icon:"🌙" },
  ]},
  { day:2, date:"3/26 (四)", realDate:"2026-03-26", title:"🏎️ F1 Pit Walk + 伊勢神宮", color:"#E52020", spots:[
    { time:"07:30", name:"退房出發", note:"行李上車", lat:35.064, lng:136.696, icon:"🚗" },
    { time:"08:00", name:"抵達鈴鹿賽道", note:"Main Gate 8:30開門", lat:34.8432, lng:136.5407, icon:"🏁" },
    { time:"09:00", name:"Pit Lane Walk & Track Walk", note:"9:00-12:00・三日票免費", lat:34.8432, lng:136.5407, icon:"🏎️" },
    { time:"11:00", name:"GP Square Fanzone", note:"周邊商品、展示、摩天輪", lat:34.844, lng:136.542, icon:"🎪" },
    { time:"12:30", name:"開車前往伊勢", note:"鈴鹿→伊勢約1小時", lat:34.4569, lng:136.7256, icon:"🚗" },
    { time:"13:30", name:"伊勢神宮（內宮）", note:"日本最高規格神宮", lat:34.4569, lng:136.7256, icon:"⛩️" },
    { time:"14:00", name:"托福橫丁午餐", note:"伊勢烏龍、赤福餅、松阪牛串", lat:34.4562, lng:136.7268, icon:"🍜" },
    { time:"16:00", name:"返程回名古屋", note:"約1.5-2小時", lat:35.1709, lng:136.8815, icon:"🚗" },
    { time:"18:00", name:"名古屋市區晚餐", note:"", lat:35.1709, lng:136.8815, icon:"🍽️" },
  ]},
  { day:3, date:"3/27 (五)", realDate:"2026-03-27", title:"吉卜力公園 🌿", color:"#4CAF50", spots:[
    { time:"08:00", name:"出發前往吉卜力公園", note:"開車約40分鐘", lat:35.1785, lng:137.0866, icon:"🚗" },
    { time:"09:00", name:"吉卜力公園", note:"⚠️ 需預約門票！大倉庫+青春之丘+魔女之谷", lat:35.1785, lng:137.0866, icon:"🌿" },
    { time:"15:00", name:"回名古屋市區", note:"約40分鐘", lat:35.1691, lng:136.909, icon:"🚗" },
    { time:"16:00", name:"榮 / 大須商店街", note:"OASIS 21 / 大須觀音 / 藥妝採購", lat:35.1584, lng:136.9025, icon:"🛍️" },
    { time:"18:30", name:"晚餐", note:"味仙台灣拉麵 / コメダ珈琲 / 鰻魚飯", lat:35.1691, lng:136.909, icon:"🍽️" },
    { time:"20:00", name:"名古屋住宿 Check-in", note:"", lat:35.1615, lng:136.9021, icon:"🏨" },
  ]},
  { day:4, date:"3/28 (六)", realDate:"2026-03-28", title:"高山古街 + 合掌村", color:"#9C27B0", spots:[
    { time:"07:00", name:"出發前往高山", note:"開車約2.5-3小時", lat:36.1461, lng:137.2522, icon:"🚗" },
    { time:"10:00", name:"高山老街（三町古街）", note:"飛驒牛壽司串、團子、味噌", lat:36.14, lng:137.255, icon:"🏮" },
    { time:"11:00", name:"宮川朝市", note:"週六有開・在地蔬果漬物", lat:36.1419, lng:137.2545, icon:"🥬" },
    { time:"12:00", name:"飛驒牛午餐", note:"推薦：丸明 / 味藏天國", lat:36.1405, lng:137.254, icon:"🥩" },
    { time:"13:30", name:"出發前往白川鄉", note:"約50分鐘", lat:36.2578, lng:136.9063, icon:"🚗" },
    { time:"14:30", name:"白川鄉合掌村", note:"展望台拍照＋村內散步 約1.5-2hr", lat:36.2578, lng:136.9063, icon:"🏔️" },
    { time:"16:30", name:"返程回名古屋", note:"約3小時", lat:35.1709, lng:136.8815, icon:"🚗" },
    { time:"19:30", name:"名古屋晚餐", note:"", lat:35.1709, lng:136.8815, icon:"🍽️" },
  ]},
  { day:5, date:"3/29 (日)", realDate:"2026-03-29", title:"🏎️ F1 正賽日", color:"#E52020", spots:[
    { time:"07:30", name:"出發前往鈴鹿", note:"約1小時", lat:34.8432, lng:136.5407, icon:"🚗" },
    { time:"08:30", name:"抵達鈴鹿賽道", note:"正賽日人潮爆滿・早到搶車位", lat:34.8432, lng:136.5407, icon:"🏁" },
    { time:"09:00", name:"Fanzone / 賽道周邊", note:"逛攤位、買紀念品", lat:34.844, lng:136.542, icon:"🎪" },
    { time:"14:00", name:"🏁 正賽開始", note:"53圈・約1.5小時", lat:34.8432, lng:136.5407, icon:"🏎️" },
    { time:"16:00", name:"正賽結束・散場", note:"⚠️ 散場預留1小時+", lat:34.8432, lng:136.5407, icon:"🏎️" },
    { time:"18:30", name:"回名古屋", note:"", lat:35.1709, lng:136.8815, icon:"🚗" },
    { time:"19:00", name:"晚餐慶祝 🍻", note:"", lat:35.1709, lng:136.8815, icon:"🍽️" },
  ]},
  { day:6, date:"3/30 (一)", realDate:"2026-03-30", title:"常滑散步 🐱", color:"#3C8CE8", spots:[
    { time:"09:00", name:"Check-out・出發往常滑", note:"約40分鐘", lat:34.8889, lng:136.8316, icon:"🚗" },
    { time:"10:00", name:"常滑 やきもの散步道", note:"招き猫之城・陶瓷小鎮", lat:34.8889, lng:136.8316, icon:"🐱" },
    { time:"12:00", name:"常滑午餐", note:"", lat:34.8889, lng:136.8316, icon:"🍽️" },
    { time:"13:30", name:"AEON Mall 常滑", note:"最後採購伴手禮", lat:34.8701, lng:136.8283, icon:"🛍️" },
    { time:"15:30", name:"常滑住宿 Check-in", note:"離機場超近", lat:34.87, lng:136.83, icon:"🏨" },
    { time:"16:00", name:"自由時間", note:"想補逛名古屋可自行前往", lat:34.87, lng:136.83, icon:"🎯" },
    { time:"18:30", name:"晚餐", note:"", lat:34.8701, lng:136.8283, icon:"🍽️" },
  ]},
  { day:7, date:"3/31 (二)", realDate:"2026-03-31", title:"回國 ✈️", color:"#607D8B", spots:[
    { time:"10:00", name:"Check-out", note:"整理行李", lat:34.87, lng:136.83, icon:"🧳" },
    { time:"10:15", name:"開車至機場還車", note:"約10分鐘", lat:34.8584, lng:136.8125, icon:"🚗" },
    { time:"10:30", name:"中部機場逛街", note:"FLIGHT OF DREAMS / 商店街", lat:34.8584, lng:136.8125, icon:"🛍️" },
    { time:"12:00", name:"機場午餐", note:"最後一餐日本料理！", lat:34.8584, lng:136.8125, icon:"🍽️" },
    { time:"14:00", name:"過安檢・出境", note:"CX531 16:40起飛", lat:34.8584, lng:136.8125, icon:"🛂" },
    { time:"16:40", name:"CX531 起飛 ✈️", note:"→ 台灣時間 19:15 抵達桃園", lat:34.8584, lng:136.8125, icon:"✈️" },
  ]},
];

const TOKYO_ITINERARY = [
  { day:1, date:"7/25 (六)", realDate:"2026-07-25", title:"抵達東京・秋葉原 🎮", color:"#E8673C", spots:[
    { time:"15:40", name:"成田機場 抵達", note:"入境+領行李約40-50分", lat:35.7719, lng:140.3929, icon:"✈️" },
    { time:"17:10", name:"Skyliner 前往上野", note:"約45分・京成上野站下車", lat:35.7118, lng:139.7745, icon:"🚃" },
    { time:"18:00", name:"上野住宿 Check-in", note:"放行李休息", lat:35.7106, lng:139.7772, icon:"🏨" },
    { time:"19:00", name:"秋葉原逛街", note:"電器街・動漫・扭蛋（多數店約20-21點打烊）", lat:35.6984, lng:139.7731, icon:"🎮" },
    { time:"20:30", name:"秋葉原晚餐", note:"拉麵 / 燒肉 / 丼飯", lat:35.6984, lng:139.7731, icon:"🍽️" },
    { time:"22:00", name:"回上野飯店", note:"山手線2站", lat:35.7106, lng:139.7772, icon:"🌙" },
  ]},
  { day:2, date:"7/26 (日)", realDate:"2026-07-26", title:"淺草 → 晴空塔 → 澀谷", color:"#3C8CE8", spots:[
    { time:"09:00", name:"淺草寺・雷門", note:"早點去避人潮・仲見世通小吃", lat:35.7148, lng:139.7967, icon:"⛩️" },
    { time:"11:30", name:"淺草午餐", note:"天婦羅 / 鰻魚飯 / 大黑家", lat:35.7119, lng:139.7963, icon:"🍽️" },
    { time:"13:00", name:"東京晴空塔", note:"淺草走路20分或電車1站・展望台可預約", lat:35.7101, lng:139.8107, icon:"🗼" },
    { time:"15:30", name:"前往澀谷", note:"半藏門線直達約30分", lat:35.6595, lng:139.7005, icon:"🚃" },
    { time:"16:00", name:"忠犬八公＋十字路口", note:"經典打卡點", lat:35.6595, lng:139.7005, icon:"🐕" },
    { time:"16:30", name:"澀谷逛街", note:"SHIBUYA109 / PARCO / Center街", lat:35.6614, lng:139.6993, icon:"🛍️" },
    { time:"18:30", name:"SHIBUYA SKY 夜景", note:"⚠️ 熱門需預約・日落時段最搶手", lat:35.6580, lng:139.7016, icon:"🌆" },
    { time:"20:00", name:"澀谷晚餐", note:"", lat:35.6595, lng:139.7005, icon:"🍽️" },
    { time:"22:00", name:"回上野", note:"銀座線直達約30分", lat:35.7106, lng:139.7772, icon:"🌙" },
  ]},
  { day:3, date:"7/27 (一)", realDate:"2026-07-27", title:"鐮倉一日遊 🌊", color:"#4CAF50", spots:[
    { time:"08:00", name:"出發前往鐮倉", note:"上野東京線直達約1小時", lat:35.3190, lng:139.5504, icon:"🚃" },
    { time:"09:30", name:"鶴岡八幡宮", note:"鐮倉最大神社", lat:35.3251, lng:139.5565, icon:"⛩️" },
    { time:"10:30", name:"小町通", note:"小吃逛街・吻仔魚仙貝", lat:35.3222, lng:139.5505, icon:"🍡" },
    { time:"12:00", name:"午餐 しらす丼", note:"生吻仔魚丼是鐮倉名物", lat:35.3195, lng:139.5510, icon:"🍽️" },
    { time:"13:30", name:"江之電 → 鐮倉高校前", note:"灌籃高手平交道打卡", lat:35.3067, lng:139.5013, icon:"🚃" },
    { time:"15:00", name:"長谷寺・鐮倉大佛", note:"江之電長谷站下車", lat:35.3167, lng:139.5357, icon:"🗿" },
    { time:"16:30", name:"江之島（體力夠再去）", note:"江之電終點・看海夕陽", lat:35.2990, lng:139.4802, icon:"🏝️" },
    { time:"18:30", name:"返回東京", note:"約1-1.5小時", lat:35.7106, lng:139.7772, icon:"🚃" },
    { time:"20:00", name:"晚餐", note:"上野阿美橫町居酒屋", lat:35.7091, lng:139.7745, icon:"🍽️" },
  ]},
  { day:4, date:"7/28 (二)", realDate:"2026-07-28", title:"自由活動・回國 ✈️", color:"#607D8B", spots:[
    { time:"10:00", name:"Check-out・行李寄放", note:"", lat:35.7106, lng:139.7772, icon:"🧳" },
    { time:"10:30", name:"自由活動", note:"阿美橫町 / 銀座 / 新宿 看大家想逛哪", lat:35.7091, lng:139.7745, icon:"🛍️" },
    { time:"12:30", name:"午餐", note:"", lat:35.7091, lng:139.7745, icon:"🍽️" },
    { time:"15:00", name:"取行李・前往機場", note:"Skyliner約45分・時間抓寬鬆", lat:35.7719, lng:140.3929, icon:"🚃" },
    { time:"17:00", name:"抵達機場・掛行李", note:"", lat:35.7719, lng:140.3929, icon:"🛂" },
    { time:"18:00", name:"免稅店最後採購", note:"", lat:35.7719, lng:140.3929, icon:"🛍️" },
    { time:"20:40", name:"起飛回台灣 ✈️", note:"→ 約台灣時間 23:30 抵達桃園", lat:35.7719, lng:140.3929, icon:"✈️" },
  ]},
];

// ─── Trips ──────────────────────────────────────────────────
// Each trip has its own itinerary + its own Firestore collection/settings,
// so old trips' ledgers stay intact and viewable.
const TRIPS = [
  { id:"tokyo2607", switchLabel:"🗼 東京", title:"🗼 東京 4天3夜之旅", subtitle:"7/25 - 7/28 · 4天3夜 · 鈺翔、嘉銘、承翰、冠崴、律豪",
    itinerary:TOKYO_ITINERARY, expensesColl:"expenses_tokyo2607", settingsDoc:"tokyo2607", defaultRate:0.21 },
  { id:"nagoya2603", switchLabel:"🏁 名古屋", title:"🇯🇵 名古屋 × 鈴鹿 F1 之旅", subtitle:"3/25 - 3/31 · 7天6夜 · 鈺翔、嘉銘、承翰、冠崴、律豪",
    itinerary:NAGOYA_ITINERARY, expensesColl:"expenses", settingsDoc:"global", defaultRate:0.22 },
];

const CATEGORIES = [
  { id:"food", label:"餐飲", icon:"🍽️", color:"#E8673C" }, { id:"transport", label:"交通", icon:"🚃", color:"#3C8CE8" },
  { id:"ticket", label:"門票", icon:"🎫", color:"#9C27B0" }, { id:"shopping", label:"購物", icon:"🛍️", color:"#4CAF50" },
  { id:"hotel", label:"住宿", icon:"🏨", color:"#FF9800" }, { id:"other", label:"其他", icon:"📌", color:"#607D8B" },
];

// ─── Utility ────────────────────────────────────────────────
function googleMapsUrl(lat,lng){return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;}

function findNextUp(now,itinerary){
  const jp=new Date(now.toLocaleString("en-US",{timeZone:"Asia/Tokyo"}));
  const td=`${jp.getFullYear()}-${String(jp.getMonth()+1).padStart(2,'0')}-${String(jp.getDate()).padStart(2,'0')}`;
  const nm=jp.getHours()*60+jp.getMinutes();
  let di=itinerary.findIndex(d=>d.realDate===td);
  if(di===-1){
    const s=new Date(itinerary[0].realDate+"T00:00:00+09:00");
    if(jp<s) return{dayIdx:0,spotIdx:0,status:"before",daysUntil:Math.ceil((s-jp)/864e5)};
    return{dayIdx:itinerary.length-1,spotIdx:-1,status:"after",daysUntil:0};
  }
  const day=itinerary[di];
  for(let i=0;i<day.spots.length;i++){
    const[h,m]=day.spots[i].time.split(":").map(Number);
    if(h*60+m>nm) return{dayIdx:di,spotIdx:i,status:"during",daysUntil:0};
  }
  return{dayIdx:di,spotIdx:day.spots.length-1,status:"during-done",daysUntil:0};
}

// ─── Settlement Engine ──────────────────────────────────────
function settleGroup(expenses, members, getAmount) {
  const balances = {};
  const paid = {};
  members.forEach(m => { balances[m] = 0; paid[m] = 0; });

  expenses.forEach(e => {
    const sa = e.splitAmong?.length > 0 ? e.splitAmong : members;
    const amt = getAmount(e);
    paid[e.paidBy] = (paid[e.paidBy] || 0) + amt;
    balances[e.paidBy] = (balances[e.paidBy] || 0) + amt;

    if (e.splitType === "custom" && e.splitAmounts) {
      // Custom split — scale amounts proportionally for currency conversion
      const originalTotal = Object.values(e.splitAmounts).reduce((s, v) => s + v, 0);
      const ratio = originalTotal > 0 ? amt / originalTotal : 1;
      Object.entries(e.splitAmounts).forEach(([name, customAmt]) => {
        balances[name] = (balances[name] || 0) - customAmt * ratio;
      });
    } else {
      // Equal split
      const pp = amt / sa.length;
      sa.forEach(m => { balances[m] = (balances[m] || 0) - pp; });
    }
  });

  const debtors = [], creditors = [];
  Object.entries(balances).forEach(([n, a]) => {
    if (a < -0.5) debtors.push({ name: n, amount: -a });
    else if (a > 0.5) creditors.push({ name: n, amount: a });
  });
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const p = Math.min(debtors[i].amount, creditors[j].amount);
    if (p > 0.5) transactions.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(p) });
    debtors[i].amount -= p;
    creditors[j].amount -= p;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }

  const total = expenses.reduce((s, e) => s + getAmount(e), 0);
  return { transactions, balances, paid, total };
}

// mode: "split" | "unified-jpy" | "unified-twd"
function calcSettlement(expenses, members, mode, jpyToTwd) {
  if (mode === "split") {
    const jpyExp = expenses.filter(e => (e.currency || "JPY") === "JPY");
    const twdExp = expenses.filter(e => (e.currency || "JPY") === "TWD");
    return {
      mode: "split",
      jpy: settleGroup(jpyExp, members, e => e.amount),
      twd: settleGroup(twdExp, members, e => e.originalAmount || Math.round(e.amount * jpyToTwd)),
    };
  }
  if (mode === "unified-twd") {
    return {
      mode: "unified-twd",
      result: settleGroup(expenses, members, e =>
        (e.currency || "JPY") === "TWD"
          ? (e.originalAmount || Math.round(e.amount * jpyToTwd))
          : Math.round(e.amount * jpyToTwd)
      ),
    };
  }
  // unified-jpy (default) — amount is already stored in JPY
  return {
    mode: "unified-jpy",
    result: settleGroup(expenses, members, e => e.amount),
  };
}

// ─── CSS ────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap');
:root{--bg:#0D0D0F;--surface:#17171B;--surface2:#1E1E24;--border:#2A2A34;--text:#F0EDE8;--text2:#9C9AA0;--text3:#6B6970;--accent:#E52020;--accent2:#FF6B35;--green:#22C55E;--blue:#3B82F6;--font:'Noto Sans TC',sans-serif;}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased;overflow-x:hidden;}

/* ── Layout ── */
.app{max-width:600px;margin:0 auto;min-height:100vh;min-height:100dvh;position:relative;padding-bottom:80px;}

/* ── Desktop ── */
@media(min-width:768px){
  .app{max-width:960px;}
  .header{padding:28px 32px 22px;}
  .header h1{font-size:26px;}
  .header::after{font-size:48px;}
  .tab-bar{gap:4px;padding:0 20px;}
  .tab{padding:16px 0 14px;font-size:14px;border-radius:8px 8px 0 0;transition:background 0.2s;}
  .tab:hover:not(.active){background:var(--surface2);}
  .expense-section{padding:24px 32px;}
  .expense-summary{grid-template-columns:1fr 1fr 1fr;}
  .expense-list{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .settle-section{padding:24px 32px;}
  .settle-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}
  .settle-currency-group{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;}
  .spots-list{padding:0 32px 24px;}
  .day-scroll{padding:16px 32px;}
  .day-header{padding:0 32px 12px;}
  .spot-card{padding:16px 0;}
  .spot-nav{transition:transform 0.15s,background 0.15s;}
  .form-overlay{align-items:center;}
  .form-sheet{max-width:520px;border-radius:20px;max-height:85vh;}
  .delete-btn{transition:opacity 0.15s,color 0.15s;}
  .chip{transition:all 0.15s;}
  .chip:hover:not(.selected){border-color:var(--text3);}
  .add-btn{transition:opacity 0.15s;}
  .add-btn:hover{opacity:0.9;}
  .expense-item{transition:border-color 0.15s;}
  .expense-item:hover{border-color:var(--text3);}
}

/* ── Header ── */
.header{padding:20px 20px 16px;background:linear-gradient(135deg,#E52020,#C41818,#8B0000);position:relative;overflow:hidden;}
.header::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,0.06);border-radius:50%;}
.header::after{content:'🏁';position:absolute;top:12px;right:16px;font-size:36px;opacity:0.3;}
.header h1{font-size:21px;font-weight:900;letter-spacing:-0.5px;line-height:1.3;}
.header p{font-size:13px;opacity:0.8;margin-top:4px;}
.rate-badge{position:absolute;bottom:12px;right:16px;background:rgba(0,0,0,0.3);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:11px;font-weight:600;padding:5px 10px;border-radius:20px;cursor:pointer;font-family:var(--font);}
.trip-badge{display:inline-flex;align-items:center;gap:4px;margin-top:10px;background:rgba(0,0,0,0.3);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);font-size:11px;font-weight:600;padding:5px 10px;border-radius:20px;cursor:pointer;font-family:var(--font);}

/* ── Countdown / Sync / Tabs ── */
.countdown-banner{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;font-size:13px;font-weight:600;}
.countdown-banner.before{background:linear-gradient(90deg,rgba(59,130,246,0.15),rgba(229,32,32,0.15));color:var(--blue);}
.countdown-banner.during{background:linear-gradient(90deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05));color:var(--green);}
.countdown-banner.after{background:rgba(107,105,112,0.1);color:var(--text3);}
.countdown-pulse{width:8px;height:8px;border-radius:50%;background:currentColor;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.8);}}
.sync-bar{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;font-size:11px;color:var(--text3);background:var(--surface);border-bottom:1px solid var(--border);}
.sync-dot{width:6px;height:6px;border-radius:50%;}.sync-dot.ok{background:var(--green);}.sync-dot.live{background:var(--green);animation:pulse 2s infinite;}.sync-dot.err{background:var(--accent);}
.tab-bar{display:flex;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;}
.tab{flex:1;padding:14px 0 12px;text-align:center;font-size:13px;font-weight:500;color:var(--text3);border:none;background:none;cursor:pointer;position:relative;font-family:var(--font);}
.tab.active{color:var(--text);}.tab.active::after{content:'';position:absolute;bottom:0;left:20%;width:60%;height:2.5px;background:var(--accent);border-radius:2px;}
.tab-icon{font-size:18px;display:block;margin-bottom:3px;}

/* ── Itinerary ── */
.day-scroll{display:flex;gap:8px;padding:16px 20px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.day-scroll::-webkit-scrollbar{display:none;}
.day-chip{flex-shrink:0;padding:8px 14px;border-radius:20px;background:var(--surface2);border:1.5px solid var(--border);color:var(--text2);font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;white-space:nowrap;position:relative;font-family:var(--font);}
.day-chip.active{color:#fff;border-color:transparent;}
.day-chip .day-num{font-weight:700;font-size:13px;}
.day-chip .today-dot{position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:var(--green);border:1.5px solid var(--surface2);animation:pulse 1.5s infinite;}
.spots-list{padding:0 20px 20px;}
.spot-card{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);animation:fadeUp 0.3s ease both;position:relative;}
.spot-card.next-up{background:linear-gradient(90deg,rgba(229,32,32,0.08),transparent);margin:0 -20px;padding:14px 20px;border-radius:12px;border-bottom:none;border:1.5px solid rgba(229,32,32,0.3);}
.spot-card.past-spot{opacity:0.4;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
.spot-time-col{width:48px;flex-shrink:0;text-align:center;}.spot-time{font-size:12px;font-weight:700;color:var(--text2);}
.spot-card.next-up .spot-time{color:var(--accent);}
.spot-icon{font-size:20px;margin-top:4px;}
.spot-body{flex:1;min-width:0;}.spot-name{font-size:15px;font-weight:700;line-height:1.3;margin-bottom:3px;}.spot-note{font-size:12px;color:var(--text2);line-height:1.5;}
.spot-nav{flex-shrink:0;width:36px;height:36px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;text-decoration:none;align-self:center;}
.spot-nav:hover,.spot-nav:active{background:var(--accent);border-color:var(--accent);transform:scale(1.08);}
.next-badge{display:inline-flex;align-items:center;gap:4px;background:var(--accent);color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;margin-bottom:4px;letter-spacing:0.5px;}
.next-badge-dot{width:5px;height:5px;border-radius:50%;background:white;animation:pulse 1.2s infinite;}
.day-header{padding:0 20px 12px;}.day-header h2{font-size:20px;font-weight:900;}.day-header .day-date{font-size:13px;color:var(--text2);margin-top:2px;}

/* ── Expenses ── */
.expense-section{padding:20px;}
.expense-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.summary-card{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:14px;}
.summary-card .label{font-size:11px;color:var(--text3);font-weight:500;text-transform:uppercase;letter-spacing:0.5px;}
.summary-card .value{font-size:22px;font-weight:900;margin-top:4px;}
.summary-card .sub{font-size:11px;color:var(--text3);margin-top:2px;}
.add-btn{width:100%;padding:14px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:white;font-size:15px;font-weight:700;border:none;cursor:pointer;font-family:var(--font);margin-bottom:16px;}

/* ── Form ── */
.form-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s;padding-top:env(safe-area-inset-top,0px);}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.form-sheet{background:var(--surface);width:100%;max-width:600px;border-radius:20px 20px 0 0;padding:16px 20px calc(36px + env(safe-area-inset-bottom,0px));animation:slideUp 0.3s ease;max-height:92vh;max-height:92dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
.form-handle{width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 14px;}
.form-sheet h3{font-size:18px;font-weight:900;margin-bottom:16px;}
.form-group{margin-bottom:12px;}
.form-label{font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;display:block;}
.form-input{width:100%;padding:11px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:12px;color:var(--text);font-size:16px;font-family:var(--font);outline:none;-webkit-appearance:none;}
.form-input:focus{border-color:var(--accent);}.form-input::placeholder{color:var(--text3);}
.form-error{color:var(--accent);font-size:12px;margin-top:4px;}
.split-type-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.split-type-btn{padding:8px 12px;border-radius:12px;background:var(--surface2);border:1.5px solid var(--border);font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;font-family:var(--font);text-align:center;}
.split-type-btn.active{border-color:var(--accent);color:var(--text);background:rgba(229,32,32,0.15);}
.custom-split-list{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
.custom-split-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface2);border-radius:12px;border:1px solid var(--border);}
.custom-split-name{font-size:14px;font-weight:600;min-width:48px;}
.custom-split-input{flex:1;padding:8px 10px;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;color:var(--text);font-size:15px;font-family:var(--font);outline:none;-webkit-appearance:none;text-align:right;}
.custom-split-input:focus{border-color:var(--accent);}
.custom-split-input::placeholder{color:var(--text3);}
.split-sum-bar{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:10px;font-size:12px;font-weight:600;margin-top:6px;}
.split-sum-bar.ok{background:rgba(34,197,94,0.1);color:var(--green);}
.split-sum-bar.mismatch{background:rgba(229,32,32,0.1);color:var(--accent);}
.chip-group{display:flex;flex-wrap:wrap;gap:8px;}
.chip{padding:8px 14px;border-radius:20px;background:var(--surface2);border:1.5px solid var(--border);font-size:13px;color:var(--text2);cursor:pointer;font-family:var(--font);-webkit-tap-highlight-color:transparent;}
.chip.selected{border-color:var(--accent);color:var(--text);background:rgba(229,32,32,0.15);}
.form-actions{display:flex;gap:10px;margin-top:16px;}
.btn-cancel{flex:1;padding:14px;border-radius:12px;background:var(--surface2);border:1px solid var(--border);color:var(--text2);font-size:15px;font-weight:600;cursor:pointer;font-family:var(--font);}
.btn-save{flex:2;padding:14px;border-radius:12px;background:var(--accent);border:none;color:white;font-size:15px;font-weight:700;cursor:pointer;font-family:var(--font);}
.currency-toggle{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.currency-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:12px 10px;border-radius:14px;background:var(--surface2);border:2px solid var(--border);color:var(--text2);font-size:14px;font-weight:600;cursor:pointer;font-family:var(--font);}
.currency-btn .currency-flag{font-size:22px;margin-bottom:2px;}
.currency-btn .currency-sub{font-size:10px;color:var(--text3);}
.currency-btn.active-jpy{border-color:#E52020;background:rgba(229,32,32,0.12);color:var(--text);}
.currency-btn.active-twd{border-color:#3B82F6;background:rgba(59,130,246,0.12);color:var(--text);}

/* ── Expense list ── */
.expense-list{display:flex;flex-direction:column;gap:8px;}
.expense-item{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;animation:fadeUp 0.3s ease both;}
.expense-cat-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.expense-info{flex:1;min-width:0;}.expense-desc{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}.expense-meta{font-size:11px;color:var(--text3);margin-top:2px;}
.expense-amount{font-size:16px;font-weight:900;text-align:right;flex-shrink:0;}.expense-amount .yen{font-size:11px;color:var(--text3);font-weight:500;}
.delete-btn{background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:4px;opacity:0.5;}.delete-btn:hover{opacity:1;color:var(--accent);}
.confirm-delete{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.confirm-delete button{padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);border:none;}
.confirm-delete .yes{background:var(--accent);color:white;}.confirm-delete .no{background:var(--surface);color:var(--text2);border:1px solid var(--border);}

/* ── Settlement ── */
.settle-section{padding:20px;}
.settle-title{font-size:20px;font-weight:900;}
.settle-subtitle{font-size:13px;color:var(--text2);margin-bottom:12px;margin-top:4px;}
.settle-mode-bar{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
.settle-mode-btn{padding:7px 14px;border-radius:20px;background:var(--surface2);border:1.5px solid var(--border);font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;font-family:var(--font);white-space:nowrap;}
.settle-mode-btn.active{border-color:var(--accent);color:var(--text);background:rgba(229,32,32,0.15);}
.balance-list{margin-bottom:24px;}
.balance-item{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);gap:12px;}
.balance-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white;flex-shrink:0;}
.balance-name{flex:1;font-size:14px;font-weight:600;}
.balance-paid{font-size:12px;color:var(--text3);text-align:right;}
.balance-amt{font-size:15px;font-weight:800;text-align:right;min-width:70px;}
.positive{color:var(--green);}.negative{color:var(--accent);}
.settle-arrow-section{background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:20px;}
.settle-arrow-title{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.settle-tx{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);}
.settle-tx:last-child{border-bottom:none;}
.settle-from,.settle-to{font-size:14px;font-weight:700;min-width:40px;}
.settle-arrow{color:var(--accent);font-size:18px;}
.settle-tx-amt{margin-left:auto;font-size:15px;font-weight:900;color:var(--accent2);}
.settle-currency-section{margin-bottom:24px;}
.settle-currency-header{font-size:15px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--surface2);border-radius:12px;border:1px solid var(--border);}
.settle-currency-header .settle-total{margin-left:auto;font-size:13px;font-weight:600;color:var(--text2);}

/* ── Misc ── */
.no-expenses{text-align:center;padding:60px 20px;color:var(--text3);}.no-expenses .big-icon{font-size:48px;margin-bottom:12px;}
.empty-state{text-align:center;padding:40px 20px;color:var(--text3);font-size:14px;}
.loading-overlay{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999;}
.spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
`;

// ─── Components ─────────────────────────────────────────────

function ItineraryTab({nextUp,itinerary}){
  const[sel,setSel]=useState(nextUp.dayIdx);
  const day=itinerary[sel];
  const ref=useRef(null);
  const isToday=sel===nextUp.dayIdx&&(nextUp.status==="during"||nextUp.status==="during-done");
  useEffect(()=>{if(ref.current&&isToday)setTimeout(()=>ref.current?.scrollIntoView({behavior:"smooth",block:"center"}),400);},[sel,isToday]);

  return(<div>
    <div className="day-scroll">{itinerary.map((d,i)=>(
      <button key={i} className={`day-chip ${i===sel?"active":""}`}
        style={i===sel?{background:d.color,borderColor:d.color,color:"#fff"}:{}}
        onClick={()=>setSel(i)}>
        <span className="day-num">D{d.day}</span> {d.date.split(" ")[0]}
        {i===nextUp.dayIdx&&(nextUp.status==="during"||nextUp.status==="during-done")&&<span className="today-dot"/>}
      </button>
    ))}</div>
    <div className="day-header">
      <h2 style={{color:day.color}}>{day.title}{isToday&&<span style={{fontSize:12,fontWeight:500,color:"var(--green)",marginLeft:8}}>← 今天</span>}</h2>
      <div className="day-date">{day.date}</div>
    </div>
    <div className="spots-list">{day.spots.map((s,i)=>{
      const isNext=isToday&&i===nextUp.spotIdx&&nextUp.status==="during";
      const isPast=isToday&&nextUp.status==="during"&&i<nextUp.spotIdx;
      return(
        <div key={i} ref={isNext?ref:null} className={`spot-card ${isNext?"next-up":""} ${isPast?"past-spot":""}`} style={{animationDelay:`${i*0.05}s`}}>
          <div className="spot-time-col"><div className="spot-time">{s.time}</div><div className="spot-icon">{s.icon}</div></div>
          <div className="spot-body">
            {isNext&&<div className="next-badge"><span className="next-badge-dot"/>NEXT UP</div>}
            <div className="spot-name">{s.name}</div>
            <div className="spot-note">{s.note}</div>
          </div>
          <a className="spot-nav" href={googleMapsUrl(s.lat,s.lng)} target="_blank" rel="noopener noreferrer">📍</a>
        </div>
      );
    })}</div>
  </div>);
}

function ExpenseForm({onSave,onCancel,jpyToTwd}){
  const[desc,setDesc]=useState("");
  const[amount,setAmount]=useState("");
  const[currency,setCurrency]=useState("JPY");
  const[paidBy,setPaidBy]=useState(MEMBERS[0]);
  const[category,setCategory]=useState("food");
  const[splitAmong,setSplitAmong]=useState([...MEMBERS]);
  const[splitType,setSplitType]=useState("equal"); // "equal" | "custom"
  const[splitAmounts,setSplitAmounts]=useState({}); // { memberName: number }
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState("");
  const twdToJpy=1/jpyToTwd;
  const currencySymbol=currency==="JPY"?"¥":"NT$";

  const customSum=Object.values(splitAmounts).reduce((s,v)=>s+(parseFloat(v)||0),0);
  const rawAmount=Math.round(parseFloat(amount)||0);

  const handleSave=async()=>{
    if(!desc||!amount||saving) return;
    if(splitAmong.length===0){setError("請至少選擇一位分攤人員");return;}
    if(isNaN(rawAmount)||rawAmount<=0){setError("請輸入有效金額");return;}
    if(splitType==="custom"){
      if(Math.abs(customSum-rawAmount)>0.5){setError(`自訂金額合計 ${currencySymbol}${customSum.toLocaleString()} ≠ 總額 ${currencySymbol}${rawAmount.toLocaleString()}`);return;}
    }
    setError("");
    setSaving(true);
    try{
      const expenseData={
        desc,
        amount: currency==="TWD"?Math.round(rawAmount*twdToJpy):rawAmount,
        originalAmount: rawAmount,
        currency,
        paidBy,
        category,
        splitAmong,
        date: new Date().toLocaleDateString("zh-TW"),
      };
      if(splitType==="custom"){
        // Store custom amounts in original currency, only for selected members with amount > 0
        const cleanAmounts={};
        splitAmong.forEach(m=>{
          const v=Math.round(parseFloat(splitAmounts[m])||0);
          if(v>0) cleanAmounts[m]=v;
        });
        expenseData.splitType="custom";
        expenseData.splitAmounts=cleanAmounts;
        expenseData.splitAmong=Object.keys(cleanAmounts);
      }
      await onSave(expenseData);
    }catch(e){console.error(e);}finally{setSaving(false);}
  };

  const handleToggleMember=(m)=>{
    const next=splitAmong.includes(m)?splitAmong.filter(x=>x!==m):[...splitAmong,m];
    // Clean up splitAmounts for removed members
    if(!next.includes(m)) setSplitAmounts(prev=>{const n={...prev};delete n[m];return n;});
    setSplitAmong(next);
    setError("");
  };

  return(
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-sheet" onClick={e=>e.stopPropagation()}>
        <div className="form-handle"/>
        <h3>新增花費 💴</h3>
        <div className="form-group">
          <label className="form-label">花了什麼</label>
          <input className="form-input" placeholder="例：拉麵午餐" value={desc} onChange={e=>setDesc(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">幣別</label>
          <div className="currency-toggle">
            <button className={`currency-btn ${currency==="JPY"?"active-jpy":""}`} onClick={()=>setCurrency("JPY")}>
              <span className="currency-flag">🇯🇵</span><span>¥ 日圓</span><span className="currency-sub">現金</span>
            </button>
            <button className={`currency-btn ${currency==="TWD"?"active-twd":""}`} onClick={()=>setCurrency("TWD")}>
              <span className="currency-flag">🇹🇼</span><span>NT$ 台幣</span><span className="currency-sub">刷卡</span>
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">金額（{currency==="JPY"?"¥ 日圓":"NT$ 台幣"}）</label>
          <input className="form-input" type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}/>
          {amount&&<div style={{fontSize:12,color:"var(--text3)",marginTop:6}}>
            {currency==="JPY"
              ?`≈ NT$${Math.round(parseFloat(amount||0)*jpyToTwd).toLocaleString()}`
              :`≈ ¥${Math.round(parseFloat(amount||0)*twdToJpy).toLocaleString()}`}
          </div>}
        </div>
        <div className="form-group">
          <label className="form-label">分類</label>
          <div className="chip-group">{CATEGORIES.map(c=>(
            <button key={c.id} className={`chip ${category===c.id?"selected":""}`} onClick={()=>setCategory(c.id)}>{c.icon} {c.label}</button>
          ))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">誰付的</label>
          <div className="chip-group">{MEMBERS.map(m=>(
            <button key={m} className={`chip ${paidBy===m?"selected":""}`} onClick={()=>setPaidBy(m)}>{m}</button>
          ))}</div>
        </div>
        <div className="form-group">
          <label className="form-label">分攤方式</label>
          <div className="split-type-toggle">
            <button className={`split-type-btn ${splitType==="equal"?"active":""}`} onClick={()=>setSplitType("equal")}>均分</button>
            <button className={`split-type-btn ${splitType==="custom"?"active":""}`} onClick={()=>setSplitType("custom")}>自訂金額</button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{splitType==="equal"?"分攤給誰（點擊取消勾選）":"各人金額（點名字切換參與）"}</label>
          {splitType==="equal"?(
            <div className="chip-group">{MEMBERS.map(m=>(
              <button key={m} className={`chip ${splitAmong.includes(m)?"selected":""}`}
                onClick={()=>handleToggleMember(m)}>{m}</button>
            ))}</div>
          ):(
            <div>
              <div className="chip-group" style={{marginBottom:8}}>{MEMBERS.map(m=>(
                <button key={m} className={`chip ${splitAmong.includes(m)?"selected":""}`}
                  onClick={()=>handleToggleMember(m)}>{m}</button>
              ))}</div>
              <div className="custom-split-list">
                {splitAmong.map(m=>(
                  <div key={m} className="custom-split-row">
                    <div className="custom-split-name">{m}</div>
                    <span style={{fontSize:13,color:"var(--text3)"}}>{currencySymbol}</span>
                    <input
                      className="custom-split-input"
                      type="number"
                      placeholder="0"
                      value={splitAmounts[m]||""}
                      onChange={e=>setSplitAmounts(prev=>({...prev,[m]:e.target.value}))}
                    />
                  </div>
                ))}
              </div>
              {amount&&splitAmong.length>0&&(
                <div className={`split-sum-bar ${Math.abs(customSum-rawAmount)<=0.5?"ok":"mismatch"}`}>
                  <span>合計：{currencySymbol}{customSum.toLocaleString()}</span>
                  <span>總額：{currencySymbol}{rawAmount.toLocaleString()}</span>
                  {Math.abs(customSum-rawAmount)<=0.5?<span>✓ 吻合</span>:<span>差額 {currencySymbol}{Math.abs(rawAmount-customSum).toLocaleString()}</span>}
                </div>
              )}
            </div>
          )}
          {error&&<div className="form-error">{error}</div>}
        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onCancel}>取消</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>{saving?"儲存中...":"儲存"}</button>
        </div>
      </div>
    </div>
  );
}

function ExpenseTab({expenses,onAdd,onDelete,jpyToTwd}){
  const[sf,setSf]=useState(false);
  const[confirmId,setConfirmId]=useState(null);
  const totalJpy=expenses.reduce((s,e)=>s+e.amount,0);
  const jpyCount=expenses.filter(e=>(e.currency||"JPY")==="JPY").length;
  const twdCount=expenses.filter(e=>(e.currency||"JPY")==="TWD").length;

  return(
    <div className="expense-section">
      <div className="expense-summary">
        <div className="summary-card">
          <div className="label">總花費</div>
          <div className="value">¥{totalJpy.toLocaleString()}</div>
          <div className="sub">≈ NT${Math.round(totalJpy*jpyToTwd).toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="label">筆數</div>
          <div className="value">{expenses.length}</div>
          <div className="sub">{jpyCount>0&&`🇯🇵${jpyCount}筆`}{jpyCount>0&&twdCount>0&&" · "}{twdCount>0&&`🇹🇼${twdCount}筆`}</div>
        </div>
      </div>
      <button className="add-btn" onClick={()=>setSf(true)}>＋ 新增花費</button>
      {expenses.length===0
        ?(<div className="no-expenses"><div className="big-icon">🧾</div><div>還沒有花費紀錄</div></div>)
        :(<div className="expense-list">{expenses.map(exp=>{
          const cat=CATEGORIES.find(c=>c.id===exp.category)||CATEGORIES[5];
          const isJ=(exp.currency||"JPY")==="JPY";
          const da=exp.originalAmount||exp.amount;
          return(
            <div key={exp._docId||exp.id} className="expense-item">
              <div className="expense-cat-icon" style={{background:cat.color+"22"}}>{cat.icon}</div>
              <div className="expense-info">
                <div className="expense-desc">{exp.desc}</div>
                <div className="expense-meta">
                  {exp.paidBy} 付 · {
                    (exp.splitAmong||[]).length===MEMBERS.length
                      ?(exp.splitType==="custom"?"全員自訂":"全員均分")
                      :`${(exp.splitAmong||[]).join("、")}${exp.splitType==="custom"?" 自訂":" 均分"}`
                  } · {isJ?"🇯🇵現金":"🇹🇼刷卡"}
                </div>
              </div>
              <div className="expense-amount">
                {isJ?"¥":"NT$"}{da.toLocaleString()}
                <div className="yen">{isJ?`≈ NT$${Math.round(exp.amount*jpyToTwd).toLocaleString()}`:`≈ ¥${exp.amount.toLocaleString()}`}</div>
              </div>
              {confirmId===exp._docId
                ?(<div className="confirm-delete">
                    <button className="yes" onClick={()=>{onDelete(exp._docId);setConfirmId(null);}}>刪除</button>
                    <button className="no" onClick={()=>setConfirmId(null)}>取消</button>
                  </div>)
                :(<button className="delete-btn" onClick={()=>setConfirmId(exp._docId)}>✕</button>)
              }
            </div>
          );
        })}</div>)
      }
      {sf&&<ExpenseForm onSave={async(e)=>{await onAdd(e);setSf(false);}} onCancel={()=>setSf(false)} jpyToTwd={jpyToTwd}/>}
    </div>
  );
}

const AC=["#E52020","#3B82F6","#22C55E","#F59E0B","#8B5CF6"];

function BalanceList({balances, paid, members, symbol, cv}){
  return(
    <div className="balance-list">{members.map((m,i)=>(
      <div key={m} className="balance-item">
        <div className="balance-avatar" style={{background:AC[i]}}>{m[0]}</div>
        <div className="balance-name">{m}</div>
        <div className="balance-paid">已付 {symbol}{cv(paid[m]||0).toLocaleString()}</div>
        <div className={`balance-amt ${(balances[m]||0)>=0?"positive":"negative"}`}>
          {(balances[m]||0)>=0?"+":""}{symbol}{cv(balances[m]||0).toLocaleString()}
        </div>
      </div>
    ))}</div>
  );
}

function TransferList({transactions, symbol, cv}){
  return(
    <div className="settle-arrow-section">
      <div className="settle-arrow-title"><span>💸</span> 最少轉帳路徑</div>
      {transactions.length===0
        ?(<div className="empty-state">所有人都已結清！</div>)
        :transactions.map((t,i)=>(
          <div key={i} className="settle-tx">
            <div className="settle-from">{t.from}</div>
            <div className="settle-arrow">→</div>
            <div className="settle-to">{t.to}</div>
            <div className="settle-tx-amt">{symbol}{cv(t.amount).toLocaleString()}</div>
          </div>
        ))
      }
    </div>
  );
}

function SettleTab({expenses, jpyToTwd}){
  const[mode,setMode]=useState("split");

  if(expenses.length===0) return(
    <div className="settle-section">
      <div className="settle-title">結算</div>
      <div className="no-expenses"><div className="big-icon">🤝</div><div>記帳後才能結算</div></div>
    </div>
  );

  const hasJpy=expenses.some(e=>(e.currency||"JPY")==="JPY");
  const hasTwd=expenses.some(e=>(e.currency||"JPY")==="TWD");
  // Single-currency ledgers have nothing to "split" — fall back to that currency
  const effMode=mode==="split"&&!(hasJpy&&hasTwd)?(hasTwd?"unified-twd":"unified-jpy"):mode;
  const settlement=calcSettlement(expenses, MEMBERS, effMode, jpyToTwd);

  return(
    <div className="settle-section">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}>
        <div className="settle-title">結算</div>
      </div>

      <div className="settle-mode-bar">
        {hasTwd&&hasJpy&&<button className={`settle-mode-btn ${effMode==="split"?"active":""}`} onClick={()=>setMode("split")}>🔀 分幣別</button>}
        <button className={`settle-mode-btn ${effMode==="unified-jpy"?"active":""}`} onClick={()=>setMode("unified-jpy")}>🇯🇵 統一日圓</button>
        <button className={`settle-mode-btn ${effMode==="unified-twd"?"active":""}`} onClick={()=>setMode("unified-twd")}>🇹🇼 統一台幣</button>
      </div>

      {settlement.mode==="split" ? (
        <div className="settle-currency-group">
          {/* JPY section */}
          {settlement.jpy.total>0&&(
            <div className="settle-currency-section">
              <div className="settle-currency-header">
                <span>🇯🇵 日圓帳</span>
                <span className="settle-total">共 ¥{Math.round(settlement.jpy.total).toLocaleString()}</span>
              </div>
              <BalanceList balances={settlement.jpy.balances} paid={settlement.jpy.paid} members={MEMBERS} symbol="¥" cv={v=>Math.round(v)}/>
              <TransferList transactions={settlement.jpy.transactions} symbol="¥" cv={v=>Math.round(v)}/>
            </div>
          )}

          {/* TWD section */}
          {settlement.twd.total>0&&(
            <div className="settle-currency-section">
              <div className="settle-currency-header">
                <span>🇹🇼 台幣帳</span>
                <span className="settle-total">共 NT${Math.round(settlement.twd.total).toLocaleString()}</span>
              </div>
              <BalanceList balances={settlement.twd.balances} paid={settlement.twd.paid} members={MEMBERS} symbol="NT$" cv={v=>Math.round(v)}/>
              <TransferList transactions={settlement.twd.transactions} symbol="NT$" cv={v=>Math.round(v)}/>
            </div>
          )}

          {settlement.jpy.total===0&&settlement.twd.total===0&&(
            <div className="no-expenses"><div className="big-icon">🤝</div><div>沒有需要結算的項目</div></div>
          )}
        </div>
      ) : (
        <div>
          <div className="settle-subtitle">
            每人餘額（{settlement.mode==="unified-jpy"?"日圓":"台幣"}）
            <span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>
              共 {settlement.mode==="unified-jpy"?"¥":"NT$"}{Math.round(settlement.result.total).toLocaleString()}
            </span>
          </div>
          <div className="settle-layout">
            <BalanceList
              balances={settlement.result.balances}
              paid={settlement.result.paid}
              members={MEMBERS}
              symbol={settlement.mode==="unified-jpy"?"¥":"NT$"}
              cv={v=>Math.round(v)}
            />
            <TransferList
              transactions={settlement.result.transactions}
              symbol={settlement.mode==="unified-jpy"?"¥":"NT$"}
              cv={v=>Math.round(v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────

export default function App(){
  const[tab,setTab]=useState("itinerary");
  const[tripId,setTripId]=useState(()=>{
    const saved=localStorage.getItem("tripId");
    return TRIPS.some(t=>t.id===saved)?saved:TRIPS[0].id;
  });
  const trip=TRIPS.find(t=>t.id===tripId)||TRIPS[0];
  const otherTrip=TRIPS.find(t=>t.id!==trip.id);
  const[expenses,setExpenses]=useState([]);
  const[jpyToTwd,setJpyToTwd]=useState(trip.defaultRate);
  const[showRate,setShowRate]=useState(false);
  const[rateInput,setRateInput]=useState(String(trip.defaultRate));
  const[now,setNow]=useState(new Date());
  const[loading,setLoading]=useState(true);
  const[connected,setConnected]=useState(false);
  const[syncError,setSyncError]=useState(false);

  useEffect(()=>{
    setLoading(true);setConnected(false);setSyncError(false);setExpenses([]);
    const t=TRIPS.find(x=>x.id===tripId)||TRIPS[0];
    setJpyToTwd(t.defaultRate);setRateInput(String(t.defaultRate));
    const unsub1=subscribeExpenses(t.expensesColl,
      (data)=>{setExpenses(data);setLoading(false);setConnected(true);setSyncError(false);},
      ()=>{setLoading(false);setConnected(false);setSyncError(true);});
    const unsub2=subscribeSettings(t.settingsDoc,(s)=>{if(s.jpyToTwd){const r=parseFloat(s.jpyToTwd);if(r>0){setJpyToTwd(r);setRateInput(String(r));}}},t.defaultRate);
    return()=>{unsub1();unsub2();};
  },[tripId]);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);

  const switchTrip=()=>{
    if(!otherTrip) return;
    localStorage.setItem("tripId",otherTrip.id);
    setTripId(otherTrip.id);
  };

  const nextUp=findNextUp(now,trip.itinerary);
  const handleAdd=async(exp)=>{await fbAddExpense(trip.expensesColl,exp);};
  const handleDelete=async(docId)=>{await fbDeleteExpense(trip.expensesColl,docId);};
  const handleRateSave=async()=>{const v=parseFloat(rateInput);if(v>0&&v<10){setJpyToTwd(v);setShowRate(false);await updateSetting(trip.settingsDoc,"jpyToTwd",v);}};

  const ctText=nextUp.status==="before"?`✈️ 距離出發還有 ${nextUp.daysUntil} 天！`
    :nextUp.status==="during"?`📍 下一站：${trip.itinerary[nextUp.dayIdx].spots[nextUp.spotIdx].name}`
    :nextUp.status==="during-done"?"✅ 今天行程已結束":"🏠 旅程已結束，辛苦了！";

  if(loading) return(<><style>{CSS}</style><div className="loading-overlay"><div className="spinner"/><p style={{marginTop:12,fontSize:13,color:"var(--text2)"}}>連線 Firebase 中...</p></div></>);

  return(<><style>{CSS}</style><div className="app">
    <div className="header">
      <h1>{trip.title}</h1>
      <p>{trip.subtitle}</p>
      {otherTrip&&<button className="trip-badge" onClick={switchTrip}>🔁 切換至 {otherTrip.switchLabel}</button>}
      <button className="rate-badge" onClick={()=>{setRateInput(String(jpyToTwd));setShowRate(true);}}>¥1 = NT${jpyToTwd} ⚙️</button>
    </div>
    <div className={`countdown-banner ${nextUp.status==="before"?"before":nextUp.status==="after"?"after":"during"}`}>
      {nextUp.status==="during"&&<span className="countdown-pulse"/>}{ctText}
    </div>
    <div className="sync-bar">
      <div className={`sync-dot ${syncError?"err":connected?"live":"ok"}`}/>
      <span>{syncError?"⚠️ 同步失敗，請檢查網路後重新整理":connected?"🔴 即時同步中":"連線中..."}</span>
    </div>
    <div className="tab-bar">
      <button className={`tab ${tab==="itinerary"?"active":""}`} onClick={()=>setTab("itinerary")}><span className="tab-icon">📍</span>行程</button>
      <button className={`tab ${tab==="expense"?"active":""}`} onClick={()=>setTab("expense")}><span className="tab-icon">💴</span>記帳</button>
      <button className={`tab ${tab==="settle"?"active":""}`} onClick={()=>setTab("settle")}><span className="tab-icon">🤝</span>結算</button>
    </div>
    {tab==="itinerary"&&<ItineraryTab key={trip.id} nextUp={nextUp} itinerary={trip.itinerary}/>}
    {tab==="expense"&&<ExpenseTab expenses={expenses} onAdd={handleAdd} onDelete={handleDelete} jpyToTwd={jpyToTwd}/>}
    {tab==="settle"&&<SettleTab expenses={expenses} jpyToTwd={jpyToTwd}/>}
  </div>
  {showRate&&(
    <div className="form-overlay" onClick={()=>setShowRate(false)}>
      <div className="form-sheet" onClick={e=>e.stopPropagation()} style={{paddingBottom:28}}>
        <div className="form-handle"/>
        <h3>⚙️ 匯率設定</h3>
        <p style={{fontSize:13,color:"var(--text2)",marginBottom:16,lineHeight:1.6}}>大家結算時統一採用的匯率。</p>
        <div className="form-group">
          <label className="form-label">¥1 日圓 = NT$ ?</label>
          <input className="form-input" type="number" step="0.001" value={rateInput} onChange={e=>setRateInput(e.target.value)} style={{fontSize:22,fontWeight:900,textAlign:"center"}}/>
        </div>
        {rateInput&&parseFloat(rateInput)>0&&(
          <div style={{background:"var(--surface2)",borderRadius:12,padding:14,marginBottom:16,display:"flex",justifyContent:"space-around",textAlign:"center"}}>
            <div><div style={{fontSize:11,color:"var(--text3)"}}>¥1,000</div><div style={{fontSize:16,fontWeight:700}}>NT${Math.round(1000*parseFloat(rateInput)).toLocaleString()}</div></div>
            <div><div style={{fontSize:11,color:"var(--text3)"}}>¥10,000</div><div style={{fontSize:16,fontWeight:700}}>NT${Math.round(10000*parseFloat(rateInput)).toLocaleString()}</div></div>
            <div><div style={{fontSize:11,color:"var(--text3)"}}>¥50,000</div><div style={{fontSize:16,fontWeight:700}}>NT${Math.round(50000*parseFloat(rateInput)).toLocaleString()}</div></div>
          </div>
        )}
        <div className="form-actions">
          <button className="btn-cancel" onClick={()=>setShowRate(false)}>取消</button>
          <button className="btn-save" onClick={handleRateSave}>確認</button>
        </div>
      </div>
    </div>
  )}
  </>);
}
