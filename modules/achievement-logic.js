function parseMarkerFromMessage(text, markerRegexGlobal, rarityMeta, normalizeText) {
    if (!text) return null;
    const all = [...String(text).matchAll(markerRegexGlobal)];
    if (!all.length) return null;
    const match = all[all.length - 1];
    const emoji = normalizeText(match[1]);
    const title = normalizeText(match[2]);
    const description = normalizeText(match[3]);
    const rarity = normalizeText(match[4]).toLowerCase();
    if (!rarityMeta[rarity] || !title || !description) return null;
    return { emoji, title, description, rarity };
}

function getInjectState(interval, context) {
    const userMessages = Array.isArray(context?.chat) ? context.chat.filter((m) => m?.is_user).length : 0;
    const safeInterval = Math.max(0, Number(interval) || 0);

    if (safeInterval <= 0 || userMessages <= 0) {
        return { shouldInject: false, messagesTillInsertion: null };
    }
    if (safeInterval === 1) {
        return { shouldInject: true, messagesTillInsertion: 0 };
    }

    const messagesTillInsertion = userMessages >= safeInterval
        ? (userMessages % safeInterval)
        : (safeInterval - userMessages);
    return { shouldInject: messagesTillInsertion === 0, messagesTillInsertion };
}

function refreshInjectCounter(state, interval, uiText) {
    const el = document.getElementById('stsa_inject_counter');
    if (!el) return;
    const disabled = Number(interval) <= 0 || state.messagesTillInsertion === null;
    el.textContent = disabled
        ? uiText('inject_messages_disabled')
        : uiText('inject_messages_until', { count: state.messagesTillInsertion });
}

function normalizeCooldownSettings(settingsOrCooldown) {
    if (typeof settingsOrCooldown === 'object' && settingsOrCooldown) {
        const mode = String(settingsOrCooldown.cooldownMode || (settingsOrCooldown.useCooldown === false ? 'off' : 'fixed'));
        const fixed = Math.max(1, Number(settingsOrCooldown.cooldown) || 1);
        const rawMin = Math.max(1, Number(settingsOrCooldown.cooldownMin) || fixed);
        const rawMax = Math.max(1, Number(settingsOrCooldown.cooldownMax) || Math.max(rawMin, fixed));
        return {
            mode: ['off', 'fixed', 'floating'].includes(mode) ? mode : 'fixed',
            fixed,
            min: Math.min(rawMin, rawMax),
            max: Math.max(rawMin, rawMax),
        };
    }
    const fixed = Math.max(1, Number(settingsOrCooldown) || 1);
    return { mode: 'fixed', fixed, min: fixed, max: fixed };
}

function cooldownThreshold(settingsOrCooldown, seed, hashString) {
    const cfg = normalizeCooldownSettings(settingsOrCooldown);
    if (cfg.mode === 'off') return 0;
    if (cfg.mode !== 'floating' || cfg.min === cfg.max) return cfg.fixed;
    const span = cfg.max - cfg.min + 1;
    const hash = typeof hashString === 'function' ? parseInt(hashString(seed || 'cooldown'), 36) : 0;
    const offset = Number.isFinite(hash) ? Math.abs(hash) % span : 0;
    return cfg.min + offset;
}

function getAchievementCooldownInfo(cooldownInput, context, parseMarkerFromMessage, hashString) {
    const chat = Array.isArray(context?.chat) ? context.chat : [];
    const fallbackCooldown = cooldownThreshold(cooldownInput, 'initial', hashString);
    let lastAchievementMessageIndex = -1;
    let lastAchievementSeed = '';

    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        if (!message || message.is_user) continue;
        const parsed = parseMarkerFromMessage(message.mes);
        if (parsed) {
            lastAchievementMessageIndex = i;
            lastAchievementSeed = `${i}|${parsed.emoji}|${parsed.title}|${parsed.description}|${parsed.rarity}`;
            break;
        }
    }

    const cooldown = cooldownThreshold(cooldownInput, lastAchievementSeed || 'initial', hashString) || fallbackCooldown;

    if (lastAchievementMessageIndex < 0) {
        return {
            hasAchievement: false,
            cooldown,
            messagesSinceLast: null,
            remaining: 0,
        };
    }

    const messagesSinceLast = Math.max(0, (chat.length - 1) - lastAchievementMessageIndex);
    const remaining = Math.max(0, cooldown - messagesSinceLast);

    return {
        hasAchievement: true,
        cooldown,
        messagesSinceLast,
        remaining,
    };
}

function applyTemplateVars(template, vars) {
    let output = String(template || '');
    for (const [key, value] of Object.entries(vars || {})) {
        output = output.replaceAll(`{{${key}}}`, String(value));
    }
    return output;
}

function getDefaultNegativePromptForLocale(uiLang, defaultNegativePromptRu, defaultNegativePromptEn) {
    return uiLang === 'ru' ? defaultNegativePromptRu : defaultNegativePromptEn;
}

function buildScannedAchievements(context, settings, store, parseMarkerFromMessage, hashString) {
    const ignored = new Set(store.ignoredIds);
    const list = [];

    if (!Array.isArray(context?.chat)) return list;

    let lastGrantedMessageIndex = -99999;
    let lastGrantedSeed = '';
    const dedupe = new Set();

    for (let i = 0; i < context.chat.length; i++) {
        const message = context.chat[i];
        if (!message || message.is_user) continue;

        const parsed = parseMarkerFromMessage(message.mes);
        if (!parsed) continue;

        if (settings.enforceLocalCooldown && settings.useCooldown) {
            const diff = i - lastGrantedMessageIndex;
            const threshold = cooldownThreshold(settings, lastGrantedSeed || 'initial', hashString);
            if (diff < threshold) continue;
        }

        if (settings.dedupeByName) {
            const dedupeKey = `${parsed.title.toLowerCase()}|${parsed.description.toLowerCase()}`;
            if (dedupe.has(dedupeKey)) continue;
            dedupe.add(dedupeKey);
        }

        const sendDateTs = typeof message.send_date === 'string'
            ? Date.parse(message.send_date)
            : Number(message.send_date || 0);
        const genStartedTs = Number(message.gen_started || 0);
        let awardedAt = Number.isFinite(sendDateTs) && sendDateTs > 0
            ? sendDateTs
            : (Number.isFinite(genStartedTs) && genStartedTs > 0 ? genStartedTs : (i + 1));
        if (!Number.isFinite(awardedAt) || awardedAt <= 0) {
            awardedAt = i + 1;
        }
        const sig = `${parsed.emoji}|${parsed.title}|${parsed.description}|${parsed.rarity}`;
        const id = `msg_${i}_${hashString(`${sig}|${Math.trunc(awardedAt)}`)}`;
        if (ignored.has(id)) continue;

        list.push({
            id,
            source: 'chat',
            emoji: parsed.emoji || 'рџЏ†',
            title: parsed.title,
            description: parsed.description,
            rarity: parsed.rarity,
            messageIndex: i,
            awardedAt,
        });
        lastGrantedMessageIndex = i;
        lastGrantedSeed = id;
    }
    return list;
}

function hideAchievementMarkersInDOM(markerHideRegexGlobal) {
    const containers = document.querySelectorAll('.mes_text, .message_text');
    for (const container of containers) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const node of textNodes) {
            const original = node.nodeValue || '';
            if (!original.includes('[ACHIEVEMENT:')) continue;
            // Hide any ACHIEVEMENT marker from visible chat, even if it's malformed
            // or rejected by local cooldown/validation logic.
            const replaced = original
                .replace(markerHideRegexGlobal, '')
                .replace(/\n{3,}/g, '\n\n');
            if (replaced !== original) node.nodeValue = replaced;
        }
    }
}

export {
    parseMarkerFromMessage,
    getInjectState,
    refreshInjectCounter,
    getAchievementCooldownInfo,
    cooldownThreshold,
    applyTemplateVars,
    getDefaultNegativePromptForLocale,
    buildScannedAchievements,
    hideAchievementMarkersInDOM,
};

