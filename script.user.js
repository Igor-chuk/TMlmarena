// ==UserScript==
// @name         Clear cookies for lmarena.ai (filtered)
// @namespace    http://tampermonkey.net/
// @version      2025-11-24
// @description  remove cookies (кроме служебных) и перезагрузить страницу
// @author       You
// @match        https://arena.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lmarena.ai
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Имена куков, которые можно игнорировать (пример — под себя допишешь)
    const IGNORE_COOKIES = [
        'cf_clearance',
        '__cf_bm'
        // сюда можешь добавить те, которые трогать не хочется
    ];

    function getVisibleCookies() {
        if (!document.cookie) return [];

        // Разбираем строку cookies в список объектов { name, value, raw }
        return document.cookie
            .split(';')
            .map(c => c.trim())
            .filter(Boolean)
            .map(raw => {
                const eqPos = raw.indexOf('=');
                const name = eqPos > -1 ? raw.substring(0, eqPos).trim() : raw.trim();
                const value = eqPos > -1 ? raw.substring(eqPos + 1) : '';
                return { name, value, raw };
            });
    }

    function filterCookies(cookies) {
        return cookies.filter(c => !IGNORE_COOKIES.includes(c.name));
    }

    const allCookies = getVisibleCookies();
    console.log('[TM cookies] Все куки:', allCookies);

    const targetCookies = filterCookies(allCookies);
    console.log('[TM cookies] Куки для удаления:', targetCookies);

    // Если куков для удаления нет — просто выходим, вообще без confirm
    if (targetCookies.length < 4) {
        console.log('[TM cookies] Нечего удалять — выходим без всплывашки');
        return;
    }

    if (!confirm(`Удалить ${targetCookies.length} куки для lmarena.ai?`)) {
        console.log('[TM cookies] Пользователь отменил удаление');
        return;
    }

    // Удаляем только те, которые в targetCookies
    targetCookies.forEach(({ name }) => {
        // root path
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

        // все уровни пути
        const paths = location.pathname.split('/');
        let currentPath = '';

        paths.forEach(p => {
            if (!p) return;
            currentPath += '/' + p;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${currentPath}`;
        });
    });

    console.log('[TM cookies] Удаление завершено, перезагружаю страницу');
    location.reload();
})();
