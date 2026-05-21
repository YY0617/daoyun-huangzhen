/* ======================================================
   《道韵·洪荒镇道》- 游戏数据定义
   所有数值、定义、事件数据集中在此
   ====================================================== */

// ========== 境界体系 ==========
const REALMS = [
    {
        id: 0, name: '锻体',
        desc: '淬炼筋骨皮肉，打通经脉关窍。凡人之躯，亦能碎铁裂石。',
        lifeBonus: 20,
        stages: 9,
        basePower: 10,
        daoCost: 0,
        breakCost: 20,  // 入门费，防止零门槛跳过体验
        breakRate: 1.0,
        color: '#8a9a6a',
        nextName: '玄脉'
    },
    {
        id: 1, name: '玄脉',
        desc: '周身经脉贯通如明河，灵力流转不息。可施展基础道术。',
        lifeBonus: 50,
        stages: 9,
        basePower: 30,
        daoCost: 120,
        breakCost: 50,
        breakRate: 0.85,
        color: '#4a7aa9',
        nextName: '武心'
    },
    {
        id: 2, name: '武心',
        desc: '凝练武道真意入心，一招一式皆含道韵。以武入道，战力激增。',
        lifeBonus: 100,
        stages: 9,
        basePower: 80,
        daoCost: 600,
        breakCost: 200,
        breakRate: 0.70,
        color: '#c97a4a',
        nextName: '灵现'
    },
    {
        id: 3, name: '灵现',
        desc: '神识破体而出，可见常人所不能见。与天地灵气共鸣在即。',
        lifeBonus: 200,
        stages: 9,
        basePower: 200,
        daoCost: 3000,
        breakCost: 800,
        breakRate: 0.55,
        color: '#9a5ab8',
        nextName: '凌虚'
    },
    {
        id: 4, name: '凌虚',
        desc: '御空而行，凌驾于凡俗之上。可窥见世界之下的规则纹路。',
        lifeBonus: 400,
        stages: 9,
        basePower: 500,
        daoCost: 15000,
        breakCost: 3000,
        breakRate: 0.40,
        color: '#4a9ac9',
        nextName: '触道'
    },
    {
        id: 5, name: '触道',
        desc: '指尖触碰到了世界的底层规则。每一次呼吸都在与天道共鸣。',
        lifeBonus: 800,
        stages: 9,
        basePower: 1200,
        daoCost: 80000,
        breakCost: 12000,
        breakRate: 0.30,
        color: '#c9a64c',
        nextName: '冠绝'
    },
    {
        id: 6, name: '冠绝',
        desc: '在某一道规则上登峰造极。弹指间可令山河变色。',
        lifeBonus: 1500,
        stages: 9,
        basePower: 3000,
        daoCost: 400000,
        breakCost: 50000,
        breakRate: 0.20,
        color: '#e8a030',
        nextName: '绝圣'
    },
    {
        id: 7, name: '绝圣',
        desc: '超越传统的圣人范畴，以己身代天道。众生称颂，因果缠身。',
        lifeBonus: 3000,
        stages: 9,
        basePower: 8000,
        daoCost: 2000000,
        breakCost: 200000,
        breakRate: 0.12,
        color: '#c0392b',
        nextName: '圣君'
    },
    {
        id: 8, name: '圣君',
        desc: '一方主宰。言行皆可为法则，意念所至，规则生灭。',
        lifeBonus: 6000,
        stages: 9,
        basePower: 20000,
        daoCost: 10000000,
        breakCost: 1000000,
        breakRate: 0.06,
        color: '#8e44ad',
        nextName: '君帝'
    },
    {
        id: 9, name: '君帝',
        desc: '传说中的存在。你可尝试修补破碎的天道——或另立新道。',
        lifeBonus: 10000,
        stages: 9,
        basePower: 60000,
        daoCost: 50000000,
        breakCost: 5000000,
        breakRate: 0.03,
        color: '#2c3e50',
        nextName: '???' // 扩展预留
    }
];

// ========== 资源定义 ==========
const RESOURCES = {
    spirit_stones: { name: '灵石', icon: '◆', desc: '修行界硬通货，内含精纯灵气', color: '#c9a64c' },
    dao_essence: { name: '道蕴', icon: '◇', desc: '对"道"的感悟积累', color: '#9a5ab8' },
    enlightenment: { name: '悟道点', icon: '悟', desc: '顿悟的契机，突破所必需', color: '#e8a030' },
    herbs: { name: '药材', icon: '药', desc: '炼丹原料，种类繁多', color: '#5a9a6a' },
    ores: { name: '矿石', icon: '矿', desc: '炼器基础材料', color: '#7a8a9a' },
    beast_materials: { name: '妖材', icon: '妖', desc: '妖兽身上的材料', color: '#b84a3a' },
    technique_fragments: { name: '功诀残页', icon: '诀', desc: '散落的修炼法门片段', color: '#4a7aa9' },
    rep: { name: '声望', icon: '名', desc: '在洪荒世界中的名声', color: '#c9a64c' },
    maxVitality: { name: '气血上限', icon: '血', desc: '身体能承受的最大伤势', color: '#c85a48' },
    maxSpirit: { name: '灵力上限', icon: '灵', desc: '丹田能容纳的最大灵力', color: '#6a9ac9' },
    attack: { name: '攻击', icon: '攻', desc: '战斗中的攻击力', color: '#c85a48' },
    defense: { name: '防御', icon: '防', desc: '战斗中的防御力', color: '#4a7aa9' },
    speed: { name: '速度', icon: '速', desc: '战斗中的出手速度', color: '#7ab88a' },
};

// ========== 丹药定义 ==========
const PILLS = {
    qi_refining: {
        name: '聚气丹',
        desc: '基础修炼丹药，加速道蕴积累',
        cost: { herbs: 5, spirit_stones: 20 },
        effect: { dao_essence: 15 },
        minRealm: 0,
        color: '#5a9a6a'
    },
    meridian_opening: {
        name: '通脉丹',
        desc: '冲开经脉瓶颈，用于境界突破',
        cost: { herbs: 15, spirit_stones: 80 },
        effect: { breakBonus: 0.10 },
        minRealm: 0,
        color: '#4a7aa9'
    },
    spirit_condensing: {
        name: '凝神丹',
        desc: '凝聚神识，提升悟道点获得',
        cost: { herbs: 10, beast_materials: 5, spirit_stones: 60 },
        effect: { enlightenment: 5 },
        minRealm: 1,
        color: '#9a5ab8'
    },
    marrow_washing: {
        name: '洗髓丹',
        desc: '改造根骨，永久提升属性',
        cost: { herbs: 30, ores: 10, spirit_stones: 200 },
        effect: { maxVitality: 50, maxSpirit: 30 },
        minRealm: 2,
        color: '#e8a030'
    },
    tribulation_resist: {
        name: '渡厄丹',
        desc: '抵御突破时的反噬之力',
        cost: { herbs: 50, beast_materials: 30, spirit_stones: 500, technique_fragments: 5 },
        effect: { breakBonus: 0.20 },
        minRealm: 3,
        color: '#c0392b'
    },
    heaven_defying: {
        name: '逆命丹',
        desc: '强行提升突破成功率，代价是部分根基受损',
        cost: { herbs: 100, beast_materials: 50, ores: 30, spirit_stones: 2000, technique_fragments: 20 },
        effect: { breakBonus: 0.30, vitalityPenalty: 30 },
        minRealm: 5,
        color: '#8e44ad'
    }
};

// ========== 混沌灵宝定义 ==========
const ARTIFACTS = {
    iron_sword: { name: '铁剑', type: 'weapon', desc: '凡铁所铸，聊胜于无', atk: 5, cost: { spirit_stones: 30 }, minRealm: 0, tier: '凡品' },
    bronze_mirror: { name: '铜镜', type: 'accessory', desc: '可反射低阶道术，略有防护', def: 3, spi: 5, cost: { spirit_stones: 50 }, minRealm: 0, tier: '凡品' },
    spirit_robe: { name: '灵丝道袍', type: 'armor', desc: '百年灵蚕丝织就，柔韧如铁', def: 8, hp: 20, cost: { spirit_stones: 80, beast_materials: 5 }, minRealm: 1, tier: '下品' },
    wind_trace: { name: '追风履', type: 'accessory', desc: '轻如无物，踏风而行', spd: 8, cost: { spirit_stones: 60, beast_materials: 3 }, minRealm: 1, tier: '下品' },
    frost_blade: { name: '寒霜剑', type: 'weapon', desc: '剑刃凝霜，寒气逼人', atk: 18, cost: { spirit_stones: 150, ores: 20 }, minRealm: 2, tier: '中品' },
    golden_scale: { name: '金鳞甲', type: 'armor', desc: '取妖蛟金鳞炼制，防护非凡', def: 20, hp: 60, cost: { spirit_stones: 300, beast_materials: 30, ores: 15 }, minRealm: 3, tier: '中品' },
    starfall: { name: '陨星剑', type: 'weapon', desc: '天外陨铁所铸，一往无前', atk: 45, cost: { spirit_stones: 800, ores: 50, technique_fragments: 10 }, minRealm: 4, tier: '上品' },
    void_pendant: { name: '虚空佩', type: 'accessory', desc: '内含微小空间，可储存灵力和物品', def: 5, spi: 40, atk: 10, cost: { spirit_stones: 2000, ores: 30, technique_fragments: 25 }, minRealm: 5, tier: '上品' },
    phoenix_robes: { name: '凤羽天衣', type: 'armor', desc: '传说以凤凰翎羽编就，万法不侵', def: 60, hp: 200, spi: 30, cost: { spirit_stones: 10000, beast_materials: 200, ores: 100, technique_fragments: 50 }, minRealm: 6, tier: '极品' },
    heaven_splitter: { name: '裂天', type: 'weapon', desc: '一剑可裂苍穹——如果你挥得动的话', atk: 150, cost: { spirit_stones: 50000, ores: 500, beast_materials: 300, technique_fragments: 200 }, minRealm: 8, tier: '灵器' },
};

// ========== 城镇建筑 ==========
const BUILDINGS = [
    {
        id: 'town_hall', name: '镇道殿', icon: '🏛',
        desc: '城镇核心，决定发展阶段',
        maxLevel: 5,
        costs: [
            { spirit_stones: 100 },
            { spirit_stones: 500, ores: 30 },
            { spirit_stones: 2000, ores: 100, beast_materials: 50 },
            { spirit_stones: 10000, ores: 500, technique_fragments: 30 },
            { spirit_stones: 50000, ores: 2000, technique_fragments: 100 }
        ],
        effects: function(lv) {
            return {
                maxBuildings: Math.floor(lv * 2) + 3,
                taxRate: 0.05 + lv * 0.02,
                populationCap: 10 * Math.pow(2, lv)
            };
        },
        story: '一座破败的殿堂，牌匾上"镇道"二字依稀可辨。你隐约感觉到，这里曾是这片天地的一个"锚点"。'
    },
    {
        id: 'spirit_vein', name: '灵脉阵', icon: '💧',
        desc: '聚集天地灵气的阵法，基础产出之源',
        maxLevel: 8,
        costs: [
            { spirit_stones: 80, ores: 10 },
            { spirit_stones: 300, ores: 30 },
            { spirit_stones: 800, ores: 80 },
            { spirit_stones: 2000, ores: 200 },
            { spirit_stones: 6000, ores: 500, technique_fragments: 10 },
            { spirit_stones: 15000, ores: 1200, technique_fragments: 30 },
            { spirit_stones: 40000, ores: 3000, technique_fragments: 80 },
            { spirit_stones: 100000, ores: 8000, technique_fragments: 200 }
        ],
        effects: function(lv) {
            return {
                spirit_per_min: lv * 0.5,
                stones_per_min: lv * 0.3
            };
        }
    },
    {
        id: 'market', name: '坊市', icon: '🏪',
        desc: '物资流通之地，税收与贸易',
        maxLevel: 6,
        costs: [
            { spirit_stones: 150, ores: 5 },
            { spirit_stones: 500, ores: 20 },
            { spirit_stones: 1500, ores: 60, beast_materials: 10 },
            { spirit_stones: 5000, ores: 200, beast_materials: 40 },
            { spirit_stones: 20000, ores: 800, technique_fragments: 20 },
            { spirit_stones: 80000, ores: 3000, technique_fragments: 80 }
        ],
        effects: function(lv) {
            return {
                tax_income: lv * 0.8 + 0.5,
                tradeBonus: lv * 0.05
            };
        }
    },
    {
        id: 'library', name: '藏经阁', icon: '📖',
        desc: '存放各种功法秘籍，加速修行',
        maxLevel: 5,
        costs: [
            { spirit_stones: 200, technique_fragments: 5 },
            { spirit_stones: 800, technique_fragments: 15 },
            { spirit_stones: 3000, technique_fragments: 40, ores: 50 },
            { spirit_stones: 12000, technique_fragments: 100, ores: 200 },
            { spirit_stones: 50000, technique_fragments: 300, ores: 1000 }
        ],
        effects: function(lv) {
            return {
                daoBonus: lv * 0.15,
                breakResearch: lv * 0.02
            };
        }
    },
    {
        id: 'pill_room', name: '炼丹房', icon: '🔥',
        desc: '炼制丹药，辅助修行',
        maxLevel: 5,
        costs: [
            { spirit_stones: 100, herbs: 10 },
            { spirit_stones: 400, herbs: 30, ores: 10 },
            { spirit_stones: 1500, herbs: 80, ores: 40 },
            { spirit_stones: 5000, herbs: 200, ores: 150, beast_materials: 30 },
            { spirit_stones: 20000, herbs: 500, ores: 500, beast_materials: 100 }
        ],
        effects: function(lv) {
            return {
                pillEfficiency: 1 + lv * 0.3,
                herbConversion: lv * 0.1
            };
        }
    },
    {
        id: 'forge', name: '炼器室', icon: '🔨',
        desc: '打造混沌灵宝，强化装备',
        maxLevel: 5,
        costs: [
            { spirit_stones: 150, ores: 15 },
            { spirit_stones: 600, ores: 50 },
            { spirit_stones: 2000, ores: 150, beast_materials: 20 },
            { spirit_stones: 8000, ores: 500, beast_materials: 80, technique_fragments: 10 },
            { spirit_stones: 30000, ores: 2000, beast_materials: 300, technique_fragments: 50 }
        ],
        effects: function(lv) {
            return {
                forgeEfficiency: 1 + lv * 0.25,
                oreConversion: lv * 0.08
            };
        }
    },
    {
        id: 'spirit_field', name: '灵田', icon: '🌾',
        desc: '种植灵药，自给自足',
        maxLevel: 6,
        costs: [
            { spirit_stones: 50, herbs: 5 },
            { spirit_stones: 200, herbs: 15 },
            { spirit_stones: 600, herbs: 40, ores: 10 },
            { spirit_stones: 2000, herbs: 100, ores: 30 },
            { spirit_stones: 8000, herbs: 300, ores: 100, technique_fragments: 5 },
            { spirit_stones: 30000, herbs: 800, ores: 300, technique_fragments: 20 }
        ],
        effects: function(lv) {
            return { herbs_per_min: lv * 0.15 + 0.05 };
        }
    },
    {
        id: 'training_ground', name: '演武场', icon: '⚔',
        desc: '磨练战技，提升实战能力',
        maxLevel: 4,
        costs: [
            { spirit_stones: 100 },
            { spirit_stones: 400, ores: 20 },
            { spirit_stones: 1500, ores: 80, beast_materials: 20 },
            { spirit_stones: 6000, ores: 300, beast_materials: 80, technique_fragments: 10 }
        ],
        effects: function(lv) {
            return {
                combatBonus: lv * 0.08,
                maxVitalityBonus: lv * 10
            };
        }
    },
    {
        id: 'defense_array', name: '护山大阵', icon: '🛡',
        desc: '抵御外敌，守护城镇安全',
        maxLevel: 5,
        costs: [
            { spirit_stones: 200, ores: 10, technique_fragments: 2 },
            { spirit_stones: 800, ores: 40, technique_fragments: 5 },
            { spirit_stones: 3000, ores: 150, technique_fragments: 15, beast_materials: 20 },
            { spirit_stones: 12000, ores: 500, technique_fragments: 40, beast_materials: 80 },
            { spirit_stones: 50000, ores: 2000, technique_fragments: 100, beast_materials: 300 }
        ],
        effects: function(lv) {
            return {
                defense: lv * 20 + 10,
                securityBonus: lv * 8
            };
        }
    },
    {
        id: 'recruit_hall', name: '招贤馆', icon: '🎭',
        desc: '吸引各方奇人异士，扩充人才',
        maxLevel: 4,
        costs: [
            { spirit_stones: 200 },
            { spirit_stones: 1100, beast_materials: 10 },
            { spirit_stones: 3000, beast_materials: 30, technique_fragments: 10 },
            { spirit_stones: 10000, beast_materials: 100, technique_fragments: 30, ores: 200 }
        ],
        effects: function(lv) {
            return {
                recruitRate: lv * 0.2 + 0.1,
                maxPopulation: lv * 20 + 10
            };
        }
    }
];

// ========== 探索区域 ==========
const EXPLORE_AREAS = [
    {
        id: 'mist_forest',
        name: '迷雾森林', icon: '🌲',
        desc: '荒古镇外古老的原始森林，常年被白色迷雾笼罩。林中妖兽众多，但也生长着罕见的灵药。',
        minRealm: 0,
        minRealmName: '锻体',
        difficulties: [
            { name: '外围', time: 2, risk: 0.15, rewardMult: 0.6, desc: '相对安全，适合新手历练' },
            { name: '深处', time: 5, risk: 0.35, rewardMult: 1.0, desc: '常有妖兽出没，需谨慎行事' },
            { name: '核心', time: 10, risk: 0.55, rewardMult: 1.8, desc: '传说中的千年灵药可能在此' }
        ],
        loot: {
            herbs: { min: 3, max: 15, rate: 0.7 },
            beast_materials: { min: 1, max: 8, rate: 0.5 },
            spirit_stones: { min: 5, max: 30, rate: 0.6 },
            technique_fragments: { min: 1, max: 2, rate: 0.1 }
        },
        events: [
            { type: 'combat', weight: 40 },
            { type: 'treasure', weight: 20 },
            { type: 'trap', weight: 15 },
            { type: 'story', weight: 15 },
            { type: 'rest', weight: 10 }
        ]
    },
    {
        id: 'battlefield_ruins',
        name: '古战场遗迹', icon: '⚔',
        desc: '远古大能交战之地。大地的伤痕至今仍在渗出一缕缕怨念，但也埋藏着无数上古遗宝。',
        minRealm: 2,
        minRealmName: '武心',
        difficulties: [
            { name: '边缘', time: 4, risk: 0.30, rewardMult: 0.7, desc: '散落的残兵断刃随处可见' },
            { name: '战场', time: 8, risk: 0.50, rewardMult: 1.2, desc: '核心战场遗址，怨气冲天' },
            { name: '将冢', time: 15, risk: 0.70, rewardMult: 2.2, desc: '陨落大能的埋骨之地' }
        ],
        loot: {
            ores: { min: 5, max: 20, rate: 0.7 },
            technique_fragments: { min: 2, max: 8, rate: 0.5 },
            spirit_stones: { min: 10, max: 60, rate: 0.6 },
            beast_materials: { min: 2, max: 10, rate: 0.3 },
            herbs: { min: 1, max: 5, rate: 0.2 }
        },
        events: [
            { type: 'combat', weight: 45 },
            { type: 'treasure', weight: 25 },
            { type: 'trap', weight: 10 },
            { type: 'story', weight: 15 },
            { type: 'rest', weight: 5 }
        ]
    },
    {
        id: 'void_rift',
        name: '虚空裂隙', icon: '🌀',
        desc: '天道碎片之间裂开的缝隙。连接着未知的小世界，每一次进入都是一场全新的冒险。',
        minRealm: 4,
        minRealmName: '凌虚',
        difficulties: [
            { name: '浅层', time: 6, risk: 0.40, rewardMult: 0.8, desc: '刚刚踏入虚空边缘' },
            { name: '中层', time: 12, risk: 0.60, rewardMult: 1.5, desc: '虚空中飘浮的小世界碎片' },
            { name: '深层', time: 20, risk: 0.80, rewardMult: 3.0, desc: '接近归墟之地的危险区域' }
        ],
        loot: {
            spirit_stones: { min: 30, max: 200, rate: 0.7 },
            technique_fragments: { min: 5, max: 20, rate: 0.6 },
            beast_materials: { min: 5, max: 25, rate: 0.5 },
            ores: { min: 10, max: 40, rate: 0.4 },
            herbs: { min: 5, max: 15, rate: 0.3 }
        },
        events: [
            { type: 'combat', weight: 35 },
            { type: 'treasure', weight: 30 },
            { type: 'trap', weight: 15 },
            { type: 'story', weight: 15 },
            { type: 'rest', weight: 5 }
        ]
    }
];

// ========== 势力定义 ==========
const FACTIONS = {
    righteous_alliance: {
        name: '正道盟',
        desc: '以"护道"为名的修行者联盟。表面上维持天地秩序，但暗流涌动。',
        neutralDesc: '他们对你既无好感也无敌意',
        hostileDesc: '你的所作所为已触及他们的底线',
        friendlyDesc: '他们视你为可信任的盟友',
        color: '#4a7aa9'
    },
    demon_beast_valley: {
        name: '万妖谷',
        desc: '妖族联盟。选择了与人类不同的修炼之路，追求与天地自然和谐共存。',
        neutralDesc: '你还没有引起他们的注意',
        hostileDesc: '你手上沾了太多妖族的血',
        friendlyDesc: '他们认可你对天地之道的尊重',
        color: '#5a9a6a'
    },
    nether_cult: {
        name: '幽冥教',
        desc: '研究生死轮回的隐秘教派。世人畏之如虎，但他们对天道的理解最为深刻。',
        neutralDesc: '他们不关心你是谁，只关心你知道什么',
        hostileDesc: '你干扰了他们对生死边界的研究',
        friendlyDesc: '你证明了对死亡之道的理解',
        color: '#7a5a9a'
    },
    rogue_alliance: {
        name: '散修盟',
        desc: '无门无派的散修自发组织的互助联盟。鱼龙混杂，但消息最为灵通。',
        neutralDesc: '你被看作一个普通的独行客',
        hostileDesc: '你的行为伤害了散修的利益',
        friendlyDesc: '你在散修中有了不错的名声',
        color: '#a09878'
    },
    heaven_pavilion: {
        name: '天机阁',
        desc: '中立的情报组织。他们知道太多不该知道的秘密。',
        neutralDesc: '他们评估着你的价值',
        hostileDesc: '你想知道太多了',
        friendlyDesc: '你成了他们的消息来源之一',
        color: '#c9a64c'
    }
};

// ========== 随机事件模板 ==========
const RANDOM_EVENTS = {
    combat: [
        {
            name: '遭遇妖兽',
            desc: function(diff) {
                const enemies = ['铁背苍狼', '毒雾蟒', '金甲蝎', '血牙野猪'];
                return `前方的树丛中传来低沉的嘶吼。一头${enemies[Math.floor(Math.random()*enemies.length)]}挡住了去路。`;
            },
            rewards: function(diff) {
                return {
                    beast_materials: Math.floor(Math.random() * 3 + 1) * (diff + 1),
                    dao_essence: Math.floor(Math.random() * 5 + 2) * (diff + 1)
                };
            }
        },
        {
            name: '遭遇陷境',
            desc: function() {
                return '你似乎闯入了某位大能遗留的禁制。周围的灵气突然变得狂暴起来，化作凌厉的攻击！';
            },
            rewards: function(diff) {
                return {
                    technique_fragments: Math.floor(Math.random() * 2 + 1) * (diff + 1),
                    dao_essence: Math.floor(Math.random() * 8 + 3) * (diff + 1)
                };
            }
        }
    ],
    treasure: [
        {
            name: '灵药现世',
            desc: function() {
                const herbs = ['千年灵芝', '九叶玄参', '紫纹何首乌', '七彩雪莲'];
                return `一阵异香飘来。你在石缝中发现了一株${herbs[Math.floor(Math.random()*herbs.length)]}！`;
            },
            rewards: function(diff) {
                return {
                    herbs: Math.floor(Math.random() * 10 + 5) * (diff + 1),
                    dao_essence: Math.floor(Math.random() * 3 + 1) * (diff + 1)
                };
            }
        },
        {
            name: '前人遗藏',
            desc: function() {
                return '你发现了一个隐蔽的洞府，似乎是某位前辈的坐化之地。散落着一些遗物。';
            },
            rewards: function(diff) {
                return {
                    spirit_stones: Math.floor(Math.random() * 30 + 10) * (diff + 1),
                    technique_fragments: Math.floor(Math.random() * 3 + 1) * (diff + 1),
                    ores: Math.floor(Math.random() * 5 + 2) * (diff + 1)
                };
            }
        }
    ],
    story: [
        {
            name: '神秘痕迹',
            desc: function() {
                return '地面上刻着一行字："别相信天机阁的话——一个死人的忠告。"字迹潦草，像是用指甲硬生生划出来的。';
            },
            rewards: function() {
                return { dao_essence: 10, rep: 5 };
            }
        },
        {
            name: '残破石碑',
            desc: function() {
                return '一块古老的石碑倒在荆棘中。上面的文字大部分已经风化，只能勉强辨认出两个字——"归墟"。';
            },
            rewards: function() {
                return { dao_essence: 15, technique_fragments: 2 };
            }
        }
    ],
    trap: [
        {
            name: '陷阱触发',
            desc: function() {
                return '你不小心踩到了一个古老的陷阱。周围的阵纹骤然亮起，灵力化作风刃向你袭来！';
            },
            rewards: function(diff) {
                return { spirit_stones: -10 * (diff+1), dao_essence: 2 };
            }
        },
        {
            name: '迷阵困锁',
            desc: function() {
                return '你陷入了一座残破的迷阵。虽然阵法已经松动，但还是耗费了不少时间才走出来。';
            },
            rewards: function() {
                return { dao_essence: 3 };
            }
        }
    ],
    rest: [
        {
            name: '灵泉休憩',
            desc: function() {
                return '你发现了一处隐蔽的灵泉。泉水清澈，灵气氤氲，正好可以打坐恢复。';
            },
            rewards: function() {
                return { maxVitality: 5, dao_essence: 5 };
            }
        }
    ]
};

// ========== 主线剧情 ==========
const STORY_CHAPTERS = [
    // 序章
    {
        title: '坠落',
        text: '那天夜里，你记得天裂了。\n\n不是比喻，而是真正的裂开——苍穹从正中撕开一道金黑色的口子，像一只巨眼缓缓睁开。然后，你在坠落中失去了意识。\n\n醒来时，你躺在陌生的荒野中。远处的山脊上有一座破败的小镇，像被遗忘在棋盘角落的一枚弃子。\n\n冷风刮过，你打了个寒颤。身上的衣服破了一半，口袋里只有三块碎灵石。\n\n——你还活着。但在这个地方，活着可能只是暂时的。',
        rewards: { spirit_stones: 3, dao_essence: 5 },
        nextQuest: '前往荒古镇',
        condition: { minRealm: 0 }
    },
    {
        title: '荒古镇',
        text: '小镇比远看更加破败。镇口的牌坊斜了一半，"荒古镇"三个字还剩一半勉强可辨。\n\n街上几乎没有人影。偶尔有一两个裹着破袍的身影匆匆闪过，都用警惕的眼神打量你。\n\n——"新来的？"一个沙哑的声音从背后传来。\n\n你回头，看到一个瞎了一只眼的老道士靠在墙边。他的道袍打满了补丁，但手中的拂尘却泛着微弱的灵光。\n\n"别那么紧张。老夫叫尘虚子，是这镇上……最后一个人还记得自己是修行者的人。"\n\n他笑了笑，露出一口黄牙。"既然你掉到了这里，那就是天意——或者说，是天道的碎片把你扔到了这儿。荒古镇需要一个镇守者。你，就是第十七个。"',
        rewards: { rep: 10, dao_essence: 10 },
        nextQuest: '修缮镇道殿',
        condition: { minRealm: 0 }
    },
    {
        title: '镇道之始',
        text: '"镇道殿？"你看着眼前这座勉强没有塌掉的建筑，有点怀疑自己的耳朵。\n\n"别看它破，"尘虚子往地上啐了一口，"这座殿本身就是一件混沌灵宝——或者说是某个更大法器的残片。你要做的第一步，就是让它重新开始运转。\n\n他递给你一张发黄的图纸。"出镇东二十里，有个废弃的灵石矿脉。带上这个，至少能把地基稳住。"\n\n你展开图纸，上面画着潦草的阵纹。看起来不太靠谱。但眼下，你也没有其他选择。',
        rewards: { spirit_stones: 50, dao_essence: 15 },
        nextQuest: '修建灵脉阵',
        condition: { minRealm: 0, buildings: { town_hall: 1 } }
    },
    {
        title: '天道的碎片',
        text: '灵脉阵运转起来的那一刻，你感觉到脚下的地面微微震颤。一股微弱但确实存在的灵气从地底升腾而起。\n\n尘虚子难得露出了认真的表情。"感觉到了吗？这个世界……是有伤的。"\n\n他指了指天空。"这里的"天道"不是完整的。它像一块被打碎的玉，你我现在就站在其中一块碎片上。\n\n"那……其他的碎片呢？"\n\n"飘在虚空中。有些被大能占据了，有些散落在谁都够不到的地方。还有一些……正在崩塌。"\n\n他的独眼盯着你。"知道为什么你是第十七个镇守者吗？因为前十六个，都被这片天地的真相吓跑了——或者说，被"归墟"吃掉了。"',
        rewards: { dao_essence: 30, technique_fragments: 3 },
        nextQuest: '提升修为至玄脉',
        condition: { minRealm: 0, buildings: { spirit_vein: 1 } }
    },
    {
        title: '迷雾之下',
        text: '当你的玄脉贯通的那一刻，世界在你眼前变得截然不同。\n\n你能"看见"灵气在空气中流动，像一缕缕微弱的金色丝线。荒古镇下方，三道残缺的地脉像断掉的琴弦。\n\n尘虚子点了点头。"不错，你终于能看了。那么，你知道荒古镇为什么叫"荒古"吗？"\n\n"因为……这片区域在远古曾经是战场？"\n\n"不对。"他摇头。"因为它本身就是洪荒时代的一块碎片——它是从更古老的世界中剥离出来的。那些迷雾森林、古战场，都是同一个碎片的褶皱。"\n\n"所以，我们其实……"\n\n"对，我们根本不在原来的世界。我们在一粒漂浮的尘埃上。"',
        rewards: { spirit_stones: 100, dao_essence: 50 },
        nextQuest: '探索迷雾森林外围',
        condition: { minRealm: 1 }
    }
];

// ========== 更多剧情章节（6-12章） ==========
const STORY_CHAPTERS_MORE = [
    {
        title: '迷雾中的足迹',
        text: '迷雾森林比想象中更加诡异。这里的树木呈现出一种不属于自然的灰白色，树皮上长满了苔藓般的古老符文。\n\n你深入了大约三里后，在一棵巨大的枯树下发现了——一个脚印。\n\n不是妖兽的脚印，是人的。而且很新，最多不过三天。\n\n"有意思了。"你蹲下来仔细观察。脚印很深，说明此人修为不弱，至少是武心境。在这片被遗忘的大地上，居然还有别的人？\n\n你顺着脚印的方向望去，那边是森林的更深处。隐约可见一座倒塌的石塔。',
        rewards: { dao_essence: 30, technique_fragments: 2 },
        condition: { minRealm: 1, exploration: { mist_forest: 1 } }
    },
    {
        title: '石塔的秘密',
        text: '石塔已经坍塌了大半，但底层的一个房间奇迹般地保存完整。门上刻着复杂的封印阵纹——被人用暴力破解过。\n\n房间里空荡荡的，只有中央的石台上放着一卷兽皮卷轴。上面用一种你从未见过的文字写着什么。\n\n但你却能读懂它的意思——这很奇怪。文字直接烙印在了你的意识中：\n\n"第十六位镇守者留——\n\n"你去古战场找吧。那个老东西骗了我们所有人。天道从来没有碎过——是有人故意把它打碎的。"\n\n落款处有一股凌厉的剑意残留，手指触碰时隐隐作痛。这个人的修为，恐怕远在尘虚子之上。',
        rewards: { technique_fragments: 5, dao_essence: 50, spirit_stones: 200 },
        condition: { minRealm: 1 }
    },
    {
        title: '古战场之门',
        text: '武心已成，你终于有资格进入古战场遗迹了。\n\n说是"进入"，其实用"被吸入"更准确。当你站在遗迹边缘时，一股强大的吸力将你拉了进去。\n\n这里不是一片土地——而是一个被封存的时间片段。天是暗红色的，地面由碎裂的白骨和锈蚀的兵器铺成。空气中弥漫着令人窒息的肃杀之气。\n\n远方的地平线上，一道黑色的裂缝贯穿天地。那里散发的波动让你心惊——不是灵气的波动，而是某种更深层的东西。\n\n你隐约听到风中传来一个声音——不是说话，更像是直接在你脑海中响起：\n\n"——还没到时候。回去，变得更强。"\n\n然后你被弹了出来。',
        rewards: { beast_materials: 10, dao_essence: 80, rep: 20 },
        condition: { minRealm: 2 }
    },
    {
        title: '尘虚子的往事',
        text: '"你去了古战场？"尘虚子正在喝酒，听到你的话后顿了一下。\n\n"你怎么知道？"\n\n他指了指自己的独眼。"那只眼睛里残留的剑意，跟那个地方一模一样。"\n\n他沉默了很久，然后罕见地收起了那副吊儿郎当的模样。\n\n"你看到那道裂缝了吧？那里就是整个碎片世界的核心。天道崩裂的源头。""你相信天道是被人打碎的吗？"你问。\n\n"信。"他给自己倒了碗酒。"因为我就是当年参与打碎它的人之一。"\n\n空气凝固了。\n\n"十六个镇守者？"你问。"他们没跑，也没死。"他一口饮尽。"是被我亲手送走的——送到别的碎片世界去了。因为这里，快要撑不住了。"',
        rewards: { dao_essence: 100, spirit_stones: 300, technique_fragments: 3 },
        condition: { minRealm: 2, storyFlags: 'visited_battlefield' }
    },
    {
        title: '灵现之路',
        text: '突破到灵现境的过程出乎意料地艰难。\n\n这不仅仅是力量的积累——你需要在识海中"看见"天道碎片的本来面目。而当你真正看到它时，你明白了尘虚子说的话。\n\n这个碎片世界，像一片树叶漂浮在虚空中。它的边缘在不断地剥落，化作虚无。而在世界的中心，那道裂缝像一颗心脏在缓慢跳动。\n\n最震撼的不是景象本身——而是你发现，所有生活在这片碎片上的人、妖、兽，你们的灵力波动，都与那道裂缝的跳动频率完全一致。\n\n你们不是独立的存在。你们都是这片碎片的延伸。\n\n包括你自己。',
        rewards: { dao_essence: 150, enlightenment: 3 },
        condition: { minRealm: 3 }
    },
    {
        title: '裂缝的低语',
        text: '灵现境之后，你开始能"听"到裂缝的声音了。\n\n不是耳朵听到的那种声音——而是一种直接作用于灵魂的低语。每当夜深人静时，它会变得格外清晰。\n\n"……来……" \n"……补上……" \n"……还来得及……"\n\n它似乎在向你传递某种信息。但你无法确定，是它在求救，还是在引诱你。\n\n你试着去问过天机阁的密探，他们给出的答案模棱两可。但你注意到，当你说到"裂缝在低语"时，那个密探的瞳孔猛地收缩了一下。\n\n他知道些什么，但不敢说。',
        rewards: { dao_essence: 200, technique_fragments: 5 },
        condition: { minRealm: 3, storyFlags: 'heard_whisper' }
    },
    {
        title: '虚空中的访客',
        text: '凌虚境让你真正可以自由飞行。你选择了那个月夜，飞到了碎片世界的边缘。\n\n站在虚空与现实的交界处，你看到了永生难忘的景象。\n\n虚空中漂浮着无数光点——那是其它的碎片世界。有的近在咫尺，有的远在天边。你能感知到它们微弱的气息，像一盏盏不同颜色的灯。\n\n然后你看到了它。\n\n一道身影。站在另一块碎片上，同样在望着你。\n\n你们隔着虚空对视了片刻。然后那个人抬手，在身前写下了几个金色的大字——那些字穿过虚空，在你的脑海中炸开：\n\n"第十七位，别过来。这边……更糟。"\n\n然后他消失了。',
        rewards: { dao_essence: 300, enlightenment: 5, rep: 30 },
        condition: { minRealm: 4 }
    },
    {
        title: '选择的时刻',
        text: '触道境让你触碰到了规则的边界。你现在清楚地知道，这个碎片世界还能撑多久——大约十年。\n\n十年之后，裂缝会彻底崩解，把整个碎片世界吞没。而你，作为镇守者，将有三个选择：\n\n一、修补裂缝。但需要牺牲这个世界一半的灵气，所有人修为倒退一个大境界。\n二、打碎整个碎片，化作灵力送所有人去往其他碎片世界。但成功率不到三成。\n三、成为新的裂缝——用你的身体作为容器，把崩解的力量导入自身。代价是你将永远迷失在虚空中。\n\n你终于明白为什么前十六个镇守者都选择了离开。\n\n这个选择不是太轻——而是太重了。',
        rewards: { dao_essence: 500, enlightenment: 10 },
        condition: { minRealm: 5 }
    },
    {
        title: '终章·道之所向',
        text: '你做出了选择。\n\n在你做出决定的那一刻，整个碎片世界的天空都变了颜色。所有的生灵都感受到了——无论他们在哪里，无论他们在做什么，都同时抬头望天。\n\n尘虚子站在镇道殿前，第一次露出了真正的笑容。\n\n"我就知道你能做到。"\n\n"你怎么知道？"\n\n"因为你是第一个走到这一步的镇守者。前面十六个，没有一个敢面对这个选择。"\n\n他顿了顿。"而我，一直在等你。"\n\n他的身体开始变得透明。"我本来就是这道裂缝的意志在人间的投影。第十七次了，我总算等到了一个真正能接过一切的人。"\n\n"你的选择就是我的选择。此间天地，交给你了。"\n\n他化作一道金光，融入了镇道殿中。殿顶猛然亮起——整座建筑开始复苏，散发出洪荒时代的古老气息。\n\n一个新的纪元，从此开始。',
        rewards: { dao_essence: 1000, rep: 100 },
        condition: { minRealm: 5, storyFlags: 'made_choice' }
    }
];

// ========== 结局分支 + 万界篇（第13-16章） ==========
const STORY_EXTRA = [
    {
        title: '结局·霸道', condition:'ba_dao',
        text: '你不是在修补裂缝——你在撕裂它。\n\n当尘虚子的身影消散后，你的选择已经明确。你抬起手，不是去合拢那道裂缝——而是把手伸了进去。\n\n"既然天道已碎，那就碎得彻底一点。"\n\n裂缝在你的意志下剧烈震颤，然后——开始扩张。不是崩裂，而是有控制地扩张。你把裂缝撕成了一个门的形状。\n\n另一侧，是无尽的虚空。和站在虚空中的一个人。\n\n第十六任镇守者。他转头看着你，笑了。\n\n"终于来了一个不修修补补的。"\n\n你迈步走进了门。'
    },
    {
        title: '结局·王道', condition:'wang_dao',
        text: '你把双手放在了裂缝两侧。\n\n灵力从你体内涌出，不是狂暴的，而是温和如水的。裂缝的边缘在你的触碰下开始微微发光——不是撕裂的光，是愈合的光。\n\n尘虚子的声音在风中回荡："人道劫，渡的不是你是众生。"\n\n整个荒古镇的灵力都被你调动了。灵脉阵在共振，坊市的灵石在发光，甚至每一块铺路石都在颤动。这座小镇活了四百年——在你手中第一次真正地"呼吸"。\n\n裂缝在缩小。很慢，但确实在缩小。\n\n你需要时间。十年，也许二十年。但你有耐心。因为你不是在修补天道，你是在让这个世界自己愈合。'
    },
    {
        title: '结局·天道', condition:'tian_dao',
        text: '你闭上眼睛，然后睁开了——但你看世界的方式已经截然不同。\n\n你看到的不是裂缝，而是规则。无数的金色线条在你眼前交织，构成这个碎片世界的底层架构。那条"裂缝"，其实是一束断裂的主干规则。\n\n"原来如此。"\n\n你伸出手，不是去触碰裂缝，而是去触碰那些规则线条。你的指尖与它们共鸣——你收集的天道碎片在这一刻全部亮起。\n\n八块碎片——不，十块——围绕着你旋转。你不是在修补，也不是在撕碎。你在重新编写。\n\n一个新世界在你意识的边缘缓缓成形。不是修复旧的，而是构建新的。\n\n尘虚子的声音带着笑意："你果然和前面十六个都不一样。"'
    },
    // ===== 万界篇 =====
    {
        title: '第十三章·门的那一边',
        text: '你踏入了一个新的碎片世界。\n\n这里的天空是紫色的。这里的土地是半透明的，你能看到地下的灵力像血管一样在流动。空气中弥漫着一种你从未感受过的气息——不是灵气，而是某种更古老的东西。\n\n你回头望去。荒古镇的门在你身后缓缓关闭。\n\n一个声音在你身边响起："又是一个……等等，你身上有十七道气息。你是那边的第十七任？有意思。"\n\n你转头，看到了一个你从没想过会在这里遇到的人——守门人。第十六任镇守者。\n\n他看起来比你想象中年轻。\n\n"别那么惊讶。我只是在等你——或者说，等你们中能推开门的那一个。"他指向远方的地平线。"这个世界叫「殷墟」。天道的碎片在这里不是裂开的——它们是拼好的。\n\n一条完美的天道。只是……不属于我们。"',
        condition: { minRealm: 7 }
    },
    {
        title: '第十四章·殷墟的法则',
        text: '殷墟世界的规则和荒古镇完全不同。这里的天道是完整的，但——它是有主人的。\n\n守门人带你穿过一片水晶般的森林。沿途你能看到被"规则之力"束缚的妖兽——它们的行为被天道精确地规定了：什么时候醒来、去哪里觅食、什么时候繁衍后代。一切都在"剧本"之中。\n\n"你能感觉到吗？"守门人问。"这个世界的一切都被写好了。这里的人从出生到死亡，每一步都被天道安排得明明白白。他们称之为\'天命的馈赠\'。"\n\n他冷笑了一声。"我管它叫笼子。"\n\n"所以我们那边的天道碎片……是被故意打碎的？"\n\n"聪明。"守门人点头。"因为有人不想活在一个被安排好的世界里。他们宁可面对破碎的未知，也不愿接受完美的牢笼。"',
        condition: { minRealm: 7, storyFlags: 'made_choice' }
    },
    {
        title: '第十五章·归墟的真相',
        text: '"所以归墟到底是什么？"你问出了那个一直压在心底的问题。\n\n守门人沉默了很久。\n\n"归墟，不是裂缝。"他缓缓开口。"归墟是两个天道系统之间的边界——你可以理解为两个世界之间的\'墙\'。在你们那边，因为天道是碎片的，所以这堵墙才出现了裂缝。而在殷墟这边，天道是完整的，所以墙是完美的。"\n\n"完美的墙意味着什么？"\n\n"意味着——"他转身看向你，"没有人能出去。"\n\n你的后背一阵发凉。"那建立这堵墙的人呢？"\n\n"死了。"守门人平静地说。"创建这堵墙的人，就是第一个碎掉天道的人。他把自己献祭了，给后来者留了一道门——也就是你们那边的裂缝。"\n\n"所以我的选择……"\n\n"决定了你是让那扇门开得更大，还是把它关上。"',
        condition: { minRealm: 8, storyFlags: 'made_choice' }
    },
    {
        title: '第十六章·道之所在',
        text: '你回到了荒古镇——带着殷墟的全部真相。\n\n裂缝还在那里。但你不再把它看作一道伤口了。它是一扇门。通往其他世界、其他规则、其他可能性的门。\n\n尘虚子不在镇道殿前了——但他留下了一行字，刻在门槛上：\n\n"第十七任，这是我最后一次帮你了。裂缝不是终点，是起点。你愿意走多远，门就开多大。"\n\n你站在镇道殿前，看着裂缝。它在你眼中已经不再是黑与金交织的裂口——而是无数金色丝线编织的一个节点。你可以触摸它、修补它、撕开它、或者穿过它。\n\n你选择了什么？这个问题的答案，只有你自己知道。\n\n——但整个世界，都在等待你的答案。',
        condition: { minRealm: 8 }
    }
];

// ========== 成就系统 ==========
const ACHIEVEMENTS = [
    { id: 'first_break', name: '初窥门径', desc: '完成第一次境界突破', icon: '✦', category: '修炼' },
    { id: 'realm_3', name: '武道之心', desc: '达到武心境', icon: '⚔', category: '修炼' },
    { id: 'realm_5', name: '规则触摸者', desc: '达到触道境', icon: '◇', category: '修炼' },
    { id: 'realm_7', name: '冠绝天下', desc: '达到冠绝境', icon: '◆', category: '修炼' },
    { id: 'first_battle', name: '初战告捷', desc: '赢得第一场战斗', icon: '⚔', category: '战斗' },
    { id: 'battle_10', name: '身经百战', desc: '累计赢得10场战斗', icon: '◇', category: '战斗' },
    { id: 'battle_50', name: '百战之躯', desc: '累计赢得50场战斗', icon: '◆', category: '战斗' },
    { id: 'town_hall_3', name: '荒古之主', desc: '镇道殿升至3级', icon: '◆', category: '城镇' },
    { id: 'all_buildings', name: '百废俱兴', desc: '建造全部10种建筑', icon: '◆', category: '城镇' },
    { id: 'prosperity_50', name: '繁华初现', desc: '城镇繁荣度达到50', icon: '◇', category: '城镇' },
    { id: 'explore_10', name: '探路者', desc: '完成10次探索', icon: '◇', category: '探索' },
    { id: 'explore_all', name: '大地图', desc: '探索过全部三大区域', icon: '◆', category: '探索' },
    { id: 'wealth_1000', name: '小有积蓄', desc: '累计拥有1000灵石', icon: '◇', category: '财富' },
    { id: 'wealth_10000', name: '富甲一方', desc: '累计拥有10000灵石', icon: '◆', category: '财富' },
    { id: 'fortune_teller', name: '命运访客', desc: '触发10次随机奇遇事件', icon: '◇', category: '奇遇' },
    { id: 'alchemist', name: '炼丹入门', desc: '成功炼制第一颗丹药', icon: '◇', category: '炼丹' },
    { id: 'equip_all', name: '全副武装', desc: '三个装备位全部装备', icon: '◆', category: '战斗' },
    { id: 'story_5', name: '真相之始', desc: '推进剧情至第五章', icon: '◇', category: '剧情' },
    { id: 'story_all', name: '洪荒见证者', desc: '完成全部主线剧情', icon: '◆', category: '剧情' },
    { id: 'rep_100', name: '名扬天下', desc: '声望达到100', icon: '◇', category: '社交' },
];

// ========== 势力互动事件 ==========
const FACTION_EVENTS = [
    {
        faction: 'righteous_alliance',
        title: '正道盟的传讯',
        text: '一只传讯纸鹤落在你的肩头。展开后，上面只有几行字：\n\n"听闻道友镇守荒古之地，颇有成效。我正道盟近日将迎战归墟边缘的异变，急需战力。若道友肯援手，必以厚礼相报。"\n\n落款处有一枚金色剑印，散发着浩然正气。',
        minRep: 20,
        rewards: { spirit_stones: 500, rep: 20, dao_essence: 100 },
        responseText: '你随使者前往战场，协助正道盟镇压了一次小规模的归墟异动。虽然没有惊天动地，但你的名字开始在联盟中流传。'
    },
    {
        faction: 'demon_beast_valley',
        title: '万妖谷的善意',
        text: '一头通体雪白的小狐狸不知何时出现在你屋中。它口中衔着一枚玉佩，上面刻着万妖谷的图腾。\n\n你拿起玉佩时，一道温婉的声音在你脑海中响起：\n\n"听闻荒古镇出了位有趣的新镇守者。不像其他人那样见妖就杀。改日得闲，不妨来妖谷喝茶——我们这里有些关于裂缝的秘密，那些"正道"可不会告诉你。"\n\n小狐狸晃了晃尾巴，原地消失了。',
        minRep: 10,
        rewards: { herbs: 30, dao_essence: 80, rep: 15 },
        responseText: '你前往万妖谷赴约。妖族的生存哲学出乎意料地纯粹——它们从不试图"修补"天道，而是学着与裂缝共存。这份坦然让你受益匪浅。'
    },
    {
        faction: 'nether_cult',
        title: '幽冥教的邀请',
        text: '午夜时分，你桌上的烛火忽地变成了幽绿色。一个戴着骨制面具的身影从阴影中浮现。\n\n"幽冥教，问死使。"他的声音像从深井中传来。"教主对镇守者的死亡观很感兴趣。我们研究了一千三百年生死轮回，但从未有人像你这样——站在天道裂缝的边上活着。"\n\n他留下了一卷暗黑色的竹简。"这是我们整理的归墟记录。或许对你有用。"\n\n说罢，他如雾气般消散。',
        minRep: 0,
        rewards: { technique_fragments: 8, dao_essence: 150 },
        responseText: '你研读了幽冥教的归墟记录。内容远比想象中更加骇人——归墟不是自然现象，而是天道被打破后产生的"疼痛反应"。换句话说，这个世界正在因为疼痛而痉挛。'
    },
    {
        faction: 'rogue_alliance',
        title: '散修的求助',
        text: '几个衣衫褴褛的散修来到荒古镇门口。为首的是一个断了一条手臂的中年汉子。\n\n"镇守者大人！求您救命！正道盟的人把我们在迷雾森林的据点端了，说我们私藏禁术！我们只是……想找条活路而已。"\n\n他身后的几个人都带着重伤。看他们的修为，不过练气到玄脉不等。\n\n接纳他们，会提升你的人望，但可能得罪正道盟。',
        minRep: 10,
        rewards: { rep: 25, spirit_stones: 200, population: 3 },
        responseText: '你收留了这些散修。他们在荒古镇外围搭建了几间木屋，开始自给自足。作为回报，他们带来了迷雾森林深处的情报——以及，一个你从未听说过的名字："归墟之子"。'
    },
    {
        faction: 'heaven_pavilion',
        title: '天机阁的交易',
        text: '一个看不清面容的修士坐在你的镇道殿里，像是一直就在那里。\n\n"我是天机阁的掌书使。"他的声音平淡如水。"我们想和你做一笔交易——用一条关于裂缝真相的情报，换取你一次举手之劳。"\n\n"什么举手之劳？"\n\n"很简单。"他微微抬手，一幅地图凭空展开。"三个月后，虚空裂隙深处会有一座遗迹开启。我们的人进不去——只有镇守者能。帮我们取一件东西，裂缝的一切，我们知无不言。"\n\n地图上标注的位置，正是你上次在虚空中看到那个神秘人的方向。',
        minRep: 0,
        rewards: { technique_fragments: 15, dao_essence: 200, enlightenment: 3 },
        responseText: '你接下了这个交易。天机阁给的那条情报只有五个字，却让你所有的认知都开始动摇：\n\n"裂缝有意识。"'
    }
];

// ========== NPC访客事件 ==========
const NPC_VISITORS = [
    {
        title: '流浪的说书人',
        text: '一个背着破旧书箱的老人来到镇上。他在坊市角落支起一张小桌，开始讲洪荒时代的故事。\n\n他讲的不是神话——更像是一个互相矛盾的历史记录。同一个事件有七八种版本，每种都言之凿凿。\n\n你给了他一壶酒，他嘿嘿一笑："想知道真相？真相就是——没人知道真相。所有"历史"都是活着的人为了证明自己正确而编的。"\n\n说完，他收摊就走了。但你脑子里多了一个关于"归墟"的全新想法。',
        rewards: { dao_essence: 30, enlightenment: 1 },
        minProsperity: 10
    },
    {
        title: '受伤的异兽',
        text: '一只通体漆黑的异兽倒在镇口。它浑身是伤，左前爪以一种不自然的角度扭曲着。见到人时，它没有攻击，而是用一种近乎人类的目光看着你。\n\n它的脖子上挂着一块玉牌，上面刻着一个名字——"归墟之子·柒"。',
        rewards: { rep: 15, beast_materials: 5 },
        minProsperity: 20
    },
    {
        title: '迷路的傀儡师',
        text: '一个操纵木傀儡的艺人路过荒古镇。他的木傀儡做工精巧，能模仿各种妖兽的动作。\n\n他主动提出，可以在镇口设置一些机关傀儡作为预警——只要付一些灵石和矿石就行。',
        rewards: { security: 10 },
        minProsperity: 15,
        cost: { spirit_stones: 200, ores: 30 }
    },
    {
        title: '天上的流星',
        text: '一颗流星划破夜空，坠落在迷雾森林方向。第二天，有采药的散修带回来一块闪着幽蓝色光芒的碎片。\n\n碎片内部有某种细微的震动——像一颗活着的心脏。',
        rewards: { spirit_stones: 500, dao_essence: 50 },
        minProsperity: 30
    }
];

// ========== 道号系统 ==========
const DAO_TITLES = [
    // ★ 凡（灰白）
    { id:'dao_1', name:'觉醒者', rarity:1, color:'#a0a0a0', effect:'none', desc:'道之初醒', cond:{realm:0} },
    { id:'dao_2', name:'锻体人', rarity:1, color:'#a0a0a0', effect:'none', desc:'肉身成道的起点', cond:{stage:5,realm:0} },
    { id:'dao_3', name:'寻道者', rarity:1, color:'#a0a0a0', effect:'none', desc:'在迷雾中摸索前行', cond:{expeditions:3} },
    // ★ 精（绿色）
    { id:'dao_4', name:'玄脉通幽', rarity:2, color:'#5aaa7a', effect:'glow', desc:'玄脉贯通，初窥门径', cond:{realm:1} },
    { id:'dao_5', name:'灵石满仓', rarity:2, color:'#5aaa7a', effect:'glow', desc:'富甲一方，灵石过千', cond:{wealth:1000} },
    { id:'dao_6', name:'迷雾踏破', rarity:2, color:'#5aaa7a', effect:'glow', desc:'穿越迷雾森林而返', cond:{exploreMist:1} },
    { id:'dao_7', name:'百战不殆', rarity:2, color:'#5aaa7a', effect:'glow', desc:'经历百场战斗磨砺', cond:{battles:10} },
    // ★ 奇（蓝色）
    { id:'dao_8', name:'武道问心', rarity:3, color:'#5a8ad4', effect:'wave', desc:'武心已成，问心无愧', cond:{realm:2} },
    { id:'dao_9', name:'一诺千金', rarity:3, color:'#5a8ad4', effect:'wave', desc:'声望满天下', cond:{rep:50} },
    { id:'dao_10', name:'古战遗魂', rarity:3, color:'#5a8ad4', effect:'wave', desc:'踏足古战场遗迹', cond:{exploreBattle:1} },
    { id:'dao_11', name:'洪荒筑基', rarity:3, color:'#5a8ad4', effect:'wave', desc:'镇道殿三级可镇一方', cond:{townHall:3} },
    { id:'dao_12', name:'丹道入门', rarity:3, color:'#5a8ad4', effect:'wave', desc:'炼出一炉好丹', cond:{pills:1} },
    // ★ 绝（紫色）
    { id:'dao_13', name:'灵现照影', rarity:4, color:'#9a5ad4', effect:'purple_glow', desc:'神识出体，照见本我', cond:{realm:3} },
    { id:'dao_14', name:'虚空独行者', rarity:4, color:'#9a5ad4', effect:'purple_glow', desc:'孤身踏入虚空裂隙', cond:{exploreVoid:1} },
    { id:'dao_15', name:'万妖敬服', rarity:4, color:'#9a5ad4', effect:'purple_glow', desc:'万妖谷的座上客', cond:{factionRep:20} },
    { id:'dao_16', name:'归墟听闻者', rarity:4, color:'#9a5ad4', effect:'purple_glow', desc:'听到了裂缝的低语', cond:{storyFlag:'heard_whisper'} },
    { id:'dao_17', name:'剑指苍穹', rarity:4, color:'#9a5ad4', effect:'purple_glow', desc:'战力破万，可撼山岳', cond:{combatPower:10000} },
    // ★ 荒（金色 — 最高稀有度）
    { id:'dao_18', name:'我即道', rarity:5, color:'#d4b04a', effect:'golden_particle', desc:'单字道号，天地共鸣', cond:{realm:4} },
    { id:'dao_19', name:'触道者', rarity:5, color:'#d4b04a', effect:'golden_particle', desc:'指尖触碰规则边界', cond:{realm:5} },
    { id:'dao_20', name:'天道之上一换一', rarity:5, color:'#ff4444', effect:'flame', desc:'敢与天道博弈之人', cond:{realm:6,wealth:100000} },
    { id:'dao_21', name:'此间天地我独尊', rarity:5, color:'#d4b04a', effect:'golden_particle', desc:'冠绝一道无人能敌', cond:{realm:7,combatPower:50000} },
    { id:'dao_22', name:'在归无劫尽头回头看了一眼的人', rarity:5, color:'#ff8800', effect:'cosmic', desc:'十三字尊号，以存在为代价', cond:{nearVoid:true} },
    { id:'dao_23', name:'一念天道碎', rarity:5, color:'#ff4444', effect:'flame', desc:'圣君之巅，一念碎天', cond:{realm:8} },
    { id:'dao_24', name:'凡', rarity:5, color:'#ffffff', effect:'golden_particle', desc:'单字逆天——以凡人之躯比肩天道', cond:{realm:9} },
];

// ========== 排行榜定义 + 预设伪玩家 ==========
// ========== 排行榜定义 + 预设伪玩家 ==========
const LEADERBOARDS = [
    {
        id:'lb_combat', name:'潜龙榜', desc:'锻体至玄脉境修士的战力排行。上榜最低门槛：战力1000',
        unlockRealm:0, icon:'潜', powerThreshold:1000,
        npcs:[
            { name:'剑无痕', title:'一剑封喉', realm:1, stage:5, powerBase:3800, powerRange:500, story:'剑道天才，三岁握剑，五岁通玄。', rivals:['铁骨'] },
            { name:'铁骨', title:'不破金身', realm:1, stage:3, powerBase:2800, powerRange:400, story:'横练宗师门下弟子。', rivals:['剑无痕'] },
            { name:'柳如烟', title:'烟雨剑法', realm:0, stage:9, powerBase:2200, powerRange:300, story:'江南柳家剑修。', rivals:[] },
            { name:'石破天', title:'力拔山兮', realm:0, stage:7, powerBase:1500, powerRange:200, story:'莽荒之地走出的巨力修士。', rivals:['云中子'] },
            { name:'云中子', title:'云游散修', realm:0, stage:5, powerBase:1200, powerRange:200, story:'不知来历的白发散修。', rivals:['石破天'] },
            { name:'叶小钗', title:'疾风剑', realm:0, stage:4, powerBase:800, powerRange:150, story:'十五岁少女剑修。', rivals:[] },
        ]
    },
    {
        id:'lb_combat_2', name:'天骄榜', desc:'武心至灵现境修士的战力排行。上榜最低门槛：战力5000',
        unlockRealm:2, icon:'天', powerThreshold:5000,
        npcs:[
            { name:'道无名', title:'无名天地之始', realm:3, stage:5, powerBase:15000, powerRange:2000, story:'没有人知道他的真名。', rivals:['明心见性'] },
            { name:'明心见性', title:'照见五蕴皆空', realm:3, stage:2, powerBase:12000, powerRange:1500, story:'来自西方佛国的禅修者。', rivals:['道无名'] },
            { name:'尘虚子', title:'独目观天机', realm:2, stage:9, powerBase:9000, powerRange:1000, story:'荒古镇的老熟人。', rivals:[] },
            { name:'忘川', title:'前尘尽忘', realm:2, stage:6, powerBase:7000, powerRange:800, story:'一个失忆的修士。', rivals:['问天道人'] },
            { name:'问天道人', title:'问天三百年', realm:2, stage:4, powerBase:5500, powerRange:600, story:'活了三百多岁的老怪物。', rivals:['忘川'] },
        ]
    },
    {
        id:'lb_combat_3', name:'宗师榜', desc:'凌虚至触道境修士的战力排行。上榜最低门槛：战力20000',
        unlockRealm:4, icon:'宗', powerThreshold:20000,
        npcs:[
            { name:'万里行', title:'踏遍洪荒', realm:4, stage:4, powerBase:40000, powerRange:5000, story:'以行走为修行的苦行僧。', rivals:['随风'] },
            { name:'随风', title:'来去如风', realm:3, stage:8, powerBase:28000, powerRange:3000, story:'风一样的男子。', rivals:['万里行'] },
            { name:'寻宝鼠', title:'哪里有宝去哪里', realm:3, stage:5, powerBase:23000, powerRange:2500, story:'嗅觉异常灵敏的寻宝者。', rivals:[] },
            { name:'云游僧', title:'不立文字', realm:3, stage:3, powerBase:21000, powerRange:2000, story:'沉默的僧人。', rivals:['寻宝鼠'] },
        ]
    },
    {
        id:'lb_combat_4', name:'至尊榜', desc:'冠绝至绝圣境修士的战力排行。上榜最低门槛：战力80000',
        unlockRealm:6, icon:'至', powerThreshold:80000,
        npcs:[
            { name:'归墟之子·柒', title:'裂缝的另一面', realm:7, stage:3, powerBase:180000, powerRange:20000, story:'从归墟裂缝中走出的人形存在。', rivals:[] },
            { name:'无名剑主', title:'一人一剑一乾坤', realm:7, stage:1, powerBase:150000, powerRange:15000, story:'所有碎片世界中排名前三的剑修。', rivals:['太上忘情'] },
            { name:'太上忘情', title:'无情即天道', realm:6, stage:9, powerBase:120000, powerRange:15000, story:'修炼无情道的绝顶高手。', rivals:['无名剑主'] },
            { name:'守门人', title:'第十七个之前的那一个', realm:6, stage:7, powerBase:100000, powerRange:10000, story:'第十六任镇守者。', rivals:[] },
        ]
    },
    {
        id:'lb_combat_5', name:'荒古榜', desc:'圣君及以上传说修士的战力排行。上榜最低门槛：战力200000',
        unlockRealm:8, icon:'荒', powerThreshold:200000,
        npcs:[
            { name:'荒古之主', title:'第一个碎道之人', realm:9, stage:5, powerBase:500000, powerRange:50000, story:'第一个打碎天道的人，也是建立万界之墙的人。', rivals:[] },
            { name:'虚无道尊', title:'行走在归墟中', realm:9, stage:3, powerBase:380000, powerRange:40000, story:'在归墟中生存了上千年的神秘存在。', rivals:['荒古之主'] },
            { name:'尘虚子(本体)', title:'裂缝意志的化身', realm:9, stage:1, powerBase:280000, powerRange:30000, story:'尘虚子的真正面目——裂缝意志本身。', rivals:[] },
        ]
    }
];

// ========== 三条修炼道路 ==========
const CULTIVATION_PATHS = {
    ba_dao: {
        id:'ba_dao', name:'霸道', icon:'⚔',
        desc:'以战养战，掠夺对手修为。强者之路，不留余地。',
        skills:[
            {id:'bd_1', name:'掠夺之息', level:1, desc:'战斗胜利后掠夺对手5%的道蕴', cond:null, effect:function(){return {pillageRate:0.05};}},
            {id:'bd_2', name:'血战八方', level:2, desc:'每次战斗额外获得10灵石', cond:{battles:5}, effect:function(){return {battleStones:10};}},
            {id:'bd_3', name:'以战悟道', level:3, desc:'战斗有10%几率直接获得悟道点', cond:{battles:20}, effect:function(){return {battleEnlightenChance:0.1};}},
            {id:'bd_4', name:'不灭战意', level:4, desc:'每损失10%气血攻击+3%', cond:{battles:50}, effect:function(){return {berserkPerLost:0.03};}},
            {id:'bd_5', name:'破境掠夺', level:5, desc:'突破时掠夺排行榜第一NPC的部分道蕴', cond:{realm:3,battles:100}, effect:function(){return {breakPillage:true};}},
        ]
    },
    wang_dao: {
        id:'wang_dao', name:'王道', icon:'🏛',
        desc:'以德服人，治理一方。城镇即道场，繁荣即修为。',
        skills:[
            {id:'wd_1', name:'人道共鸣', level:1, desc:'繁荣度每10点提升修炼效率3%', cond:null, effect:function(){return {prosDaoRate:0.003};}},
            {id:'wd_2', name:'万民供养', level:2, desc:'人口每10人提供1灵石/分', cond:{prosperity:20}, effect:function(){return {popIncome:0.1};}},
            {id:'wd_3', name:'人道劫·一', level:3, desc:'繁荣度50触发人道劫，渡劫后全属性+20%', cond:{prosperity:50}, effect:function(){return {tribulation:1,atkMult:1.2,defMult:1.2};}},
            {id:'wd_4', name:'百废俱兴', level:4, desc:'所有建筑产出+30%', cond:{buildings:5}, effect:function(){return {buildingBonus:0.3};}},
            {id:'wd_5', name:'人道劫·二', level:5, desc:'繁荣度100触发二次人道劫，渡劫后产出翻倍', cond:{prosperity:100}, effect:function(){return {tribulation:2,townDouble:true};}},
        ]
    },
    tian_dao: {
        id:'tian_dao', name:'天道', icon:'◇',
        desc:'探索天道奥秘，领悟规则碎片。知天命而用之。',
        skills:[
            {id:'td_1', name:'灵觉初开', level:1, desc:'探索时额外发现1条线索', cond:null, effect:function(){return {exploreClue:1};}},
            {id:'td_2', name:'规则共鸣', level:2, desc:'稀有事件触发概率+10%', cond:{expeditions:5}, effect:function(){return {rareChance:0.1};}},
            {id:'td_3', name:'天道碎片感应', level:3, desc:'可感知附近的天道碎片', cond:{expeditions:15}, effect:function(){return {fragmentSense:true};}},
            {id:'td_4', name:'规则镶嵌', level:4, desc:'可镶嵌两块天道碎片同时生效', cond:{realm:4,fragments:3}, effect:function(){return {maxSlots:2};}},
            {id:'td_5', name:'以身合道', level:5, desc:'修炼时5%概率进入"天人合一"，10倍产出', cond:{realm:6,fragments:5}, effect:function(){return {heavenFusion:0.05};}},
        ]
    }
};

// ========== 道心倾向定义(5轴) ==========
const DAO_XIN_AXES = {
    ren: { name:'仁', desc:'仁慈怜悯，兼济天下', color:'#5aaa7a' },
    yi: { name:'义', desc:'正义凛然，持守本心', color:'#5a8ad4' },
    li: { name:'利', desc:'利益至上，务实主义', color:'#d4b04a' },
    yu: { name:'欲', desc:'欲望驱动，掠夺进取', color:'#c85a48' },
    kong: { name:'空', desc:'四大皆空，超脱物外', color:'#9a5ad4' }
};

// ========== 天命命格(8种) ==========
const DESTINY_TYPES = [
    { id:'gu_xing', name:'天煞孤星', desc:'独行之路，孤独是最大的力量', effect:'单独战斗+20%战力，城镇收益-10%', color:'#5a5a7a', stats:{combatSolo:1.2,townPenalty:0.9} },
    { id:'zi_wei', name:'紫微帝星', desc:'天生的领袖，万民归心', effect:'城镇繁荣增长速度+30%，声望获取+20%', color:'#d4b04a', stats:{prosperityRate:1.3,repBonus:1.2} },
    { id:'tai_yin', name:'太阴润物', desc:'如水般柔和，以柔克刚', effect:'修炼效率+15%，但突破成功率-5%', color:'#6a9ac9', stats:{cultivationRate:1.15,breakPenalty:0.95} },
    { id:'tai_yang', name:'太阳耀世', desc:'光芒万丈，不可一世', effect:'突破成功率+15%，但修炼效率-10%', color:'#e8a030', stats:{breakBonus:1.15,cultivationPenalty:0.9} },
    { id:'qi_lin', name:'麒麟祥瑞', desc:'天降祥瑞，气运加身', effect:'探索稀有事件概率翻倍，锻造成功率+15%', color:'#5aaa7a', stats:{rareDouble:true,forgeBonus:0.15} },
    { id:'xuan_wu', name:'玄武镇世', desc:'不动如山，稳如磐石', effect:'防御翻倍，气血恢复速度+50%', color:'#4a7aa9', stats:{defMult:2.0,regenBonus:0.5} },
    { id:'zhu_que', name:'朱雀焚天', desc:'烈焰焚天，不破不立', effect:'攻击+50%，但每次战斗后掉血10%', color:'#c85a48', stats:{atkMult:1.5,combatBurn:0.1} },
    { id:'bai_hu', name:'白虎噬魂', desc:'杀伐果决，以战止战', effect:'掠夺效率+30%，声望衰减-50%', color:'#9a8a6a', stats:{pillageBonus:1.3,repDecay:0.5} }
];

// ========== 归虚回响事件 ==========
const VOID_ECHO_EVENTS = [
    { id:'ve_1', name:'归虚之潮', desc:'归无劫满时触发——虚无蔓延开来，所有资源产出翻倍', duration:60, buff:{resourceMult:2.0,breakBonus:0.2,rareEvent:true} },
    { id:'ve_2', name:'存在凝固', desc:'归虚回响结束后——你的存在痕上限永久锁定当前档位', penalty:{existenceLock:true} }
];

// ========== 天道碎片(10块) ==========
const HEAVEN_FRAGMENTS = [
    { id:'hf_begin', name:'初醒碎片', desc:'世界在你脚下展开——修炼效率永久+5%', effect:'cultivation', bonus:0.05, findCond:{realm:0} },
    { id:'hf_explore', name:'探索碎片', desc:'踏出第一步——探索收益永久+10%', effect:'exploreBonus', bonus:0.1, findCond:{expeditions:1} },
    { id:'hf_gravity', name:'重力碎片', desc:'领悟重力之规则，速度永久+20%', effect:'spd', bonus:0.2, findCond:{realm:2,area:'battlefield_ruins'} },
    { id:'hf_time', name:'时间碎片', desc:'窥见时间的缝隙，修炼效率永久+15%', effect:'cultivation', bonus:0.15, findCond:{realm:3,area:'mist_forest',explored:5} },
    { id:'hf_life', name:'生命碎片', desc:'生命规则的一角，气血上限永久+30%', effect:'hp', bonus:0.3, findCond:{realm:3,area:'void_rift'} },
    { id:'hf_space', name:'空间碎片', desc:'折叠空间之法，背包容量翻倍', effect:'bag', bonus:2, findCond:{realm:4,area:'void_rift',explored:3} },
    { id:'hf_element', name:'元素碎片', desc:'五行之力的源头，攻击+25%，防御+25%', effect:'atk_def', bonus:0.25, findCond:{realm:5,explored:15} },
    { id:'hf_soul', name:'灵魂碎片', desc:'触碰灵魂的本质，悟道点获取+30%', effect:'enlighten', bonus:0.3, findCond:{realm:5,storyFlag:'heard_whisper'} },
    { id:'hf_fate', name:'命运碎片', desc:'窥见命运长河，突破成功率永久+10%', effect:'breakRate', bonus:0.1, findCond:{realm:6,storyFlag:'made_choice'} },
    { id:'hf_void', name:'归墟碎片', desc:'直视虚无而不迷失——你已触摸到天道的本质', effect:'void_resist', bonus:1, findCond:{realm:7,explored:30} }
];

// ========== 初始状态 ==========
function getInitialState(playerName) {
    return {
        version: 1.0,
        player: {
            name: playerName || '无名散修',
            realm: 0,
            stage: 0,
            maxStage: 0, // 历史最高阶段
            vitality: 100,
            maxVitality: 100,
            spirit: 50,
            maxSpirit: 50,
            attack: 10,
            defense: 5,
            speed: 8,
            dao_essence: 0,
            enlightenment: 0,
            spirit_stones: 100,
            herbs: 5,
            ores: 3,
            beast_materials: 0,
            technique_fragments: 0,
            rep: 0,
            breakthroughAttempts: 0,
            breakthroughFailures: 0,
            // 三条修炼道路进度
            pathLevels: {ba_dao:0,wang_dao:0,tian_dao:0},
            pathExp: {ba_dao:0,wang_dao:0,tian_dao:0},
            // 道心倾向
            daoXin: {ren:50,yi:50,li:50,yu:50,kong:50},
            // 天命命格
            destiny: 'zi_wei', // 默认紫微帝星
            // 天道碎片收集
            fragments: [],
            equippedFragments: [],
            // 人道劫计数器
            tribulationsPassed: 0
        },
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },
        inventory: {
            qi_refining: 0,
            meridian_opening: 0,
            spirit_condensing: 0,
            marrow_washing: 0,
            tribulation_resist: 0,
            heaven_defying: 0
        },
        town: {
            buildings: {},
            population: 8,
            prosperity: 15,
            security: 30,
            lastTick: Date.now()
        },
        exploration: {
            areas: {},
            currentExpedition: null
        },
        factions: {
            righteous_alliance: 0,
            demon_beast_valley: 0,
            nether_cult: 0,
            rogue_alliance: 10,
            heaven_pavilion: 0
        },
        story: {
            chapter: 0,
            flags: {},
            completed_chapters: []
        },
        achievements: {},
        titles: [],
        equippedTitle: null, // 已获得道号id列表
        factionEvents: {
            triggered: []
        },
        npcVisitors: {
            triggered: [],
            lastCheck: Date.now()
        },
        npcEncounters: {
            triggered: [],
            lastCheck: Date.now()
        },
        stats: {
            startTime: Date.now(),
            playTime: 0,
            battles: 0,
            treasuresFound: 0,
            breakthroughs: 0,
            totalSpent: 0,
            expeditions: 0,
            pillsCrafted: 0,
            eventsTriggered: 0
        },
        lastSave: Date.now()
    };
}
