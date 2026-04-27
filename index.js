import {
    eventSource,
    event_types,
    extension_prompt_types,
    extension_prompt_roles,
    setExtensionPrompt,
    saveSettingsDebounced,
} from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { getCurrentLocale } from '../../../i18n.js';

const MODULE_NAME = 'ST-silly-achievements';
const PROMPT_KEY = 'st_silly_achievements_prompt';
const META_KEY = 'st_silly_achievements';

const UI_TEXT = {
    ru: {
        achievement_unlocked: 'ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО',
        achievements_chat_title: 'Ачивки чата',
        close: 'Закрыть',
        delete: 'Удалить',
        delete_all: 'Удалить все',
        confirm_delete_all: 'Удалить все ачивки текущего чата?',
        empty_list: 'Пока пусто. Заслужи первую ачивку в этом чате.',
        total: 'Всего: {count}',
        achievements_count: '{count} ачивок',
        fab_open_title: 'Открыть ачивки текущего чата',
        fab_label: 'Ачивки',
        enable_extension: 'Включить расширение',
        cooldown_messages: 'Cooldown (сообщений)',
        inject_depth: 'Глубина инжекта',
        inject_role: 'Роль инжекта',
        inject_position: 'Позиция инжекта',
        inject_before_prompt: 'Перед основным промптом / общим шаблоном',
        inject_after_prompt: 'После основного промпта / общего шаблона',
        inject_at_depth: 'Вставка на глубину',
        inject_frequency: 'Частота вставки',
        inject_messages_until: 'Ваших сообщений до след. вставки: {count}',
        inject_messages_disabled: 'Ваших сообщений до след. вставки: (выключено)',
        cooldown_left: 'До кулдауна: {count} сообщений',
        cooldown_last_ago: 'Последняя ачивка была {count} сообщений назад',
        cooldown_no_achievements: 'Ачивок пока не было',
        cooldown_ready: 'Кулдаун пройден: можно выдавать ачивку',
        enforce_local_cooldown: 'Локально ограничивать частоту наград',
        dedupe_exact: 'Не выдавать точные дубликаты',
        show_toasts: 'Показывать Steam-like уведомления',
        prompt_for_injection: 'Промпт для инжекта',
        negative_prompt_for_cooldown: 'Негативный промпт (во время кулдауна)',
        debug: 'Отладка',
        placeholder_emoji: 'Эмодзи',
        placeholder_title: 'Название',
        placeholder_desc: 'Описание',
        debug_default_title: 'Тестовая победа',
        debug_default_desc: 'Ручная выдача из дебага.',
        debug_grant: 'Получить ачивку',
        debug_remove_last: 'Удалить последнюю',
        debug_open_list: 'Открыть список',
        section_core: 'Основные настройки',
        section_prompt: 'Инжект промпта',
        section_appearance: 'Внешний вид тостов',
        section_debug: 'Отладка',
        rarity_glow: 'Свечение редкости в тостах',
        toast_appearance: 'Внешний вид тостов',
        preset: 'Пресет',
        toast_corner: 'Угол тостов',
        corner_top_right: 'Верхний правый',
        corner_top_left: 'Верхний левый',
        corner_bottom_right: 'Нижний правый',
        corner_bottom_left: 'Нижний левый',
        scale: 'Масштаб',
        title_lines: 'Строк заголовка',
        description_lines: 'Строк описания',
        sharp_corners: 'Острые углы',
        toast_theme_presets: 'Тематические пресеты тостов',
        theme_preset: 'Пресет темы',
        preset_name: 'Название пресета',
        preset_name_placeholder: 'Название пресета',
        primary: 'Основной',
        secondary: 'Вторичный',
        accent: 'Акцент',
        text: 'Текст',
        new_preset: 'Новый пресет',
        save_changes: 'Сохранить изменения',
        delete_preset: 'Удалить пресет',
        prompt_presets: 'Пресеты промпта',
        prompt_preset: 'Пресет промпта',
        negative_prompt_presets: 'Пресеты негативного промпта',
        negative_prompt_preset: 'Пресет негативного промпта',
        warning_keep_one_theme: 'Должен остаться минимум один пресет темы тоста.',
        warning_keep_one_prompt: 'Должен остаться минимум один пресет промпта.',
        new_theme_default: 'Новая тема',
        new_prompt_default: 'Новый промпт',
        new_negative_prompt_default: 'Новый негативный промпт',
    },
    en: {
        achievement_unlocked: 'ACHIEVEMENT UNLOCKED',
        achievements_chat_title: 'Chat achievements',
        close: 'Close',
        delete: 'Delete',
        delete_all: 'Delete all',
        confirm_delete_all: 'Delete all achievements in this chat?',
        empty_list: 'No achievements yet. Earn your first one in this chat.',
        total: 'Total: {count}',
        achievements_count: '{count} achievements',
        fab_open_title: 'Open current chat achievements',
        fab_label: 'Achievements',
        enable_extension: 'Enable extension',
        cooldown_messages: 'Cooldown (messages)',
        inject_depth: 'Injection depth',
        inject_role: 'Injection role',
        inject_position: 'Injection position',
        inject_before_prompt: 'Before main prompt / story string',
        inject_after_prompt: 'After main prompt / story string',
        inject_at_depth: 'At depth',
        inject_frequency: 'Insertion frequency',
        inject_messages_until: 'Your messages till next insertion: {count}',
        inject_messages_disabled: 'Your messages till next insertion: (disabled)',
        cooldown_left: 'Until cooldown ends: {count} messages',
        cooldown_last_ago: 'Last achievement was {count} messages ago',
        cooldown_no_achievements: 'No achievements yet',
        cooldown_ready: 'Cooldown passed: achievement may be issued',
        enforce_local_cooldown: 'Enforce local reward cooldown',
        dedupe_exact: 'Do not issue exact duplicates',
        show_toasts: 'Show Steam-like notifications',
        prompt_for_injection: 'Prompt for injection',
        negative_prompt_for_cooldown: 'Negative prompt (during cooldown)',
        debug: 'Debug',
        placeholder_emoji: 'Emoji',
        placeholder_title: 'Title',
        placeholder_desc: 'Description',
        debug_default_title: 'Test victory',
        debug_default_desc: 'Manually granted from debug tools.',
        debug_grant: 'Grant achievement',
        debug_remove_last: 'Remove last',
        debug_open_list: 'Open list',
        section_core: 'Core settings',
        section_prompt: 'Prompt injection',
        section_appearance: 'Toast appearance',
        section_debug: 'Debug',
        rarity_glow: 'Rarity glow in toasts',
        toast_appearance: 'Toast appearance',
        preset: 'Preset',
        toast_corner: 'Toast corner',
        corner_top_right: 'Top right',
        corner_top_left: 'Top left',
        corner_bottom_right: 'Bottom right',
        corner_bottom_left: 'Bottom left',
        scale: 'Scale',
        title_lines: 'Title lines',
        description_lines: 'Description lines',
        sharp_corners: 'Sharp corners',
        toast_theme_presets: 'Toast theme presets',
        theme_preset: 'Theme preset',
        preset_name: 'Preset name',
        preset_name_placeholder: 'Preset name',
        primary: 'Primary',
        secondary: 'Secondary',
        accent: 'Accent',
        text: 'Text',
        new_preset: 'New preset',
        save_changes: 'Save changes',
        delete_preset: 'Delete preset',
        prompt_presets: 'Prompt presets',
        prompt_preset: 'Prompt preset',
        negative_prompt_presets: 'Negative prompt presets',
        negative_prompt_preset: 'Negative prompt preset',
        warning_keep_one_theme: 'At least one toast theme preset must remain.',
        warning_keep_one_prompt: 'At least one prompt preset must remain.',
        new_theme_default: 'New Theme',
        new_prompt_default: 'New Prompt',
        new_negative_prompt_default: 'New Negative Prompt',
    },
};

function getUiLang() {
    const locale = String(getCurrentLocale?.() || 'en').toLowerCase();
    return locale.startsWith('ru') ? 'ru' : 'en';
}

function uiText(key, vars = {}) {
    const table = UI_TEXT[getUiLang()] || UI_TEXT.en;
    const fallback = UI_TEXT.en[key] ?? key;
    const template = table[key] ?? fallback;
    return String(template).replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}

const MARKER_REGEX = /\[ACHIEVEMENT:\s*([^|\]\n]{1,16})\s*\|\s*([^|\]\n]{1,96})\s*\|\s*([^|\]\n]{1,220})\s*\|\s*(common|rare|epic|legendary)\s*\]/i;
const MARKER_REGEX_GLOBAL = new RegExp(MARKER_REGEX.source, 'gi');
const MARKER_HIDE_REGEX_GLOBAL = /\[ACHIEVEMENT:[^\]]*\]/gi;

const defaultPrompt = `[СИСТЕМА АЧИВОК]
В конце своего ответа ты МОЖЕШЬ (но не обязан!) выдать ачивку игроку, если в сцене произошло что-то реально достойное:
— Неожиданный сюжетный поворот
— Эмоциональный пик / катарсис
— Острая мастерская реплика юзера
— Безумный/героический/смешной поступок
— Раскрытие важной правды, поворотное решение
— Момент, который запомнится

ФОРМАТ — строго на отдельной строке в самом конце ответа, после всего текста:
[ACHIEVEMENT: эмодзи | Название | Краткое описание (1 предложение) | редкость]

Редкости:
— common — мелкие забавные/милые моменты
— rare — заметные сюжетные/эмоциональные события
— epic — крупные повороты, мастерство юзера
— legendary — нечто исключительное (раз в десятки часов чата)

ПРАВИЛА:
— Не выдавай чаще чем раз в {{cooldown}} сообщений. Лучше промолчать, чем выдать ради выдачи.
— Не пиши маркер если ничего реально не произошло.
— Только ОДНА ачивка за ответ.
— Название — короткое, креативное, в стиле Steam (3-6 слов).
— Описание — лаконично, что именно случилось.
— Эмодзи — одна штука, тематически подходящая.
— Маркер пишется отдельной строкой и потом скрывается из чата — не упоминай ачивку в самом тексте ответа.

Пример: [ACHIEVEMENT: 💀 | Без права на ошибку | Прошёл сцену один на один с боссом и не дрогнул | epic]
[/СИСТЕМА АЧИВОК]`;

const defaultSettings = {
    enabled: true,
    promptTemplate: '',
    promptPresets: [],
    activePromptPresetId: 'ru_default',
    negativePromptTemplate: '',
    negativePromptPresets: [],
    activeNegativePromptPresetId: 'ru_default_negative',
    cooldown: 8,
    injectPosition: extension_prompt_types.IN_CHAT,
    injectDepth: 4,
    injectRole: extension_prompt_roles.SYSTEM,
    injectInterval: 1,
    enforceLocalCooldown: true,
    dedupeByName: true,
    showToasts: true,
    toastRarityGlow: true,
    toastCorner: 'top_right',
    toastPreset: 'steam_compact',
    toastSharpCorners: true,
    toastScale: 100,
    toastTitleLines: 1,
    toastDescLines: 2,
    toastTheme: 'night',
    toastCustomColors: {
        primary: '#b0c4de',
        secondary: '#e8eef5',
        accent: '#7a9cc0',
        text: '#3a4a5c',
    },
    toastThemePresets: [],
    activeToastThemePresetId: 'night',
    fabX: null,
    fabY: null,
};

const rarityMeta = {
    common: { label: 'common', icon: '⬢' },
    rare: { label: 'rare', icon: '◆' },
    epic: { label: 'epic', icon: '✦' },
    legendary: { label: 'legendary', icon: '✶' },
};

const TOAST_THEMES = {
    soft:     { name: '🩶 Soft',     primary: '#b0c4de', secondary: '#e8eef5', accent: '#7a9cc0', text: '#3a4a5c' },
    pink:     { name: '🌸 Pink',     primary: '#f0a0b0', secondary: '#fce8ec', accent: '#d07080', text: '#5a3a42' },
    lavender: { name: '💜 Lavender', primary: '#a090c8', secondary: '#e4def8', accent: '#7060a8', text: '#3a2a58' },
    mint:     { name: '🌿 Mint',     primary: '#7abfa0', secondary: '#d8f0e8', accent: '#4a9a78', text: '#1a4030' },
    peach:    { name: '🍑 Peach',    primary: '#d4a070', secondary: '#f8ead8', accent: '#b07840', text: '#4a2a10' },
    night:    { name: '🌙 Night',    primary: '#5858a0', secondary: '#18182a', accent: '#8888d0', text: '#c8c8f0' },
    blackout: { name: '⚫ Blackout', primary: '#000000', secondary: '#000000', accent: '#000000', text: '#ffffff' },
    custom:   { name: '🎨 Custom' },
};

const DEFAULT_PROMPT_RU = `<achievement_sys>
В конце своего ответа ты МОЖЕШЬ (но не обязан!) выдать ачивку юзеру, если в сцене произошло что-то реально достойное:
— Неожиданный сюжетный поворот
— Эмоциональный пик / катарсис
— Острая мастерская реплика юзера
— Безумный/героический/смешной поступок
— Раскрытие важной правды, поворотное решение
— Момент, который запомнится

ФОРМАТ - строго на отдельной строке в самом конце ответа, после всего текста:
[ACHIEVEMENT: эмодзи | Название | Краткое описание (1 предложение) | редкость]

Доступные редкости (используй строго эти, не придумывай новые):
- common - мелкие забавные/милые моменты
- rare - заметные сюжетные/эмоциональные события
- epic - крупные повороты, мастерство юзера
- legendary - нечто исключительное (раз в десятки часов чата)

ПРАВИЛА:
- Не выдавай чаще чем раз в {{cooldown}} сообщений. Лучше промолчать, чем выдать ради выдачи.
- Не пиши маркер если ничего реально не произошло.
- Только ОДНА ачивка за ответ.
- Название - короткое, креативное, в стиле Steam (3-6 слов).
- Описание - лаконично, что именно случилось.
- Эмодзи - одна штука, тематически подходящая.
- Маркер пишется отдельной строкой и потом скрывается из чата — не упоминай ачивку в самом тексте ответа.

Пример: [ACHIEVEMENT: 💀 | Без права на ошибку | Прошёл сцену один на один с боссом и не дрогнул | epic]
</achievement_sys>`;

const DEFAULT_PROMPT_EN = `<achievement_sys>
At the end of your reply, you MAY (but are not obligated to!) issue an achievement to the user if something truly noteworthy happened in the scene:
— An unexpected plot twist
— An emotional peak / catharsis
— A sharp, masterful line from the user
— A crazy/heroic/funny act
— The revelation of an important truth, a pivotal decision
— A moment that will be remembered

FORMAT - strictly on a separate line at the very end of the reply, after all text:
[ACHIEVEMENT: emoji | Title | Short description (1 sentence) | rarity]

Available rarities (use strictly these, do not invent new ones):
- common - minor funny/cute moments
- rare - notable plot/emotional events
- epic - major twists, user mastery
- legendary - something exceptional (once in dozens of chat hours)

RULES:
- Do not issue more often than once every {{cooldown}} messages. Better to stay silent than to issue one just for the sake of it.
- Do not write the marker if nothing truly happened.
- Only ONE achievement per reply.
- Title - short, creative, Steam-style (3-6 words).
- Description - concise, stating what exactly happened.
- Emoji - a single one, thematically fitting.
- The marker is written on a separate line and then hidden from the chat — do not mention the achievement in the reply text itself.

Example: [ACHIEVEMENT: 💀 | No Room for Error | Cleared the scene one-on-one with the boss without flinching | epic]
</achievement_sys>`;

const DEFAULT_NEGATIVE_PROMPT_RU = `<achievement_sys>
НЕ ВЫДАВАЙ АЧИВКУ.
До окончания кулдауна осталось {{remaining}} сообщений.
Последняя ачивка была {{since_last}} сообщений назад.
Не добавляй маркер [ACHIEVEMENT: ...] в ответ.
</achievement_sys>`;

const DEFAULT_NEGATIVE_PROMPT_EN = `<achievement_sys>
DO NOT ISSUE AN ACHIEVEMENT.
Cooldown has {{remaining}} messages left.
The last achievement was {{since_last}} messages ago.
Do not add the [ACHIEVEMENT: ...] marker to your reply.
</achievement_sys>`;

function createDefaultPromptPresets() {
    return [
        { id: 'ru_default', name: 'Русский', template: DEFAULT_PROMPT_RU },
        { id: 'en_default', name: 'English', template: DEFAULT_PROMPT_EN },
    ];
}

function createDefaultNegativePromptPresets() {
    return [
        { id: 'ru_default_negative', name: 'Русский (кулдаун)', template: DEFAULT_NEGATIVE_PROMPT_RU },
        { id: 'en_default_negative', name: 'English (cooldown)', template: DEFAULT_NEGATIVE_PROMPT_EN },
    ];
}

function createDefaultThemePresets() {
    return Object.entries(TOAST_THEMES)
        .filter(([id]) => id !== 'custom')
        .map(([id, theme]) => ({
            id,
            name: theme.name.replace(/[^\w\s()-]/g, '').trim() || id,
            primary: theme.primary,
            secondary: theme.secondary,
            accent: theme.accent,
            text: theme.text,
        }));
}

let scannedAchievements = [];
let lastScannedIds = new Set();
let rescanTimer = null;
let hideTimer = null;
let hideObserver = null;
let suppressFabClickUntil = 0;
let pendingRescanNotify = false;
let panelOutsideClickHandler = null;

function getContext() {
    return SillyTavern.getContext();
}

function makePresetId(prefix, name) {
    const slug = String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24) || 'preset';
    return `${prefix}_${slug}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeColorHex(value, fallback) {
    const v = String(value || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
    return fallback;
}

function normalizeThemePreset(input, fallbackId = 'preset') {
    const source = input || {};
    return {
        id: normalizeText(source.id) || makePresetId('theme', fallbackId),
        name: normalizeText(source.name) || uiText('theme_preset'),
        primary: normalizeColorHex(source.primary, '#5858a0'),
        secondary: normalizeColorHex(source.secondary, '#18182a'),
        accent: normalizeColorHex(source.accent, '#8888d0'),
        text: normalizeColorHex(source.text, '#c8c8f0'),
    };
}

function normalizePromptPreset(input, fallbackId = 'preset') {
    const source = input || {};
    return {
        id: normalizeText(source.id) || makePresetId('prompt', fallbackId),
        name: normalizeText(source.name) || uiText('prompt_preset'),
        template: String(source.template || ''),
    };
}

function ensureUniquePresetIds(list, prefix) {
    const used = new Set();
    return list.map((item, index) => {
        const next = { ...item };
        if (!next.id || used.has(next.id)) {
            next.id = makePresetId(prefix, `${prefix}_${index + 1}`);
        }
        used.add(next.id);
        return next;
    });
}

function getSettings() {
    if (!extension_settings[MODULE_NAME]) {
        extension_settings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    const settings = extension_settings[MODULE_NAME];
    if (settings.injectDepth === undefined && settings.depth !== undefined) settings.injectDepth = settings.depth;
    if (settings.injectRole === undefined && settings.role !== undefined) settings.injectRole = settings.role;
    if (settings.injectPosition === undefined) settings.injectPosition = extension_prompt_types.IN_CHAT;
    if (settings.injectInterval === undefined) settings.injectInterval = 1;
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined) {
            settings[key] = value;
        }
    }
    if (!settings.toastCustomColors || typeof settings.toastCustomColors !== 'object') {
        settings.toastCustomColors = structuredClone(defaultSettings.toastCustomColors);
    }
    for (const [k, v] of Object.entries(defaultSettings.toastCustomColors)) {
        if (!settings.toastCustomColors[k]) {
            settings.toastCustomColors[k] = v;
        }
    }

    if (!Array.isArray(settings.toastThemePresets) || !settings.toastThemePresets.length) {
        settings.toastThemePresets = createDefaultThemePresets();
    }
    settings.toastThemePresets = ensureUniquePresetIds(
        settings.toastThemePresets.map((item, index) => normalizeThemePreset(item, `theme_${index + 1}`)),
        'theme',
    );
    for (const required of createDefaultThemePresets()) {
        if (!settings.toastThemePresets.some((item) => item.id === required.id)) {
            settings.toastThemePresets.push(required);
        }
    }

    if (settings.toastTheme === 'custom' && settings.toastCustomColors) {
        const legacyCustom = settings.toastThemePresets.find((item) => item.id === 'custom');
        const customTheme = normalizeThemePreset({
            id: 'custom',
            name: 'Custom',
            primary: settings.toastCustomColors.primary,
            secondary: settings.toastCustomColors.secondary,
            accent: settings.toastCustomColors.accent,
            text: settings.toastCustomColors.text,
        }, 'custom');
        if (legacyCustom) {
            Object.assign(legacyCustom, customTheme);
        } else {
            settings.toastThemePresets.push(customTheme);
        }
    }

    const hasActiveTheme = settings.toastThemePresets.some((item) => item.id === settings.activeToastThemePresetId);
    if (!hasActiveTheme) {
        const legacyThemeExists = settings.toastThemePresets.some((item) => item.id === settings.toastTheme);
        settings.activeToastThemePresetId = legacyThemeExists ? settings.toastTheme : settings.toastThemePresets[0]?.id;
    }

    if (!Array.isArray(settings.promptPresets) || !settings.promptPresets.length) {
        settings.promptPresets = createDefaultPromptPresets();
    }
    settings.promptPresets = ensureUniquePresetIds(
        settings.promptPresets.map((item, index) => normalizePromptPreset(item, `prompt_${index + 1}`)),
        'prompt',
    );

    for (const required of createDefaultPromptPresets()) {
        if (!settings.promptPresets.some((item) => item.id === required.id)) {
            settings.promptPresets.push(required);
        }
    }

    const hasActivePrompt = settings.promptPresets.some((item) => item.id === settings.activePromptPresetId);
    if (!hasActivePrompt) {
        settings.activePromptPresetId = settings.promptPresets[0]?.id;
    }
    if (!settings.promptTemplate) {
        const activePreset = settings.promptPresets.find((item) => item.id === settings.activePromptPresetId);
        settings.promptTemplate = activePreset?.template || DEFAULT_PROMPT_RU;
    }

    if (!Array.isArray(settings.negativePromptPresets) || !settings.negativePromptPresets.length) {
        settings.negativePromptPresets = createDefaultNegativePromptPresets();
    }
    settings.negativePromptPresets = ensureUniquePresetIds(
        settings.negativePromptPresets.map((item, index) => normalizePromptPreset(item, `negative_prompt_${index + 1}`)),
        'negative_prompt',
    );
    for (const required of createDefaultNegativePromptPresets()) {
        if (!settings.negativePromptPresets.some((item) => item.id === required.id)) {
            settings.negativePromptPresets.push(required);
        }
    }
    const hasActiveNegativePrompt = settings.negativePromptPresets.some((item) => item.id === settings.activeNegativePromptPresetId);
    if (!hasActiveNegativePrompt) {
        settings.activeNegativePromptPresetId = settings.negativePromptPresets[0]?.id;
    }
    if (!settings.negativePromptTemplate) {
        const activeNegative = settings.negativePromptPresets.find((item) => item.id === settings.activeNegativePromptPresetId);
        settings.negativePromptTemplate = activeNegative?.template || DEFAULT_NEGATIVE_PROMPT_RU;
    }

    settings.injectDepth = Math.max(0, Number(settings.injectDepth) || 0);
    settings.injectRole = Number(settings.injectRole ?? extension_prompt_roles.SYSTEM);
    settings.injectInterval = Math.max(0, Number(settings.injectInterval) || 0);
    settings.injectPosition = Number(settings.injectPosition ?? extension_prompt_types.IN_CHAT);
    if (![extension_prompt_types.BEFORE_PROMPT, extension_prompt_types.IN_PROMPT, extension_prompt_types.IN_CHAT].includes(settings.injectPosition)) {
        settings.injectPosition = extension_prompt_types.IN_CHAT;
    }
    const validCorners = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
    if (!validCorners.includes(String(settings.toastCorner))) {
        settings.toastCorner = 'top_right';
    }

    return settings;
}

function saveSettings() {
    saveSettingsDebounced();
}

function ensureChatStore() {
    const context = getContext();
    if (!context?.chatMetadata) context.chatMetadata = {};
    if (!context.chatMetadata[META_KEY]) {
        context.chatMetadata[META_KEY] = {
            ignoredIds: [],
            debugAchievements: [],
        };
    }
    if (!Array.isArray(context.chatMetadata[META_KEY].ignoredIds)) {
        context.chatMetadata[META_KEY].ignoredIds = [];
    }
    if (!Array.isArray(context.chatMetadata[META_KEY].debugAchievements)) {
        context.chatMetadata[META_KEY].debugAchievements = [];
    }
    return context.chatMetadata[META_KEY];
}

function persistChat() {
    const context = getContext();
    if (typeof context?.saveChat === 'function') {
        context.saveChat();
    }
}

function normalizeText(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function hashString(value) {
    let hash = 5381;
    const text = String(value ?? '');
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) + hash) + text.charCodeAt(i);
        hash &= 0xffffffff;
    }
    return Math.abs(hash).toString(36);
}

function parseMarkerFromMessage(text) {
    if (!text) return null;
    const all = [...String(text).matchAll(MARKER_REGEX_GLOBAL)];
    if (!all.length) return null;
    const match = all[all.length - 1];
    const emoji = normalizeText(match[1]);
    const title = normalizeText(match[2]);
    const description = normalizeText(match[3]);
    const rarity = normalizeText(match[4]).toLowerCase();
    if (!rarityMeta[rarity] || !title || !description) return null;
    return { emoji, title, description, rarity };
}

function getInjectState(interval) {
    const context = getContext();
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

function refreshInjectCounter(state, interval) {
    const el = document.getElementById('stsa_inject_counter');
    if (!el) return;
    const disabled = Number(interval) <= 0 || state.messagesTillInsertion === null;
    el.textContent = disabled
        ? uiText('inject_messages_disabled')
        : uiText('inject_messages_until', { count: state.messagesTillInsertion });
}

function getAchievementCooldownInfo(cooldownInput) {
    const context = getContext();
    const chat = Array.isArray(context?.chat) ? context.chat : [];
    const cooldown = Math.max(1, Number(cooldownInput) || 1);
    let lastAchievementMessageIndex = -1;

    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        if (!message || message.is_user) continue;
        if (parseMarkerFromMessage(message.mes)) {
            lastAchievementMessageIndex = i;
            break;
        }
    }

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

function getDefaultNegativePromptForLocale() {
    return getUiLang() === 'ru' ? DEFAULT_NEGATIVE_PROMPT_RU : DEFAULT_NEGATIVE_PROMPT_EN;
}

function applyPromptInjection() {
    const settings = getSettings();
    const injectState = getInjectState(settings.injectInterval);
    refreshInjectCounter(injectState, settings.injectInterval);

    if (!settings.enabled) {
        setExtensionPrompt(PROMPT_KEY, '', extension_prompt_types.NONE, 0, false, settings.injectRole);
        return;
    }
    if (!injectState.shouldInject) {
        setExtensionPrompt(PROMPT_KEY, '', extension_prompt_types.NONE, 0, false, settings.injectRole);
        return;
    }

    const cooldown = Math.max(1, Number(settings.cooldown) || 1);
    const position = Number(settings.injectPosition ?? extension_prompt_types.IN_CHAT);
    const depth = position === extension_prompt_types.IN_CHAT ? settings.injectDepth : 0;
    const role = settings.injectRole;
    const cooldownInfo = getAchievementCooldownInfo(cooldown);
    const vars = {
        cooldown,
        remaining: cooldownInfo.remaining,
        since_last: cooldownInfo.messagesSinceLast ?? 0,
    };
    const basePrompt = applyTemplateVars(settings.promptTemplate, vars);
    const negativePrompt = applyTemplateVars(settings.negativePromptTemplate || getDefaultNegativePromptForLocale(), vars);
    const prompt = cooldownInfo.hasAchievement && cooldownInfo.remaining > 0
        ? negativePrompt
        : basePrompt;
    setExtensionPrompt(PROMPT_KEY, prompt, position, depth, false, role);
}

function buildScannedAchievements() {
    const context = getContext();
    const settings = getSettings();
    const store = ensureChatStore();
    const ignored = new Set(store.ignoredIds);
    const list = [];

    if (!Array.isArray(context?.chat)) return list;

    let lastGrantedMessageIndex = -99999;
    const dedupe = new Set();

    for (let i = 0; i < context.chat.length; i++) {
        const message = context.chat[i];
        if (!message || message.is_user) continue;

        const parsed = parseMarkerFromMessage(message.mes);
        if (!parsed) continue;

        if (settings.enforceLocalCooldown) {
            const diff = i - lastGrantedMessageIndex;
            if (diff < Math.max(1, Number(settings.cooldown) || 1)) continue;
        }

        if (settings.dedupeByName) {
            const dedupeKey = `${parsed.title.toLowerCase()}|${parsed.description.toLowerCase()}`;
            if (dedupe.has(dedupeKey)) continue;
            dedupe.add(dedupeKey);
        }

        const sig = `${parsed.emoji}|${parsed.title}|${parsed.description}|${parsed.rarity}`;
        const id = `msg_${i}_${hashString(sig)}`;
        if (ignored.has(id)) continue;

        let awardedAt = Number(message.send_date || message.gen_started || 0);
        if (!Number.isFinite(awardedAt) || awardedAt <= 0) {
            awardedAt = Date.now() + i;
        }

        list.push({
            id,
            source: 'chat',
            emoji: parsed.emoji || '🏆',
            title: parsed.title,
            description: parsed.description,
            rarity: parsed.rarity,
            messageIndex: i,
            awardedAt,
        });
        lastGrantedMessageIndex = i;
    }
    return list;
}

function getDebugAchievements() {
    const store = ensureChatStore();
    return store.debugAchievements;
}

function getAchievements() {
    const debug = getDebugAchievements();
    return [...scannedAchievements, ...debug].sort((a, b) => Number(a.awardedAt) - Number(b.awardedAt));
}

function getToastContainer() {
    let container = document.getElementById('stsa_toast_container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'stsa_toast_container';
        document.body.appendChild(container);
    }
    const corner = String(getSettings().toastCorner || 'top_right');
    container.style.top = '';
    container.style.right = '';
    container.style.bottom = '';
    container.style.left = '';
    container.style.alignItems = '';
    container.style.flexDirection = 'column';
    switch (corner) {
        case 'top_left':
            container.style.top = '14px';
            container.style.left = '12px';
            container.style.alignItems = 'flex-start';
            break;
        case 'bottom_right':
            container.style.bottom = '14px';
            container.style.right = '12px';
            container.style.alignItems = 'flex-end';
            container.style.flexDirection = 'column-reverse';
            break;
        case 'bottom_left':
            container.style.bottom = '14px';
            container.style.left = '12px';
            container.style.alignItems = 'flex-start';
            container.style.flexDirection = 'column-reverse';
            break;
        default:
            container.style.top = '14px';
            container.style.right = '12px';
            container.style.alignItems = 'flex-end';
            break;
    }
    return container;
}

function getToastThemeColors() {
    const settings = getSettings();
    const active = settings.toastThemePresets?.find((item) => item.id === settings.activeToastThemePresetId);
    if (active) {
        return active;
    }
    return settings.toastThemePresets?.[0] || TOAST_THEMES.night;
}

function showToast(achievement) {
    const settings = getSettings();
    const theme = getToastThemeColors();
    const container = getToastContainer();
    const el = document.createElement('div');
    const preset = String(settings.toastPreset || 'steam_compact');
    const titleLines = Math.min(3, Math.max(1, Number(settings.toastTitleLines) || 1));
    const descLines = Math.min(4, Math.max(1, Number(settings.toastDescLines) || 2));
    const scale = Math.min(120, Math.max(80, Number(settings.toastScale) || 100));
    el.className = `stsa_toast stsa_toast_preset_${preset} stsa_rarity_${achievement.rarity} ${settings.toastRarityGlow ? 'stsa_toast_glow' : 'stsa_toast_no_glow'} ${settings.toastSharpCorners ? 'stsa_toast_sharp' : ''}`;
    el.style.setProperty('--stsa-title-lines', String(titleLines));
    el.style.setProperty('--stsa-desc-lines', String(descLines));
    el.style.setProperty('--stsa-toast-scale', String(scale / 100));
    el.style.setProperty('--stsa-primary', String(theme.primary || '#5858a0'));
    el.style.setProperty('--stsa-secondary', String(theme.secondary || '#18182a'));
    el.style.setProperty('--stsa-accent', String(theme.accent || '#8888d0'));
    el.style.setProperty('--stsa-text', String(theme.text || '#c8c8f0'));
    el.innerHTML = `
        <div class="stsa_toast_emoji">${escapeHtml(achievement.emoji)}</div>
        <div class="stsa_toast_content">
            <div class="stsa_toast_title">
                <span>${escapeHtml(uiText('achievement_unlocked'))}</span>
            </div>
            <div class="stsa_toast_name">${escapeHtml(achievement.title)}</div>
            <div class="stsa_toast_desc">${escapeHtml(achievement.description)}</div>
            <div class="stsa_toast_badge">${escapeHtml((achievement.rarity || 'common').toUpperCase())}</div>
        </div>
        <div class="stsa_toast_close">×</div>
    `;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('stsa_toast_show'));
    setTimeout(() => {
        el.classList.remove('stsa_toast_show');
        setTimeout(() => el.remove(), 280);
    }, 5200);
}

function refreshFloatingCount() {
    const countEl = document.getElementById('stsa_fab_count');
    if (!countEl) return;
    countEl.textContent = String(getAchievements().length);
}

function renderModalList() {
    const listEl = document.getElementById('stsa_modal_list');
    const statsEl = document.getElementById('stsa_modal_stats');
    if (!listEl || !statsEl) return;

    const list = [...getAchievements()].reverse();
    const cooldownInfo = getAchievementCooldownInfo(getSettings().cooldown);
    if (!list.length) {
        statsEl.innerHTML = `
            <span>${escapeHtml(uiText('achievements_count', { count: 0 }))}</span>
            <span>${escapeHtml(uiText('cooldown_no_achievements'))}</span>
        `;
        listEl.innerHTML = `<div class="stsa_empty">${escapeHtml(uiText('empty_list'))}</div>`;
        return;
    }

    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (const item of list) counts[item.rarity] = (counts[item.rarity] || 0) + 1;

    const cooldownText = !cooldownInfo.hasAchievement
        ? uiText('cooldown_no_achievements')
        : (cooldownInfo.remaining > 0
            ? uiText('cooldown_left', { count: cooldownInfo.remaining })
            : uiText('cooldown_last_ago', { count: cooldownInfo.messagesSinceLast }));

    statsEl.innerHTML = `
        <span>${escapeHtml(cooldownText)}</span>
        <span>${escapeHtml(uiText('total', { count: list.length }))}</span>
        <span>common: ${counts.common}</span>
        <span>rare: ${counts.rare}</span>
        <span>epic: ${counts.epic}</span>
        <span>legendary: ${counts.legendary}</span>
    `;

    listEl.innerHTML = list.map((item) => {
        const meta = rarityMeta[item.rarity] || rarityMeta.common;
        const date = new Date(item.awardedAt).toLocaleString(getUiLang() === 'ru' ? 'ru-RU' : 'en-US');
        return `
            <div class="stsa_item stsa_rarity_${escapeHtml(item.rarity)}">
                <div class="stsa_item_icon">${escapeHtml(item.emoji)}</div>
                <div class="stsa_item_body">
                    <div class="stsa_item_top">
                        <div class="stsa_item_title">${escapeHtml(item.title)}</div>
                        <div class="stsa_item_rarity">${meta.icon} ${meta.label}</div>
                    </div>
                    <div class="stsa_item_desc">${escapeHtml(item.description)}</div>
                    <div class="stsa_item_date">${escapeHtml(date)}</div>
                </div>
                <button class="stsa_item_delete" title="${escapeHtml(uiText('delete'))}" data-ach-id="${escapeHtml(item.id)}">🗑</button>
            </div>
        `;
    }).join('');
}

function removeAchievementById(id) {
    if (!id) return;
    const store = ensureChatStore();

    if (String(id).startsWith('debug_')) {
        store.debugAchievements = store.debugAchievements.filter((item) => item.id !== id);
    } else if (!store.ignoredIds.includes(id)) {
        store.ignoredIds.push(id);
    }

    persistChat();
    rescanAchievements(false);
}

function clearAchievements() {
    const store = ensureChatStore();
    const scannedIds = scannedAchievements.map((item) => item.id);
    const allIgnored = new Set([...(store.ignoredIds || []), ...scannedIds]);
    store.ignoredIds = [...allIgnored];
    store.debugAchievements = [];
    persistChat();
    rescanAchievements(false);
}

function removeLastAchievement() {
    const list = getAchievements();
    if (!list.length) return;
    removeAchievementById(list[list.length - 1].id);
}

function grantDebugAchievement() {
    const store = ensureChatStore();
    const emoji = normalizeText($('#stsa_debug_emoji').val()) || '🏆';
    const title = normalizeText($('#stsa_debug_title').val()) || uiText('debug_default_title');
    const description = normalizeText($('#stsa_debug_desc').val()) || uiText('debug_default_desc');
    const rarity = normalizeText($('#stsa_debug_rarity').val()).toLowerCase();
    const safeRarity = rarityMeta[rarity] ? rarity : 'common';

    store.debugAchievements.push({
        id: `debug_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source: 'debug',
        emoji,
        title,
        description,
        rarity: safeRarity,
        messageIndex: Number.MAX_SAFE_INTEGER,
        awardedAt: Date.now(),
    });

    persistChat();
    rescanAchievements(false);
    if (getSettings().showToasts) {
        const last = store.debugAchievements[store.debugAchievements.length - 1];
        showToast(last);
    }
}

function rescanAchievements(notifyNew = false) {
    const nextScanned = buildScannedAchievements();
    const nextIds = new Set(nextScanned.map((item) => item.id));

    if (notifyNew && getSettings().showToasts) {
        for (const item of nextScanned) {
            if (!lastScannedIds.has(item.id)) {
                showToast(item);
            }
        }
    }

    scannedAchievements = nextScanned;
    lastScannedIds = nextIds;
    refreshFloatingCount();
    renderModalList();
}

function scheduleRescan(notifyNew = false) {
    pendingRescanNotify = pendingRescanNotify || Boolean(notifyNew);
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(() => {
        rescanTimer = null;
        const shouldNotify = pendingRescanNotify;
        pendingRescanNotify = false;
        rescanAchievements(shouldNotify);
    }, 60);
}

function hideAchievementMarkersInDOM() {
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
                .replace(MARKER_HIDE_REGEX_GLOBAL, '')
                .replace(/\n{3,}/g, '\n\n');
            if (replaced !== original) node.nodeValue = replaced;
        }
    }
}

function scheduleHideMarkers() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        hideTimer = null;
        hideAchievementMarkersInDOM();
    }, 80);
}

function ensureHideObserver() {
    if (hideObserver) return;
    const target = document.getElementById('chat') || document.querySelector('#chat');
    const root = target || document.body;
    if (!root) return;

    hideObserver = new MutationObserver(() => {
        // Some extensions re-render message DOM after async tasks (e.g. image generation),
        // so markers can reappear even after initial cleanup.
        scheduleHideMarkers();
    });

    hideObserver.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}

function openModal() {
    ensurePanel();
    const panel = document.getElementById('stsa_panel');
    if (!panel) return;
    positionPanelNearFab(panel);
    renderModalList();
    panel.classList.add('stsa_panel_open');
    bindPanelOutsideClose();
}

function closeModal() {
    document.getElementById('stsa_panel')?.classList.remove('stsa_panel_open');
    unbindPanelOutsideClose();
}

function ensurePanel() {
    if (document.getElementById('stsa_panel')) return;
    const panel = document.createElement('div');
    panel.id = 'stsa_panel';
    panel.className = 'stsa_panel';
    panel.innerHTML = `
        <div class="stsa_modal">
            <div class="stsa_modal_header">
                <div class="stsa_modal_title">${escapeHtml(uiText('achievements_chat_title'))}</div>
                <button id="stsa_modal_close" class="stsa_modal_close" title="${escapeHtml(uiText('close'))}">✕</button>
            </div>
            <div id="stsa_modal_stats" class="stsa_modal_stats"></div>
            <div id="stsa_modal_list" class="stsa_modal_list"></div>
            <div class="stsa_modal_footer">
                <button id="stsa_clear_all" class="menu_button stsa_clear_all">${escapeHtml(uiText('delete_all'))}</button>
            </div>
        </div>
    `;
    panel.querySelector('#stsa_modal_close')?.addEventListener('click', closeModal);
    panel.querySelector('#stsa_clear_all')?.addEventListener('click', () => {
        if (!window.confirm(uiText('confirm_delete_all'))) return;
        clearAchievements();
    });
    panel.querySelector('#stsa_modal_list')?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-ach-id]');
        if (!btn) return;
        removeAchievementById(btn.getAttribute('data-ach-id'));
    });
    document.body.appendChild(panel);
}

function positionPanelNearFab(panelEl) {
    const fab = document.getElementById('stsa_fab');
    if (!fab || !panelEl) return;

    const mobile = window.innerWidth <= 760;
    if (mobile) {
        panelEl.style.width = `${Math.max(280, window.innerWidth - 16)}px`;
        panelEl.style.height = `${Math.max(260, window.innerHeight - 16)}px`;
        panelEl.style.maxHeight = `${Math.max(260, window.innerHeight - 16)}px`;
        panelEl.style.left = '8px';
        panelEl.style.top = '8px';
        return;
    }

    const fabRect = fab.getBoundingClientRect();
    const panelW = 420;
    const panelH = Math.min(640, Math.max(280, window.innerHeight - 20));

    panelEl.style.width = `${panelW}px`;
    panelEl.style.height = `${panelH}px`;
    panelEl.style.maxHeight = `${panelH}px`;

    let left = fabRect.right + 8;
    if (left + panelW > window.innerWidth - 8) {
        left = fabRect.left - panelW - 8;
    }
    if (left < 8) left = Math.max(8, window.innerWidth - panelW - 8);

    let top = fabRect.top;
    if (top + panelH > window.innerHeight - 8) {
        top = window.innerHeight - panelH - 8;
    }
    if (top < 8) top = 8;

    panelEl.style.left = `${Math.round(left)}px`;
    panelEl.style.top = `${Math.round(top)}px`;
}

function bindPanelOutsideClose() {
    if (panelOutsideClickHandler) return;
    panelOutsideClickHandler = (event) => {
        const panel = document.getElementById('stsa_panel');
        if (!panel || !panel.classList.contains('stsa_panel_open')) return;
        const fab = document.getElementById('stsa_fab');
        if (panel.contains(event.target) || fab?.contains(event.target)) return;
        closeModal();
    };
    // Delay, чтобы клик по FAB не закрыл панель сразу после открытия.
    setTimeout(() => {
        if (panelOutsideClickHandler) {
            document.addEventListener('mousedown', panelOutsideClickHandler);
            document.addEventListener('touchstart', panelOutsideClickHandler, { passive: true });
        }
    }, 0);
}

function unbindPanelOutsideClose() {
    if (!panelOutsideClickHandler) return;
    document.removeEventListener('mousedown', panelOutsideClickHandler);
    document.removeEventListener('touchstart', panelOutsideClickHandler);
    panelOutsideClickHandler = null;
}

function getDefaultFabPosition() {
    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    return {
        x: Math.max(8, vw - 174),
        y: Math.max(8, Math.round(vh * 0.68)),
    };
}

function clampFabPosition(x, y, el) {
    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    const w = el?.offsetWidth || 150;
    const h = el?.offsetHeight || 42;
    return {
        x: Math.min(Math.max(8, x), Math.max(8, vw - w - 8)),
        y: Math.min(Math.max(8, y), Math.max(8, vh - h - 8)),
    };
}

function applyFabPosition(el, x, y) {
    const p = clampFabPosition(x, y, el);
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
}

function enableFabDragging(fab) {
    let dragging = false;
    let moved = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let startFabX = 0;
    let startFabY = 0;

    const onMove = (event) => {
        if (!dragging) return;
        const dx = event.clientX - startPointerX;
        const dy = event.clientY - startPointerY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
        const nextX = startFabX + dx;
        const nextY = startFabY + dy;
        applyFabPosition(fab, nextX, nextY);
    };

    const onUp = () => {
        if (!dragging) return;
        dragging = false;
        fab.classList.remove('stsa_dragging');
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);

        const settings = getSettings();
        settings.fabX = parseInt(fab.style.left, 10) || 8;
        settings.fabY = parseInt(fab.style.top, 10) || 8;
        saveSettings();

        if (moved) suppressFabClickUntil = Date.now() + 220;
    };

    fab.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        dragging = true;
        moved = false;
        fab.classList.add('stsa_dragging');
        fab.setPointerCapture(event.pointerId);
        startPointerX = event.clientX;
        startPointerY = event.clientY;
        startFabX = parseInt(fab.style.left, 10) || 8;
        startFabY = parseInt(fab.style.top, 10) || 8;
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
    });
}

function ensureFloatingButton() {
    if (document.getElementById('stsa_fab')) return;
    const fab = document.createElement('button');
    fab.id = 'stsa_fab';
    fab.className = 'stsa_fab';
    fab.title = uiText('fab_open_title');
    fab.innerHTML = `
        <span class="stsa_fab_icon">🏆</span>
        <span class="stsa_fab_text">${escapeHtml(uiText('fab_label'))}</span>
        <span id="stsa_fab_count" class="stsa_fab_count">0</span>
    `;
    fab.addEventListener('click', () => {
        if (Date.now() < suppressFabClickUntil) return;
        openModal();
    });
    document.body.appendChild(fab);

    const settings = getSettings();
    const def = getDefaultFabPosition();
    const x = Number.isFinite(settings.fabX) ? settings.fabX : def.x;
    const y = Number.isFinite(settings.fabY) ? settings.fabY : def.y;
    applyFabPosition(fab, x, y);
    enableFabDragging(fab);

    window.addEventListener('resize', () => {
        applyFabPosition(fab, parseInt(fab.style.left, 10) || def.x, parseInt(fab.style.top, 10) || def.y);
        const panel = document.getElementById('stsa_panel');
        if (panel?.classList.contains('stsa_panel_open')) {
            positionPanelNearFab(panel);
        }
    });
}

function buildSettingsHtml() {
    return `
        <div id="stsa_root" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🏆 ST-silly-achievements</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="stsa_settings">
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_enabled">
                        <span>${escapeHtml(uiText('enable_extension'))}</span>
                    </label>
                    <div class="stsa_grid">
                        <label>${escapeHtml(uiText('cooldown_messages'))}
                            <input id="stsa_cooldown" class="text_pole" type="number" min="1" max="200" step="1">
                        </label>
                    </div>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_enforce_local_cooldown">
                        <span>${escapeHtml(uiText('enforce_local_cooldown'))}</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_dedupe">
                        <span>${escapeHtml(uiText('dedupe_exact'))}</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_toasts">
                        <span>${escapeHtml(uiText('show_toasts'))}</span>
                    </label>
                    <label>${escapeHtml(uiText('prompt_for_injection'))}
                        <textarea id="stsa_prompt" class="text_pole" rows="14"></textarea>
                    </label>
                    <label>${escapeHtml(uiText('negative_prompt_for_cooldown'))}
                        <textarea id="stsa_negative_prompt" class="text_pole" rows="8"></textarea>
                    </label>
                    <div class="stsa_debug">
                        <div class="stsa_debug_title">${escapeHtml(uiText('inject_position'))}</div>
                        <label class="checkbox_label stsa_radio_label">
                            <input type="radio" name="stsa_inject_position" value="${extension_prompt_types.BEFORE_PROMPT}" id="stsa_inject_pos_before">
                            <span>${escapeHtml(uiText('inject_before_prompt'))}</span>
                        </label>
                        <label class="checkbox_label stsa_radio_label">
                            <input type="radio" name="stsa_inject_position" value="${extension_prompt_types.IN_PROMPT}" id="stsa_inject_pos_after">
                            <span>${escapeHtml(uiText('inject_after_prompt'))}</span>
                        </label>
                        <div class="stsa_inject_depth_row">
                            <label class="checkbox_label stsa_radio_label">
                                <input type="radio" name="stsa_inject_position" value="${extension_prompt_types.IN_CHAT}" id="stsa_inject_pos_depth">
                                <span>${escapeHtml(uiText('inject_at_depth'))}</span>
                            </label>
                            <input id="stsa_depth" class="text_pole" type="number" min="0" max="10000" step="1">
                            <label>${escapeHtml(uiText('inject_role'))}
                                <select id="stsa_role" class="text_pole">
                                    <option value="${extension_prompt_roles.SYSTEM}">system</option>
                                    <option value="${extension_prompt_roles.USER}">user</option>
                                    <option value="${extension_prompt_roles.ASSISTANT}">assistant</option>
                                </select>
                            </label>
                        </div>
                        <label>${escapeHtml(uiText('inject_frequency'))}
                            <input id="stsa_inject_interval" class="text_pole" type="number" min="0" max="500" step="1">
                        </label>
                        <div id="stsa_inject_counter" class="stsa_inject_counter">${escapeHtml(uiText('inject_messages_disabled'))}</div>
                    </div>
                    <div class="stsa_debug">
                        <div class="stsa_debug_title">${escapeHtml(uiText('debug'))}</div>
                        <div class="stsa_debug_grid">
                            <input id="stsa_debug_emoji" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_emoji'))}" value="🏆">
                            <input id="stsa_debug_title" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_title'))}" value="${escapeHtml(uiText('debug_default_title'))}">
                            <input id="stsa_debug_desc" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_desc'))}" value="${escapeHtml(uiText('debug_default_desc'))}">
                            <select id="stsa_debug_rarity" class="text_pole">
                                <option value="common">common</option>
                                <option value="rare">rare</option>
                                <option value="epic">epic</option>
                                <option value="legendary">legendary</option>
                            </select>
                        </div>
                        <div class="stsa_debug_actions">
                            <button id="stsa_debug_grant" class="menu_button">${escapeHtml(uiText('debug_grant'))}</button>
                            <button id="stsa_debug_remove_last" class="menu_button">${escapeHtml(uiText('debug_remove_last'))}</button>
                            <button id="stsa_debug_open_modal" class="menu_button">${escapeHtml(uiText('debug_open_list'))}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function buildCollapsibleSettingsSections() {
    const root = document.querySelector('#stsa_root .stsa_settings');
    if (!root || root.querySelector('.stsa_section')) return;

    const enabled = document.getElementById('stsa_enabled')?.closest('label');
    const grid = document.getElementById('stsa_cooldown')?.closest('.stsa_grid');
    const enforce = document.getElementById('stsa_enforce_local_cooldown')?.closest('label');
    const dedupe = document.getElementById('stsa_dedupe')?.closest('label');
    const toasts = document.getElementById('stsa_toasts')?.closest('label');
    const glow = document.getElementById('stsa_toast_glow')?.closest('label');
    const prompt = document.getElementById('stsa_prompt')?.closest('label');
    const promptPresets = document.getElementById('stsa_prompt_presets');
    const negativePrompt = document.getElementById('stsa_negative_prompt')?.closest('label');
    const negativePromptPresets = document.getElementById('stsa_negative_prompt_presets');
    const appearance = document.getElementById('stsa_toast_appearance');
    const colors = document.getElementById('stsa_toast_theme_section');
    const debug = document.getElementById('stsa_debug_grant')?.closest('.stsa_debug');

    const createSection = (id, title, nodes) => {
        const section = document.createElement('div');
        section.className = 'stsa_section stsa_section_collapsed';
        section.dataset.section = id;
        section.innerHTML = `
            <button type="button" class="stsa_section_header">
                <span>${title}</span>
                <i class="fa-solid fa-chevron-down stsa_section_chevron"></i>
            </button>
            <div class="stsa_section_body"></div>
        `;
        const body = section.querySelector('.stsa_section_body');
        for (const node of nodes) {
            if (node) body.appendChild(node);
        }
        section.querySelector('.stsa_section_header')?.addEventListener('click', () => {
            section.classList.toggle('stsa_section_collapsed');
        });
        return section;
    };

    if (enabled) root.prepend(enabled);
    root.appendChild(createSection('core', uiText('section_core'), [grid, enforce, dedupe, toasts, glow]));
    root.appendChild(createSection('prompt', uiText('section_prompt'), [prompt, promptPresets, negativePrompt, negativePromptPresets]));
    root.appendChild(createSection('appearance', uiText('section_appearance'), [appearance, colors]));
    root.appendChild(createSection('debug', uiText('section_debug'), [debug]));
}

function renderSettings() {
    if (document.getElementById('stsa_root')) return;
    $('#extensions_settings').append(buildSettingsHtml());
    if (!document.getElementById('stsa_toast_glow')) {
        $('#stsa_toasts').closest('label').after(`
            <label class="checkbox_label">
                <input type="checkbox" id="stsa_toast_glow">
                <span>${escapeHtml(uiText('rarity_glow'))}</span>
            </label>
        `);
    }
    if (!document.getElementById('stsa_toast_appearance')) {
        $('#stsa_toast_glow').closest('label').after(`
            <div id="stsa_toast_appearance" class="stsa_debug">
                <div class="stsa_debug_title">${escapeHtml(uiText('toast_appearance'))}</div>
                <div class="stsa_grid">
                    <label>${escapeHtml(uiText('preset'))}
                        <select id="stsa_toast_preset" class="text_pole">
                            <option value="steam_compact">Steam Compact</option>
                            <option value="steam_classic">Steam Classic</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </label>
                    <label>${escapeHtml(uiText('toast_corner'))}
                        <select id="stsa_toast_corner" class="text_pole">
                            <option value="top_right">${escapeHtml(uiText('corner_top_right'))}</option>
                            <option value="top_left">${escapeHtml(uiText('corner_top_left'))}</option>
                            <option value="bottom_right">${escapeHtml(uiText('corner_bottom_right'))}</option>
                            <option value="bottom_left">${escapeHtml(uiText('corner_bottom_left'))}</option>
                        </select>
                    </label>
                    <label>${escapeHtml(uiText('scale'))}
                        <input id="stsa_toast_scale" class="text_pole" type="range" min="80" max="120" step="5">
                    </label>
                    <label>${escapeHtml(uiText('title_lines'))}
                        <input id="stsa_toast_title_lines" class="text_pole" type="number" min="1" max="3" step="1">
                    </label>
                    <label>${escapeHtml(uiText('description_lines'))}
                        <input id="stsa_toast_desc_lines" class="text_pole" type="number" min="1" max="4" step="1">
                    </label>
                </div>
                <label class="checkbox_label">
                    <input type="checkbox" id="stsa_toast_sharp">
                    <span>${escapeHtml(uiText('sharp_corners'))}</span>
                </label>
            </div>
        `);
    }
    if (!document.getElementById('stsa_toast_theme_section')) {
        $('#stsa_toast_appearance').after(`
            <div id="stsa_toast_theme_section" class="stsa_debug">
                <div class="stsa_debug_title">${escapeHtml(uiText('toast_theme_presets'))}</div>
                <div class="stsa_grid stsa_preset_grid">
                    <label>${escapeHtml(uiText('theme_preset'))}
                        <select id="stsa_toast_theme_preset" class="text_pole"></select>
                    </label>
                    <label>${escapeHtml(uiText('preset_name'))}
                        <input id="stsa_toast_theme_name" class="text_pole" type="text" maxlength="40" placeholder="${escapeHtml(uiText('preset_name_placeholder'))}">
                    </label>
                </div>
                <div id="stsa_toast_custom_colors" class="stsa_custom_colors">
                    <div class="stsa_color_row"><label>${escapeHtml(uiText('primary'))}</label><input type="color" id="stsa_color_primary"></div>
                    <div class="stsa_color_row"><label>${escapeHtml(uiText('secondary'))}</label><input type="color" id="stsa_color_secondary"></div>
                    <div class="stsa_color_row"><label>${escapeHtml(uiText('accent'))}</label><input type="color" id="stsa_color_accent"></div>
                    <div class="stsa_color_row"><label>${escapeHtml(uiText('text'))}</label><input type="color" id="stsa_color_text"></div>
                </div>
                <div class="stsa_debug_actions">
                    <button id="stsa_theme_new" class="menu_button">${escapeHtml(uiText('new_preset'))}</button>
                    <button id="stsa_theme_save" class="menu_button">${escapeHtml(uiText('save_changes'))}</button>
                    <button id="stsa_theme_delete" class="menu_button">${escapeHtml(uiText('delete_preset'))}</button>
                </div>
            </div>
        `);
    }
    if (!document.getElementById('stsa_prompt_presets')) {
        $('#stsa_prompt').closest('label').after(`
            <div id="stsa_prompt_presets" class="stsa_debug">
                <div class="stsa_debug_title">${escapeHtml(uiText('prompt_presets'))}</div>
                <div class="stsa_grid stsa_preset_grid">
                    <label>${escapeHtml(uiText('prompt_preset'))}
                        <select id="stsa_prompt_preset_select" class="text_pole"></select>
                    </label>
                    <label>${escapeHtml(uiText('preset_name'))}
                        <input id="stsa_prompt_preset_name" class="text_pole" type="text" maxlength="60" placeholder="${escapeHtml(uiText('preset_name_placeholder'))}">
                    </label>
                </div>
                <div class="stsa_debug_actions">
                    <button id="stsa_prompt_new" class="menu_button">${escapeHtml(uiText('new_preset'))}</button>
                    <button id="stsa_prompt_save" class="menu_button">${escapeHtml(uiText('save_changes'))}</button>
                    <button id="stsa_prompt_delete" class="menu_button">${escapeHtml(uiText('delete_preset'))}</button>
                </div>
            </div>
        `);
    }
    if (!document.getElementById('stsa_negative_prompt_presets')) {
        $('#stsa_negative_prompt').closest('label').after(`
            <div id="stsa_negative_prompt_presets" class="stsa_debug">
                <div class="stsa_debug_title">${escapeHtml(uiText('negative_prompt_presets'))}</div>
                <div class="stsa_grid stsa_preset_grid">
                    <label>${escapeHtml(uiText('negative_prompt_preset'))}
                        <select id="stsa_negative_prompt_preset_select" class="text_pole"></select>
                    </label>
                    <label>${escapeHtml(uiText('preset_name'))}
                        <input id="stsa_negative_prompt_preset_name" class="text_pole" type="text" maxlength="60" placeholder="${escapeHtml(uiText('preset_name_placeholder'))}">
                    </label>
                </div>
                <div class="stsa_debug_actions">
                    <button id="stsa_negative_prompt_new" class="menu_button">${escapeHtml(uiText('new_preset'))}</button>
                    <button id="stsa_negative_prompt_save" class="menu_button">${escapeHtml(uiText('save_changes'))}</button>
                    <button id="stsa_negative_prompt_delete" class="menu_button">${escapeHtml(uiText('delete_preset'))}</button>
                </div>
            </div>
        `);
    }
    buildCollapsibleSettingsSections();

    const settings = getSettings();
    const getThemePreset = () => settings.toastThemePresets.find((item) => item.id === settings.activeToastThemePresetId) || settings.toastThemePresets[0];
    const getPromptPreset = () => settings.promptPresets.find((item) => item.id === settings.activePromptPresetId) || settings.promptPresets[0];
    const getNegativePromptPreset = () => settings.negativePromptPresets.find((item) => item.id === settings.activeNegativePromptPresetId) || settings.negativePromptPresets[0];

    const fillThemePresetSelect = () => {
        const select = $('#stsa_toast_theme_preset');
        const options = settings.toastThemePresets.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
        select.html(options);
        select.val(settings.activeToastThemePresetId);
    };
    const syncThemePresetFields = () => {
        const preset = getThemePreset();
        if (!preset) return;
        $('#stsa_toast_theme_name').val(preset.name);
        $('#stsa_color_primary').val(preset.primary);
        $('#stsa_color_secondary').val(preset.secondary);
        $('#stsa_color_accent').val(preset.accent);
        $('#stsa_color_text').val(preset.text);
    };

    const fillPromptPresetSelect = () => {
        const select = $('#stsa_prompt_preset_select');
        const options = settings.promptPresets.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
        select.html(options);
        select.val(settings.activePromptPresetId);
    };
    const syncPromptPresetFields = () => {
        const preset = getPromptPreset();
        if (!preset) return;
        $('#stsa_prompt_preset_name').val(preset.name);
    };
    const fillNegativePromptPresetSelect = () => {
        const select = $('#stsa_negative_prompt_preset_select');
        const options = settings.negativePromptPresets.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
        select.html(options);
        select.val(settings.activeNegativePromptPresetId);
    };
    const syncNegativePromptPresetFields = () => {
        const preset = getNegativePromptPreset();
        if (!preset) return;
        $('#stsa_negative_prompt_preset_name').val(preset.name);
    };

    $('#stsa_enabled').prop('checked', settings.enabled);
    $('#stsa_cooldown').val(settings.cooldown);
    $('#stsa_depth').val(settings.injectDepth);
    $('#stsa_role').val(settings.injectRole);
    $(`input[name="stsa_inject_position"][value="${settings.injectPosition}"]`).prop('checked', true);
    $('#stsa_inject_interval').val(settings.injectInterval);
    $('#stsa_enforce_local_cooldown').prop('checked', settings.enforceLocalCooldown);
    $('#stsa_dedupe').prop('checked', settings.dedupeByName);
    $('#stsa_toasts').prop('checked', settings.showToasts);
    $('#stsa_toast_glow').prop('checked', settings.toastRarityGlow);
    $('#stsa_toast_corner').val(settings.toastCorner);
    $('#stsa_toast_preset').val(settings.toastPreset);
    $('#stsa_toast_scale').val(settings.toastScale);
    $('#stsa_toast_title_lines').val(settings.toastTitleLines);
    $('#stsa_toast_desc_lines').val(settings.toastDescLines);
    $('#stsa_toast_sharp').prop('checked', settings.toastSharpCorners);
    $('#stsa_prompt').val(settings.promptTemplate);
    $('#stsa_negative_prompt').val(settings.negativePromptTemplate);
    fillThemePresetSelect();
    syncThemePresetFields();
    fillPromptPresetSelect();
    syncPromptPresetFields();
    fillNegativePromptPresetSelect();
    syncNegativePromptPresetFields();
    refreshInjectCounter(getInjectState(settings.injectInterval), settings.injectInterval);

    $('#stsa_enabled').on('change', function() {
        settings.enabled = Boolean($(this).prop('checked'));
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_cooldown').on('input', function() {
        settings.cooldown = Math.max(1, Number($(this).val()) || 1);
        saveSettings();
        applyPromptInjection();
        scheduleRescan(false);
    });
    $('#stsa_depth').on('input', function() {
        settings.injectDepth = Math.max(0, Number($(this).val()) || 0);
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_role').on('change', function() {
        settings.injectRole = Number($(this).val());
        saveSettings();
        applyPromptInjection();
    });
    $('input[name="stsa_inject_position"]').on('change', function() {
        settings.injectPosition = Number($(this).val());
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_inject_interval').on('input', function() {
        settings.injectInterval = Math.max(0, Number($(this).val()) || 0);
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_enforce_local_cooldown').on('change', function() {
        settings.enforceLocalCooldown = Boolean($(this).prop('checked'));
        saveSettings();
        scheduleRescan(false);
    });
    $('#stsa_dedupe').on('change', function() {
        settings.dedupeByName = Boolean($(this).prop('checked'));
        saveSettings();
        scheduleRescan(false);
    });
    $('#stsa_toasts').on('change', function() {
        settings.showToasts = Boolean($(this).prop('checked'));
        saveSettings();
    });
    $('#stsa_toast_glow').on('change', function() {
        settings.toastRarityGlow = Boolean($(this).prop('checked'));
        saveSettings();
    });
    $('#stsa_toast_corner').on('change', function() {
        settings.toastCorner = String($(this).val() || 'top_right');
        saveSettings();
        getToastContainer();
    });
    $('#stsa_toast_preset').on('change', function() {
        settings.toastPreset = String($(this).val() || 'steam_compact');
        saveSettings();
    });
    $('#stsa_toast_scale').on('input', function() {
        settings.toastScale = Math.min(120, Math.max(80, Number($(this).val()) || 100));
        saveSettings();
    });
    $('#stsa_toast_title_lines').on('input', function() {
        settings.toastTitleLines = Math.min(3, Math.max(1, Number($(this).val()) || 1));
        saveSettings();
    });
    $('#stsa_toast_desc_lines').on('input', function() {
        settings.toastDescLines = Math.min(4, Math.max(1, Number($(this).val()) || 2));
        saveSettings();
    });
    $('#stsa_toast_sharp').on('change', function() {
        settings.toastSharpCorners = Boolean($(this).prop('checked'));
        saveSettings();
    });
    $('#stsa_prompt').on('input', function() {
        settings.promptTemplate = String($(this).val() || '');
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_negative_prompt').on('input', function() {
        settings.negativePromptTemplate = String($(this).val() || '');
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_toast_theme_preset').on('change', function() {
        settings.activeToastThemePresetId = String($(this).val() || '');
        const active = getThemePreset();
        if (active) settings.activeToastThemePresetId = active.id;
        syncThemePresetFields();
        saveSettings();
    });

    $('#stsa_theme_new').on('click', function() {
        const source = getThemePreset() || defaultSettings.toastThemePresets[0];
        const name = normalizeText($('#stsa_toast_theme_name').val()) || uiText('new_theme_default');
        const created = normalizeThemePreset({
            id: makePresetId('theme', name),
            name,
            primary: source?.primary,
            secondary: source?.secondary,
            accent: source?.accent,
            text: source?.text,
        }, 'theme');
        settings.toastThemePresets.push(created);
        settings.activeToastThemePresetId = created.id;
        fillThemePresetSelect();
        syncThemePresetFields();
        saveSettings();
    });

    $('#stsa_theme_save').on('click', function() {
        const active = getThemePreset();
        if (!active) return;
        active.name = normalizeText($('#stsa_toast_theme_name').val()) || active.name;
        active.primary = normalizeColorHex($('#stsa_color_primary').val(), active.primary);
        active.secondary = normalizeColorHex($('#stsa_color_secondary').val(), active.secondary);
        active.accent = normalizeColorHex($('#stsa_color_accent').val(), active.accent);
        active.text = normalizeColorHex($('#stsa_color_text').val(), active.text);
        fillThemePresetSelect();
        syncThemePresetFields();
        saveSettings();
    });

    $('#stsa_theme_delete').on('click', function() {
        if (settings.toastThemePresets.length <= 1) {
            toastr.warning(uiText('warning_keep_one_theme'));
            return;
        }
        const activeId = settings.activeToastThemePresetId;
        settings.toastThemePresets = settings.toastThemePresets.filter((item) => item.id !== activeId);
        settings.activeToastThemePresetId = settings.toastThemePresets[0]?.id;
        fillThemePresetSelect();
        syncThemePresetFields();
        saveSettings();
    });

    $('#stsa_prompt_preset_select').on('change', function() {
        settings.activePromptPresetId = String($(this).val() || '');
        const active = getPromptPreset();
        if (!active) return;
        settings.activePromptPresetId = active.id;
        settings.promptTemplate = active.template;
        $('#stsa_prompt').val(settings.promptTemplate);
        syncPromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_prompt_new').on('click', function() {
        const name = normalizeText($('#stsa_prompt_preset_name').val()) || uiText('new_prompt_default');
        const created = normalizePromptPreset({
            id: makePresetId('prompt', name),
            name,
            template: String($('#stsa_prompt').val() || ''),
        }, 'prompt');
        settings.promptPresets.push(created);
        settings.activePromptPresetId = created.id;
        fillPromptPresetSelect();
        syncPromptPresetFields();
        saveSettings();
    });

    $('#stsa_prompt_save').on('click', function() {
        const active = getPromptPreset();
        if (!active) return;
        active.name = normalizeText($('#stsa_prompt_preset_name').val()) || active.name;
        active.template = String($('#stsa_prompt').val() || '');
        settings.promptTemplate = active.template;
        fillPromptPresetSelect();
        syncPromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_prompt_delete').on('click', function() {
        if (settings.promptPresets.length <= 1) {
            toastr.warning(uiText('warning_keep_one_prompt'));
            return;
        }
        const activeId = settings.activePromptPresetId;
        settings.promptPresets = settings.promptPresets.filter((item) => item.id !== activeId);
        settings.activePromptPresetId = settings.promptPresets[0]?.id;
        const active = getPromptPreset();
        settings.promptTemplate = active?.template || settings.promptTemplate;
        $('#stsa_prompt').val(settings.promptTemplate);
        fillPromptPresetSelect();
        syncPromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_negative_prompt_preset_select').on('change', function() {
        settings.activeNegativePromptPresetId = String($(this).val() || '');
        const active = getNegativePromptPreset();
        if (!active) return;
        settings.activeNegativePromptPresetId = active.id;
        settings.negativePromptTemplate = active.template;
        $('#stsa_negative_prompt').val(settings.negativePromptTemplate);
        syncNegativePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_negative_prompt_new').on('click', function() {
        const name = normalizeText($('#stsa_negative_prompt_preset_name').val()) || uiText('new_negative_prompt_default');
        const created = normalizePromptPreset({
            id: makePresetId('negative_prompt', name),
            name,
            template: String($('#stsa_negative_prompt').val() || ''),
        }, 'negative_prompt');
        settings.negativePromptPresets.push(created);
        settings.activeNegativePromptPresetId = created.id;
        fillNegativePromptPresetSelect();
        syncNegativePromptPresetFields();
        saveSettings();
    });

    $('#stsa_negative_prompt_save').on('click', function() {
        const active = getNegativePromptPreset();
        if (!active) return;
        active.name = normalizeText($('#stsa_negative_prompt_preset_name').val()) || active.name;
        active.template = String($('#stsa_negative_prompt').val() || '');
        settings.negativePromptTemplate = active.template;
        fillNegativePromptPresetSelect();
        syncNegativePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_negative_prompt_delete').on('click', function() {
        if (settings.negativePromptPresets.length <= 1) {
            toastr.warning(uiText('warning_keep_one_prompt'));
            return;
        }
        const activeId = settings.activeNegativePromptPresetId;
        settings.negativePromptPresets = settings.negativePromptPresets.filter((item) => item.id !== activeId);
        settings.activeNegativePromptPresetId = settings.negativePromptPresets[0]?.id;
        const active = getNegativePromptPreset();
        settings.negativePromptTemplate = active?.template || settings.negativePromptTemplate;
        $('#stsa_negative_prompt').val(settings.negativePromptTemplate);
        fillNegativePromptPresetSelect();
        syncNegativePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });

    $('#stsa_debug_grant').on('click', grantDebugAchievement);
    $('#stsa_debug_remove_last').on('click', removeLastAchievement);
    $('#stsa_debug_open_modal').on('click', openModal);
}

function onChatChanged() {
    applyPromptInjection();
    lastScannedIds = new Set();
    pendingRescanNotify = false;
    scheduleRescan(false);
    scheduleHideMarkers();
}

function onMessageEvent(notify = false) {
    applyPromptInjection();
    scheduleRescan(notify);
    scheduleHideMarkers();
}

function init() {
    getSettings();
    renderSettings();
    ensureFloatingButton();
    ensurePanel();
    ensureHideObserver();
    applyPromptInjection();
    scheduleRescan(false);
    scheduleHideMarkers();

    eventSource.on(event_types.CHAT_CHANGED, onChatChanged);
    eventSource.on(event_types.GENERATION_STARTED, applyPromptInjection);

    eventSource.on(event_types.MESSAGE_RECEIVED, () => onMessageEvent(true));
    eventSource.on(event_types.MESSAGE_SWIPED, () => onMessageEvent(false));
    eventSource.on(event_types.MESSAGE_EDITED, () => onMessageEvent(false));
    eventSource.on(event_types.MESSAGE_UPDATED, () => onMessageEvent(false));
    eventSource.on(event_types.MESSAGE_DELETED, () => onMessageEvent(false));
    eventSource.on(event_types.MESSAGE_SWIPE_DELETED, () => onMessageEvent(false));
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, () => onMessageEvent(false));

    setTimeout(() => {
        onChatChanged();
    }, 250);

    console.log(`[${MODULE_NAME}] loaded`);
}

jQuery(() => {
    init();
});

