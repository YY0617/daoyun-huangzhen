/* ======================================================
   《道韵·洪荒镇道》- 游戏核心引擎
   状态管理、修炼、战斗、经济、探索、离线等
   ====================================================== */

// ========== 游戏状态 ==========
let G = null; // 全局游戏状态

// ========== 工具函数 ==========
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randf() { return Math.random(); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ========== 初始化/存档 ==========
function createNewGame(name) {
    G = getInitialState(name);
    // 初始建筑：镇道殿Lv1
    G.town.buildings['town_hall'] = 1;
    G.town.buildings['spirit_vein'] = 0;
    // 初始化探索区域状态（合并额外区域）
    var allAreas = EXPLORE_AREAS;
    if (typeof EXPLORE_AREAS_EXTRA !== 'undefined') {
        allAreas = EXPLORE_AREAS.concat(EXPLORE_AREAS_EXTRA);
    }
    allAreas.forEach(a => {
        G.exploration.areas[a.id] = { discovered: false, exploredCount: 0 };
    });
    // 随机天命命格
    var d = rollDestiny();
    G.player.destiny = d.id;
    G.town.lastTick = Date.now();
    G._createTime = Date.now(); // 用于计算游戏年龄
    saveGame();
    return G;
}

function saveGame(slot) {
    slot = slot || 0;
    try {
        localStorage.setItem('htzd_save_' + slot, JSON.stringify(G));
        localStorage.setItem('htzd_save_' + slot + '_time', new Date().toLocaleString());
        G.lastSave = Date.now();
    } catch(e) {
        console.warn('存档失败:', e);
    }
}

function loadGame(slot) {
    slot = slot || 0;
    try {
        const data = localStorage.getItem('htzd_save_' + slot);
        if (data) {
            G = JSON.parse(data);
            G.town.lastTick = Date.now();
            // ★ 兼容旧存档——补充新字段
            if(!G.player.pathLevels)G.player.pathLevels={ba_dao:0,wang_dao:0,tian_dao:0};
            if(!G.player.pathExp)G.player.pathExp={ba_dao:0,wang_dao:0,tian_dao:0};
            if(!G.player.daoXin)G.player.daoXin={ren:50,yi:50,li:50,yu:50,kong:50};
            if(!G.player.destiny)G.player.destiny='zi_wei';
            if(!G.player.fragments)G.player.fragments=[];
            if(!G.player.equippedFragments)G.player.equippedFragments=[];
            if(!G.player.tribulationsPassed)G.player.tribulationsPassed=0;
            if(!G.player.maxStage)G.player.maxStage=G.player.stage; // 历史最高阶段
            if(!G.titles)G.titles=[];
            if(G.equippedTitle===undefined)G.equippedTitle=null;
            if(!G.npcEncounters)G.npcEncounters={triggered:[],lastCheck:Date.now()};
            if(!G._createTime)G._createTime=Date.now();
            return true;
        }
    } catch(e) {
        console.warn('读档失败:', e);
    }
    return false;
}

function hasSave(slot) {
    slot = slot || 0;
    return !!localStorage.getItem('htzd_save_' + slot);
}

function getSaveInfo(slot) {
    slot = slot || 0;
    const time = localStorage.getItem('htzd_save_' + slot + '_time');
    if (time) return { exists: true, time: time };
    return { exists: false };
}

function deleteSave(slot) {
    slot = slot || 0;
    localStorage.removeItem('htzd_save_' + slot);
    localStorage.removeItem('htzd_save_' + slot + '_time');
}

function exportSave() {
    return btoa(JSON.stringify(G));
}

function importSave(data) {
    try {
        const parsed = JSON.parse(atob(data));
        G = parsed;
        G.town.lastTick = Date.now();
        return true;
    } catch(e) { return false; }
}

// ========== 境界与修炼系统 ==========

// 获取当前境界的总上限
function getMaxDaoForRealm(realmId) {
    const r = REALMS[realmId];
    if (!r) return Infinity;
    return r.daoCost;
}

// 获取当前阶段需要消耗的道蕴
function getDaoForStage(realmId, stage) {
    const r = REALMS[realmId];
    if (!r) return 0;
    if (realmId === 0) return stage * 5;     // 初始境界线性增长
    if (stage === 0) return 0;
    return Math.floor(r.daoCost * stage * 0.06);  // 每小阶约6%，8小阶=48%
}

// 获取下一阶段所需道蕴（小阶为门槛值，大境界为消耗值）
function getDaoNeeded(realmId, stage) {
    if (stage >= 8) return REALMS[realmId].daoCost; // 大境界突破需 daoCose 道蕴
    return getDaoForStage(realmId, stage + 1) - getDaoForStage(realmId, stage);
}

// ========== 修炼产出（次指数增长） ==========
function calcCultivationOutput() {
    if (!G) return { dao_essence: 0, enlightenment: 0 };
    const r = REALMS[G.player.realm];
    if (!r) return { dao_essence: 0, enlightenment: 0 };
    
    // ★ P0#1 次指数增长修炼产出
    // 原：daoBase = 2 + realm * 2  (线性)
    // 新：daoBase = 2 + pow(2, realm*0.5) * 3  (次指数)
    const daoBase = 2 + Math.pow(2, G.player.realm * 0.5) * 3;
    const libLv = G.town.buildings['library'] || 0;
    const libBonus = 1 + libLv * 0.18;
    // 灵脉阵加成
    const veinLv = G.town.buildings['spirit_vein'] || 0;
    const veinBonus = 1 + veinLv * 0.05;
    
    const daoPerAction = Math.floor(daoBase * libBonus * veinBonus * (0.9 + randf() * 0.2));
    
    // ★ P0#3 悟道点产出提升
    // 原：randf() < 0.12 + realm*0.02 ? rand(1,2) : 0
    // 新：随境界提升基础概率和数量
    const enlChance = 0.15 + G.player.realm * 0.03;
    const enlMax = 1 + Math.floor(G.player.realm / 2);
    const enlPerAction = randf() < enlChance ? rand(1, enlMax) : 0;
    
    // 城镇繁荣度加成
    const prosBonus = Math.floor(G.town.prosperity * 0.02);
    
    return { dao_essence: daoPerAction + prosBonus, enlightenment: enlPerAction };
}

// 执行修炼（dao_essence永不减少，只记录累积总量）
function doCultivate() {
    if (!G) return;
    const p = G.player;
    const output = calcCultivationOutput();
    
    // 天道·以身合道：5%概率10倍产出
    var tdEff=getPathEffects('tian_dao');
    if(tdEff.heavenFusion>0&&randf()<tdEff.heavenFusion){
        output.dao_essence*=10;
        output.enlightenment*=10;
        output.fusion=true;
    }
    
    p.dao_essence += output.dao_essence;
    if (output.enlightenment > 0) {
        p.enlightenment += output.enlightenment;
    }
    
    return output;
}

// 尝试突破（道蕴永不消耗！只作为累积门槛检验）
function tryBreakthrough() {
    if (!G) return { success: false, reason: '' };
    const p = G.player;
    const r = REALMS[p.realm];
    if (!r) return { success: false, reason: '已达最高境界' };
    
    if (p.stage < 8) {
        // ★ P0#2 小阶段只检验门槛，不消耗道蕴（大境界才消耗）
        const needed = getDaoNeeded(p.realm, p.stage);
        if (p.dao_essence < needed) {
            return { success: false, reason: `道蕴不足（还需${Math.floor(needed - p.dao_essence)}）` };
        }
        // 不消耗道蕴
        p.stage++;
        if(p.stage>p.maxStage)p.maxStage=p.stage; // 记录历史最高阶段
        checkDaoTitles(); // 突破后立即检查道号条件
        return { success: true, stageUp: true, realmUp: false, realmName: r.name };
    } else {
        // === 渡天劫（大境界突破） ===
        if (p.realm >= REALMS.length - 1) {
            return { success: false, reason: '已达最高境界' };
        }
        
        // 渡劫前置条件
        const nextRealm = REALMS[p.realm + 1];
        if (p.enlightenment < 1) {
            return { success: false, reason: '悟道点不足——天劫需以悟道为引' };
        }
        if (p.dao_essence < getDaoNeeded(p.realm, 8)) {
            return { success: false, reason: `道蕴未达圆满——还需${getDaoNeeded(p.realm, 8)}道蕴方能引动天劫` };
        }
        if (p.spirit_stones < r.breakCost) {
            return { success: false, reason: `灵石不足——渡劫需布设阵法消耗${r.breakCost}灵石` };
        }
        // 天劫新增条件：气血充足、灵力充沛
        if (p.vitality < p.maxVitality * 0.5) {
            return { success: false, reason: '气血亏空——当前气血不足五成，强行渡劫必死无疑' };
        }
        if (p.spirit < p.maxSpirit * 0.5) {
            return { success: false, reason: '灵力枯竭——当前灵力不足五成，无法维持渡劫法力' };
        }
        // 天劫额外：玩家必须完成至少3次战斗
        if (G.stats.battles < 3) {
            return { success: false, reason: '未经磨砺——至少经历3场战斗方可引动天劫' };
        }
        
        // 生成天劫事件
        var tribulationTexts = [
            '第一道天雷轰然落下！雷光贯穿你的躯体，经脉寸寸断裂又重塑。',
            '狂风骤起，风中夹杂着天道意志的咆哮——你听到了第十六个镇守者的叹息。',
            '地火从脚下喷涌而出，你的护体灵气在急剧消耗。稳住心神，这一劫必须自己扛过去。',
            '天劫化形！一道模糊的身影从雷光中走出——那是你内心的心魔。',
            '虚空裂缝在你头顶打开，归墟的气息渗透而出。你感觉自己在被世界排斥。'
        ];
        var tribText = tribulationTexts[Math.floor(randf() * tribulationTexts.length)];
        
        // 天劫伤害：根据境界扣除气血和灵力
        var tribDamage = Math.floor(p.maxVitality * 0.3 * (1 - pillBonus));
        p.vitality -= tribDamage;
        p.spirit -= Math.floor(p.maxSpirit * 0.3);
        if (p.vitality < 1) p.vitality = 1;
        if (p.spirit < 1) p.spirit = 1;
        
        // 计算成功率
        let rate = r.breakRate;
        let pillBonus = 0;
        let vitalityPenalty = 0;
        const hasTrib = (G.inventory['tribulation_resist'] || 0) > 0;
        const hasHeaven = (G.inventory['heaven_defying'] || 0) > 0;
        
        // ★ 关联1：道心·空→突破率加成
        var dxEff3=getDaoXinEffects();
        rate*=dxEff3.cultivationBonus;
        
        if (hasHeaven) {
            pillBonus += 0.30;
            vitalityPenalty += 30;
            G.inventory['heaven_defying']--;
        } else if (hasTrib) {
            pillBonus += 0.20;
            G.inventory['tribulation_resist']--;
        }
        rate = Math.min(0.95, rate + pillBonus);
        p.breakthroughAttempts++;
        
        if (randf() < rate) {
            // 突破成功：消耗灵石、悟道点、道蕴
            const oldRealm = p.realm;
            p.spirit_stones -= r.breakCost;
            p.enlightenment--;
            // ★ P0#2 大境界突破消耗 daoCose 道蕴的 50%
            p.dao_essence = Math.floor(p.dao_essence * 0.5);
            if (p.dao_essence < 0) p.dao_essence = 0;
            p.realm++;
            p.stage = 0;
            
            const newR = REALMS[p.realm];
            p.maxVitality += 20 + p.realm * 10;
            p.maxSpirit += 15 + p.realm * 8;
            p.attack += 5 + p.realm * 3;
            p.defense += 3 + p.realm * 2;
            p.speed += 2 + p.realm;
            p.vitality = p.maxVitality;
            p.spirit = p.maxSpirit;
            G.stats.breakthroughs++;
            checkDaoTitles(); // 突破后立即检查道号条件
            
            // ★ 霸道·破境掠夺：突破时从排行榜第一NPC掠夺道蕴
            var baEff2=getPathEffects('ba_dao');
            if(baEff2.breakPillage){
                var firstLb=getUnlockedLeaderboards();
                if(firstLb.length>0){
                    var rankData=getPlayerRankData(firstLb[0].id);
                    if(rankData&&rankData.ranks.length>0){
                        for(var ri=0;ri<rankData.ranks.length;ri++){
                            if(!rankData.ranks[ri].isPlayer){
                                var pillageAmt=Math.floor(rankData.ranks[ri].val*0.1);
                                if(pillageAmt>0){
                                    p.dao_essence+=pillageAmt;
                                    p._breakPillage=pillageAmt;
                                    p._breakPillageName=rankData.ranks[ri].name;
                                }
                                break;
                            }
                        }
                    }
                }
            }
            
            return {
                success: true, stageUp: false, realmUp: true,
                oldRealm, newRealm: p.realm, newRealmName: newR.name,
                pillUsed: hasHeaven ? '逆命丹' : hasTrib ? '渡厄丹' : null,
                tribText: tribText
            };
        } else {
            // 突破失败：消耗悟道点，道蕴不掉落
            p.breakthroughFailures++;
            p.enlightenment--;
            p.maxVitality = Math.max(50, p.maxVitality - 10);
            p.vitality = Math.min(p.vitality, p.maxVitality);
            
            return {
                success: false,
                reason: '天劫渡厄失败！根基受损，气血上限下降10点。' +
                    (hasHeaven ? '（逆命丹已消耗）' : hasTrib ? '（渡厄丹已消耗）' : '')
            };
        }
    }
}

// 挂机修炼（离线/空闲时）
function getIdleCultivation(minutes) {
    if (!G) return;
    // 每分钟产出
    const r = REALMS[G.player.realm];
    const baseRate = 0.3 + G.player.realm * 0.1;
    const libLv = G.town.buildings['library'] || 0;
    const bonus = 1 + libLv * 0.15;
    
    const totalDao = Math.floor(baseRate * bonus * minutes * (0.8 + randf() * 0.4));
    const totalStones = G.player.realm * 0.2 * minutes;
    
    G.player.dao_essence += totalDao;
    G.player.spirit_stones += Math.floor(totalStones);
    
    return { dao_essence: totalDao, spirit_stones: Math.floor(totalStones) };
}

// ========== 战斗系统 ==========
function calcPlayerPower() {
    if (!G) return { power: 10, atk: 10, def: 5, spd: 8, hp: 100 };
    const p = G.player;
    let atk = p.attack;
    let def = p.defense;
    let hp = p.maxVitality;
    let spd = p.speed;
    
    // 装备加成
    if (G.equipment.weapon) {
        const w = ARTIFACTS[G.equipment.weapon];
        if (w) { atk += w.atk || 0; hp += w.hp || 0; def += w.def || 0; }
    }
    if (G.equipment.armor) {
        const a = ARTIFACTS[G.equipment.armor];
        if (a) { def += a.def || 0; hp += a.hp || 0; atk += a.atk || 0; }
    }
    if (G.equipment.accessory) {
        const ac = ARTIFACTS[G.equipment.accessory];
        if (ac) { spd += ac.spd || 0; def += ac.def || 0; atk += ac.atk || 0; hp += ac.hp || 0; }
    }
    
    // 演武场加成
    const trainLv = G.town.buildings['training_ground'] || 0;
    if (trainLv > 0) {
        const bonus = BUILDINGS.find(b => b.id === 'training_ground').effects(trainLv);
        atk = Math.floor(atk * (1 + bonus.combatBonus));
        def = Math.floor(def * (1 + bonus.combatBonus));
        hp += bonus.maxVitalityBonus;
    }
    
    // 战力估算
    const power = Math.floor(atk * 2 + def * 1.5 + hp * 0.2 + spd * 1.5);
    
    return { power, atk, def, spd, hp };
}

function generateEnemy(difficulty) {
    const diff = difficulty || 0;
    const playerPower = calcPlayerPower();
    const minRealm = G.player.realm;
    
    const enemyNames = [
        '铁背苍狼', '毒雾蟒', '金甲蝎', '血牙野猪',
        '噬魂蝠', '熔岩蜥', '冰魄蛛', '雷角犀',
        '暗影豹', '骸骨战将', '不死怨魂', '地煞魔'
    ];
    
    const mult = 0.5 + diff * 0.4 + randf() * 0.3;
    const hp = Math.floor(playerPower.hp * mult * (0.7 + randf() * 0.6));
    const atk = Math.floor(playerPower.atk * mult * 0.6 * (0.8 + randf() * 0.4));
    const def = Math.floor(playerPower.def * mult * 0.5 * (0.8 + randf() * 0.4));
    
    return {
        name: pick(enemyNames),
        hp: hp,
        maxHp: hp,
        atk: Math.max(1, atk),
        def: Math.max(1, def),
        power: Math.floor(atk * 2 + def + hp * 0.1),
        realm: minRealm + diff
    };
}

// ★ P0#5 战斗技能系统
const BATTLE_SKILLS = {
    basic_attack: { name: '普通攻击', type: 'attack', multiplier: 1.0, cost: 0, desc: '基础攻击' },
    heavy_strike: { name: '重击', type: 'attack', multiplier: 1.8, cost: 5, desc: '消耗5灵力造成1.8倍伤害' },
    defend: { name: '防御', type: 'defend', multiplier: 0.5, cost: 0, desc: '本回合承伤减半' },
    meditate: { name: '调息', type: 'heal', multiplier: 0.15, cost: 0, desc: '恢复15%气血' }
};

function doBattle(enemy, playerSkill) {
    if (!G) return { win: false, log: [], enemy: enemy };
    if (!playerSkill) playerSkill = 'basic_attack';
    const p = calcPlayerPower();
    const log = [];
    const skill = BATTLE_SKILLS[playerSkill] || BATTLE_SKILLS.basic_attack;
    
    log.push({ text: `⚔ 你遭遇了 ${enemy.name}（战力约${enemy.power}）`, type: 'combat' });
    log.push({ text: `你的气血：${p.hp} | 敌方气血：${enemy.maxHp}`, type: 'combat' });
    log.push({ text: '——战斗开始——', type: 'divider' });
    
    let pHp = p.hp;
    let eHp = enemy.maxHp;
    let rounds = 0;
    const maxRounds = 20;
    
    while (pHp > 0 && eHp > 0 && rounds < maxRounds) {
        rounds++;
        
        // 玩家回合（技能系统）
        let pFinal = 0;
        let defending = false;
        let pSpirit = G.player.spirit;
        
        if (skill.type === 'attack') {
            const pDmg = Math.max(1, Math.floor(p.atk * skill.multiplier) - enemy.def + rand(-2, 4));
            const pCrit = randf() < 0.1 ? 2 : 1;
            pFinal = Math.floor(pDmg * pCrit);
            eHp -= pFinal;
            if (skill.cost > 0) { pSpirit -= skill.cost; G.player.spirit = Math.max(0, pSpirit); }
        } else if (skill.type === 'defend') {
            defending = true;
            pFinal = 0;
        } else if (skill.type === 'heal') {
            const heal = Math.floor(p.hp * skill.multiplier);
            pHp = Math.min(p.hp, pHp + heal);
            pFinal = 0;
        }
        
        if (pFinal > 0) {
            if (pCrit > 1) {
                log.push({ text: `[${rounds}] 你${skill.name}暴击！${pFinal}伤害 ➜ 敌方剩余${Math.max(0,eHp)}血`, type: 'combat_crit' });
            } else {
                log.push({ text: `[${rounds}] 你${skill.name}造成${pFinal}伤害 ➜ 敌方剩余${Math.max(0,eHp)}血`, type: 'combat' });
            }
        } else if (skill.type === 'defend') {
            log.push({ text: `[${rounds}] 你摆出防御姿态`, type: 'combat' });
        } else if (skill.type === 'heal') {
            log.push({ text: `[${rounds}] 你调息恢复${Math.floor(p.hp * skill.multiplier)}气血`, type: 'combat' });
        }
        
        if (eHp <= 0) break;
        
        // 敌方攻击
        const eDmg = Math.max(1, enemy.atk - (defending ? p.def * 2 : p.def) + rand(-2, 3));
        const eCrit = randf() < 0.08 ? 2 : 1;
        const eFinal = Math.floor(eDmg * eCrit);
        pHp -= eFinal;
        
        if (eCrit > 1) {
            log.push({ text: `[${rounds}] ${enemy.name}暴击！${eFinal}点伤害 ➜ 你剩余${Math.max(0,pHp)}气血`, type: 'combat_danger' });
        } else {
            log.push({ text: `[${rounds}] ${enemy.name}造成${eFinal}点伤害 ➜ 你剩余${Math.max(0,pHp)}气血`, type: 'combat' });
        }
    }
    
    const win = eHp <= 0;
    const hpLost = p.hp - Math.max(0, pHp);
    G.player.vitality = Math.max(0, G.player.vitality - Math.max(0, Math.floor(hpLost * 0.3)));
    
    if (win) {
        log.push({ text: '—— 胜利！——', type: 'divider_win' });
        G.stats.battles++;
        // 霸道·掠夺之息：战斗胜利掠夺对手5%道蕴
        var baEff=getPathEffects('ba_dao');
        if(baEff.pillageRate>0){
            var pillage=Math.floor(enemy.power*baEff.pillageRate);
            if(pillage>0){
                G.player.dao_essence+=pillage;
                log.push({ text: `[霸道] 掠夺道蕴 +${pillage}`, type: 'combat' });
            }
        }
        // 霸道·血战八方：每次战斗额外获得灵石
        if(baEff.battleStones>0){
            G.player.spirit_stones+=baEff.battleStones;
            log.push({ text: `[霸道] 战后缴获灵石 +${baEff.battleStones}`, type: 'combat' });
        }
    } else {
        log.push({ text: '—— 败阵！你狼狈撤退 ——', type: 'divider_loss' });
        G.player.vitality = Math.max(1, Math.floor(G.player.vitality * 0.3));
    }
    
    return { win, log, rounds, hpLost };
}

// ========== 城镇系统 ==========
function getBuildingLevel(id) {
    if (!G) return 0;
    return G.town.buildings[id] || 0;
}

function getBuildingEffects(id) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return {};
    const lv = getBuildingLevel(id);
    if (lv <= 0) return {};
    return b.effects(lv);
}

function getUpgradeCost(id) {
    const b = BUILDINGS.find(x => x.id === id);
    if (!b) return null;
    const lv = getBuildingLevel(id);
    if (lv >= b.maxLevel) return null;
    return b.costs[lv] || null;
}

function canUpgradeBuilding(id) {
    const cost = getUpgradeCost(id);
    if (!cost) return { can: false, reason: '已达最高等级' };
    
    // 镇道殿等级限制（更宽松：每级+3个建筑位，Lv1可建6个）
    const hallLv = getBuildingLevel('town_hall');
    const maxBuildings = hallLv * 3 + 3;
    const totalBuildings = Object.values(G.town.buildings).reduce((a, b) => a + b, 0);

    if (id !== 'town_hall' && totalBuildings - getBuildingLevel(id) >= maxBuildings) {
        return { can: false, reason: '镇道殿等级不足，无法继续升级' };
    }
    
    // 检查城镇人口（Lv2需要10人口，之后每级+8人口）
    const popNeeded = getBuildingLevel(id) + 1;
    const requiredPop = 5 + popNeeded * 4;
    if (id !== 'town_hall' && G.town.population < requiredPop) {
        return { can: false, reason: `人口不足（需${requiredPop}人）` };
    }
    
    // 检查资源
    for (const [res, amt] of Object.entries(cost)) {
        if (res === 'spirit_stones' && G.player.spirit_stones < amt) return { can: false, reason: `灵石不足（需${amt}）` };
        if (res === 'ores' && G.player.ores < amt) return { can: false, reason: `矿石不足（需${amt}）` };
        if (res === 'herbs' && G.player.herbs < amt) return { can: false, reason: `药材不足（需${amt}）` };
        if (res === 'beast_materials' && G.player.beast_materials < amt) return { can: false, reason: `妖材不足（需${amt}）` };
        if (res === 'technique_fragments' && G.player.technique_fragments < amt) return { can: false, reason: `功诀残页不足（需${amt}）` };
    }
    
    return { can: true, cost: cost };
}

function upgradeBuilding(id) {
    const check = canUpgradeBuilding(id);
    if (!check.can) return { success: false, reason: check.reason };
    
    // 消耗资源
    for (const [res, amt] of Object.entries(check.cost)) {
        if (res === 'spirit_stones') G.player.spirit_stones -= amt;
        if (res === 'ores') G.player.ores -= amt;
        if (res === 'herbs') G.player.herbs -= amt;
        if (res === 'beast_materials') G.player.beast_materials -= amt;
        if (res === 'technique_fragments') G.player.technique_fragments -= amt;
    }
    
    if (!G.town.buildings[id]) G.town.buildings[id] = 0;
    G.town.buildings[id]++;
    
    // 记录花费
    G.stats.totalSpent += Object.values(check.cost).reduce((a, b) => a + b, 0);
    
    // 自动保存
    saveGame();
    
    const b = BUILDINGS.find(x => x.id === id);
    return { success: true, buildingName: b.name, newLevel: G.town.buildings[id] };
}

// ========== 探索系统 ==========
function startExpedition(areaId, difficulty) {
    if (!G) return { success: false, reason: '游戏未开始' };
    
    if (G.exploration.currentExpedition) {
        return { success: false, reason: '已有进行中的探索' };
    }
    
    const area = EXPLORE_AREAS.find(a => a.id === areaId);
    if (!area) return { success: false, reason: '未知区域' };
    
    if (G.player.realm < area.minRealm) {
        return { success: false, reason: `至少需要${area.minRealmName}境界才能进入` };
    }
    
    const diff = area.difficulties[difficulty];
    if (!diff) return { success: false, reason: '未知难度' };
    
    // 检查灵力是否充足
    const spiritCost = diff.time * 3;
    if (G.player.spirit < spiritCost) {
        return { success: false, reason: `灵力不足（需${spiritCost}点）` };
    }
    
    G.player.spirit -= spiritCost;
    
    // 发现区域
    G.exploration.areas[areaId].discovered = true;
    
    // 记录远征
    G.exploration.currentExpedition = {
        areaId: areaId,
        difficulty: difficulty,
        startTime: Date.now(),
        duration: diff.time * 1000 * 3, // 实际3秒/分钟 加速，现实时间
        steps: diff.time,
        currentStep: 0,
        results: [],
        loot: {}
    };
    
    return { success: true, area: area, difficulty: diff };
}

function processExpeditionStep() {
    if (!G || !G.exploration.currentExpedition) return null;
    const exp = G.exploration.currentExpedition;
    const area = EXPLORE_AREAS.find(a => a.id === exp.areaId);
    const diff = area.difficulties[exp.difficulty];
    
    exp.currentStep++;
    
    // 随机事件（★道心·利→提高宝箱/宝物类事件权重）
    const events = RANDOM_EVENTS;
    const eventTypes = area.events.map(function(et){
        var w=et.weight;
        if(et.type==='treasure'&&G&&G.player.daoXin){
            var liVal=G.player.daoXin.li||50;
            w=Math.floor(w*(1+(liVal-50)/500));
        }
        return {type:et.type,weight:Math.max(1,w)};
    });
    const totalWeight = eventTypes.reduce(function(a, e){return a+e.weight;},0);
    let roll = randf() * totalWeight;
    let chosenType = 'combat';
    for (const et of eventTypes) {
        roll -= et.weight;
        if (roll <= 0) { chosenType = et.type; break; }
    }
    
    const eventPool = events[chosenType];
    if (!eventPool || eventPool.length === 0) return { type: 'nothing', text: '这片区域似乎什么也没有。' };
    
    const event = pick(eventPool);
    
    // combat 事件接入真实战斗引擎
    if (chosenType === 'combat') {
        const enemy = generateEnemy(exp.difficulty);
        const battleResult = doBattle(enemy);
        G.stats.battles++;
        // 战斗胜利获得额外战利品
        const lootRewards = {};
        if (battleResult.win) {
            lootRewards.beast_materials = rand(1, 3) * (exp.difficulty + 1);
            lootRewards.dao_essence = rand(3, 8) * (exp.difficulty + 1);
        }
        const result = {
            type: 'combat',
            name: event.name + (battleResult.win ? ' [胜利]' : ' [败退]'),
            desc: event.desc ? event.desc(exp.difficulty) : '',
            win: battleResult.win,
            enemy: enemy.name,
            rewards: lootRewards,
            battleLog: battleResult.log.slice(0, 3)
        };
        // 应用战斗收益
        for (const [res, amt] of Object.entries(lootRewards)) {
            if (G.player[res] !== undefined) G.player[res] += amt;
        }
        exp.results.push(result);
        for (const [res, amt] of Object.entries(lootRewards)) {
            exp.loot[res] = (exp.loot[res] || 0) + amt;
        }
        return result;
    }
    
    const result = {
        type: chosenType,
        name: event.name,
        desc: event.desc ? event.desc(exp.difficulty) : '',
        rewards: event.rewards ? event.rewards(exp.difficulty) : {}
    };
    
    // 应用收益
    if (result.rewards) {
        for (const [res, amt] of Object.entries(result.rewards)) {
            if (G.player[res] !== undefined) {
                G.player[res] += amt;
            }
        }
    }
    
    exp.results.push(result);
    
    // 合并战利品（只合并非负收益）
    for (const [res, amt] of Object.entries(result.rewards || {})) {
        if(amt>0)exp.loot[res] = (exp.loot[res] || 0) + amt;
    }
    
    return result;
}

function isExpeditionComplete() {
    if (!G || !G.exploration.currentExpedition) return false;
    const exp = G.exploration.currentExpedition;
    return exp.currentStep >= exp.steps;
}

function finishExpedition() {
    if (!G || !G.exploration.currentExpedition) return null;
    const exp = G.exploration.currentExpedition;
    const area = EXPLORE_AREAS.find(a => a.id === exp.areaId);
    
    // 基础掉落
    if (area && area.loot) {
        for (const [res, info] of Object.entries(area.loot)) {
            if (randf() < info.rate * (1 + exp.difficulty * 0.2)) {
                const amt = rand(info.min, info.max) * (1 + exp.difficulty * 0.5);
                const finalAmt = Math.floor(amt);
                if (G.player[res] !== undefined) {
                    G.player[res] += finalAmt;
                }
                exp.loot[res] = (exp.loot[res] || 0) + finalAmt;
            }
        }
    }
    
    // 道蕴奖励
    const daoReward = Math.floor((exp.difficulty + 1) * 5 * (1 + G.player.realm * 0.2));
    G.player.dao_essence += daoReward;
    exp.loot['dao_essence'] = (exp.loot['dao_essence'] || 0) + daoReward;
    
    const expData = { ...G.exploration.currentExpedition };
    G.exploration.currentExpedition = null;
    G.exploration.areas[exp.areaId].exploredCount++;
    
    saveGame();
    return expData;
}

function abortExpedition() {
    if (!G || !G.exploration.currentExpedition) return false;
    // 部分收益保留
    G.exploration.currentExpedition = null;
    return true;
}

// ========== 经济系统 ==========
// 市场价格（波动 + 势力加成）
function getMarketPrices() {
    const basePrices = {
        herbs: { buy: 8, sell: 4 },
        ores: { buy: 12, sell: 6 },
        beast_materials: { buy: 15, sell: 8 },
        technique_fragments: { buy: 50, sell: 25 }
    };
    
    // 坊市等级加成
    const marketLv = getBuildingLevel('market');
    const sellBonus = marketLv * 0.05;
    
    // ★ 关联7：势力好感影响坊市商品（正道盟→药材更便宜，万妖谷→妖材更多）
    var factionDiscount=1;
    if(G&&G.factions){
        var righteousRep=G.factions.righteous_alliance||0;
        var beastValleyRep=G.factions.demon_beast_valley||0;
        // 正道盟好感>20：草药类9折
        if(righteousRep>20)factionDiscount-=0.05;
        if(righteousRep>50)factionDiscount-=0.05;
        // 万妖谷好感>20：妖材类价格浮动上限提高
    }
    
    const prices = {};
    // 道心影响
    var dxEff=getDaoXinEffects();
    for (const [key, val] of Object.entries(basePrices)) {
        const fluctuation = 0.85 + randf() * 0.3;
        var buyPrice=Math.floor(val.buy * fluctuation * dxEff.priceDiscount);
        // 势力折扣：药材
        if(key==='herbs')buyPrice=Math.floor(buyPrice*factionDiscount);
        prices[key] = {
            buy: buyPrice,
            sell: Math.floor(val.sell * (1 + sellBonus) * (0.9 + randf() * 0.2))
        };
    }
    
    return prices;
}

function buyItem(item, qty) {
    qty = qty || 1;
    if (!G) return { success: false, reason: '游戏未开始' };
    
    const prices = getMarketPrices();
    const price = prices[item];
    if (!price) return { success: false, reason: '无法购买此物品' };
    
    const totalCost = price.buy * qty;
    if (G.player.spirit_stones < totalCost) {
        return { success: false, reason: `灵石不足（需${totalCost}）` };
    }
    
    G.player.spirit_stones -= totalCost;
    G.player[item] = (G.player[item] || 0) + qty;
    
    return { success: true, item: item, qty: qty, cost: totalCost };
}

function sellItem(item, qty) {
    qty = qty || 1;
    if (!G) return { success: false, reason: '游戏未开始' };
    if ((G.player[item] || 0) < qty) {
        return { success: false, reason: '库存不足' };
    }
    
    const prices = getMarketPrices();
    const price = prices[item];
    if (!price) return { success: false, reason: '无法出售此物品' };
    
    const totalIncome = price.sell * qty;
    G.player[item] -= qty;
    G.player.spirit_stones += totalIncome;
    
    return { success: true, item: item, qty: qty, income: totalIncome };
}

// ========== 炼丹系统 ==========
function craftPill(pillId, qty) {
    qty = qty || 1;
    if (!G) return { success: false, reason: '游戏未开始' };
    
    const pill = PILLS[pillId];
    if (!pill) return { success: false, reason: '未知丹方' };
    
    if (G.player.realm < pill.minRealm) {
        return { success: false, reason: '当前境界不足以炼制此丹' };
    }
    
    const pillRoomLv = getBuildingLevel('pill_room');
    if (pillRoomLv <= 0) {
        return { success: false, reason: '需要建造炼丹房' };
    }
    
    // 检查材料
    for (const [res, amt] of Object.entries(pill.cost)) {
        const total = amt * qty;
        if ((G.player[res] || 0) < total) {
            return { success: false, reason: `材料不足（${(RESOURCES[res]||{}).name||res}缺${total - (G.player[res]||0)}）` };
        }
    }
    
    // 消耗材料
    for (const [res, amt] of Object.entries(pill.cost)) {
        G.player[res] -= amt * qty;
    }
    
    // 炼丹房效率加成
    const eff = 1 + pillRoomLv * 0.3;
    const produced = Math.floor(qty * eff * (0.85 + randf() * 0.3));
    
    if (!G.inventory[pillId]) G.inventory[pillId] = 0;
    G.inventory[pillId] += produced;
    
    return { success: true, pill: pill.name, qty: produced, expected: qty };
}

// ========== 使用物品 ==========
function useItem(itemId) {
    if (!G) return { success: false, reason: '游戏未开始' };
    const qty = G.inventory[itemId] || 0;
    if (qty <= 0) return { success: false, reason: '没有此物品' };
    
    const pill = PILLS[itemId];
    if (!pill) return { success: false, reason: '未知物品' };
    
    if (G.player.realm < pill.minRealm) {
        return { success: false, reason: `当前境界不足，无法使用${pill.name}` };
    }
    
    G.inventory[itemId]--;
    
    const effects = [];
    
    // 应用效果
    if (pill.effect.dao_essence) {
        G.player.dao_essence += pill.effect.dao_essence;
        effects.push(`道蕴+${pill.effect.dao_essence}`);
    }
    if (pill.effect.enlightenment) {
        G.player.enlightenment += pill.effect.enlightenment;
        effects.push(`悟道点+${pill.effect.enlightenment}`);
    }
    if (pill.effect.maxVitality) {
        G.player.maxVitality += pill.effect.maxVitality;
        G.player.vitality = Math.min(G.player.vitality + pill.effect.maxVitality, G.player.maxVitality);
        effects.push(`气血上限+${pill.effect.maxVitality}`);
    }
    if (pill.effect.maxSpirit) {
        G.player.maxSpirit += pill.effect.maxSpirit;
        G.player.spirit = Math.min(G.player.spirit + pill.effect.maxSpirit, G.player.maxSpirit);
        effects.push(`灵力上限+${pill.effect.maxSpirit}`);
    }
    
    return { success: true, name: pill.name, effects: effects };
}

// ========== 装备系统 ==========
function equipArtifact(artifactId) {
    if (!G) return { success: false, reason: '游戏未开始' };
    
    // 检查物品是否存在（简化处理 - 按ID直接拥有）
    const art = ARTIFACTS[artifactId];
    if (!art) return { success: false, reason: '未知混沌灵宝' };
    
    if (G.player.realm < art.minRealm) {
        return { success: false, reason: `至少需要${REALMS[art.minRealm].name}境界才能使用` };
    }
    
    const slot = art.type;
    G.equipment[slot] = artifactId;
    saveGame();
    
    return { success: true, name: art.name, slot: slot, tier: art.tier };
}

function unequipSlot(slot) {
    if (!G) return { success: false, reason: '游戏未开始' };
    if (!G.equipment[slot]) return { success: false, reason: '该位置未装备任何混沌灵宝' };
    
    G.equipment[slot] = null;
    saveGame();
    return { success: true, slot: slot };
}

// ========== 混沌灵宝锻造系统 ==========
function forgeArtifact(artifactId) {
    if (!G) return { success: false, reason: '游戏未开始' };
    const art = ARTIFACTS[artifactId];
    if (!art) return { success: false, reason: '未知混沌灵宝' };
    
    const forgeLv = getBuildingLevel('forge');
    if (forgeLv <= 0) return { success: false, reason: '需要建造炼器室' };
    if (G.player.realm < art.minRealm) return { success: false, reason: '境界不足' };
    
    // ★ 检查该装备位是否已有装备
    if (G.equipment[art.type]) {
        const current = ARTIFACTS[G.equipment[art.type]];
        if (!confirm(`当前${art.type==='weapon'?'兵器':art.type==='armor'?'衣甲':'饰品'}位已装备「${current.name}」(${current.tier})，\n锻造「${art.name}」(${art.tier})将覆盖并替换。\n确定继续？`)) {
            return { success: false, reason: '已取消锻造' };
        }
    }
    
    // 检查材料
    for (const [res, amt] of Object.entries(art.cost)) {
        if ((G.player[res] || 0) < amt) {
            return { success: false, reason: `材料不足（${(RESOURCES[res]||{}).name||res}缺${amt-(G.player[res]||0)}）` };
        }
    }
    
    // 消耗材料，炼器室效率加成
    const eff = 1 + forgeLv * 0.2;
    const successRate = Math.min(0.95, 0.5 + forgeLv * 0.1);
    
    if (randf() > successRate) {
        // 失败，消耗一半材料
        for (const [res, amt] of Object.entries(art.cost)) {
            G.player[res] -= Math.floor(amt * 0.5);
        }
        return { success: false, reason: '锻造失败！材料损耗一半。可升级炼器室提高成功率。' };
    }
    
    for (const [res, amt] of Object.entries(art.cost)) {
        G.player[res] -= amt;
    }
    
    // 自动装备
    G.equipment[art.type] = artifactId;
    saveGame();
    return { success: true, name: art.name, tier: art.tier, slot: art.type };
}

// ========== 离线收益 ==========
function processOfflineGains() {
    if (!G) return null;
    const now = Date.now();
    const elapsed = now - G.town.lastTick;
    const minutes = Math.floor(elapsed / 60000);
    
    if (minutes < 1) return null;
    
    // 最大离线8小时
    const effectiveMin = Math.min(minutes, 480);
    
    const gains = {
        offlineTime: minutes,
        effectiveTime: effectiveMin
    };
    
    // 灵脉阵产出
    const veinLv = getBuildingLevel('spirit_vein');
    if (veinLv > 0) {
        const veinEff = BUILDINGS.find(b => b.id === 'spirit_vein').effects(veinLv);
        gains.spirit_stones = Math.floor(veinEff.stones_per_min * effectiveMin);
        // 灵气恢复
        gains.spiritRestored = Math.floor(veinEff.spirit_per_min * effectiveMin * 2);
        G.player.spirit_stones += gains.spirit_stones;
        G.player.spirit = Math.min(G.player.maxSpirit, G.player.spirit + (gains.spiritRestored || 0));
    }
    
    // 灵田产出
    const fieldLv = getBuildingLevel('spirit_field');
    if (fieldLv > 0) {
        const fieldEff = BUILDINGS.find(b => b.id === 'spirit_field').effects(fieldLv);
        gains.herbs = Math.floor(fieldEff.herbs_per_min * effectiveMin);
        G.player.herbs += gains.herbs;
    }
    
    // 坊市税收
    const marketLv = getBuildingLevel('market');
    if (marketLv > 0) {
        const marketEff = BUILDINGS.find(b => b.id === 'market').effects(marketLv);
        gains.tax = Math.floor(marketEff.tax_income * effectiveMin);
        G.player.spirit_stones += gains.tax || 0;
    }
    
    // 离线修炼
    gains.cultivation = getIdleCultivation(effectiveMin);
    
    // 人口自然增长（受镇道殿人口上限约束）
    var maxPop=getBuildingEffect('town_hall','populationCap')||999999;
    var gameAge=Date.now()-G._createTime;
    var earlyBonus=0;
    if(gameAge<300000&&G.town.population<9){
        var targetPop=9;
        earlyBonus=Math.ceil(Math.min(targetPop-G.town.population, maxPop-G.town.population)*effectiveMin/300);
    }
    var prosperityRate=1+G.town.prosperity*0.02;
    var popGrowth=Math.floor(effectiveMin/60*prosperityRate);
    var baseline=0;
    if(prosperityRate<3)baseline=Math.floor(effectiveMin/60*Math.min(1,3-prosperityRate));
    var totalGrowth=Math.min(popGrowth+baseline+earlyBonus, maxPop-G.town.population);
    if(totalGrowth>0){G.town.population+=totalGrowth;gains.populationGrowth=totalGrowth;}
    
    // 安全度自然恢复
    G.town.security = Math.min(100, G.town.security + effectiveMin * 0.02);
    G.town.lastTick = now;
    saveGame();
    
    // ★ 离线事件报告
    gains.events=[];
    var eventPool=[
        {text:'镇外巡逻队发现了一处小型灵石矿脉', weight:3, cond:function(){return getBuildingLevel('defense_array')>0;}},
        {text:'一位云游商人途经荒古镇，留下了些许丹药', weight:4},
        {text:'酒馆里传出了关于天道裂缝的新传言', weight:3},
        {text:'护山大阵在夜间挡住了几只妖兽的袭击', weight:2, cond:function(){return getBuildingLevel('defense_array')>0;}},
        {text:'灵田中又长出了一批新药材', weight:3, cond:function(){return getBuildingLevel('spirit_field')>0;}},
        {text:'有流民在镇外徘徊，或许可以招募', weight:4},
        {text:'坊市交易活跃，每日流水见涨', weight:3, cond:function(){return getBuildingLevel('market')>0;}},
        {text:'藏经阁中有人翻阅古籍，找到了些许修炼心得', weight:2, cond:function(){return getBuildingLevel('library')>0;}},
        {text:'月光下的荒古镇格外宁静', weight:2},
        {text:'镇道殿的烛火彻夜未熄', weight:2}
    ];
    // 按离线时间生成1-3个事件
    var eventCount=Math.min(3,1+Math.floor(effectiveMin/120));
    for(var ei=0;ei<eventCount;ei++){
        var available=eventPool.filter(function(e){
            var w=e.weight;
            if(e.cond&&!e.cond())w=0;
            return w>0;
        });
        if(available.length>0){
            var pick=available[Math.floor(Math.random()*available.length)];
            gains.events.push(pick.text);
        }
    }
    
    return gains;
}

// ========== 挂机循环（每30秒触发） ==========
let autoInterval = null;

function startAutoTick() {
    if (autoInterval) clearInterval(autoInterval);
    autoInterval = setInterval(function() {
        if (G && document.visibilityState !== 'hidden') {
            // 灵气自然恢复
            G.player.spirit = Math.min(G.player.maxSpirit, G.player.spirit + 0.5 + G.player.realm * 0.1);
            
            // ★ 气血自然恢复（每30秒恢复 1-3 点）
            if (G.player.vitality < G.player.maxVitality) {
                G.player.vitality = Math.min(G.player.maxVitality, G.player.vitality + 1 + G.player.realm * 0.2);
            }
            
            // 安全度微调
            G.town.security = Math.min(100, G.town.security + 0.01);
            
            // 繁荣度微调（基于建筑总数）
            updateTownMetrics();
            // ★ 势力好感度自然衰减（长期不关注，关系会冷淡）
            if (G.factions) {
                var fkeys = Object.keys(G.factions);
                for (var fi = 0; fi < fkeys.length; fi++) {
                    var key = fkeys[fi];
                    if (G.factions[key] > 0) G.factions[key] = Math.max(0, G.factions[key] - 0.01);
                    if (G.factions[key] < 0) G.factions[key] = Math.min(0, G.factions[key] + 0.005);
                }
            }
            
            // ★ 王道·万民供养：人口每10人提供1灵石/分（每30秒就是0.5灵石/10人）
            var wdEff=getPathEffects('wang_dao');
            if(wdEff.popIncome>0){
                var popIncome=Math.floor(G.town.population/10)*wdEff.popIncome*0.5;
                if(popIncome>0)G.player.spirit_stones+=popIncome;
            }
            
            // ★ 人口增长（每30秒微增，受镇道殿人口上限约束）
            var maxPop=getBuildingEffect('town_hall','populationCap')||999999;
            // 初始不管，等镇道殿建了才有上限
            if(G.town.population>=maxPop){
                // 已满，不增长
            }else{
                var gameAge=Date.now()-G._createTime;
                if(gameAge<300000&&G.town.population<9){
                    G.town.population+=Math.ceil(Math.min(9-G.town.population, maxPop-G.town.population)*30/300);
                }else{
                    var prosperityRate=1+G.town.prosperity*0.02;
                    var popTick=prosperityRate*30/3600;
                    if(prosperityRate<3)popTick+=Math.min(1,3-prosperityRate)*30/3600;
                    if(popTick>0.5||Math.random()<popTick/0.5){
                        var growth=Math.floor(popTick)||1;
                        G.town.population+=Math.min(growth, maxPop-G.town.population);
                    }
                }
            }
            
            // 自动保存（每30秒，缩短间隔降低丢档风险）
            if (Date.now() - (G.lastSave || 0) > 30000) {
                saveGame();
            }
            
            // ★ 城镇界面实时更新
            if(typeof curTab!=='undefined'&&curTab==='town'&&typeof updateTownMetrics==='function'){
                updateTownMetrics();
                // 更新顶栏资源
                if(typeof renderRes==='function')renderRes();
                // 动态刷新故事区域的城镇数据行
                var titleEl=document.querySelector('#storyInner .t-title');
                if(!titleEl){
                    // 如果故事区域已被清除，不做额外操作
                }else{
                    // 查找并更新第一行数据（标题后面的统计行）
                    var firstText=document.querySelector('#storyInner .t-text');
                    if(firstText)firstText.textContent='人口 '+G.town.population+' | 繁荣 '+G.town.prosperity.toFixed(0)+' | 安全 '+G.town.security.toFixed(0);
                }
            }
        }
    }, 30000);
}

function stopAutoTick() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// ========== 工具：获取建筑效果 ==========
function getBuildingEffect(buildingId, effectKey) {
    if(!G||!G.town||!G.town.buildings)return null;
    var lv=G.town.buildings[buildingId]||0;
    if(lv<=0)return null;
    for(var bi=0;bi<BUILDINGS.length;bi++){
        if(BUILDINGS[bi].id===buildingId){
            var ef=BUILDINGS[bi].effects(lv);
            return ef[effectKey]!==undefined?ef[effectKey]:null;
        }
    }
    return null;
}

// ========== 工具：检查各种条件 ==========
function calcCombatPower() {
    const pp = calcPlayerPower();
    return pp.power;
}

function getRealmDaoProgress() {
    if (!G) return 0;
    const p = G.player;
    if (p.realm >= REALMS.length) return 1;
    const r = REALMS[p.realm];
    if (p.stage < 8) {
        const current = G.player.dao_essence - getDaoForStage(p.realm, p.stage);
        const needed = getDaoNeeded(p.realm, p.stage);
        return needed > 0 ? clamp(current / needed, 0, 1) : 0;
    } else {
        return clamp(G.player.dao_essence / r.daoCost, 0, 1);
    }
}

function getRealmDaoProgressText() {
    if (!G) return '—';
    const p = G.player;
    if (p.realm >= REALMS.length) return '已臻至境';
    
    if (p.stage < 8) {
        const needed = getDaoNeeded(p.realm, p.stage);
        return `道蕴 ${Math.floor(p.dao_essence)} / 需${needed}`;
    } else {
        const needed = getDaoNeeded(p.realm, 8);
        return `道蕴 ${Math.floor(p.dao_essence)} / 需${needed}（瓶颈）`;
    }
}

function formatRealmFull() {
    if (!G) return '未开始';
    const p = G.player;
    const r = REALMS[p.realm];
    if (!r) return '未知';
    const stageStr = ['一','二','三','四','五','六','七','八','九'][p.stage] || '九';
    return `${r.name} ${stageStr}转`;
}

// ========== 成就系统 ==========
function checkAchievements() {
    if (!G || !G.achievements) return [];
    const newlyEarned = [];
    
    for (const ach of ACHIEVEMENTS) {
        if (G.achievements[ach.id]) continue;
        let earned = false;
        
        switch (ach.id) {
            case 'first_break': earned = G.stats.breakthroughs > 0; break;
            case 'realm_3': earned = G.player.realm >= 2; break;
            case 'realm_5': earned = G.player.realm >= 4; break;
            case 'realm_7': earned = G.player.realm >= 6; break;
            case 'first_battle': earned = G.stats.battles > 0; break;
            case 'battle_10': earned = G.stats.battles >= 10; break;
            case 'battle_50': earned = G.stats.battles >= 50; break;
            case 'town_hall_3': earned = getBuildingLevel('town_hall') >= 3; break;
            case 'all_buildings': earned = BUILDINGS.every(b => getBuildingLevel(b.id) > 0); break;
            case 'prosperity_50': earned = G.town.prosperity >= 50; break;
            case 'explore_10': earned = Object.values(G.exploration.areas).reduce((a,b) => a+b.exploredCount, 0) >= 10; break;
            case 'explore_all': earned = Object.values(G.exploration.areas).every(a => a.discovered); break;
            case 'wealth_1000': earned = G.player.spirit_stones >= 1000; break;
            case 'wealth_10000': earned = G.player.spirit_stones >= 10000; break;
            case 'fortune_teller': earned = G.stats.eventsTriggered >= 10; break;
            case 'alchemist': earned = G.stats.pillsCrafted > 0; break;
            case 'equip_all': earned = G.equipment.weapon && G.equipment.armor && G.equipment.accessory; break;
            case 'story_5': earned = G.story.chapter >= 5; break;
            case 'story_all': earned = G.story.chapter >= STORY_CHAPTERS.length + STORY_CHAPTERS_MORE.length; break;
            case 'rep_100': earned = G.player.rep >= 100; break;
        }
        
        if (earned) {
            G.achievements[ach.id] = Date.now();
            newlyEarned.push(ach);
            // ★ 关联5：成就解锁特定道号
            var achTitleMap={
                'first_break':'dao_2','realm_3':'dao_8','realm_5':'dao_19','battle_10':'dao_7',
                'wealth_1000':'dao_5','alchemist':'dao_12','explore_all':'dao_6','battle_50':'dao_10',
                'equip_all':'dao_9','story_all':'dao_11'
            };
            var autoTitle=achTitleMap[ach.id];
            if(autoTitle&&G.titles.indexOf(autoTitle)<0){
                G.titles.push(autoTitle);
                var tData=null;for(var ti=0;ti<DAO_TITLES.length;ti++)if(DAO_TITLES[ti].id===autoTitle){tData=DAO_TITLES[ti];break;}
                if(tData)newlyEarned.push({isTitle:true,name:tData.name});
            }
        }
    }
    
    return newlyEarned;
}

function getAchievementCount() {
    if (!G || !G.achievements) return { earned: 0, total: ACHIEVEMENTS.length };
    return { earned: Object.keys(G.achievements).length, total: ACHIEVEMENTS.length };
}

// ========== 势力互动系统 ==========
function checkFactionEvents() {
    if (!G || !G.factionEvents) return [];
    const available = [];
    
    for (const ev of FACTION_EVENTS) {
        if (G.factionEvents.triggered.includes(ev.title)) continue;
        const rep = G.factions[ev.faction] || 0;
        if (rep >= ev.minRep) {
            available.push(ev);
        }
    }
    
    return available;
}

function triggerFactionEvent(eventIndex) {
    if (!G) return null;
    const events = checkFactionEvents();
    const ev = events[eventIndex];
    if (!ev) return null;
    
    // Apply rewards
    if (ev.rewards) {
        for (const [res, amt] of Object.entries(ev.rewards)) {
            if (res === 'population') {
                G.town.population += amt;
            } else if (G.player[res] !== undefined) {
                G.player[res] += amt;
            }
        }
    }
    
    G.factionEvents.triggered.push(ev.title);
    G.stats.eventsTriggered++;
    saveGame();
    return ev;
}

function getFactionRep(factionId) {
    if (!G) return 0;
    return G.factions[factionId] || 0;
}

function addFactionRep(factionId, amount) {
    if (!G) return;
    if (G.factions[factionId] === undefined) G.factions[factionId] = 0;
    G.factions[factionId] = Math.max(-100, Math.min(100, G.factions[factionId] + amount));
}

// ========== NPC访客 ==========
function checkNPCVisitors() {
    if (!G || !G.npcVisitors) return null;
    const now = Date.now();
    const lastCheck = G.npcVisitors.lastCheck || 0;
    
    // 每15分钟左右检查一次
    if (now - lastCheck < 900000) return null;
    G.npcVisitors.lastCheck = now;
    
    // 概率触发，繁荣度越高概率越大
    const chance = 0.15 + G.town.prosperity * 0.003;
    if (randf() > chance) return null;
    
    // 检查NPC是否可触发（含资源校验）
    const available = NPC_VISITORS.filter(npc => {
        if (G.npcVisitors.triggered.includes(npc.title)) return false;
        if (npc.minProsperity && G.town.prosperity < npc.minProsperity) return false;
        // 校验资源是否足够支付
        if (npc.cost) {
            for (const [res, amt] of Object.entries(npc.cost)) {
                if ((G.player[res] || 0) < amt) return false;
            }
        }
        return true;
    });
    
    if (available.length === 0) return null;
    const visitor = pick(available);
    G.npcVisitors.triggered.push(visitor.title);
    G.stats.eventsTriggered++;
    
    // 如果有消耗
    if (visitor.cost) {
        for (const [res, amt] of Object.entries(visitor.cost)) {
            if (G.player[res] !== undefined) G.player[res] -= amt;
        }
    }
    
    // 应用奖励
    if (visitor.rewards) {
        for (const [res, amt] of Object.entries(visitor.rewards)) {
            if (res === 'population') G.town.population += amt;
            else if (res === 'security') G.town.security = Math.min(100, G.town.security + amt);
            else if (G.player[res] !== undefined) G.player[res] += amt;
        }
    }
    
    saveGame();
    return visitor;
}

// ========== 检查剧情推进条件 ==========
function checkStoryProgress() {
    if (!G) return [];
    const allChapters = [...STORY_CHAPTERS, ...STORY_CHAPTERS_MORE, ...(typeof STORY_EXTRA!=='undefined'?STORY_EXTRA:[])];
    const canProgress = [];
    
    for (let i = G.story.chapter; i < allChapters.length; i++) {
        const ch = allChapters[i];
        let ok = true;
        
        if (ch.condition) {
            // 字符串条件（分支结局：需要某条道路满级）
            if(typeof ch.condition==='string'){
                var pLv=G.player.pathLevels[ch.condition]||0;
                if(pLv<5)ok=false;
            }else{
                if (ch.condition.minRealm !== undefined && G.player.realm < ch.condition.minRealm) ok = false;
                if (ch.condition.buildings) {
                    for (const [bId, bLv] of Object.entries(ch.condition.buildings)) {
                        if ((G.town.buildings[bId] || 0) < bLv) ok = false;
                    }
                }
                if (ch.condition.exploration) {
                    for (const [areaId, count] of Object.entries(ch.condition.exploration)) {
                        var areaData = G.exploration.areas[areaId]; if ((areaData ? areaData.exploredCount : 0) < count) ok = false;
                    }
                }
                if (ch.condition.storyFlags) {
                    var flags = Array.isArray(ch.condition.storyFlags) ? ch.condition.storyFlags : [ch.condition.storyFlags];
                    for (var fi = 0; fi < flags.length; fi++) {
                        if (!G.story.flags[flags[fi]]) ok = false;
                    }
                }
            }
        }
        
        if (ok) canProgress.push({ index: i, chapter: ch });
        else break;
    }
    
    return canProgress;
}

// ========== 更新繁荣度/安全度 ==========
function updateTownMetrics() {
    if (!G) return;
    
    // 繁荣度：基于建筑等级和人口
    const totalBldgLv = Object.values(G.town.buildings).reduce((a, b) => a + b, 0);
    G.town.prosperity = Math.min(100, G.town.prosperity + 
        (totalBldgLv * 0.02 + G.town.population * 0.005 + (getBuildingLevel('market') * 0.1) - 0.05));
    G.town.prosperity = Math.max(0, G.town.prosperity);
    
    // 安全度：基于护山大阵
    const defLv = getBuildingLevel('defense_array');
    const baseDecay = -0.03;
    const defBonus = defLv * 0.08;
    G.town.security = Math.min(100, G.town.security + baseDecay + defBonus);
    G.town.security = Math.max(0, G.town.security);
}

// ========== 道号系统 ==========
function checkDaoTitles() {
    if(!G||!G.player)return [];
    var p=G.player;
    var newlyEarned=[];
    if(!G.titles)G.titles=[];
    for(var ti=0;ti<DAO_TITLES.length;ti++){
        var t=DAO_TITLES[ti];
        if(G.titles.indexOf(t.id)>=0)continue;
        var ok=checkTitleCond(t.cond);
        if(ok){G.titles.push(t.id);newlyEarned.push(t);}
    }
    return newlyEarned;
}

function checkTitleCond(cond) {
    if(!cond)return true;
    var p=G.player;
    if(cond.realm!==undefined&&p.realm<cond.realm)return false;
    if(cond.stage!==undefined&&(p.maxStage||p.stage)<cond.stage)return false;
    if(cond.wealth!==undefined&&p.spirit_stones<cond.wealth)return false;
    if(cond.battles!==undefined&&G.stats.battles<cond.battles)return false;
    if(cond.expeditions!==undefined&&G.stats.expeditions<cond.expeditions)return false;
    if(cond.rep!==undefined&&p.rep<cond.rep)return false;
    if(cond.pills!==undefined&&(G.stats.pillsCrafted||0)<cond.pills)return false;
    if(cond.townHall!==undefined&&(G.town.buildings['town_hall']||0)<cond.townHall)return false;
    if(cond.combatPower!==undefined&&calcCombatPower()<cond.combatPower)return false;
    if(cond.factionRep!==undefined){var maxRep=0;for(var fk in G.factions)if(G.factions[fk]>maxRep)maxRep=G.factions[fk];if(maxRep<cond.factionRep)return false;}
    if(cond.exploreMist!==undefined){var ma=G.exploration.areas['mist_forest'];if(!ma||ma.exploredCount<cond.exploreMist)return false;}
    if(cond.exploreBattle!==undefined){var ba=G.exploration.areas['battlefield_ruins'];if(!ba||ba.exploredCount<cond.exploreBattle)return false;}
    if(cond.exploreVoid!==undefined){var va=G.exploration.areas['void_rift'];if(!va||va.exploredCount<cond.exploreVoid)return false;}
    if(cond.storyFlag!==undefined){if(!G.story.flags||!G.story.flags[cond.storyFlag])return false;}
    if(cond.nearVoid){if(p.dao_essence<5000||p.spirit_stones<100000)return false;}
    return true;
}

// 佩戴/卸下道号
function equipDaoTitle(titleId) {
    if(!G||!G.player)return {success:false};
    if(titleId===null||titleId===undefined){
        G.equippedTitle=null;
        saveGame();
        return {success:true,unequipped:true};
    }
    if(G.titles.indexOf(titleId)<0)return {success:false,reason:'尚未解锁此道号'};
    G.equippedTitle=titleId;
    saveGame();
    var t=null;for(var ti=0;ti<DAO_TITLES.length;ti++)if(DAO_TITLES[ti].id===titleId){t=DAO_TITLES[ti];break;}
    return {success:true,name:t?t.name:titleId};
}

function getEquippedTitle() {
    if(!G||!G.equippedTitle)return null;
    for(var ti=0;ti<DAO_TITLES.length;ti++)if(DAO_TITLES[ti].id===G.equippedTitle)return DAO_TITLES[ti];
    return null;
}

// ========== 排行榜系统 ==========
function getPlayerRankData(lbId) {
    var lb=null;for(var li=0;li<LEADERBOARDS.length;li++)if(LEADERBOARDS[li].id===lbId){lb=LEADERBOARDS[li];break;}
    if(!lb)return null;
    var p=G.player;
    // 计算玩家在该榜单上的数值
    var pVal=0;
    if(lbId==='lb_combat')pVal=calcCombatPower();
    else if(lbId==='lb_wealth')pVal=p.spirit_stones;
    else if(lbId==='lb_dao')pVal=p.dao_essence;
    else if(lbId==='lb_explore'){var totalExp=0;for(var ek in G.exploration.areas)totalExp+=G.exploration.areas[ek].exploredCount;pVal=totalExp;}
    else if(lbId==='lb_legend')pVal=calcCombatPower();
    // 生成NPC排名数据
    var ranks=[];
    for(var ni=0;ni<lb.npcs.length;ni++){
        var npc=lb.npcs[ni];
        // 统一使用powerBase+powerRange计算战力
        var nVal=npc.powerBase+Math.floor(Math.random()*npc.powerRange-npc.powerRange/2);
        ranks.push({name:npc.name,title:npc.title,val:nVal,isPlayer:false,story:npc.story,rivals:npc.rivals,realm:npc.realm,stage:npc.stage});
    }
    // 检查玩家是否达到上榜门槛
    var threshold=lb.powerThreshold||0;
    if(pVal>=threshold)ranks.push({name:p.name,title:'',val:pVal,isPlayer:true});
    // 排序
    ranks.sort(function(a,b){return b.val-a.val;});
    // 标记玩家排名
    var playerRank=-1;
    for(var ri=0;ri<ranks.length;ri++)if(ranks[ri].isPlayer)playerRank=ri+1;
    return {lb:lb,ranks:ranks,playerRank:playerRank};
}

function getUnlockedLeaderboards() {
    if(!G||!G.player)return [];
    var p=G.player;
    var unlocked=[];
    for(var li=0;li<LEADERBOARDS.length;li++){
        var lb=LEADERBOARDS[li];
        if(G.player.realm>=lb.unlockRealm)unlocked.push(lb);
    }
    return unlocked;
}

// ========== 三条修炼道路系统 ==========
function checkPathSkill(path,skillId) {
    if(!G||!G.player)return false;
    var sk=null;
    if(CULTIVATION_PATHS[path]&&CULTIVATION_PATHS[path].skills){for(var si=0;si<CULTIVATION_PATHS[path].skills.length;si++)if(CULTIVATION_PATHS[path].skills[si].id===skillId){sk=CULTIVATION_PATHS[path].skills[si];break;}}
    if(!sk)return false;
    var currentLv=G.player.pathLevels[path]||0;
    if(currentLv>=sk.level)return true; // 已解锁
    if(sk.level>currentLv+1)return false; // 需要先学低级的
    // 检查升级条件
    var cond=sk.cond;
    if(!cond)return true;
    if(cond.battles!==undefined&&G.stats.battles<cond.battles)return false;
    if(cond.realm!==undefined&&G.player.realm<cond.realm)return false;
    if(cond.expeditions!==undefined&&G.stats.expeditions<cond.expeditions)return false;
    if(cond.prosperity!==undefined&&G.town.prosperity<cond.prosperity)return false;
    if(cond.buildings!==undefined){var totalBld=0;for(var bk in G.town.buildings)totalBld+=G.town.buildings[bk];if(totalBld<cond.buildings)return false;}
    if(cond.fragments!==undefined&&(!G.player.fragments||G.player.fragments.length<cond.fragments))return false;
    return true;
}

function learnPathSkill(path,skillId) {
    if(!checkPathSkill(path,skillId))return {success:false,reason:'条件未满足'};
    var sk=null;if(CULTIVATION_PATHS[path]&&CULTIVATION_PATHS[path].skills){for(var si=0;si<CULTIVATION_PATHS[path].skills.length;si++)if(CULTIVATION_PATHS[path].skills[si].id===skillId){sk=CULTIVATION_PATHS[path].skills[si];break;}}
    if(!sk)return {success:false,reason:'技能不存在'};
    var currentLv=G.player.pathLevels[path]||0;
    if(currentLv>=sk.level)return {success:false,reason:'已习得'};
    G.player.pathLevels[path]=sk.level;
    // ★ 关联8：道路选择影响道心倾向
    if(path==='ba_dao'){modifyDaoXin('yu',3);modifyDaoXin('li',2);}
    else if(path==='wang_dao'){modifyDaoXin('ren',3);modifyDaoXin('yi',2);}
    else if(path==='tian_dao'){modifyDaoXin('kong',3);}
    saveGame();
    return {success:true,skillName:sk.name,pathName:CULTIVATION_PATHS[path].name};
}

function getPathEffects(path) {
    if(!G||!G.player)return{};
    var lv=G.player.pathLevels[path]||0;
    var effects={};
    if(CULTIVATION_PATHS[path]&&CULTIVATION_PATHS[path].skills){
        for(var si=0;si<CULTIVATION_PATHS[path].skills.length;si++){
            var sk=CULTIVATION_PATHS[path].skills[si];
            if(lv>=sk.level&&sk.effect){
                var ef=sk.effect();
                for(var ek in ef)effects[ek]=ef[ek];
            }
        }
    }
    return effects;
}

// ========== 道心倾向系统 ==========
function modifyDaoXin(axis,amount) {
    if(!G||!G.player||!G.player.daoXin)return;
    if(!DAO_XIN_AXES[axis])return;
    G.player.daoXin[axis]=Math.max(0,Math.min(100,(G.player.daoXin[axis]||50)+amount));
}

function getDominantDaoXin() {
    if(!G||!G.player||!G.player.daoXin)return null;
    var dx=G.player.daoXin;
    var max=-1;var dom=null;
    for(var ax in dx){if(dx[ax]>max){max=dx[ax];dom=ax;}}
    return dom;
}

// 道心影响数值
function getDaoXinEffects() {
    var ef={priceDiscount:1,pillageBonus:1,repBonus:1,incomeBonus:1,cultivationBonus:1};
    if(!G||!G.player||!G.player.daoXin)return ef;
    var dx=G.player.daoXin;
    ef.priceDiscount=Math.max(0.7,1-(dx.ren||50)/1000);
    ef.pillageBonus=1+(dx.yu||50)/300;
    ef.repBonus=1+(dx.yi||50)/400;
    ef.incomeBonus=1+(dx.li||50)/400;
    ef.cultivationBonus=1+(dx.kong||50)/800;
    return ef;
}

// ★ 命格↔道路加成偏向
function getDestinyPathBonus(path) {
    var bonus={expMult:1,effectMult:1};
    if(!G||!G.player||!G.player.destiny)return bonus;
    var dMap={
        'gu_xing':{ba_dao:1.25,wang_dao:0.85,tian_dao:0.95},
        'zi_wei':{ba_dao:1.0,wang_dao:1.2,tian_dao:1.0},
        'tai_yin':{ba_dao:0.85,wang_dao:1.0,tian_dao:1.15},
        'tai_yang':{ba_dao:1.15,wang_dao:1.0,tian_dao:0.85},
        'qi_lin':{ba_dao:1.0,wang_dao:1.0,tian_dao:1.2},
        'xuan_wu':{ba_dao:0.9,wang_dao:1.15,tian_dao:1.0},
        'zhu_que':{ba_dao:1.2,wang_dao:0.9,tian_dao:1.0},
        'bai_hu':{ba_dao:1.1,wang_dao:0.95,tian_dao:0.95}
    };
    var map=dMap[G.player.destiny];
    if(map&&map[path])bonus.expMult=map[path];
    return bonus;
}

// ========== 天命命格系统 ==========
function rollDestiny() {
    var idx=Math.floor(Math.random()*DESTINY_TYPES.length);
    return DESTINY_TYPES[idx];
}

function applyDestinyEffects(destiny) {
    if(!destiny||!destiny.stats)return{};
    return destiny.stats;
}

function initDestiny() {
    if(!G)return;
    var d=rollDestiny();
    G.player.destiny=d.id;
    saveGame();
    return d;
}

// 获取当前天命命格
function getPlayerDestiny() {
    if(!G||!G.destiny)return null;
    for(var di=0;di<DESTINY_TYPES.length;di++)if(DESTINY_TYPES[di].id===G.player.destiny)return DESTINY_TYPES[di];
    return null;
}

// ========== 归虚回响 ==========
function checkVoidEcho() {
    // 归无劫==500时触发（当前游戏没有此数值，用境界和道蕴组合代替）
    // 简化实现：当玩家触道境(6)且道蕴>50000时触发
    // 更合理的触发：在startAutoTick中定期检查
    if(!G||!G.player)return null;
    if(G.player.realm>=6&&G.player.dao_essence>=50000&&!G._voidEchoActive){
        G._voidEchoActive=true;
        G._voidEchoTimer=Date.now()+60000*VOID_ECHO_EVENTS[0].duration;
        saveGame();
        return VOID_ECHO_EVENTS[0];
    }
    return null;
}

function isVoidEchoActive() {
    if(!G||!G._voidEchoTimer)return false;
    if(Date.now()<G._voidEchoTimer)return true;
    // 归虚回响结束
    G._voidEchoActive=false;
    G._voidEchoTimer=null;
    saveGame();
    return false;
}

// ========== 天道碎片系统 ==========
function checkFragmentDiscovery(fragmentId) {
    if(!G||!G.player)return false;
    var fr=null;for(var fi=0;fi<HEAVEN_FRAGMENTS.length;fi++)if(HEAVEN_FRAGMENTS[fi].id===fragmentId){fr=HEAVEN_FRAGMENTS[fi];break;}
    if(!fr)return false;
    if(G.player.fragments&&G.player.fragments.indexOf(fragmentId)>=0)return false; // 已有
    var cond=fr.findCond;
    if(cond.realm!==undefined&&G.player.realm<cond.realm)return false;
    if(cond.area!==undefined){var aData=G.exploration.areas[cond.area];if(!aData||!aData.discovered)return false;}
    if(cond.explored!==undefined){var aData2=G.exploration.areas[cond.area];if(!aData2||aData2.exploredCount<cond.explored)return false;}
    if(cond.storyFlag!==undefined){if(!G.story.flags||!G.story.flags[cond.storyFlag])return false;}
    if(cond.exploredTotal!==undefined){var totalExp=0;for(var ek in G.exploration.areas)totalExp+=G.exploration.areas[ek].exploredCount;if(totalExp<cond.exploredTotal)return false;}
    return true;
}

function discoverFragment(fragmentId) {
    if(!checkFragmentDiscovery(fragmentId))return {success:false,reason:'条件未满足'};
    if(!G.player.fragments)G.player.fragments=[];
    G.player.fragments.push(fragmentId);
    saveGame();
    var fr=null;for(var fi=0;fi<HEAVEN_FRAGMENTS.length;fi++)if(HEAVEN_FRAGMENTS[fi].id===fragmentId){fr=HEAVEN_FRAGMENTS[fi];break;}
    return {success:true,fragment:fr};
}

function getFragmentEffects() {
    if(!G||!G.player||!G.player.fragments)return{};
    var ef={};
    var efs=G.player.fragments;
    for(var fi=0;fi<efs.length;fi++){
        for(var hi=0;hi<HEAVEN_FRAGMENTS.length;hi++){
            if(HEAVEN_FRAGMENTS[hi].id===efs[fi]){
                var hf=HEAVEN_FRAGMENTS[hi];
                ef[hf.effect]=(ef[hf.effect]||1)+(hf.bonus||0);
            }
        }
    }
    return ef;
}

// ========== NPC随机偶遇系统 ==========
const NPC_ENCOUNTERS = [
    { npc:'叶小钗', title:'疾风剑', text:'你在迷雾森林边缘遇到了一个十五六岁的少女。她正对着一棵古树疯狂挥剑，每一剑都快如闪电。\n\n看到你，她停下动作："你是镇守者？我师父……就是上一任镇守者之一。他失踪之前留了封信，说如果遇到新来的镇守者，就告诉你——"裂缝不是裂开，是在生长。"说完她就跑了。"', rewards:{dao_essence:20,technique_fragments:1}, minRealm:0 },
    { npc:'云中子', title:'云游散修', text:'你在镇口看到一个白发老头躺在长椅上晒太阳。\n\n看到你过来，他懒洋洋地睁开一只眼："新来的？不错不错，比上一个精神。老夫云中子，在这躺了三十年了。告诉你个秘密——这镇上有个地窖，里面埋着第二任镇守者的笔记。位置嘛……用你的灵石砸一下镇道殿东边的第三块砖。"', rewards:{dao_essence:30,spirit_stones:50}, minRealm:0 },
    { npc:'金算子', title:'一路算到底', text:'坊市里有个衣着华贵的商人正在和摊贩讨价还价。\n\n你走过去时，他转过头来："哦？你就是新镇守者？我叫金算子。提醒你一句——别在天机阁买太多情报。他们卖的消息，一半是真的，一半是故意放出来的。至于哪些真哪些假……嘿嘿，自己琢磨。"', rewards:{spirit_stones:80}, minRealm:0 },
    { npc:'铁骨', title:'不破金身', text:'一个铁塔般的大汉站在演武场中央，任由三个散修轮流攻击，纹丝不动。\n\n看到你，他咧嘴一笑："你就是那个新来的？不错，比剑无痕那个瘦猴结实。改天咱俩练练？放心，我只防守不进攻。"', rewards:{dao_essence:15,rep:5}, minRealm:1 },
    { npc:'寻宝鼠', title:'哪里有宝去哪里', text:'一个贼头贼脑的矮个子鬼鬼祟祟地从你身边经过，怀里鼓鼓囊囊。\n\n注意到你的目光，他嘿嘿一笑："别紧张，兄弟。我刚从古战场边缘摸了点好东西——见者有份。"他塞给你几块灵石，然后一溜烟跑了。', rewards:{spirit_stones:120,ores:5}, minRealm:1 },
    { npc:'道无名', title:'无名天地之始', text:'镇外的悬崖上，一个青袍道人面朝虚空打坐。\n\n你没有打扰他。但他似乎知道你来了一样，背对着你说："第十七位。你知道裂缝里传出的声音说了什么吗？"沉默片刻，他摇头笑道："算了，还不是时候。等你到了触道境再来找我。"', rewards:{dao_essence:50}, minRealm:2 },
];

function checkNPCEncounter() {
    if(!G||!G.npcEncounters)return null;
    var now=Date.now();
    var last=G.npcEncounters.lastCheck||0;
    if(now-last<120000)return null; // 2分钟CD
    G.npcEncounters.lastCheck=now;
    var rolled=G.npcEncounters.triggered||[];
    var available=[];
    for(var ei=0;ei<NPC_ENCOUNTERS.length;ei++){
        var enc=NPC_ENCOUNTERS[ei];
        if(rolled.indexOf(enc.npc)>=0)continue;
        if(enc.minRealm!==undefined&&G.player.realm<enc.minRealm)continue;
        available.push(enc);
    }
    if(available.length===0||randf()>0.3)return null; // 30%概率触发
    var enc2=available[Math.floor(Math.random()*available.length)];
    if(!G.npcEncounters.triggered)G.npcEncounters.triggered=[];
    G.npcEncounters.triggered.push(enc2.npc);
    return enc2;
}

// ========== 激励广告系统 ==========
// 广告API：TapTap广告SDK占位
var ADS_ENABLED = false; // TapTap试玩期间禁用，上架后改为true

var adApi = {
    isReady: function(){return typeof __rewardedAdReady!=='undefined'?__rewardedAdReady:false;},
    showRewarded: function(){if(typeof showRewardedAd==='function')showRewardedAd();}
};

var adCooldown=0;
var AD_COOLDOWN_MS=180000; // 3分钟CD

function canShowAd() {return Date.now()>=adCooldown;}

function getAvailableAds() {
    if(!ADS_ENABLED)return [];
    var ads=[];
    if(canShowAd()){
        ads.push({id:'ad_cultivate',name:'修炼加速',desc:'立即获得大量道蕴（等于30分钟自动修炼）',icon:'◇'});
        ads.push({id:'ad_stones',name:'灵石增益',desc:'立即获得灵石（等于30分钟城镇产出）',icon:'◆'});
        ads.push({id:'ad_herbs',name:'药材丰收',desc:'立即获得大量药材（等于30分钟灵田产出）',icon:'药'});
        ads.push({id:'ad_explore',name:'探索加速',desc:'立即完成一次当前区域的探索事件',icon:'探'});
        ads.push({id:'ad_heal',name:'气血恢复',desc:'立即恢复全部气血和灵力',icon:'血'});
        ads.push({id:'ad_break',name:'悟道顿悟',desc:'立即获得1点悟道点',icon:'悟'});
        ads.push({id:'ad_battle',name:'战意激昂',desc:'30分钟内战斗经验翻倍',icon:'战'});
        ads.push({id:'ad_pill',name:'炼丹祝福',desc:'下一次炼丹必定成功',icon:'丹'});
        ads.push({id:'ad_build',name:'工匠之心',desc:'下一次建筑升级灵石减半',icon:'建'});
    }
    return ads;
}

function triggerAdReward(adId) {
    if(!canShowAd())return {success:false,reason:'冷却中'};
    adCooldown=Date.now()+AD_COOLDOWN_MS;
    saveGame();
    // 实际游戏中使用TapTap广告SDK，这里直接给奖励以便测试
    var reward=null;
    if(adId==='ad_cultivate'){
        var amt=calcCultivationOutput().dao_essence*30;
        if(G)G.player.dao_essence+=amt;
        reward={type:'道蕴',amount:amt};
    }else if(adId==='ad_stones'){
        var veinLv=G?getBuildingLevel('spirit_vein'):0;
        var stones=Math.floor(veinLv*0.3*30+50);
        if(G)G.player.spirit_stones+=stones;
        reward={type:'灵石',amount:stones};
    }else if(adId==='ad_herbs'){
        var fieldLv=G?getBuildingLevel('spirit_field'):0;
        var herbs=Math.floor(fieldLv*0.5*30+10);
        if(G)G.player.herbs+=herbs;
        reward={type:'药材',amount:herbs};
    }else if(adId==='ad_explore'){
        if(G&&G.exploration.currentExpedition){
            // 快速完成一步探索
            for(var ei=0;ei<3;ei++)processExpeditionStep();
            var exp2=G.exploration.currentExpedition;
            var stepCount=exp2?exp2.currentStep:0;
            reward={type:'探索步骤',amount:stepCount};
        }else{
            reward={type:'探索加速',amount:1};
        }
    }else if(adId==='ad_heal'){
        if(G){G.player.vitality=G.player.maxVitality;G.player.spirit=G.player.maxSpirit;}
        reward={type:'全恢复',amount:1};
    }else if(adId==='ad_break'){
        if(G)G.player.enlightenment=(G.player.enlightenment||0)+1;
        reward={type:'悟道点',amount:1};
    }else if(adId==='ad_battle'){
        if(G){G._battleBoost=Date.now()+1800000;G._battleBoosted=true;}
        reward={type:'战斗经验加成',amount:30};
    }else if(adId==='ad_pill'){
        if(G)G._nextPillGuaranteed=true;
        reward={type:'炼丹必定成功',amount:1};
    }else if(adId==='ad_build'){
        if(G)G._nextBuildDiscount=true;
        reward={type:'建筑灵石减半',amount:1};
    }
    return {success:true,reward:reward};
}

// ========== 挖矿系统 ==========
function calcMiningOutput() {
    if (!G) return { ores: 0, spirit_stones: 0, beast_materials: 0 };
    var p = G.player;
    var realmBonus = 1 + p.realm * 0.5;
    var miningLv = G.stats.miningLevel || 1;
    var baseOre = Math.floor((2 + miningLv) * realmBonus);
    // 基础矿石产出
    var ores = baseOre + rand(-1, 2);
    if (ores < 1) ores = 1;
    // 概率附带灵石
    var stones = 0;
    if (randf() < 0.3 + p.realm * 0.05) stones = rand(1, 5 + p.realm * 2) * miningLv;
    // 低概率妖材
    var beast = 0;
    if (randf() < 0.1 + p.realm * 0.02) beast = rand(1, 2);
    return { ores: ores, spirit_stones: stones, beast_materials: beast };
}

function doMining() {
    if (!G) return { success: false, reason: '' };
    var p = G.player;
    var cost = 5 + p.realm * 2; // 消耗灵力
    if (p.spirit < cost) return { success: false, reason: '灵力不足，需要' + cost + '灵力' };
    p.spirit -= cost;
    var output = calcMiningOutput();
    p.ores += output.ores;
    if (output.spirit_stones > 0) p.spirit_stones += output.spirit_stones;
    if (output.beast_materials > 0) p.beast_materials += output.beast_materials;
    // 挖矿经验
    G.stats.miningLevel = (G.stats.miningLevel || 1) + 0.02;
    // 随机深度事件
    var depthEvent = null;
    if (randf() < 0.05) {
        var events = [
            { text: '你挖到了一条小型灵石矿脉！', rewards: { spirit_stones: rand(20, 50 + p.realm * 10) } },
            { text: '矿洞深处发现了一具远古遗骸，旁边散落着几枚功诀残页。', rewards: { technique_fragments: rand(1, 3) } },
            { text: '你惊动了一头沉睡的地底妖兽！虽然险象环生，但也收获了不少妖材。', rewards: { beast_materials: rand(3, 8) } },
            { text: '一株罕见的石中灵药在矿壁上生长，你小心翼翼地采了下来。', rewards: { herbs: rand(3, 10) } }
        ];
        depthEvent = events[Math.floor(randf() * events.length)];
        for (var k in depthEvent.rewards) {
            if (p[k] !== undefined) p[k] += depthEvent.rewards[k];
        }
    }
    return { success: true, ores: output.ores, stones: output.spirit_stones, beast: output.beast_materials, event: depthEvent };
}
