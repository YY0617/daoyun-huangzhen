// 道韵洪荒镇道 Service Worker v2 - 网络优先策略
var CACHE_NAME = 'htzd-v2';
var FILES_TO_CACHE = [
    'index.html',
    'manifest.json',
    'css/style.css',
    'js/data.js',
    'js/engine.js',
    'js/ui.js',
    'icons/icon-192.svg',
    'icons/icon-512.svg',
    'bg.png',
    '边框1.png',
    '边框2.png',
    '边框3.png'
];

// 安装时缓存核心文件
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(FILES_TO_CACHE);
        }).then(function() { return self.skipWaiting(); })
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
            );
        }).then(function() { return self.clients.claim(); })
    );
});

// 拦截请求：网络优先，缓存回退（保证总是拿到最新文件）
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(response) {
            // 成功响应就更新缓存
            if (response && response.status === 200) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
            }
            return response;
        }).catch(function() {
            // 离线时从缓存读取
            return caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                if (event.request.mode === 'navigate') return caches.match('index.html');
                return new Response('离线', { status: 503 });
            });
        })
    );
});
