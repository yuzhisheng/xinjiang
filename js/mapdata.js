// ===================================================================
// 高德地图 Key 配置
// 免费申请：https://console.amap.com → 应用管理 → 创建应用 → 添加Key
// 服务平台务必选择「Web端(JS API)」
// v2.0 起同时需要配套的安全密钥 securityJsCode
// ===================================================================
export const AMAP_CONFIG = {
  key: 'ab800010988ba8a13e407604fab001fc',
  securityJsCode: ''
};

// ===================================================================
// 行程站点（uid 为唯一标识；坐标 GCJ-02，已用腾讯地图实测校正）
// ===================================================================
export const MAP_STOPS = [
  {
    uid: 'urc', day: 'D0', name: '乌鲁木齐', sub: '09/24 深夜抵达 · 宿机场',
    lat: 43.899670, lng: 87.470058, type: 'city',
    desc: '深圳 17:40 起飞、深夜落地。明早机场店取车（已预约 9/25 早取、10/3 早还共 8 天），今晚直接睡机场酒店，为 490km 北上养精蓄锐。',
    stay: '机场酒店（第 1 晚）', nights: 1
  },
  {
    uid: 'fuhai', day: 'D1', name: '福海县', sub: '午餐 · 乌伦古湖烤鱼',
    lat: 47.112165, lng: 87.486642, type: 'pass',
    desc: 'S21 沿线的午餐点：乌伦古湖冷水鱼是北疆第一味，饭后顺路看一眼"离海最远的海"。',
    stay: '—（途经午餐）', nights: 0
  },
  {
    uid: 'altay', day: 'D1', name: '阿勒泰市', sub: '宿市区 · 明晨进阿禾公路',
    lat: 47.827064, lng: 88.131946, type: 'city',
    desc: '今日 490km（实测 5h04m）终点，《我的阿勒泰》故事原点。满油、备齐干粮，明早直上 G681。',
    stay: '阿勒泰市区酒店', nights: 1
  },
  {
    uid: 'hemu', day: 'D2', name: '禾木村', sub: '观景台日落 · 清晨云雾',
    lat: 48.568560, lng: 87.432910, type: 'star',
    desc: '经阿禾公路 224km 边走边玩抵达，全程画面巅峰。已订禾盛山庄（禾木村入口服务区）：清晨看雾需预留 20-30 分钟接驳，提前问店家进村方式。',
    stay: '禾盛山庄（已订 · 村口服务区）', nights: 1
  },
  {
    uid: 'kanas', day: 'D3-4', name: '喀纳斯', sub: '三湾 · 晨雾 · 湖边栈道 · 游船',
    lat: 48.691747, lng: 87.025975, type: 'star',
    desc: '两晚都住贾登峪（景区门口）：D3 下午三湾、D4 清晨神仙湾晨雾+湖边栈道。观鱼台季节性关闭中（至 2027 春），原登高改平缓栈道；每天赶首班区间车进山。',
    stay: '贾登峪 · 生态度假酒店(27) + 疆峪酒店(28) · 已订', nights: 2
  },
  {
    uid: 'burjin', day: 'D5', name: '布尔津', sub: '五彩滩日落 · 河堤夜市',
    lat: 47.702615, lng: 86.875590, type: 'city',
    desc: '出山缓冲日，仅 124km。傍晚五彩滩看日落，晚上河堤夜市烤冷水鱼，物价正常的最后补给点。',
    stay: '布尔津县城酒店', nights: 1
  },
  {
    uid: 'ghost', day: 'D6', name: '世界魔鬼城', sub: '乌尔禾雅丹 · 日落后就近入住',
    lat: 46.129675, lng: 85.746798, type: 'spot',
    desc: '风蚀土林像外星球，日落色彩最浓。9/30 国庆前进景区人还不多，看完日落 10 分钟车程入住乌尔禾。',
    stay: '乌尔禾区酒店', nights: 1
  },
  {
    uid: 'sailimu', day: 'D7', name: '赛里木湖', sub: '环湖公路 · 湖畔日落与日出',
    lat: 44.555000, lng: 81.315000, type: 'star',
    desc: '10/1 西行 577km 抵达（全程最长单日）：下午环湖北线随停随拍，19:50 湖畔日落；明晨 07:50 看完日出再东归。宿湖畔或清水河镇。',
    stay: '赛湖湖畔 / 清水河镇 · 1 晚', nights: 1
  },
  {
    uid: 'bazaar', day: 'D8', name: '乌鲁木齐', sub: '大巴扎收官 · 宿机场赶上午航班',
    lat: 43.796200, lng: 87.616800, type: 'city',
    desc: '赛湖东归约 564km、17 点前后到。傍晚国际大巴扎买手信看歌舞宴，宿机场酒店，明晨 09:40 航班返深。',
    stay: '机场酒店（第 9 晚）', nights: 1
  }
];

// ===================================================================
// 分段车程（腾讯地图导航实测；via 为强制途经点，确保走 G681 阿禾公路）
// ===================================================================
export const MAP_LEGS = [
  {
    uid: 'L1', day: 'D1', from: 'urc', to: 'altay', km: 490, hours: '约5h04m',
    note: 'S21 阿乌高速直穿沙漠 · 途经福海午餐 · 过路费约217元', color: 'route',
    via: [[87.486642, 47.112165]]
  },
  {
    uid: 'L2', day: 'D2', from: 'altay', to: 'hemu', km: 224, hours: '约4h44m', note: 'G681 阿禾公路 · 31处观景台 · 无加油站限速30', color: 'ahe',
    via: [[88.306281, 48.176476], [87.586611, 48.379135]]
  },
  { uid: 'L3', day: 'D3', from: 'hemu', to: 'kanas', km: 66, hours: '约1h45m', note: '禾木 → 贾登峪停车换乘 · 山路弯多备晕车药', color: 'route' },
  { uid: 'L4', day: 'D5', from: 'kanas', to: 'burjin', km: 124, hours: '约2h05m', note: '出山 · 今晚五彩滩日落', color: 'route' },
  { uid: 'L5', day: 'D6', from: 'burjin', to: 'ghost', km: 217, hours: '约3h16m', note: 'G217 南下 · 国庆前一天错峰', color: 'route' },
  {
    uid: 'L6', day: 'D7', from: 'ghost', to: 'sailimu', km: 577, hours: '约6h30m',
    note: 'G217 + 连霍高速西行 · 全天最长 · 精河服务区午餐 · 国庆首日 7 点前出发', color: 'route',
    via: [[84.890, 45.580], [84.900, 44.420]]
  },
  {
    uid: 'L7', day: 'D8', from: 'sailimu', to: 'bazaar', km: 564, hours: '约6h15m',
    note: '连霍高速东归 · 傍晚大巴扎收官 · 过路费约 205 元', color: 'route',
    via: [[84.900, 44.420]]
  }
];

// 地图小标签（非站点，仅提示线路名）
export const MAP_LABELS = [
  { name: '阿禾公路 G681', lat: 48.280, lng: 87.920 },
  { name: '贾登峪 · 27/28 宿', lat: 48.500, lng: 87.130 },
  { name: '乌伦古湖', lat: 47.050, lng: 87.350 },
  { name: '果子沟大桥', lat: 44.420, lng: 81.020 }
];

export const MAP_TYPE_STYLE = {
  city: { color: '#3b7ea1', icon: 'ri-building-2-line', label: '城市住宿点' },
  pass: { color: '#78716c', icon: 'ri-gas-station-line', label: '途经补给点' },
  spot: { color: '#b45309', icon: 'ri-landscape-line', label: '主要景区' },
  star: { color: '#c8a04a', icon: 'ri-star-fill', label: '核心必去' }
};
