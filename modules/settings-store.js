import {
    saveSettingsDebounced,
    extension_prompt_types,
    extension_prompt_roles,
} from '../../../../../script.js';
import { extension_settings } from '../../../../extensions.js';
import {
    MODULE_NAME,
    META_KEY,
    defaultSettings,
    DEFAULT_PROMPT_RU,
    DEFAULT_PROMPT_EN,
    DEFAULT_NEGATIVE_PROMPT_RU,
    DEFAULT_NEGATIVE_PROMPT_EN,
    TOAST_THEMES,
    getUiLang,
    normalizeThemePreset,
    normalizePromptPreset,
    ensureUniquePresetIds,
    createDefaultPromptPresets,
    createDefaultNegativePromptPresets,
    createDefaultThemePresets,
    getContext,
} from './config.js';
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
export {
    getSettings,
    saveSettings,
    ensureChatStore,
    persistChat,
};
