/* 道韵·洪荒镇道 - UI交互层 v2 (ES5兼容版) */

var D={},curTab='main',expInterval=null,expWaiting=false,toastTimer=null,autoCult=false,autoCultInterval=null,tutorialStep=-1;
var _pageLockScroll=false; // 页面渲染期间禁止自动滚到底

function id(s){return document.getElementById(s)}
function q(s){return document.querySelector(s)}
function qa(s){return document.querySelectorAll(s)}

function initDOM(){
    D.splash=id('splash');D.app=id('app');D.story=id('story');D.storyInner=id('storyInner');
    D.actions=id('actions');D.resBar=id('resBar');D.statSheet=id('statSheet');
    D.statContent=id('statContent');D.statOverlay=id('statOverlay');D.toast=id('toast');
    D.menuSheet=id('menuSheet');D.menuOverlay=id('menuOverlay');
}

function toast(msg,type){
    var t=D.toast;if(!t)return;
    t.textContent=msg;t.className='show'+(type?' '+type:'');
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.className='';},2500);
}

// 叙事输出
function t(s,html){var p=document.createElement('p');if(html)p.innerHTML=s;else p.textContent=s;D.storyInner.appendChild(p);if(!_pageLockScroll)D.story.scrollTop=D.story.scrollHeight;}
function title(s){t('<span class="ti">'+s+'</span>',true);}
function div(){t('<span class="di">—— * ——</span>',true);}
function dim(s){t('<span class="dm">'+s+'</span>',true);}
function hl(s){t('<span class="hl">'+s+'</span>',true);}
function he(s){t('<span class="he">'+s+'</span>',true);}
function dang(s){t('<span class="dg">'+s+'</span>',true);}
function info(s){t('<span class="in">'+s+'</span>',true);}
function scBig(txt){var p=document.createElement('p');p.className='sc-big';p.textContent=txt;D.storyInner.appendChild(p);}
function clearStory(){D.storyInner.innerHTML='';_pageLockScroll=true;setTimeout(function(){_pageLockScroll=false;},100);}
function ac(){D.actions.innerHTML='';}

function btns(list){
    ac();var g=document.createElement('div');g.className='ab';
    for(var i=0;i<list.length;i++){
        var a=list[i];var b=document.createElement('button');b.className='btn';
        if(a.pri)b.classList.add('pri');if(a.dan)b.classList.add('dan');if(a.suc)b.classList.add('suc');
        if(a.sm)b.classList.add('sm');if(a.dis)b.disabled=true;
        b.textContent=a.text;b.onclick=a.cb;g.appendChild(b);
    }
    D.actions.appendChild(g);
}

// 资源条（可点击查看详情）
function renderRes(){
    if(!G)return;var p=G.player;
    D.resBar.innerHTML='';
    var items=[
        {key:'spirit_stones',icon:'◆',val:p.spirit_stones,cls:'gold'},
        {key:'dao_essence',icon:'◇',val:p.dao_essence,cls:''},
        {key:'enlightenment',icon:'✦',val:p.enlightenment,cls:'gold'},
        {key:'herbs',icon:'药',val:p.herbs,cls:''},
        {key:'rep',icon:'名',val:p.rep,cls:'gold'}
    ];
    for(var ri=0;ri<items.length;ri++){
        var item=items[ri];
        var span=document.createElement('span');span.className='tr-item';span.style.cursor='pointer';
        (function(k){
            span.onclick=function(){showResDetail(k);};
        })(item.key);
        span.innerHTML='<i class="ti-icon">'+item.icon+'</i><span class="tr-val'+(item.cls?' '+item.cls:'')+'">'+item.val+'</span>';
        D.resBar.appendChild(span);
    }
}

// 资源详情弹窗
function showResDetail(key){
    var r=RESOURCES[key];
    if(!r)return;
    var p=G.player;
    var v=p[key]!==undefined?p[key]:0;
    var descText=r.desc||'修行必备';
    toast(r.name+'：'+v+' | '+descText,'');
}

// 状态面板
var stOpen=false;
function toggleStats(){
    stOpen=!stOpen;
    D.statOverlay.style.display=stOpen?'block':'none';
    D.statSheet.style.display=stOpen?'flex':'none';
    if(stOpen){renderStatContent();D.statSheet.classList.add('open');}
    else D.statSheet.classList.remove('open');
}

function renderStatContent(){
    if(!G||!D.statContent)return;
    var p=G.player;var pp=calcPlayerPower();var ach=getAchievementCount();
    var h='';
    h+='<div class="ss"><div class="st">* '+p.name+'</div><div class="sr"><span class="sl">境界</span><span class="sv gold">'+formatRealmFull()+'</span></div><div class="sr"><span class="sl">战力</span><span class="sv blue">'+calcCombatPower()+'</span></div><div class="sr"><span class="sl">成就</span><span class="sv gold">'+ach.earned+'/'+ach.total+'</span></div>';
    // 道号展示（可点击切换 - 带品质颜色）
    var eq=getEquippedTitle();
    var ownedTitles=G&&G.titles?G.titles:[];
    if(eq){var eqCls='ti-name ti-rarity'+(eq.rarity||1)+(eq.effect!=='none'?' ti-effect-'+eq.effect:'');h+='<div class="sr"><span class="sl">道号</span><span class="'+eqCls+'" style="cursor:pointer;font-size:18px;letter-spacing:2px;" onclick="cycleTitle()">「'+eq.name+'」</span></div>';}
    else{h+='<div class="sr"><span class="sl">道号</span><span class="sv dim" style="cursor:pointer;" onclick="cycleTitle()">未佩戴（点击选择）</span></div>';}
    h+='</div>';
    h+='<div class="ss"><div class="st">* 战斗</div><div class="pb"><span class="sl" style="min-width:30px">气血</span><div class="pt"><div class="pf red" style="width:'+(p.vitality/pp.hp*100).toFixed(0)+'%"></div></div><span class="ptxt">'+Math.floor(p.vitality)+'/'+pp.hp+'</span></div><div class="pb"><span class="sl" style="min-width:30px">灵力</span><div class="pt"><div class="pf blue" style="width:'+(p.spirit/p.maxSpirit*100).toFixed(0)+'%"></div></div><span class="ptxt">'+Math.floor(p.spirit)+'/'+Math.floor(p.maxSpirit)+'</span></div><div class="sr"><span class="sl">攻击</span><span class="sv">'+pp.atk+'</span></div><div class="sr"><span class="sl">防御</span><span class="sv">'+pp.def+'</span></div><div class="sr"><span class="sl">速度</span><span class="sv">'+pp.spd+'</span></div></div>';
    if(p.stage<8){
        h+='<div class="ss"><div class="st">* 修炼</div><div class="pb"><span class="sl" style="min-width:30px">道蕴</span><div class="pt"><div class="pf gold" style="width:'+(getRealmDaoProgress()*100).toFixed(0)+'%"></div></div><span class="ptxt">'+getRealmDaoProgressText()+'</span></div><div class="sr"><span class="sl">悟道点</span><span class="sv gold">'+p.enlightenment+'</span></div></div>';
    }else{
        h+='<div class="ss"><div class="st">* 突破瓶颈</div><div class="pb"><span class="sl" style="min-width:30px">瓶颈</span><div class="pt"><div class="pf red" style="width:'+Math.min(100,p.dao_essence/(REALMS[p.realm].daoCost||1)*100).toFixed(0)+'%"></div></div><span class="ptxt">'+p.dao_essence+'/'+REALMS[p.realm].daoCost+'</span></div><div class="sr"><span class="sl">悟道点</span><span class="sv gold">'+p.enlightenment+'</span></div><div class="sr"><span class="sl">需灵石</span><span class="sv '+(p.spirit_stones>=REALMS[p.realm].breakCost?'green':'red')+'">'+REALMS[p.realm].breakCost+'</span></div></div>';
    }
    h+='<div class="ss"><div class="st">* 荒古镇</div><div class="sr"><span class="sl">镇道殿</span><span class="sv gold">Lv.'+getBuildingLevel('town_hall')+'</span></div><div class="sr"><span class="sl">人口</span><span class="sv">'+G.town.population+'</span><span class="sl">繁荣</span><span class="sv">'+G.town.prosperity.toFixed(0)+'</span><span class="sl">安全</span><span class="sv">'+G.town.security.toFixed(0)+'</span></div></div>';
    // 命格显示
    var destId=G.player.destiny;
    if(destId){for(var di=0;di<DESTINY_TYPES.length;di++)if(DESTINY_TYPES[di].id===destId){var dest=DESTINY_TYPES[di];h+='<div class="ss"><div class="st">* 天命命格</div><div class="sr"><span class="sl">命格</span><span class="sv" style="color:'+dest.color+'">'+dest.name+'</span></div><div class="sr"><span class="sl">天赋</span><span class="sv dim" style="font-size:12px">'+dest.effect+'</span></div></div>';break;}}
    h+='<div class="ss"><div class="st">* 混沌灵宝</div>';
    var slotMap={weapon:'兵器',armor:'衣甲',accessory:'饰品'};
    for(var s in slotMap){var aid=G.equipment[s];var aname=aid&&ARTIFACTS[aid]?ARTIFACTS[aid].name:'—';h+='<div class="sr"><span class="sl">'+slotMap[s]+'</span><span class="sv '+(aid?'gold':'dim')+'">'+aname+'</span></div>';}
    h+='</div><div class="ss"><div class="st">* 统计</div><div class="sr"><span class="sl">战斗</span><span class="sv">'+G.stats.battles+'次</span><span class="sl">突破</span><span class="sv">'+G.stats.breakthroughs+'次</span></div><div class="sr"><span class="sl">探索</span><span class="sv">'+G.stats.expeditions+'次</span><span class="sl">炼丹</span><span class="sv">'+(G.stats.pillsCrafted||0)+'次</span></div></div>';
    D.statContent.innerHTML=h;
}

// 道号选择弹窗（在状态面板点击道号行触发）
function cycleTitle(){
    checkDaoTitles(); // ★ 进入时检查道号
    var owned=G&&G.titles?G.titles:[];
    console.log('[道号-选择] G.titles:', JSON.stringify(G.titles));
    if(owned.length===0){toast('尚未获得任何道号','dan');return;}
    var current=G.equippedTitle;
    // 先关状态面板
    if(stOpen)toggleStats();
    clearStory();title('* 选择佩戴道号');
    var rarityNames=['','凡','精','奇','绝','荒'];
    var acts=[];
    // 未佩戴选项
    if(current){
        (function(){
            var emptyDiv=document.createElement('div');emptyDiv.className='ti-pick';emptyDiv.textContent='[ 卸下道号 ]';emptyDiv.style.color='var(--dim)';
            emptyDiv.onclick=function(){equipDaoTitle(null);toast('已卸下道号','');showDaoTitles();};
            D.actions.appendChild(emptyDiv);
        })();
    }
    for(var ti=0;ti<owned.length;ti++){
        var tid=owned[ti];
        var t=null;for(var dti=0;dti<DAO_TITLES.length;dti++)if(DAO_TITLES[dti].id===tid){t=DAO_TITLES[dti];break;}
        if(!t)continue;
        var isEq=tid===current;
        var prefix=rarityNames[t.rarity]||'';
        var cls='ti-pick'+(isEq?' equipped':'');
        (function(tData,isEq2){
            var div2=document.createElement('div');div2.className=cls;
            var html2='<span class="ti-name ti-rarity'+tData.rarity+(tData.effect!=='none'?' ti-effect-'+tData.effect:'')+(isEq2?'" style="font-size:22px;"':'')+'">【'+prefix+'】'+tData.name+(isEq2?' ★佩戴中':'')+'</span><br><span style="font-size:11px;color:var(--dim)">'+tData.desc+'</span>';
            div2.innerHTML=html2;
            if(!isEq2)div2.onclick=function(){var r=equipDaoTitle(tData.id);if(r.success){toast('道号：'+r.name,'suc');cycleTitle();}else toast(r.reason,'dan');};
            D.actions.appendChild(div2);
        })(t,isEq);
    }
    btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);
}
function switchTab(tab){
    if(expWaiting){toast('探索进行中，稍等','dan');return;}
    curTab=tab;
    var navs=qa('.nav-item');
    for(var i=0;i<navs.length;i++)navs[i].classList.toggle('active',navs[i].dataset.tab===tab);
    clearStory();ac();
    var fn={main:renderMain,cultivate:renderCultivate,town:renderTown,explore:renderExplore,market:renderMarket,inventory:renderInventory};
    (fn[tab]||renderMain)();renderRes();
    // 显示当前页面的简短说明
    var tabTips={main:'道韵洪荒镇道——你的道，由你书写',cultivate:'引气入体，突破境界。积累道蕴，悟道飞升',town:'建设荒古镇，发展为洪荒边陲第一重镇',explore:'踏入未知之地，搜寻资源，遭遇奇遇',market:'买卖物资，炼丹锻造，壮大实力',inventory:'查看资源、丹药、灵宝，使用物品'};
    var tip=tabTips[tab];
    if(tip){dim('[ '+tip+' ]');}
}

function openMenu(){D.menuOverlay.style.display='block';D.menuSheet.style.display='block';}
function closeMenu(){D.menuOverlay.style.display='none';D.menuSheet.style.display='none';}
// 故事区域点击处理（移动端防误触）
function handleStoryTap(){}
function saveCurrentGame(){if(!G){toast('无游戏可存档','dan');return;}showSaveSlots();}
function showSaveSlots(){
    closeMenu();clearStory();title('* 保存到哪个存档？');
    var acts=[];
    for(var i=0;i<3;i++){var info=getSaveInfo(i);var label='存档'+(i+1)+(info.exists?'（'+info.time+'）':'（空）');acts.push({text:'[ '+label+' ]',cb:function(s){return function(){saveGame(s);toast('已保存到存档'+(s+1),'suc');switchTab('main');};}(i),sm:true});}
    acts.push({text:'[ 取消 ]',cb:function(){switchTab('main');}});
    btns(acts);
}
function exportSaveData(){
    if(!G){toast('没有游戏数据','dan');return;}
    try{navigator.clipboard.writeText(exportSave());toast('存档已复制到剪贴板','suc');}
    catch(e){prompt('复制以下存档数据：',exportSave());toast('请在对话框中复制','');}
}

// splash->game 过渡
function transitionToGame(){
    D.splash.style.transition='opacity 0.4s ease';D.splash.style.opacity='0';
    setTimeout(function(){D.splash.style.display='none';D.app.style.display='flex';D.app.style.animation='fadeIn 0.3s ease';},400);
}

// 新手指引
function startTutorial(){tutorialStep=0;clearStory();title('* 洪荒苏醒');t('你的意识在混沌中漂流......');t('然后你睁开了眼。');t('你躺在一片陌生的荒原上，远处有一座破败的小镇。');div();btns([{text:'[ 先站起来 ]',cb:function(){tutorialNext(1);},pri:true}]);}
function tutorialNext(step){
    clearStory();ac();
    if(step===1){hl('[ 第一步：感受天地灵气 ]');t('盘膝坐下，闭目凝神。');t('点击下面按钮修炼一次。');btns([{text:'[ 修炼 引气入体 ]',cb:function(){var out=calcCultivationOutput();G.player.dao_essence+=out.dao_essence;if(out.enlightenment>0)G.player.enlightenment+=out.enlightenment;he('道蕴 +'+out.dao_essence+(out.enlightenment>0?' 悟道点 +'+out.enlightenment:''));renderRes();btns([{text:'[ 继续 ]',cb:function(){tutorialNext(2);},pri:true}]);},pri:true}]);}
    else if(step===2){hl('[ 第二步：你的境界 ]');t('灵气在经脉中流动。这就是道蕴。');t('你的初始境界是【锻体】一转。积累道蕴可突破。');t('前往【城镇】看看你的落脚点。');tutorialStep=-1;switchTab('town');}
}

// 主页
function renderMain(){
    if(!G){showNewGame();return;}
    clearStory();ac();
    // 显示佩戴道号
    var eq=getEquippedTitle();
    if(eq){
        var rn2=eq.rarity||1;
        var html2='<div style="text-align:center;margin:6px 0;"><span class="ti-name ti-rarity'+rn2+(eq.effect!=='none'?' ti-effect-'+eq.effect:'')+'" style="font-size:24px;letter-spacing:4px;">『'+eq.name+'』</span></div>';
        t(html2,true);
    }
    title('* 道韵洪荒镇道');
    dim('[ '+formatRealmFull()+' | 战力 '+calcCombatPower()+' ]');
    var texts=['你站在荒古镇的废墟上。风很冷，远处的迷雾森林在暮色中若隐若现。','玄脉已通，灵气在经脉中流转。','武道真意凝于心中。','神识破体而出，这个世界远比你想象的辽阔。','御空而立。前方是通往未知的门。','指尖触碰到了规则的边缘。','冠绝一道。但真正的道不止于此。','圣人之境。天道碎片在你眼前破碎。','圣君之名。你就是这一方碎片上的规则。','在这个破碎的世界之上，你就是新的锚点。'];
    t(texts[Math.min(G.player.realm,texts.length-1)]);
    if(getBuildingLevel('town_hall')<=1)dim('[ 提示 ] 去【城镇】修建灵脉阵');
    var newAch=checkAchievements();for(var i=0;i<newAch.length;i++){var na=newAch[i];if(na.isTitle){hl('★ 获封尊号【'+na.name+'】');}else{hl('[ 成就 ] '+na.icon+' '+na.name+'——'+na.desc);}}
    // 检查道号
    var newTitles=checkDaoTitles();for(var ti=0;ti<newTitles.length;ti++){var nt=newTitles[ti];hl('[ 道号 ] ★ 获封尊号【'+nt.name+'】');}
    // 归虚回响状态
    if(G._voidEchoActive){hl('✦ 归虚回响 · 万物复苏 —— 资源产出翻倍中');}
    // 显示天命命格
    var destId=G.player.destiny;
    if(destId){for(var di=0;di<DESTINY_TYPES.length;di++)if(DESTINY_TYPES[di].id===destId){var dest=DESTINY_TYPES[di];info('[ 天命 ] '+dest.name+'——'+dest.effect);break;}}
    // 检查天道碎片
    var fragList=G.player.fragments||[];
    if(fragList.length>0){dim('[ 天道碎片 ] 已收集 '+fragList.length+'/'+HEAVEN_FRAGMENTS.length+' 块');}
    var visitor=checkNPCVisitors();if(visitor){hl('[ 访客 ] '+visitor.title);t(visitor.text);var vr=[];for(var k in visitor.rewards){var rn=RESOURCES[k]?RESOURCES[k].name:k;vr.push(rn+'+'+visitor.rewards[k]);}he('获得：'+vr.join('、'));div();}
    // NPC随机偶遇
    var encounter=checkNPCEncounter();if(encounter){hl('[ 偶遇 ] '+encounter.npc+'——'+encounter.title);t(encounter.text);var evr=[];for(var ek2 in encounter.rewards){var ern=RESOURCES[ek2]?RESOURCES[ek2].name:ek2;evr.push(ern+'+'+encounter.rewards[ek2]);}if(evr.length)he('获得：'+evr.join('、'));div();}
    var progress=checkStoryProgress();var storyLabel=progress.length>0?'[ 推进剧情 ]（'+progress.length+'章可推）':null;
    div();
    var btnsList=[];
    if(storyLabel)btnsList.push({text:storyLabel,cb:function(){advanceStory();},pri:true});
    btnsList.push({text:'[ 修炼 ]',cb:function(){switchTab('cultivate');}});
    btnsList.push({text:'[ 城镇 ]',cb:function(){switchTab('town');}});
    btnsList.push({text:'[ 探索 ]',cb:function(){switchTab('explore');}});
    // 广告入口（TapTap试玩期间隐藏）
    // if(canShowAd())btnsList.push({text:'[ 激励·加速 ]',cb:function(){showAdPanel();},sm:true});
    btns(btnsList);
}

// 剧情推进（含条件锁定 + 分支结局 + 万界篇）
function advanceStory(){
    var all=STORY_CHAPTERS.concat(STORY_CHAPTERS_MORE).concat(STORY_EXTRA||[]);
    if(G.story.chapter>=all.length){t('所有剧情已看完。');return;}
    var ch=all[G.story.chapter];
    // 检查条件
    var cond=ch.condition;
    if(cond){
        var canAccess=true;var reasons=[];
        // 分支结局条件（按道路名称）
            if(typeof cond==='string'){
                var pathLv=G.player.pathLevels[cond]||0;
                var pathNames={ba_dao:'霸道',wang_dao:'王道',tian_dao:'天道'};
                if(pathLv<5){canAccess=false;reasons.push('需将【'+(pathNames[cond]||cond)+'】修炼至满级（Lv.5）');}
            }else{
                if(cond.minRealm!==undefined&&G.player.realm<cond.minRealm){canAccess=false;reasons.push('需达到【'+REALMS[cond.minRealm].name+'】境界');}
                if(cond.buildings){var bNames={town_hall:'镇道殿',spirit_vein:'灵脉阵',market:'坊市',training_ground:'演武场',library:'藏书阁',defense_array:'护山大阵',alchemy_room:'丹房',forge:'锻造铺',spirit_field:'灵田',watchtower:'望虚塔'};for(var bId in cond.buildings){if((G.town.buildings[bId]||0)<cond.buildings[bId]){canAccess=false;reasons.push('需【'+(bNames[bId]||bId)+'】Lv.'+cond.buildings[bId]);}}}
                if(cond.exploration){var aNames={mist_forest:'迷雾森林',battlefield_ruins:'古战场遗迹',void_rift:'虚空裂隙'};for(var areaId in cond.exploration){var aData=G.exploration.areas[areaId];if(!aData||aData.exploredCount<cond.exploration[areaId]){canAccess=false;reasons.push('需探索【'+(aNames[areaId]||areaId)+'】'+(cond.exploration[areaId]||1)+'次');}}}
                if(cond.storyFlags){
                if(!G.story.flags)G.story.flags={};
                var flags=Array.isArray(cond.storyFlags)?cond.storyFlags:[cond.storyFlags];
                for(var fi=0;fi<flags.length;fi++){if(!G.story.flags[flags[fi]]){canAccess=false;reasons.push('需完成前置剧情');}}
            }
        }
        if(!canAccess){
            clearStory();title('第'+(G.story.chapter+1)+'章 '+ch.title);
            dim('— 条件未满足 —');
            for(var ri=0;ri<reasons.length;ri++)dang('✗ '+reasons[ri]);
            btns([{text:'[ 返回主页 ]',cb:renderMain,pri:true}]);
            return;
        }
    }
    // 显示剧情
    var txt=ch.text||ch.content||'';
    if(!txt){dang('剧情文本缺失');return;}
    clearStory();title('第'+(G.story.chapter+1)+'章 '+ch.title);
    var ps=txt.split('\n\n');for(var a=0;a<ps.length;a++){var p=ps[a].trim();if(p.charAt(0)=='"'&&p.charAt(p.length-1)=='"')hl(p);else t(p);}
    // ★ 第2章根据命格追加特殊台词
    if(ch.title==='荒古镇'){
        var destinyTexts={
            'gu_xing':'尘虚子打量了你一番，独眼中闪过一丝异色："天煞孤星的命格……有意思。你这样的人，要么成为最强者，要么死得最快。"',
            'zi_wei':'尘虚子眯起眼睛："紫微帝星？呵，荒古镇这地方，倒是第一次来这种命格的人。希望你别嫌弃这里破旧。"',
            'tai_yin':'尘虚子若有所思："太阴润物……温和的命格。你这样的人，在边荒活下来的不多。但活下来的，都活得很好。"',
            'tai_yang':'尘虚子咧嘴一笑："太阳耀世？那你可得小心了——光芒太盛的人，在边荒容易被盯上。"',
            'qi_lin':'尘虚子微微颔首："麒麟祥瑞……难得一见的命格。有你镇守此地，或许是荒古镇的福气。"',
            'xuan_wu':'尘虚子点头："玄武镇世，不动如山。好，荒古镇最需要的就是一个稳得住的人。"',
            'zhu_que':'尘虚子挑眉："朱雀焚天？你这命格……怕是走到哪里都少不了麻烦。不过边荒正好缺点热闹。"',
            'bai_hu':'尘虚子神色微动："白虎噬魂……杀伐之命。我见过一个和你同样命格的人——他是第七任镇守者。"'
        };
        var destKey=G.player.destiny||'zi_wei';
        var extraLine=destinyTexts[destKey]||destinyTexts['zi_wei'];
        if(extraLine){div();hl('尘虚子多看了你一眼：');t(extraLine);}
    }
    if(ch.rewards){var rs=[];for(var rk in ch.rewards){if(G.player[rk]!==undefined){G.player[rk]+=ch.rewards[rk];var nm=RESOURCES[rk]?RESOURCES[rk].name:rk;rs.push(nm+'+'+ch.rewards[rk]);}}if(rs.length)he('[ 奖励 ] '+rs.join('，'));}
    G.story.chapter++;if(!G.story.completed_chapters)G.story.completed_chapters=[];G.story.completed_chapters.push(ch.title);
    // 设置剧情标志
    if(!G.story.flags)G.story.flags={};
    if(ch.title==='古战场之门')G.story.flags['visited_battlefield']=true;
    if(ch.title==='灵现之路')G.story.flags['heard_whisper']=true;
    if(ch.title==='选择的时刻')G.story.flags['made_choice']=true;
    // ★ 道心选择分支：第10章"选择的时刻"
    if(ch.title==='选择的时刻'){
        div();hl('[ 你的选择将影响你的道心 ]');
        btns([
            {text:'[ 心怀苍生，修补裂缝 ]',cb:function(){modifyDaoXin('ren',15);modifyDaoXin('yi',10);toast('仁+15,义+10','suc');advanceStory();},pri:true},
            {text:'[ 打破一切，重新开始 ]',cb:function(){modifyDaoXin('yu',15);modifyDaoXin('li',10);toast('欲+15,利+10','suc');advanceStory();},suc:true},
            {text:'[ 超然物外，冷眼旁观 ]',cb:function(){modifyDaoXin('kong',15);modifyDaoXin('yi',-5);toast('空+15,义-5','suc');advanceStory();},sm:true}
        ]);
        return;
    }
    saveGame();
    // 检查下一章是否可解锁，决定按钮显示
    var hasNext=G.story.chapter<all.length;
    var nextCond=hasNext?all[G.story.chapter].condition:null;
    var nextOk=true;
    if(nextCond){
        if(typeof nextCond==='string'){var plv=G.player.pathLevels[nextCond]||0;if(plv<5)nextOk=false;}
        else if(nextCond.minRealm!==undefined&&G.player.realm<nextCond.minRealm)nextOk=false;
    }
    div();
    if(nextOk)btns([{text:'[ 继续 ]',cb:renderMain,pri:true},{text:'[ 下一章 ]',cb:advanceStory}]);
    else btns([{text:'[ 继续 ]',cb:renderMain,pri:true},{text:'[ 下一章 锁定 ]',cb:function(){toast('条件未满足，提升修为后再来','dan');},dan:true}]);
}

// 修炼
function renderCultivate(){
    if(!G)return;clearStory();ac();var p=G.player;var isBreak=p.stage>=8;
    title('* 修炼 · 悟道之路');t('[ '+formatRealmFull()+' | 战力 '+calcCombatPower()+' ]');
    // 修炼路径引导
    hl('[ 修炼路径 ]');
    dim('1. 点击【修炼一次】积累道蕴');
    dim('2. 道蕴足够后点击【突破阶段】进阶（九转圆满）');
    if(isBreak)dim('3. 九转圆满后点击【尝试突破】渡天劫提升境界');
    else dim('3. 九转圆满后触发境界突破');
    div();
    var btnsList=[];
    if(isBreak){
        var hasEnough=p.dao_essence>=REALMS[p.realm].daoCost&&p.enlightenment>=1&&p.spirit_stones>=REALMS[p.realm].breakCost;
        hl('瓶颈已至');dim('道蕴 '+p.dao_essence+'/'+REALMS[p.realm].daoCost+' 悟道 '+p.enlightenment+' 灵石 '+p.spirit_stones+'/'+REALMS[p.realm].breakCost);
        dim('成功率 '+(REALMS[p.realm].breakRate*100).toFixed(0)+'%');
        btnsList.push({text:'[ 渡天劫 ]',cb:function(){doBreakthrough();},pri:true,dis:!hasEnough},{text:'[ 继续修炼 ]',cb:function(){doCultivateInner();renderCultivate();}});
    }else{
        t('道蕴 '+p.dao_essence+' / 需要 '+getDaoForStage(p.realm,p.stage+1)+' 突破阶段');
        // ★ 每次进入修炼页时检查道号
        var rtitles=checkDaoTitles();for(var rti=0;rti<rtitles.length;rti++){hl('[ 道号 ] ★ 获封尊号【'+rtitles[rti].name+'】');}
        btnsList.push({text:'[ 修炼一次 ]',cb:function(){doCultivateInner();renderCultivate();},pri:true});
        btnsList.push({text:'[ 冲关 ]',cb:function(){var r=tryBreakthrough();if(r.success){he('[ '+r.realmName+' 第'+['一','二','三','四','五','六','七','八','九'][G.player.stage-1]+'转达成 ]');toast('冲关','suc');// ★ 突破后检查道号
            var btitles=checkDaoTitles();for(var bti=0;bti<btitles.length;bti++){hl('[ 道号 ] ★ 获封尊号【'+btitles[bti].name+'】');}}else dang(r.reason);renderCultivate();},suc:true});
        // 三条道路入口
        div();hl('[ 三条修行大道 ]');dim('选择你的修炼方向：霸道(战斗)/王道(建设)/天道(探索)');
        for(var pk in CULTIVATION_PATHS){var cp=CULTIVATION_PATHS[pk];var plv=G.player.pathLevels[pk]||0;btnsList.push({text:cp.icon+' '+cp.name+' Lv.'+plv,cb:function(id){return function(){showPathDetail(id);};}(pk),sm:true});}
        // 演武
        btnsList.push({text:'[ 演武切磋 ]',cb:function(){showPracticeBattle();},sm:true});
        if(p.realm>=2){btnsList.push({text:autoCult?'[ 停止自动 ]':'[ 自动修炼 ]',cb:function(){autoCult=!autoCult;if(autoCult){autoCultInterval=setInterval(doCultivateInner,2000);toast('自动修炼启动','suc');}else{clearInterval(autoCultInterval);autoCultInterval=null;toast('自动修炼停止','');}renderCultivate();},sm:true});}
    }
    btns(btnsList);
}

// 演武切磋（主动战斗）
function showPracticeBattle(){
    clearStory();title('* 演武场');
    var p=G.player;var pp=calcPlayerPower();
    t('你站在演武场中央，等待对手...');
    var dummy={name:'演武傀儡',power:Math.floor(pp.power*0.8),atk:Math.floor(pp.atk*0.7),def:Math.floor(pp.def*0.7),maxHp:Math.floor(pp.hp*0.8)};
    t('一具同阶演武傀儡缓缓升起，战力约'+dummy.power+'。');
    div();hl('[ 选择招式 ]');
    var skillActs=[];
    for(var sk in BATTLE_SKILLS){
        var s=BATTLE_SKILLS[sk];
        (function(skillId){skillActs.push({text:'[ '+s.name+' ]',cb:function(){
            if(s.cost>0&&G.player.spirit<s.cost){toast('灵力不足','dan');return;}
            doPracticeBattle(dummy,skillId);
        },sm:true});})(sk);
    }
    btns(skillActs);
}
function doPracticeBattle(dummy,skillId){
    clearStory();title('* 演武');
    var result=doBattle(dummy,skillId);
    div();hl(result.win?'[ 胜 ]':'[ 负 ]');
    var logs=result.log;for(var li=0;li<logs.length&&li<8;li++)dim(logs[li].text);
    if(result.win){
        var daoGain=Math.floor(5+G.player.realm*3+Math.random()*5);
        var stoneGain=Math.floor(3+G.player.realm*2);
        G.player.dao_essence+=daoGain;
        G.player.spirit_stones+=stoneGain;
        he('演武感悟：道蕴 +'+daoGain+' | 灵石 +'+stoneGain);
        var baEff3=getPathEffects('ba_dao');
        if(baEff3.battleEnlightenChance>0&&Math.random()<baEff3.battleEnlightenChance){
            G.player.enlightenment=(G.player.enlightenment||0)+1;
            he('✦ 以战悟道：悟道点 +1');
        }
    }else{
        dang('你被击倒在地...');
        var daoGain2=Math.floor(1+Math.random()*3);
        G.player.dao_essence+=daoGain2;
        he('虽败犹悟：道蕴 +'+daoGain2);
    }
    div();btns([{text:'[ 再战 ]',cb:function(){showPracticeBattle();},pri:true},{text:'[ 返回修炼 ]',cb:renderCultivate}]);
}

// 三条道路详情
function showPathDetail(pathId){
    clearStory();var cp=CULTIVATION_PATHS[pathId];if(!cp)return;
    title(cp.icon+' '+cp.name+' 修行路');dim(cp.desc);
    var lv=G.player.pathLevels[pathId]||0;
    t('当前等级：Lv.'+lv+'/5');
    var acts=[];
    for(var si=0;si<cp.skills.length;si++){
        var sk=cp.skills[si];
        var canLearn=checkPathSkill(pathId,sk.id);
        var hasLearned=lv>=sk.level;
        if(hasLearned){hl('✓ '+sk.name+' Lv.'+sk.level+' ——'+sk.desc);}
        else if(canLearn){info('可解锁：'+sk.name+' Lv.'+sk.level+' ——'+sk.desc);acts.push({text:'[ 领悟 '+sk.name+' ]',cb:function(pid,sid){return function(){var r=learnPathSkill(pid,sid);if(r.success){toast('领悟'+r.skillName,'suc');he('[ '+r.pathName+' ] 领悟 '+r.skillName);}else{toast(r.reason,'dan');dang(r.reason);}showPathDetail(pid);};}(pathId,sk.id),sm:true});}
        else{dim('✗ '+sk.name+' Lv.'+sk.level+' ——条件未达成');}
    }
    // ★ 天道路径专属：碎片镶嵌（规则镶嵌Lv.4+）
    if(pathId==='tian_dao'&&lv>=4){
        div();hl('[ 规则镶嵌 ]');
        var ownedFrags=G.player.fragments||[];
        var equipped=G.player.equippedFragments||[];
        var maxSlots=lv>=4?2:1;
        if(ownedFrags.length===0){dim('尚未收集到任何天道碎片');}
        else{
            t('已镶嵌 '+equipped.length+'/'+maxSlots+' 槽位');
            for(var fi=0;fi<ownedFrags.length;fi++){
                var fid=ownedFrags[fi];
                var fData=null;for(var di=0;di<HEAVEN_FRAGMENTS.length;di++)if(HEAVEN_FRAGMENTS[di].id===fid){fData=HEAVEN_FRAGMENTS[di];break;}
                if(!fData)continue;
                var isEq=equipped.indexOf(fid)>=0;
                var fLabel='【'+fData.name+'】'+fData.desc+(isEq?' ★已镶嵌':'');
                if(isEq){hl(fLabel);}
                else if(equipped.length<maxSlots){
                    info(fLabel);
                    acts.push({text:'[ 镶嵌 '+fData.name+' ]',cb:function(fid2){return function(){if(!G.player.equippedFragments)G.player.equippedFragments=[];G.player.equippedFragments.push(fid2);toast('已镶嵌 '+fData.name,'suc');showPathDetail('tian_dao');};}(fid),sm:true});
                }else{dim(fLabel+' (槽位已满)');}
            }
            if(equipped.length>0){acts.push({text:'[ 卸下全部碎片 ]',cb:function(){G.player.equippedFragments=[];toast('已卸下全部碎片','');showPathDetail('tian_dao');},dan:true});}
        }
    }    acts.push({text:'[ 返回修炼 ]',cb:renderCultivate});
    btns(acts);
}
function doCultivateInner(){
    // 调用引擎层doCultivate而非直接操作数据
    var output=null;
    if(typeof doCultivate==='function')output=doCultivate();
    if(!output)output=calcCultivationOutput();
    if(output){
        G.player.dao_essence+=output.dao_essence;
        if(output.enlightenment)G.player.enlightenment+=output.enlightenment;
    }
    // ★ 只在修炼界面显示提示文本，其他界面仅刷新资源
    if(typeof curTab!=='undefined'&&curTab==='cultivate'){
        if(output&&output.fusion){hl('✦ 天人合一！修炼效果×10！');
        }else{var msgs=['盘膝凝神，引气入体。','气行周天，道蕴渐生。','灵气如细流汇入丹田。','天地道韵微震。'];dim(msgs[Math.floor(Math.random()*msgs.length)]);}
        he('道蕴 +'+(output?output.dao_essence:0)+(output&&output.enlightenment?' 悟道点 +'+output.enlightenment:''));
    }
    G.player._cultivateCount=(G.player._cultivateCount||0)+1;
    if(G.player._cultivateCount%5===0)saveGame();
    renderRes();
}
function doBreakthrough(){
    // 防重入锁
    if(G.player._breakingThrough)return;G.player._breakingThrough=true;
    var r=tryBreakthrough();
    G.player._breakingThrough=false;
    if(r.success&&r.realmUp){
        clearStory();title('* 渡天劫 · 破境');scBig('* '+r.newRealmName+' *');
        if(r.tribText){hl('⚡ '+r.tribText);}
        t('天地变色！你承受住了天劫的洗礼，经脉重塑，踏入全新境界。');
        if(r.pillUsed)dim('（'+r.pillUsed+'帮你抵挡了部分反噬。）');
        // ★ 关联4：道号突破特效（荒级道号触发天劫异象）
        var eqTitle=getEquippedTitle();
        if(eqTitle&&eqTitle.rarity>=5){hl('✦ 佩戴荒级道号「'+eqTitle.name+'」，天地共鸣！额外悟道点+1！');G.player.enlightenment=(G.player.enlightenment||0)+1;}
        if(G.player._breakPillage){hl('✦ 霸道·破境掠夺 从「'+G.player._breakPillageName+'」处掠夺道蕴 +'+G.player._breakPillage);G.player._breakPillage=null;G.player._breakPillageName='';}
        toast('* 渡劫成功！踏入'+r.newRealmName+' *','suc');btns([{text:'[ 继续 ]',cb:renderMain,pri:true}]);saveGame();
    }
    else{dang(r.reason||'渡劫失败');toast('渡劫失败','dan');renderCultivate();}
}

// 城镇(仅保留核心函数，避免过长)
function renderTown(){
    clearStory();ac();
    var thLv=getBuildingLevel('town_hall');
    var maxPop3=getBuildingEffect('town_hall','populationCap')||999999;
    var popCapStr=maxPop3<999999?'/上限'+maxPop3:'';
    title('* 荒古镇 · 边陲要塞');t('人口 '+G.town.population+popCapStr+' | 繁荣 '+G.town.prosperity.toFixed(0)+' | 安全 '+G.town.security.toFixed(0));updateTownMetrics();
    dim('升级建筑获取被动产出，提升城镇实力');
    // 人口增加说明
    var maxPop=getBuildingEffect('town_hall','populationCap')||999999;
    var popLabel=maxPop<999999?'人口上限 '+maxPop:'人口无上限';
    dim('[ 人口 ] 随时间自动增长。提升镇道殿可增加上限（当前 '+popLabel+'）。');
    dim('[ 繁荣 ] 建筑等级和人口决定，市场可加速增长。');
    dim('[ 安全 ] 护山大阵提供安全保障，低安全度影响发展。');
    // ★ 人道劫检查
    var wdEff=getPathEffects('wang_dao');
    if(wdEff.tribulation>0&&G.town.prosperity>=50&&!G.player.tribulationsPassed)G.player.tribulationsPassed=1;
    if(wdEff.tribulation>=2&&G.town.prosperity>=100&&G.player.tribulationsPassed<2)G.player.tribulationsPassed=2;
    if(G.player.tribulationsPassed===1&&!G._tribShown1){G._tribShown1=true;hl('✦ 人道劫·一 已渡！全属性+20%');dim('繁荣度达到50时触发，你的王道之道已显现。');}
    if(G.player.tribulationsPassed===2&&!G._tribShown2){G._tribShown2=true;hl('✦ 人道劫·二 已渡！城镇产出翻倍！');dim('繁荣度达到100时触发，万民归心，百业俱兴。');}
    for(var a=0;a<BUILDINGS.length;a++){var b=BUILDINGS[a];var lv=getBuildingLevel(b.id);var cost=getUpgradeCost(b.id);var check=canUpgradeBuilding(b.id);var line=b.name;if(lv>0)line+=' Lv.'+lv+'/'+b.maxLevel;else line+=' [未建]';t(line);if(cost&&check.can){var cs=[];for(var ck in cost){var rn=RESOURCES[ck]?RESOURCES[ck].name:ck;cs.push(rn+':'+cost[ck]);}info('升级需：'+cs.join(' '));}else if(cost)dim(check.reason);}
    btns([{text:'[ 升级建筑 ]',cb:function(){showBuildMenu();},pri:true},{text:'[ 总收入 ]',cb:function(){showTownDetail();},sm:true},{text:'[ 矿坑 ]',cb:function(){showMining();},sm:true},{text:'[ 返回主页 ]',cb:renderMain}]);
}
function showBuildMenu(){
    clearStory();title('* 选择升级');var list=[];
    for(var a=0;a<BUILDINGS.length;a++){var b=BUILDINGS[a];var lv=getBuildingLevel(b.id);var check=canUpgradeBuilding(b.id);if(check.can){var cost=getUpgradeCost(b.id);var cs=[];for(var ck in cost){var rn=RESOURCES[ck]?RESOURCES[ck].name:ck;cs.push(rn+':'+cost[ck]);}info(b.name+' Lv.'+lv+' -> '+(lv+1)+' 需：'+cs.join(' '));list.push({text:'[ '+b.name+' 升级 ]',cb:function(id){return function(){doUpgradeFn(id);};}(b.id)});}else dim(b.name+' Lv.'+lv+' '+check.reason);}
    list.push({text:'[ 返回 ]',cb:renderTown});btns(list);
}
function doUpgradeFn(id){var r=upgradeBuilding(id);if(r.success){toast(r.buildingName+' Lv.'+r.newLevel,'suc');he('[ '+r.buildingName+' Lv.'+r.newLevel+' ]');updateTownMetrics();saveGame();}else{toast(r.reason,'dan');dang(r.reason);}renderRes();setTimeout(showBuildMenu,400);}
function showTownDetail(){
    clearStory();title('* 城镇产出');
    var effectLabels={
        stones_per_min:'灵石/分',spirit_per_min:'灵力/分',herbs_per_min:'药材/分',tax_income:'税收/分',
        daoBonus:'修炼加成',breakResearch:'突破研究',tradeBonus:'贸易加成',pillEfficiency:'炼丹效率',
        herbConversion:'药材转化',forgeEfficiency:'锻造效率',oreConversion:'矿石转化',combatBonus:'战力加成',
        maxVitalityBonus:'气血上限',populationCap:'人口上限',taxRate:'税率',maxBuildings:'建筑上限',
        recruitRate:'招募率',maxPopulation:'最大人口',defense:'防御',securityBonus:'安全加成',
        popIncome:'人口收入'
    };
    var vLv=getBuildingLevel('spirit_vein');if(vLv>0){var e=BUILDINGS[1].effects(vLv);t('灵脉阵 Lv.'+vLv+'：灵石 +'+e.stones_per_min.toFixed(1)+'/分 灵力 +'+e.spirit_per_min.toFixed(1)+'/分');}else t('灵脉阵：未建');
    var fLv=getBuildingLevel('spirit_field');if(fLv>0){var e=BUILDINGS[6].effects(fLv);t('灵田 Lv.'+fLv+'：药材 +'+e.herbs_per_min.toFixed(2)+'/分');}else t('灵田：未建');
    var mLv=getBuildingLevel('market');if(mLv>0){var e=BUILDINGS[2].effects(mLv);t('坊市 Lv.'+mLv+'：税收 +'+e.tax_income.toFixed(1)+'灵石/分');}else t('坊市：未建');
    var maxPop2=getBuildingEffect('town_hall','populationCap')||999999;var popCapText=maxPop2<999999?'/'+maxPop2:'';t('人口：'+G.town.population+popCapText);
    if(G.town.security<30)dang('[ 警示 ] 安全度偏低');if(G.town.prosperity<20)dim('[ 提示 ] 繁荣度不足');
    div();dim('全部建筑收益：');
    for(var a=0;a<BUILDINGS.length;a++){var b=BUILDINGS[a];var lv=getBuildingLevel(b.id);if(lv>0){var e=b.effects(lv);var ef=[];for(var ek in e){if(typeof e[ek]==='number'){var label=effectLabels[ek]||ek;ef.push(label+':'+e[ek].toFixed(2));}}if(ef.length)info(b.name+' Lv.'+lv+' '+ef.join(' | '));}}
    btns([{text:'[ 返回 ]',cb:renderTown}]);
}

// 挖矿界面
function showMining(){
    clearStory();title('* 废弃矿坑');
    var mlv = Math.floor(G.stats.miningLevel || 1);
    dim('镇东废弃的灵铁矿坑。挥动镐头，挖掘深埋的矿石与灵石。');
    info('当前挖矿等级：Lv.'+mlv+' | 灵力消耗：'+(5+G.player.realm*2));
    div();
    
    // 快速挖矿
    btns([{text:'[ 挥镐挖掘 ]',cb:function(){
        var r=doMining();
        if(!r.success){toast(r.reason,'dan');return;}
        var msg='获得 矿石 +'+r.ores;
        if(r.stones>0)msg+='、灵石 +'+r.stones;
        if(r.beast>0)msg+='、妖材 +'+r.beast;
        he(msg);
        if(r.event){hl('✦ '+r.event.text);}
        renderRes();
        // 自动刷新界面
        setTimeout(showMining,500);
    },pri:true},{text:'[ 返回城镇 ]',cb:renderTown}]);
}

// 探索
function renderExplore(){
    clearStory();ac();
    if(G&&G.exploration&&G.exploration.currentExpedition){showExpWait();return;}
    title('* 探索 · 未知之地');dim('选择区域，消耗灵力踏入未知。每个区域分不同难度，风险越高回报越大。');
    var list=[];
    for(var a=0;a<EXPLORE_AREAS.length;a++){
        var area=EXPLORE_AREAS[a];var areaInfo=G.exploration.areas[area.id];var dis=areaInfo?areaInfo.discovered:false;var can=G.player.realm>=area.minRealm;
        t(area.name+(dis?' ['+(areaInfo?areaInfo.exploredCount:0)+'次]':' [未发现]'));
        dim(area.desc);if(can)list.push({text:'[ '+area.name+' ]',cb:function(id){return function(){showExpDiff(id);};}(area.id)});else dim('需 '+area.minRealmName);
    }
    list.push({text:'[ 返回 ]',cb:renderMain});btns(list);
}
function showExpDiff(areaId){
    var area;for(var a=0;a<EXPLORE_AREAS.length;a++)if(EXPLORE_AREAS[a].id===areaId){area=EXPLORE_AREAS[a];break;}
    clearStory();title('* '+area.name);
    var list=[];
    for(var a=0;a<area.difficulties.length;a++){
        var d=area.difficulties[a];var sc=d.time*3;var ok=G.player.spirit>=sc;
        info('['+d.name+'] '+d.desc+' 风险'+(d.risk*100).toFixed(0)+'% 灵力'+sc);
        list.push({text:'[ 出发 '+d.name+' ]',cb:function(id,di){return function(){startExp(id,di);};}(areaId,a),dis:!ok});
    }
    list.push({text:'[ 返回 ]',cb:renderExplore});btns(list);
}
function startExp(areaId,diff){
    var r=startExpedition(areaId,diff);if(!r.success){toast(r.reason,'dan');return;}
    clearStory();title('* '+r.area.name+' '+r.difficulty.name);hl('你踏入了'+r.area.name+'的'+r.difficulty.name+'。');
    expWaiting=true;
    processNextExpStep();
}
function processNextExpStep(){
    if(!expWaiting||!G||!G.exploration||!G.exploration.currentExpedition){expWaiting=false;return;}
    var step=processExpeditionStep();
    if(!step){expWaiting=false;return;}
    hl(step.name);t(step.desc||'');
    // 特殊处理trap负收益
    if(step.rewards){
        var rKeys=Object.keys(step.rewards);
        if(rKeys.length>0){
            var rs=[];
            for(var ri=0;ri<rKeys.length;ri++){
                var rk=rKeys[ri];
                var rv=step.rewards[rk];
                var rn=RESOURCES[rk]?RESOURCES[rk].name:rk;
                if(rv<0){dang(rn+' '+rv);}
                else{rs.push(rn+'+'+rv);}
            }
            if(rs.length>0)he(rs.join(', '));
        }
    }
    renderRes();
    if(isExpeditionComplete()){
        expWaiting=false;
        finishExp();
    }else{
        div();
        btns([{text:'[ 继续深入 ]',cb:function(){processNextExpStep();},pri:true},{text:'[ 撤退 ]',cb:function(){abortExpedition();expWaiting=false;renderExplore();},dan:true}]);
    }
}
function showExpWait(){var exp=G.exploration.currentExpedition;var area;for(var a=0;a<EXPLORE_AREAS.length;a++)if(EXPLORE_AREAS[a].id===exp.areaId){area=EXPLORE_AREAS[a];break;}title('* 探索中');t(area.name+' '+exp.currentStep+'/'+exp.steps);btns([{text:'[ 放弃 ]',cb:function(){abortExpedition();expWaiting=false;renderExplore();},dan:true}]);}
function finishExp(){
    var r=finishExpedition();if(!r)return;G.stats.expeditions++;var area;for(var a=0;a<EXPLORE_AREAS.length;a++)if(EXPLORE_AREAS[a].id===r.areaId){area=EXPLORE_AREAS[a];break;}
    title('* 探索归来');hl('从'+area.name+'归来。');
    if(r.loot&&Object.keys(r.loot).length>0){hl('[ 收获 ]');for(var rk in r.loot){var rn=RESOURCES[rk]?RESOURCES[rk].name:rk;he(rn+' +'+r.loot[rk]);}}
    btns([{text:'[ 继续探索 ]',cb:renderExplore,pri:true},{text:'[ 返回 ]',cb:renderMain}]);toast('探索归来','suc');saveGame();
}

// 坊市
function renderMarket(){
    clearStory();ac();
    if(getBuildingLevel('market')<=0){title('* 坊市');t('需要先建设坊市。');btns([{text:'[ 去城镇 ]',cb:function(){switchTab('town');}}]);return;}
    title('* 坊市 · 交易枢纽');dim('坊市 Lv.'+getBuildingLevel('market')+' | 每日行情波动，低买高卖赚取差价');
    var prices=getMarketPrices();var list=[];
    for(var item in prices){var ri=RESOURCES[item];var qty=G.player[item]||0;info(ri.name+' 买'+prices[item].buy+' 卖'+prices[item].sell+' 库存'+qty);list.push({text:'[ 买'+ri.name+' ]',cb:function(i){return function(){showBuy(i);};}(item),sm:true},{text:'[ 卖'+ri.name+' ]',cb:function(i){return function(){showSell(i);};}(item),sm:true,dis:qty<=0});}
    if(getBuildingLevel('pill_room')>0)list.push({text:'[ 炼丹 ]',cb:function(){showPillList();},pri:true});
    if(getBuildingLevel('forge')>0)list.push({text:'[ 锻造 ]',cb:function(){showForgeList();},suc:true});
    // 招募流民
    if(getBuildingLevel('market')>0){
        var recruitCost=50+G.town.population*2;
        var canRecruit=G.player.spirit_stones>=recruitCost;
        list.push({text:'[ 招募流民 '+recruitCost+'灵石 ]',cb:function(){if(!canRecruit){toast('灵石不足','dan');return;}G.player.spirit_stones-=recruitCost;G.town.population+=Math.floor(1+Math.random()*3);toast('人口增加','suc');renderMarket();renderRes();},sm:true,dis:!canRecruit});
    }
    list.push({text:'[ 返回 ]',cb:renderMain});btns(list);
}
function showBuy(item){
    var p=getMarketPrices()[item];if(!p)return;var ri=RESOURCES[item];clearStory();title('* 买入'+ri.name);t('单价 '+p.buy+' 灵石 / 现有 '+G.player.spirit_stones+' 灵石');
    var max=Math.floor(G.player.spirit_stones/p.buy);var qtys=[1,5,10,50,Math.min(max,100)].filter(function(q){return q<=max&&q>0;});var acts=qtys.map(function(q){return{text:'x'+q+' ('+(q*p.buy)+'灵石)',cb:function(){var r=buyItem(item,q);if(r.success){toast('购入'+ri.name+'x'+q,'suc');he('购入'+ri.name+'x'+q);}else toast(r.reason,'dan');renderRes();setTimeout(function(){showBuy(item);},500);}};});
    acts.push({text:'[ 返回 ]',cb:renderMarket});btns(acts);
}
function showSell(item){
    var p=getMarketPrices()[item];if(!p)return;var ri=RESOURCES[item];var qty=G.player[item]||0;clearStory();title('* 卖出'+ri.name);t('单价 '+p.sell+' 灵石 / 库存 '+qty);
    var qtys=[1,5,10,qty].filter(function(q){return q<=qty&&q>0;});var acts=qtys.map(function(q){return{text:'x'+q+' ('+(q*p.sell)+'灵石)',cb:function(){var r=sellItem(item,q);if(r.success){toast('售出'+ri.name+'x'+q,'suc');he('售出'+ri.name+'x'+q+' +'+r.income+'灵石');}else toast(r.reason,'dan');renderRes();setTimeout(function(){showSell(item);},500);}};});
    acts.push({text:'[ 返回 ]',cb:renderMarket});btns(acts);
}
function showPillList(){clearStory();title('* 炼丹');var acts=[];for(var id in PILLS){var pill=PILLS[id];var can=G.player.realm>=pill.minRealm;info(pill.name+'[库存'+(G.inventory[id]||0)+']');dim(pill.desc);if(can)acts.push({text:'[ 炼'+pill.name+' ]',cb:function(i){return function(){doCraft(i);};}(id),sm:true});else dim('需'+REALMS[pill.minRealm].name);}acts.push({text:'[ 返回 ]',cb:renderMarket});btns(acts);}
function doCraft(id){var r=craftPill(id,1);if(r.success){toast('炼制'+r.pill+'x'+r.qty,'suc');he('炼制'+r.pill+'x'+r.qty);G.stats.pillsCrafted=(G.stats.pillsCrafted||0)+1;saveGame();}else toast(r.reason,'dan');renderRes();setTimeout(showPillList,400);}
function showForgeList(){clearStory();title('* 锻造');var acts=[];for(var id in ARTIFACTS){var art=ARTIFACTS[id];var slotName={weapon:'兵器',armor:'衣甲',accessory:'饰品'}[art.type];var can=G.player.realm>=art.minRealm;info(art.name+' ['+art.tier+' '+slotName+']');dim(art.desc);if(can){var cs=[];for(var ck in art.cost){var rn=RESOURCES[ck]?RESOURCES[ck].name:ck;cs.push(rn+':'+art.cost[ck]);}info('材料：'+cs.join(' '));acts.push({text:'[ 锻造'+art.name+' ]',cb:function(i){return function(){doForge(i);};}(id),sm:true});}}acts.push({text:'[ 返回 ]',cb:renderMarket});btns(acts);}
function doForge(id){var r=forgeArtifact(id);if(r.success){toast('锻造'+r.name+'成功','suc');he('锻造成功！'+r.name+' ['+r.tier+'] 已装备');saveGame();}else{toast(r.reason,'dan');dang(r.reason);}renderRes();setTimeout(showForgeList,400);}

// 背包
function renderInventory(){
    clearStory();ac();
    title('* 须弥袋 · 随身储物');dim('查看你的全部家当——资源、丹药、灵宝一览');hl('[ 资源 ]');
    var resItems=[['灵石',G.player.spirit_stones,'gold'],['道蕴',G.player.dao_essence,''],['悟道点',G.player.enlightenment,'gold'],['药材',G.player.herbs,'green'],['矿石',G.player.ores,''],['妖材',G.player.beast_materials,''],['功诀残页',G.player.technique_fragments,'blue'],['声望',G.player.rep,'gold']];
    for(var a=0;a<resItems.length;a++)t(resItems[a][0]+'：<span class="'+resItems[a][2]+'">'+resItems[a][1]+'</span>',true);
    div();hl('[ 丹药 ]');var hasPills=false;for(var id in PILLS){var q=G.inventory[id]||0;if(q>0){hasPills=true;info(PILLS[id].name+' x'+q);}}if(!hasPills)dim('空');
    div();hl('[ 混沌灵宝 ]');for(var s in {weapon:1,armor:1,accessory:1}){var aid=G.equipment[s];var aname=aid&&ARTIFACTS[aid]?ARTIFACTS[aid].name+'（'+ARTIFACTS[aid].tier+'）':'未装备';info({weapon:'兵器',armor:'衣甲',accessory:'饰品'}[s]+'：'+aname);}
    var hasInv=false;for(var id2 in G.inventory)if(G.inventory[id2]>0)hasInv=true;
    btns([{text:'[ 使用丹药 ]',cb:function(){showUsePills();},dis:!hasInv},{text:'[ 成就 ]',cb:function(){showAchievements();}},{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);
}
function showUsePills(){clearStory();title('* 使用丹药');var acts=[];for(var id in PILLS){var q=G.inventory[id]||0;if(q>0){info(PILLS[id].name+' x'+q);acts.push({text:'[ 使用'+PILLS[id].name+' ]',cb:function(i){return function(){var r=useItem(i);if(r.success){he('使用'+r.name+'：'+r.effects.join('，'));toast('使用'+r.name,'suc');}else toast(r.reason,'dan');renderRes();setTimeout(showUsePills,500);};}(id),sm:true});}}acts.push({text:'[ 返回 ]',cb:renderInventory});btns(acts);}
function showAchievements(){clearStory();title('* 成就');var c=0;for(var a=0;a<ACHIEVEMENTS.length;a++){var ach=ACHIEVEMENTS[a];var e=G&&G.achievements?G.achievements[ach.id]:false;if(e){c++;hl(ach.icon+' '+ach.name+' '+ach.desc);}else dim(ach.icon+' '+ach.name+'（?'+ach.desc+'）');}div();t('达成 '+c+'/'+ACHIEVEMENTS.length);btns([{text:'[ 返回 ]',cb:function(){closeMenu();switchTab('main');}}]);}
function showStoryLog(){closeMenu();clearStory();title('* 剧情回顾');var all=STORY_CHAPTERS.concat(STORY_CHAPTERS_MORE);var done=G&&G.story&&G.story.completed_chapters?G.story.completed_chapters:[];for(var a=0;a<all.length;a++){if(done.indexOf(all[a].title)>=0)hl('第'+(a+1)+'章 '+all[a].title+' [已完成]');else dim('第'+(a+1)+'章 '+all[a].title);}btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);}
function showHelp(){closeMenu();clearStory();title('* 游戏指引');t('《道韵洪荒镇道》文字RPG+城镇经营');t('[修炼] 提升境界，突破瓶颈。');t('[城镇] 建设建筑，获得被动产出。');t('[探索] 获取稀有资源，遭遇事件。');t('[坊市] 买卖物资，炼丹药锻造混沌灵宝。');t('[背包] 管理丹药混沌灵宝，查看成就。');dim('核心循环：修炼->探索->建设->修炼更强');btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);}
function showSettings(){if(!D||!D.storyInner)initDOM();if(D.splash&&D.splash.style.display!=='none')transitionToGame();clearStory();title('* 设置');t('版本 v1.0');btns([{text:'[ 返回启动 ]',cb:function(){D.splash.style.display='flex';D.splash.style.opacity='1';D.app.style.display='none';},dan:true}]);}

// 道号展示（可点击佩戴）
function showDaoTitles(){
    closeMenu();clearStory();title('* 万道图录 · 道号');
    // ★ 强制重新检查所有道号条件
    if(!G.titles)G.titles=[];
    var newTitles=checkDaoTitles();
    console.log('[道号] G.titles:', JSON.stringify(G.titles), '新增:', newTitles.length);
    var owned=G&&G.titles?G.titles:[];
    var rarityNames=['','凡','精','奇','绝','荒'];
    // 当前佩戴
    var eq=getEquippedTitle();
    if(eq){t('<div style="text-align:center;margin-bottom:10px;"><span style="font-size:14px;color:var(--dim)">当前佩戴：</span><br><span class="ti-name ti-rarity'+eq.rarity+(eq.effect!=='none'?' ti-effect-'+eq.effect:'')+'" style="font-size:22px;">【'+rarityNames[eq.rarity]+'】'+eq.name+'</span></div>',true);}
    div();
    // 生成操作列表
    var acts=[];
    for(var ti=0;ti<DAO_TITLES.length;ti++){
        var t=DAO_TITLES[ti];
        var has=owned.indexOf(t.id)>=0;
        var cls=has?'ti-name ti-rarity'+t.rarity:'';
        var eff=has&&t.effect!=='none'?' ti-effect-'+t.effect:'';
        var prefix=rarityNames[t.rarity]||'';
        if(has){
            var isEquipped=G.equippedTitle===t.id;
            var eqLabel=isEquipped?' ★佩戴中':'';
            var html='<div class="ti-display"><span class="'+cls+eff+'">【'+prefix+'】'+t.name+eqLabel+'</span><br><span style="font-size:12px;color:var(--dim)">'+t.desc+'</span></div>';
            t(html,true);
            if(!isEquipped)acts.push({text:'[ 佩戴 '+t.name+' ]',cb:function(id){return function(){var r=equipDaoTitle(id);if(r.success){toast('佩戴道号：'+r.name,'suc');showDaoTitles();}else toast(r.reason,'dan');};}(t.id),sm:true});
        }else{
            dim('【'+prefix+'】??? —— 条件未达成');
        }
    }
    if(G.equippedTitle)acts.push({text:'[ 卸下道号 ]',cb:function(){equipDaoTitle(null);toast('已卸下道号','');showDaoTitles();},dan:true});
    acts.push({text:'[ 返回 ]',cb:function(){switchTab('main');}});
    btns(acts);
}

// 排行榜展示
function showLeaderboard(){
    closeMenu();clearStory();
    var unlocked=getUnlockedLeaderboards();
    title('* 洪荒榜单');
    if(unlocked.length===0){dim('暂无可用榜单，提升修为解锁');btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);return;}
    // 显示已解锁榜单列表
    var list=[];
    for(var ui=0;ui<unlocked.length;ui++){
        var lb=unlocked[ui];
        info(lb.icon+' '+lb.name+'——'+lb.desc);
        list.push({text:'[ '+lb.name+' ]',cb:function(id){return function(){showSingleLeaderboard(id);};}(lb.id),sm:true});
    }
    list.push({text:'[ 返回 ]',cb:function(){switchTab('main');}});
    btns(list);
}
function showSingleLeaderboard(lbId){
    clearStory();
    var data=getPlayerRankData(lbId);
    if(!data){dang('数据错误');btns([{text:'[ 返回 ]',cb:showLeaderboard}]);return;}
    var lb=data.lb;
    t('<div class="lb-title">'+lb.icon+' '+lb.name+'</div>',true);
    t('<div class="lb-desc">'+lb.desc+'</div>',true);
    var ranks=data.ranks;
    for(var ri=0;ri<ranks.length&&ri<12;ri++){
        var r=ranks[ri];
        var rankNum=(ri+1)+'.';
        var rankCls='lb-row'+(r.isPlayer?' lb-player':'');
        var nTitle=r.title?' <span class="lb-npc-title">('+r.title+')</span>':'';
        var detailBtn=!r.isPlayer&&r.story?' <span class="lb-detail" onclick="showNPCDetail(\''+data.lb.id+'\',\''+r.name+'\')">[详情]</span>':'';
        var row='<div class="'+rankCls+'"><span class="lb-rank">'+rankNum+'</span><span class="lb-name">'+r.name+nTitle+detailBtn+'</span><span class="lb-val">'+r.val+'</span></div>';
        t(row,true);
    }
    if(data.playerRank>0){
        div();hl('你的排名：第'+data.playerRank+'名');
    }else{
        div();dim('你尚未上榜，努力修行吧');
    }
    btns([{text:'[ 返回榜单 ]',cb:showLeaderboard},{text:'[ 返回主页 ]',cb:function(){switchTab('main');}}]);
}

// NPC详情弹窗（通过onclick调用，参数为lbId和npc名字）
function showNPCDetail(lbId,npcName){
    closeMenu();clearStory();
    // 从排名数据中找NPC
    var data2=getPlayerRankData(lbId);
    if(!data2){dang('数据错误');btns([{text:'[ 返回 ]',cb:function(){showSingleLeaderboard(lbId);}}]);return;}
    var lb2=data2.lb;
    var npc2=null;
    for(var di=0;di<data2.ranks.length;di++)if(!data2.ranks[di].isPlayer&&data2.ranks[di].name===npcName){npc2=data2.ranks[di];break;}
    if(!npc2){dang('未找到该NPC');btns([{text:'[ 返回 ]',cb:function(){showSingleLeaderboard(lbId);}}]);return;}
    title(lb2.icon+' '+lb2.name+' · '+npc2.name);
    scBig('「'+npc2.title+'」');
    dim('修为：'+REALMS[Math.min(npc2.realm||0,REALMS.length-1)].name+' '+(npc2.stage?'第'+['一','二','三','四','五','六','七','八','九'][Math.min(npc2.stage||0,8)]+'转':'')+'');
    div();t(npc2.story||'暂无背景信息');
    // 敌对关系
    if(npc2.rivals&&npc2.rivals.length>0){
        div();hl('[ 江湖恩怨 ]');
        for(var ri=0;ri<npc2.rivals.length;ri++){
            info('⚔ 与 '+npc2.rivals[ri]+' 有过交手记录');
        }
    }
    // 随机生成互动记录
    div();hl('[ 近期动向 ]');
    var rumors=[
        '在迷雾森林深处闭关修炼',
        '与路过的散修切磋了一场',
        '在坊市收购了一批灵药',
        '前往古战场遗迹寻找机缘',
        '在镇口酒馆独饮了一夜',
        '拒绝了某势力的招揽',
        '发现了一处新的灵石矿脉',
        '在虚空中观察到异常的波动',
        '修为隐隐有了突破的迹象',
        '收到了一封来自天机阁的密信'
    ];
    var rIdx=Math.floor(Math.random()*rumors.length);
    dim('近期传闻：'+npc2.name+rumors[rIdx]);
    // ★ NPC道途烙印：根据玩家最高道路等级改变对话态度
    var maxPath='';var maxPLv=0;
    for(var pk in G.player.pathLevels){var plv=G.player.pathLevels[pk]||0;if(plv>maxPLv){maxPLv=plv;maxPath=pk;}}
    if(maxPLv>=3&&npc2.name){
        var pathReactions={
            '剑无痕':{ba_dao:'剑无痕冷冷地看着你："你身上的杀气很重。改天我们打一场。"',wang_dao:'剑无痕微微点头："你治理荒古镇有一套。"',tian_dao:'剑无痕若有所思："你身上的气息……你看到了那些线？"' },
            '铁骨':{ba_dao:'铁骨咧嘴一笑："你这股狠劲，我喜欢。"',wang_dao:'铁骨拱手："多谢你让荒古镇有了个样子。"',tian_dao:'铁骨挠头："你说的那些规则啥的我不懂。但你是个好人。"' }
        };
        var reactions=pathReactions[npc2.name];
        if(reactions){
            var reaction=reactions[maxPath]||'';
            if(reaction){div();hl('[ 道途烙印 ]');dim(reaction);}
        }
    }
    // 挑战按钮
    div();
    btns([
        {text:'[ ⚔ 挑战 '+npc2.name+' ]',cb:function(){
            var enemy2={name:npc2.name,title:npc2.title,power:npc2.val,atk:Math.floor(npc2.val*0.4),def:Math.floor(npc2.val*0.25),maxHp:Math.floor(npc2.val*0.3)};
            var br=doBattle(enemy2);
            clearStory();title('⚔ 挑战 '+npc2.name);
            hl(br.win?'[ 胜利！]':'[ 败北 ]');
            var logs2=br.log;for(var li2=0;li2<logs2.length&&li2<6;li2++)dim(logs2[li2].text);
            if(br.win){
                var daoGain3=Math.floor(10+npc2.val*0.01);
                G.player.dao_essence+=daoGain3;
                he('战胜强者：道蕴 +'+daoGain3);
                dim('名声在边荒流传...');
            }else{dang('你不是'+npc2.name+'的对手...');}
            btns([{text:'[ 返回榜单 ]',cb:function(){showSingleLeaderboard(lbId);}}]);
        },pri:true},
        {text:'[ 返回榜单 ]',cb:function(){showSingleLeaderboard(lbId);}}
    ]);
}

// 天道碎片展示
function showFragments(){
    closeMenu();clearStory();title('* 天道碎片 · 万界回响');
    var owned=G.player.fragments||[];
    t('已收集 '+owned.length+'/'+HEAVEN_FRAGMENTS.length+' 块天道碎片');
    div();
    for(var fi=0;fi<HEAVEN_FRAGMENTS.length;fi++){
        var f=HEAVEN_FRAGMENTS[fi];
        var has=owned.indexOf(f.id)>=0;
        if(has){hl('✦ '+f.name);dim(f.desc);var effNames={spd:'速度',cultivation:'修炼效率',hp:'气血上限',bag:'背包容量',atk_def:'攻防',enlighten:'悟道获取',breakRate:'突破成功率',void_resist:'归墟抗性',exploreBonus:'探索收益'};info('效果：'+(effNames[f.effect]||f.effect)+' +'+(f.bonus*100).toFixed(0)+'%');}
        else{
            var can=checkFragmentDiscovery(f.id);
            if(can){info('◇ '+f.name+' [可共鸣]');dim(f.desc);}
            else{dim('◇ ??? —— 条件未满足');}
        }
    }
    div();
    var eff=getFragmentEffects();
    if(Object.keys(eff).length>0){
        hl('[ 碎片效果 ]');
        var effLabels={spd:'速度',cultivation:'修炼效率',hp:'气血上限',bag:'背包容量',atk_def:'攻防',enlighten:'悟道获取',breakRate:'突破成功率',void_resist:'归墟抗性',exploreBonus:'探索收益'};
        for(var ek in eff){var eLabel=effLabels[ek]||ek;info(eLabel+'：x'+eff[ek].toFixed(2));}
    }
    // 检查新碎片
    var acts=[{text:'[ 共鸣碎片 ]',cb:function(){tryDiscoverFragment();},pri:true},{text:'[ 返回 ]',cb:function(){switchTab('main');}}];
    btns(acts);
}
function tryDiscoverFragment(){
    clearStory();title('* 天道共鸣');
    var found=[];var owned=G.player.fragments||[];
    for(var fi=0;fi<HEAVEN_FRAGMENTS.length;fi++){
        var f=HEAVEN_FRAGMENTS[fi];
        if(owned.indexOf(f.id)>=0)continue;
        if(checkFragmentDiscovery(f.id)){
            var r=discoverFragment(f.id);
            if(r.success)found.push(r.fragment);
        }
    }
    if(found.length>0){
        for(var fi2=0;fi2<found.length;fi2++){hl('✦ 共鸣成功！获得【'+found[fi2].name+'】');dim(found[fi2].desc);}
        btns([{text:'[ 继续 ]',cb:showFragments,pri:true}]);
    }else{
        dim('没有可共鸣的天道碎片。提升修为、探索新区域后再来。');
        btns([{text:'[ 返回 ]',cb:showFragments}]);
    }
}

// 天命命格展示
function showDestiny(){
    closeMenu();clearStory();title('* 天命命格');
    var destId=G.player.destiny;
    var dest=null;
    if(destId){for(var di=0;di<DESTINY_TYPES.length;di++)if(DESTINY_TYPES[di].id===destId){dest=DESTINY_TYPES[di];break;}}
    if(dest){
        scBig('「'+dest.name+'」');
        dim(dest.desc);
        hl('天赋效果：');
        t(dest.effect);
        // 显示道心倾向
        div();hl('[ 道心倾向 ]');
        var dx=G.player.daoXin;
        for(var ax in dx){
            var axData=DAO_XIN_AXES[ax];
            var barW=Math.floor((dx[ax]||50));
            var axName=axData?axData.name:ax;
            t('<span style="color:'+(axData?axData.color:'#aaa')+'">'+axName+'</span>：<div class="pb"><div class="pt"><div class="pf gold" style="width:'+barW+'%"></div></div><span class="ptxt">'+barW+'</span></div>',true);
        }
        var dom=getDominantDaoXin();
        if(dom&&DAO_XIN_AXES[dom]){dim('主导倾向：'+DAO_XIN_AXES[dom].name+'——'+DAO_XIN_AXES[dom].desc);}
    }else{
        dim('天命未定');
    }
    btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);
}

// 万道共鸣联动页面
function showResonance(){
    closeMenu();clearStory();title('* 万道共鸣');
    dim('命格、道心、碎片、道路——万道归一的修行全景');
    div();
    // 命格
    var destId=G.player.destiny;
    if(destId){for(var di=0;di<DESTINY_TYPES.length;di++)if(DESTINY_TYPES[di].id===destId){var dest2=DESTINY_TYPES[di];hl('[ 命格 ] '+dest2.name);dim(dest2.effect);break;}}
    div();
    // 道心
    hl('[ 道心倾向 ]');
    var dx2=G.player.daoXin;
    if(dx2){for(var ax2 in dx2){var axD=DAO_XIN_AXES[ax2];if(!axD)continue;info(axD.name+'：'+dx2[ax2]);}}
    var domAx=getDominantDaoXin();
    if(domAx&&DAO_XIN_AXES[domAx]){dim('主导：'+DAO_XIN_AXES[domAx].name+'——'+DAO_XIN_AXES[domAx].desc);}
    div();
    // 碎片
    var fragCount=(G.player.fragments||[]).length;
    hl('[ 天道碎片 ] '+fragCount+'/'+HEAVEN_FRAGMENTS.length);
    if(fragCount>0){var fragEf=getFragmentEffects();var fls=[];for(var fek in fragEf){var effLabels={spd:'速度',cultivation:'修练',hp:'气血',bag:'背包',atk_def:'攻防',enlighten:'悟道',breakRate:'突破',void_resist:'抗性'};fls.push((effLabels[fek]||fek)+' x'+fragEf[fek].toFixed(2));}if(fls.length)dim('激活效果：'+fls.join(' | '));}
    div();
    // 道路 + 命格加成
    hl('[ 修行大道 ]');
    for(var pk in CULTIVATION_PATHS){var cp2=CULTIVATION_PATHS[pk];var plv2=G.player.pathLevels[pk]||0;var pb=getDestinyPathBonus(pk);var bonusStr=pb.expMult!==1?'（命格加成：x'+pb.expMult.toFixed(2)+'）':'';info(cp2.icon+' '+cp2.name+' Lv.'+plv2+'/5 '+bonusStr);}
    var dxEff2=getDaoXinEffects();
    div();hl('[ 道心共鸣效果 ]');
    info('市场价格折扣：'+(dxEff2.priceDiscount*100).toFixed(0)+'%');
    info('掠夺效率加成：+'+( (dxEff2.pillageBonus-1)*100).toFixed(0)+'%');
    info('声望获取加成：+'+( (dxEff2.repBonus-1)*100).toFixed(0)+'%');
    info('灵石收入加成：+'+( (dxEff2.incomeBonus-1)*100).toFixed(0)+'%');
    info('修炼效率加成：+'+( (dxEff2.cultivationBonus-1)*100).toFixed(0)+'%');
    btns([{text:'[ 返回 ]',cb:function(){switchTab('main');}}]);
}

// 启动
function showNewGame(){
    if(!D||!D.storyInner)initDOM();
    // 从splash按钮点击进入时，先隐藏splash显示app
    if(D.splash&&D.splash.style.display!=='none') transitionToGame();
    clearStory();title('* 踏入洪荒');t('混沌初开，天道崩碎。你从虚空坠落。');t('写下你的名号：');
    var box=document.createElement('div');box.className='name-box';box.innerHTML='<input type="text" id="nameInput" placeholder="你的名号" maxlength="12">';D.actions.appendChild(box);
    var b=document.createElement('button');b.className='btn pri';b.textContent='[ 踏入洪荒 ]';
    b.onclick=function(){
        var inp=id('nameInput');var n=inp&&inp.value?inp.value.trim():'';
        if(n==='')n='无名散修';
        transitionToGame();
        setTimeout(function(){createNewGame(n);startAutoTick();startTutorial();toast('欢迎来到洪荒','suc');},400);
    };
    D.actions.appendChild(b);
}
function showLoadGame(){
    if(!D||!D.storyInner)initDOM();
    if(D.splash&&D.splash.style.display!=='none') transitionToGame();
    clearStory();title('* 读档');ac();var grid=document.createElement('div');grid.className='save-grid';
    for(var i=0;i<3;i++){var info=getSaveInfo(i);var card=document.createElement('div');card.className='save-card';
    if(info.exists){
        card.innerHTML='<div class="s-left"><div class="s-title">存档 '+(i+1)+'</div><div class="s-info">'+info.time+'</div></div><div class="s-actions"><button class="s-btn" onclick="doLoadGame('+i+')">读取</button><button id="delBtn'+i+'" class="s-btn del">删除</button></div>';
        (function(idx){setTimeout(function(){var btn=id("delBtn"+idx);if(btn)btn.onclick=function(){deleteSave(idx);showLoadGame();};},100);})(i);
    }else{
        card.innerHTML='<div class="s-left"><div class="s-title" style="color:var(--dim)">存档 '+(i+1)+'</div><div class="s-info" style="color:var(--dim)">空</div></div>';
    }
    grid.appendChild(card);}
    D.actions.appendChild(grid);
    // 判断是否有任意存档
    var anySave=false;for(var si=0;si<3;si++){var si2=getSaveInfo(si);if(si2.exists){anySave=true;break;}}
    if(!anySave){div();dim('尚无存档——请先点击「✦ 踏入洪荒」开始你的修行之路。');}
    btns([{text:'[ 新建游戏 ]',cb:showNewGame,pri:true},{text:'[ 快速读档 ]',cb:function(){doLoadGame(0);}}]);
}
function doLoadGame(slot){
    if(loadGame(slot)){
        transitionToGame();
        setTimeout(function(){
            checkDaoTitles(); // ★ 加载存档时立即检查道号
            var gains=processOfflineGains();startAutoTick();renderMain();
            if(gains&&gains.effectiveTime>0){
                var msgs=[];if(gains.spirit_stones)msgs.push('灵石+'+gains.spirit_stones);if(gains.herbs)msgs.push('药材+'+gains.herbs);
                if(gains.tax)msgs.push('税收+'+gains.tax);if(gains.cultivation&&gains.cultivation.dao_essence)msgs.push('道蕴+'+Math.floor(gains.cultivation.dao_essence));
                if(gains.populationGrowth)msgs.push('人口+'+gains.populationGrowth);
                if(msgs.length)hl('[ 离线 '+gains.offlineTime+'分钟 ] '+msgs.join('，'));
                // ★ 事件报告
                if(gains.events&&gains.events.length>0){
                    div();hl('[ 荒古镇见闻 ]');
                    for(var ei=0;ei<gains.events.length;ei++)dim('· '+gains.events[ei]);
                }
            }
            toast('读取成功','suc');
        },400);
    }else toast('读取失败','dan');
}

// 势力
function showFactions(){
    closeMenu();clearStory();title('* 势力');
    dim('好感度：数值越高，坊市中可获得更多优惠和特殊商品');
    for(var id in FACTIONS){var f=FACTIONS[id];var rep=getFactionRep(id);t(f.name+' [好感度 '+rep+']');dim(f.desc);}
    var available=checkFactionEvents();
    if(available.length>0){div();hl('[ 可触发的势力事件 ]');var acts=[];for(var a=0;a<available.length;a++){var ev=available[a];var fn=FACTIONS[ev.faction];info(ev.title+'【'+(fn?fn.name:'')+'】');acts.push({text:'[ '+ev.title+' ]',cb:function(i){return function(){doFactionEv(i);};}(a)});}acts.push({text:'[ 返回 ]',cb:renderMain});btns(acts);}
    else{div();dim('暂无新的势力事件。');btns([{text:'[ 返回 ]',cb:renderMain}]);}
}
function doFactionEv(idx){
    var ev=triggerFactionEvent(idx);if(!ev)return;
    clearStory();title('* '+ev.title);t(ev.text);div();hl(ev.responseText);
    if(ev.rewards){var rs=[];for(var rk in ev.rewards){var rn=RESOURCES[rk]?RESOURCES[rk].name:rk;rs.push(rn+'+'+ev.rewards[rk]);}he('[ 奖励 ] '+rs.join('，'));}
    btns([{text:'[ 继续 ]',cb:showFactions,pri:true}]);toast('势力事件完成','suc');
}

// 激励广告面板（TapTap试玩期间禁用）
function showAdPanel(){
    clearStory();title('* 激励·加速');
    dim('激励功能暂未开放。');
    div();btns([{text:'[ 返回 ]',cb:renderMain}]);
}

// 初始化
function initGame(){
    initDOM();
    // 不做自动showNewGame，让用户从splash按钮进入
    // 但保留存档检测：有存档时显示读档界面
    var hasAuto=hasSave(0);
    if(hasAuto){
        showLoadGameAuto();
    }
    // 尝试恢复探索定时器
    tryResumeExpedition();
    // 菜单绑定
    var menuActions={daotitles:function(){closeMenu();showDaoTitles();},resonance:function(){closeMenu();showResonance();},leaderboard:function(){closeMenu();showLeaderboard();},fragments:function(){closeMenu();showFragments();},destiny:function(){closeMenu();showDestiny();},achievements:function(){closeMenu();showAchievements();},factions:function(){closeMenu();showFactions();},storylog:function(){closeMenu();showStoryLog();},help:function(){closeMenu();showHelp();},save:saveCurrentGame,load:function(){closeMenu();showLoadGame();},settings:function(){closeMenu();showSettings();}};
    var menuItems=qa('#menuBody .menu-item[data-action]');
    for(var a=0;a<menuItems.length;a++){(function(el){var action=el.dataset.action;if(menuActions[action]){el.onclick=function(){try{menuActions[action]();}catch(ex){}};}})(menuItems[a]);}
    var mc=id('menuCloseBtn');if(mc)mc.onclick=closeMenu;
    var navs1=qa('.nav-item');
    for(var b=0;b<navs1.length;b++)navs1[b].onclick=function(){var tab=this.dataset.tab;switchTab(tab);};
}

// 自动显示读档界面（有存档时）
function showLoadGameAuto(){
    if(!D||!D.storyInner)initDOM();
    if(D.splash&&D.splash.style.display!=='none') transitionToGame();
    clearStory();title('* 读档');ac();
    var grid=document.createElement('div');grid.className='save-grid';
    for(var i=0;i<3;i++){var info=getSaveInfo(i);var card=document.createElement('div');card.className='save-card';
    if(info.exists){
        card.innerHTML='<div class="s-left"><div class="s-title">存档 '+(i+1)+'</div><div class="s-info">'+info.time+'</div></div><div class="s-actions"><button class="s-btn" onclick="doLoadGame('+i+')">读取</button><button id="delBtn'+i+'" class="s-btn del">删除</button></div>';
        (function(idx){setTimeout(function(){var btn=id("delBtn"+idx);if(btn)btn.onclick=function(){deleteSave(idx);showLoadGameAuto();};},100);})(i);
    }else{
        card.innerHTML='<div class="s-left"><div class="s-title" style="color:var(--dim)">存档 '+(i+1)+'</div><div class="s-info" style="color:var(--dim)">空</div></div>';
    }
    grid.appendChild(card);}
    D.actions.appendChild(grid);
    btns([{text:'[ 新建游戏 ]',cb:showNewGame,pri:true},{text:'[ 快速读档 ]',cb:function(){doLoadGame(0);}}]);
}

// 恢复探索定时器（页面刷新后自动续接）
function tryResumeExpedition(){
    if(!G||!G.exploration||!G.exploration.currentExpedition)return;
    var exp=G.exploration.currentExpedition;
    if(exp.currentStep<exp.steps&&!expInterval){
        expWaiting=true;
        expInterval=setInterval(function(){
            if(!expWaiting||!G||!G.exploration||!G.exploration.currentExpedition){
                clearInterval(expInterval);expInterval=null;return;
            }
            var step=processExpeditionStep();
            if(!step||!G.exploration.currentExpedition){clearInterval(expInterval);expInterval=null;return;}
            renderRes();
            if(isExpeditionComplete()){
                clearInterval(expInterval);expInterval=null;expWaiting=false;
                var r=finishExpedition();if(r)G.stats.expeditions++;
                toast('探索归来！','suc');
            }
        },1500);
    }
}

window.addEventListener('beforeunload',function(){if(G)saveGame();if(expInterval)clearInterval(expInterval);if(autoCultInterval)clearInterval(autoCultInterval);stopAutoTick();});
window.addEventListener('popstate',function(){if(stOpen){toggleStats();return}if(D.menuSheet&&D.menuSheet.style.display==='block'){closeMenu();return}if(curTab!=='main'){switchTab('main')}});
history.replaceState(null,'',location.href);
history.pushState(null,'',location.href);
