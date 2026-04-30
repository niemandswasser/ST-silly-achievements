import {
    extension_prompt_types,
    extension_prompt_roles,
} from '../../../../../script.js';
import { getCurrentLocale } from '../../../../i18n.js';
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
        show_floating_button: 'Показывать плавающую кнопку',
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
        show_floating_button: 'Show floating button',
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
    showFloatingButton: true,
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

export {
    MODULE_NAME,
    PROMPT_KEY,
    META_KEY,
    UI_TEXT,
    MARKER_REGEX,
    MARKER_REGEX_GLOBAL,
    MARKER_HIDE_REGEX_GLOBAL,
    DEFAULT_PROMPT_RU,
    DEFAULT_PROMPT_EN,
    DEFAULT_NEGATIVE_PROMPT_RU,
    DEFAULT_NEGATIVE_PROMPT_EN,
    defaultSettings,
    rarityMeta,
    TOAST_THEMES,
    getUiLang,
    uiText,
    createDefaultPromptPresets,
    createDefaultNegativePromptPresets,
    createDefaultThemePresets,
    getContext,
    makePresetId,
    normalizeColorHex,
    normalizeThemePreset,
    normalizePromptPreset,
    ensureUniquePresetIds,
};
