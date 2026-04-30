import {
    eventSource,
    event_types,
    extension_prompt_types,
    extension_prompt_roles,
    setExtensionPrompt,
    saveSettingsDebounced,
    getRequestHeaders,
} from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { getCurrentLocale } from '../../../i18n.js';
import { normalizeText, escapeHtml, hashString } from './modules/text-utils.js';
import { getToastContainer as getToastContainerModule, showToast as showToastModule } from './modules/toast-ui.js';
import {
    parseMarkerFromMessage as parseMarkerFromMessageModule,
    getInjectState as getInjectStateModule,
    refreshInjectCounter as refreshInjectCounterModule,
    getAchievementCooldownInfo as getAchievementCooldownInfoModule,
    cooldownThreshold as cooldownThresholdModule,
    applyTemplateVars as applyTemplateVarsModule,
    getDefaultNegativePromptForLocale as getDefaultNegativePromptForLocaleModule,
    buildScannedAchievements as buildScannedAchievementsModule,
    hideAchievementMarkersInDOM as hideAchievementMarkersInDOMModule,
} from './modules/achievement-logic.js';
import {
    normalizeBaseUrl,
    fetchQuickApiModels,
    checkQuickApiConnection,
    getConnectionProfiles,
    getConnectionProfile,
    isConnectionProfileSupported,
    postQuickApiChatCompletions,
    extractTextFromApiResponse,
    sendWithConnectionProfile,
} from './modules/external-api.js';

const MODULE_NAME = 'ST-silly-achievements';
const ACHIEVEMENT_SOUND_URL = new URL('./steam-achievement.mp3', import.meta.url).href;
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
        cooldown_messages: 'Фиксированный кулдаун',
        cooldown_mode: 'Кулдаун',
        cooldown_off: 'Без кулдауна',
        cooldown_fixed: 'Фиксированный',
        cooldown_floating: 'Плавающий',
        cooldown_min: 'От сообщений',
        cooldown_max: 'До сообщений',
        use_cooldown: 'Включить кулдаун',
        inject_depth: 'Глубина инжекта',
        inject_role: 'Роль инжекта',
        inject_position: 'Позиция инжекта',
        inject_before_prompt: 'Перед промптом',
        inject_after_prompt: 'После промпта',
        inject_at_depth: 'Вставка на глубину',
        inject_frequency: 'Частота вставки',
        inject_messages_until: 'Ваших сообщений до след. вставки: {count}',
        inject_messages_disabled: 'Ваших сообщений до след. вставки: (выключено)',
        cooldown_left: 'До кулдауна: {count} сообщений',
        cooldown_left_floating: 'Плавающий кулдаун: {count} сообщений до готовности (цель: {target})',
        cooldown_last_ago: 'Последняя ачивка была {count} сообщений назад',
        cooldown_no_achievements: 'Ачивок пока не было',
        cooldown_disabled: 'Кулдаун отключен',
        cooldown_ready: 'Кулдаун пройден: можно выдавать ачивку',
        enforce_local_cooldown: 'Локально ограничивать частоту наград',
        dedupe_exact: 'Не выдавать точные дубликаты',
        show_toasts: 'Показывать Steam-like уведомления',
        achievement_sound: 'Звук при выдаче ачивки',
        achievement_sound_volume: 'Громкость звука',
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
        debug_verbose: 'Подробные логи в консоль',
        debug_dump: 'Сбросить дамп в консоль',
        debug_status: 'Статус диагностики',
        section_core: 'Выдача',
        section_prompt: 'Промпты режимов',
        section_injection: 'Инжект в контекст',
        section_prepared: 'Заготовки',
        section_notifications: 'Уведомления',
        section_appearance: 'Внешний вид',
        section_advanced: 'Дополнительно',
        section_debug: 'Отладка',
        fallback_prompts: 'Запасные промпты',
        prepared_tools: 'Управление заготовками',
        open_prepared_panel: 'Открыть заготовки',
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
        prepared_title: 'Заготовленные ачивки',
        prepared_manage: 'Заготовки',
        prepared_empty: 'Пока нет заготовленных ачивок.',
        prepared_add: 'Добавить заготовку',
        prepared_clear: 'Очистить заготовки',
        confirm_prepared_clear: 'Удалить все заготовленные ачивки текущего чата?',
        prepared_status_available: 'доступна',
        prepared_status_earned: 'получена',
        prepared_auto_collect: 'Автодобавлять выданные ИИ ачивки в заготовки',
        achievement_mode: 'Режим выдачи ачивок',
        mode_prepared_only: 'Только заготовленные',
        mode_hybrid: 'Заготовленные + креатив ИИ',
        mode_creative_only: 'Только креатив ИИ',
        mode_inject_presets: 'Пресеты инжекта режимов',
        mode_inject_preset: 'Пресет режима',
        mode_prompt_prepared_only: 'Инжект: только заготовленные',
        mode_prompt_hybrid: 'Инжект: гибрид',
        mode_prompt_creative_only: 'Инжект: только креатив',
        external_api_title: 'ИИ-создание заготовок',
        external_api_source: 'Источник ИИ',
        external_api_disabled: 'Выключен',
        external_api_quick: 'Quick API (OpenAI-совместимый)',
        external_api_profile: 'Профиль ST Connection Manager',
        external_api_endpoint_preset: 'Пресет эндпоинта',
        external_api_url: 'URL API (base)',
        external_api_key: 'API ключ',
        external_api_model: 'Модель',
        external_api_model_manual: 'Модель вручную',
        external_api_profile_name: 'Профиль подключения',
        external_api_refresh_profiles: 'Обновить профили',
        external_api_fetch_models: 'Загрузить модели',
        external_api_check: 'Проверить',
        external_api_status_off: 'Внешний API отключен',
        external_api_status_ok: 'Подключение успешно',
        external_api_status_need_url: 'Укажите URL API',
        external_api_status_need_model: 'Укажите модель',
        external_api_status_need_profile: 'Выберите профиль подключения',
        external_api_status_profile_missing: 'Профиль не найден',
        external_api_status_profile_unsupported: 'Тип API профиля не поддерживается',
        prepared_generate_title: 'Создать заготовки через ИИ',
        prepared_generate_count: 'Сколько создать',
        prepared_generate_lang: 'Язык промпта',
        prepared_generate_lang_auto: 'Авто',
        prepared_generate_lang_ru: 'Русский',
        prepared_generate_lang_en: 'English',
        prepared_generate_events: 'Добавлять последние события из чата',
        prepared_generate_recent_count: 'Последних сообщений',
        prepared_generate_button: 'Создать заготовки',
        prepared_generate_prompt_ru: 'Промпт генерации (RU)',
        prepared_generate_prompt_en: 'Промпт генерации (EN)',
        prepared_generate_result: 'Добавлено: {added}, пропущено дублей: {skipped}',
        prepared_generate_no_source: 'Сначала выбери источник ИИ в настройках заготовок',
        prepared_generate_invalid_json: 'Модель вернула невалидный JSON',
        prepared_generate_empty: 'Модель вернула пустой список',
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
        cooldown_messages: 'Fixed cooldown',
        cooldown_mode: 'Cooldown',
        cooldown_off: 'No cooldown',
        cooldown_fixed: 'Fixed',
        cooldown_floating: 'Floating',
        cooldown_min: 'From messages',
        cooldown_max: 'To messages',
        use_cooldown: 'Enable cooldown',
        inject_depth: 'Injection depth',
        inject_role: 'Injection role',
        inject_position: 'Injection position',
        inject_before_prompt: 'Before prompt',
        inject_after_prompt: 'After prompt',
        inject_at_depth: 'At depth',
        inject_frequency: 'Insertion frequency',
        inject_messages_until: 'Your messages till next insertion: {count}',
        inject_messages_disabled: 'Your messages till next insertion: (disabled)',
        cooldown_left: 'Until cooldown ends: {count} messages',
        cooldown_left_floating: 'Floating cooldown: {count} messages until ready (target: {target})',
        cooldown_last_ago: 'Last achievement was {count} messages ago',
        cooldown_no_achievements: 'No achievements yet',
        cooldown_disabled: 'Cooldown disabled',
        cooldown_ready: 'Cooldown passed: achievement may be issued',
        enforce_local_cooldown: 'Enforce local reward cooldown',
        dedupe_exact: 'Do not issue exact duplicates',
        show_toasts: 'Show Steam-like notifications',
        achievement_sound: 'Achievement sound',
        achievement_sound_volume: 'Sound volume',
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
        debug_verbose: 'Verbose console logs',
        debug_dump: 'Dump state to console',
        debug_status: 'Debug status',
        section_core: 'Awards',
        section_prompt: 'Mode prompts',
        section_injection: 'Context injection',
        section_prepared: 'Prepared',
        section_notifications: 'Notifications',
        section_appearance: 'Appearance',
        section_advanced: 'Advanced',
        section_debug: 'Debug',
        fallback_prompts: 'Fallback prompts',
        prepared_tools: 'Prepared tools',
        open_prepared_panel: 'Open prepared',
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
        prepared_title: 'Prepared achievements',
        prepared_manage: 'Prepared',
        prepared_empty: 'No prepared achievements yet.',
        prepared_add: 'Add prepared',
        prepared_clear: 'Clear prepared',
        confirm_prepared_clear: 'Delete all prepared achievements in this chat?',
        prepared_status_available: 'available',
        prepared_status_earned: 'earned',
        prepared_auto_collect: 'Auto-add AI-granted achievements to prepared',
        achievement_mode: 'Achievement mode',
        mode_prepared_only: 'Prepared only',
        mode_hybrid: 'Prepared + AI creative',
        mode_creative_only: 'AI creative only',
        mode_inject_presets: 'Mode inject presets',
        mode_inject_preset: 'Mode preset',
        mode_prompt_prepared_only: 'Inject: prepared only',
        mode_prompt_hybrid: 'Inject: hybrid',
        mode_prompt_creative_only: 'Inject: creative only',
        external_api_title: 'AI prepared creation',
        external_api_source: 'AI source',
        external_api_disabled: 'Disabled',
        external_api_quick: 'Quick API (OpenAI-compatible)',
        external_api_profile: 'ST Connection Manager profile',
        external_api_endpoint_preset: 'Endpoint preset',
        external_api_url: 'API URL (base)',
        external_api_key: 'API key',
        external_api_model: 'Model',
        external_api_model_manual: 'Model manual',
        external_api_profile_name: 'Connection profile',
        external_api_refresh_profiles: 'Refresh profiles',
        external_api_fetch_models: 'Fetch models',
        external_api_check: 'Check',
        external_api_status_off: 'External API is disabled',
        external_api_status_ok: 'Connection is OK',
        external_api_status_need_url: 'Provide API URL',
        external_api_status_need_model: 'Provide model',
        external_api_status_need_profile: 'Select a connection profile',
        external_api_status_profile_missing: 'Profile not found',
        external_api_status_profile_unsupported: 'Profile API type is not supported',
        prepared_generate_title: 'Create prepared with AI',
        prepared_generate_count: 'How many',
        prepared_generate_lang: 'Prompt language',
        prepared_generate_lang_auto: 'Auto',
        prepared_generate_lang_ru: 'Russian',
        prepared_generate_lang_en: 'English',
        prepared_generate_events: 'Include recent chat events',
        prepared_generate_recent_count: 'Recent messages',
        prepared_generate_button: 'Create prepared',
        prepared_generate_prompt_ru: 'Generation prompt (RU)',
        prepared_generate_prompt_en: 'Generation prompt (EN)',
        prepared_generate_result: 'Added: {added}, skipped duplicates: {skipped}',
        prepared_generate_no_source: 'Choose an AI source in prepared settings first',
        prepared_generate_invalid_json: 'Model returned invalid JSON',
        prepared_generate_empty: 'Model returned an empty list',
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
    cooldownMode: 'fixed',
    cooldownMin: 4,
    cooldownMax: 9,
    useCooldown: true,
    injectPosition: extension_prompt_types.IN_CHAT,
    injectDepth: 4,
    injectRole: extension_prompt_roles.SYSTEM,
    injectInterval: 1,
    enforceLocalCooldown: true,
    dedupeByName: true,
    achievementMode: 'hybrid',
    modePromptPreparedOnly: '',
    modePromptHybrid: '',
    modePromptCreativeOnly: '',
    modePromptPresets: [],
    activeModePromptPresetIds: {
        prepared_only: '',
        hybrid: '',
        creative_only: '',
    },
    modePromptSchemaVersion: 1,
    externalApiSource: 'disabled',
    externalQuickApiEndpointPreset: 'custom',
    externalQuickApiUrl: '',
    externalQuickApiKey: '',
    externalQuickApiModel: '',
    externalQuickApiModelOptions: [],
    externalConnectionProfile: '',
    preparedGenLang: 'auto',
    preparedGenCount: 12,
    preparedGenIncludeRecentEvents: true,
    preparedGenRecentMessages: 8,
    preparedGenPromptRu: '',
    preparedGenPromptEn: '',
    autoCollectPreparedFromAi: false,
    autoCollectPreparedDefaultVersion: 2,
    debugVerbose: false,
    showToasts: true,
    achievementSoundEnabled: true,
    achievementSoundVolume: 70,
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

const EXTERNAL_API_ENDPOINT_PRESETS = [
    { id: 'custom', name: 'Custom', url: '' },
    { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com/v1' },
    { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
    { id: 'groq', name: 'Groq', url: 'https://api.groq.com/openai/v1' },
    { id: 'deepseek', name: 'DeepSeek', url: 'https://api.deepseek.com/v1' },
];

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
В конце своего ответа ты МОЖЕШЬ (но не обязан!) выдать ачивку для {{user}}, если в сцене произошло что-то реально достойное отметки, например:
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
At the end of your reply, you MAY (but are not obligated to!) issue an achievement for {{user}} if something truly worth marking happened in the scene, for example:
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

const DEFAULT_MODE_PROMPT_PREPARED_ONLY_RU = `<achievement_sys>
В конце своего ответа ты МОЖЕШЬ (но не обязан!) выдать ачивку для {{user}}, если в сцене произошло что-то реально достойное отметки, например:
— Неожиданный сюжетный поворот
— Эмоциональный пик / катарсис
— Острая мастерская реплика юзера
— Безумный/героический/смешной поступок
— Раскрытие важной правды, поворотное решение
— Момент, который запомнится

ФОРМАТ - строго на отдельной строке в самом конце ответа, после всего текста:
[ACHIEVEMENT: эмодзи | Название | Краткое описание (1 предложение) | редкость]

РЕЖИМ: ТОЛЬКО ЗАГОТОВЛЕННЫЕ АЧИВКИ.
Разрешено выдать только одну ачивку ИСКЛЮЧИТЕЛЬНО из списка ниже, без изменений.
{{prepared_list}}

Если подходящей нет — не выдавай ачивку ВОВСЕ.

Доступные редкости (используй строго эти, не придумывай новые):
- common - мелкие забавные/милые моменты
- rare - заметные сюжетные/эмоциональные события
- epic - крупные повороты, мастерство юзера
- legendary - нечто исключительное (раз в десятки часов чата)

ПРАВИЛА:
- Не выдавай чаще чем раз в {{cooldown}} сообщений. Лучше промолчать, чем выдать ради выдачи.
- Не пиши маркер если ничего реально не произошло.
- Только ОДНА ачивка за ответ.
- Маркер пишется отдельной строкой и потом скрывается из чата — не упоминай ачивку в самом тексте ответа.

Пример: [ACHIEVEMENT: 💀 | Без права на ошибку | Прошёл сцену один на один с боссом и не дрогнул | epic]
</achievement_sys>`;

const DEFAULT_MODE_PROMPT_HYBRID_RU = `<achievement_sys>
В конце своего ответа ты МОЖЕШЬ (но не обязан!) выдать ачивку для {{user}}, если в сцене произошло что-то реально достойное отметки, например:
— Неожиданный сюжетный поворот
— Эмоциональный пик / катарсис
— Острая мастерская реплика юзера
— Безумный/героический/смешной поступок
— Раскрытие важной правды, поворотное решение
— Момент, который запомнится

Верни ответ в таком формате:
[ACHIEVEMENT: эмодзи | Название | Краткое описание (1 предложение) | редкость]

РЕЖИМ: ЗАГОТОВЛЕННЫЕ + КРЕАТИВ ИИ.
Приоритет: сначала используй заготовку из списка ниже.
{{prepared_list}}
Если в сцене произошло что-то крутое, что нужно отметить, но ачивки из списка не подходят, придумай новую.

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

const DEFAULT_MODE_PROMPT_CREATIVE_ONLY_RU = DEFAULT_PROMPT_RU;

const DEFAULT_MODE_PROMPT_PREPARED_ONLY_EN = `<achievement_sys>
At the end of your reply, you MAY (but are not obligated to!) issue an achievement for {{user}} if something truly worth marking happened in the scene, for example:
— An unexpected plot twist
— An emotional peak / catharsis
— A sharp, masterful line from the user
— A crazy/heroic/funny act
— The revelation of an important truth, a pivotal decision
— A moment that will be remembered

FORMAT - strictly on a separate line at the very end of the reply, after all text:
[ACHIEVEMENT: emoji | Title | Short description (1 sentence) | rarity]

MODE: PREPARED ACHIEVEMENTS ONLY.
You may issue only one achievement EXCLUSIVELY from the list below, unchanged.
{{prepared_list}}

If none fit, DO NOT issue an achievement AT ALL.

Available rarities (use strictly these, do not invent new ones):
- common - minor funny/cute moments
- rare - notable plot/emotional events
- epic - major twists, user mastery
- legendary - something exceptional (once in dozens of chat hours)

RULES:
- Do not issue more often than once every {{cooldown}} messages. Better to stay silent than to issue one just for the sake of it.
- Do not write the marker if nothing truly happened.
- Only ONE achievement per reply.
- The marker is written on a separate line and then hidden from the chat — do not mention the achievement in the reply text itself.

Example: [ACHIEVEMENT: 💀 | No Room for Error | Cleared the scene one-on-one with the boss without flinching | epic]
</achievement_sys>`;

const DEFAULT_MODE_PROMPT_HYBRID_EN = `<achievement_sys>
At the end of your reply, you MAY (but are not obligated to!) issue an achievement for {{user}} if something truly worth marking happened in the scene, for example:
— An unexpected plot twist
— An emotional peak / catharsis
— A sharp, masterful line from the user
— A crazy/heroic/funny act
— The revelation of an important truth, a pivotal decision
— A moment that will be remembered

Return the achievement in this format:
[ACHIEVEMENT: emoji | Title | Short description (1 sentence) | rarity]

MODE: PREPARED + AI CREATIVE.
Priority: first use a prepared achievement from the list below.
{{prepared_list}}
If something cool happened in the scene and should be marked, but none of the listed achievements fit, create a new one.

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

const DEFAULT_MODE_PROMPT_CREATIVE_ONLY_EN = DEFAULT_PROMPT_EN;

const DEFAULT_PREPARED_GENERATION_PROMPT_RU = `Твоя задача: сгенерировать список заготовленных ачивок для ролевого чата.

ЗАДАЧА:
Создай {{count}} уникальных ачивок в стиле Steam.
Ачивки должны быть разнообразными по тону и ситуации и учитывать контекст. Ты можешь выдавать ачивки за:
- сюжетные повороты
- эмоциональные пики
- социальные/романтические моменты
- риск/бой/экшен
- хитрые решения
- мемные/смешные эпизоды

ФОРМАТ ОТВЕТА:
Верни ТОЛЬКО JSON-массив, без пояснений и markdown:
[
  {
    "emoji": "🏆",
    "title": "Короткое название",
    "description": "Кратко, что именно произошло.",
    "rarity": "rarity"
  }
]

ЖЕСТКИЕ ПРАВИЛА:
- Ровно {{count}} объектов в массиве.
- Поля строго: emoji, title, description, rarity.
- rarity только из: common, rare, epic, legendary. Не выдумывай новые.
- emoji: ровно один эмодзи, подходящий под контекст.
- title: 2-6 слов, без кавычек внутри.
- description: 1 короткое предложение, конкретное событие, Steam-like.
- Без повторов title и без смысловых дублей.
- Баланс редкостей:
  - common: 45-55%
  - rare: 25-35%
  - epic: 10-20%
  - legendary: 3-8%

КОНТЕКСТ ДЛЯ АДАПТАЦИИ (если есть):
Начало ролевой игры:
{{rp_start}}

Произошедшие события:
{{recent_events}}

Персонажи:
{{characters}}`;

const DEFAULT_PREPARED_GENERATION_PROMPT_EN = `Your task: generate a list of prepared achievements for an RP chat.

TASK:
Create {{count}} unique Steam-style achievements.
Achievements must be diverse in tone and situation and should use context. You may issue achievements for:
- plot twists
- emotional peaks
- social/romantic moments
- risk/combat/action
- clever decisions
- meme/funny episodes

OUTPUT FORMAT:
Return ONLY a JSON array, with no explanations and no markdown:
[
  {
    "emoji": "🏆",
    "title": "Short title",
    "description": "Briefly what happened.",
    "rarity": "rarity"
  }
]

STRICT RULES:
- Exactly {{count}} objects in the array.
- Strict fields: emoji, title, description, rarity.
- rarity must be only one of: common, rare, epic, legendary.
- emoji: exactly one emoji, fitting the context.
- title: 2-6 words, no inner quotes.
- description: one short sentence, concrete event, Steam-like.
- No duplicate titles and no semantic duplicates.
- Rarity balance:
  - common: 45-55%
  - rare: 25-35%
  - epic: 10-20%
  - legendary: 3-8%

CONTEXT (if available):
RP beginning:
{{rp_start}}

Recent events:
{{recent_events}}

Characters:
{{characters}}`;

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

function getDefaultModePromptsForLocale() {
    if (getUiLang() === 'ru') {
        return {
            preparedOnly: DEFAULT_MODE_PROMPT_PREPARED_ONLY_RU,
            hybrid: DEFAULT_MODE_PROMPT_HYBRID_RU,
            creativeOnly: DEFAULT_MODE_PROMPT_CREATIVE_ONLY_RU,
        };
    }
    return {
        preparedOnly: DEFAULT_MODE_PROMPT_PREPARED_ONLY_EN,
        hybrid: DEFAULT_MODE_PROMPT_HYBRID_EN,
        creativeOnly: DEFAULT_MODE_PROMPT_CREATIVE_ONLY_EN,
    };
}

function createDefaultModePromptPresets() {
    return [
        { id: 'mode_prepared_only_ru', mode: 'prepared_only', name: 'RU: Только заготовленные', template: DEFAULT_MODE_PROMPT_PREPARED_ONLY_RU },
        { id: 'mode_hybrid_ru', mode: 'hybrid', name: 'RU: Гибрид', template: DEFAULT_MODE_PROMPT_HYBRID_RU },
        { id: 'mode_creative_only_ru', mode: 'creative_only', name: 'RU: Только креатив', template: DEFAULT_MODE_PROMPT_CREATIVE_ONLY_RU },
        { id: 'mode_prepared_only_en', mode: 'prepared_only', name: 'EN: Prepared only', template: DEFAULT_MODE_PROMPT_PREPARED_ONLY_EN },
        { id: 'mode_hybrid_en', mode: 'hybrid', name: 'EN: Hybrid', template: DEFAULT_MODE_PROMPT_HYBRID_EN },
        { id: 'mode_creative_only_en', mode: 'creative_only', name: 'EN: Creative only', template: DEFAULT_MODE_PROMPT_CREATIVE_ONLY_EN },
    ];
}

function normalizeModePromptPreset(input, fallbackId = 'mode_prompt') {
    const source = input || {};
    const mode = String(source.mode || 'hybrid');
    const safeMode = ['prepared_only', 'hybrid', 'creative_only'].includes(mode) ? mode : 'hybrid';
    return {
        id: normalizeText(source.id) || makePresetId('mode_prompt', fallbackId),
        mode: safeMode,
        name: normalizeText(source.name) || uiText('mode_inject_preset'),
        template: String(source.template || ''),
    };
}

let scannedAchievements = [];
let lastScannedIds = new Set();
let rescanTimer = null;
let hideTimer = null;
let hideObserver = null;
let suppressFabClickUntil = 0;
let pendingRescanNotify = false;
let panelOutsideClickHandler = null;
const runtimeDebug = {
    lastInjection: null,
    lastRescan: null,
    lastMarker: null,
    lastScanDiagnostics: null,
};

function getContext() {
    return SillyTavern.getContext();
}

function debugLog(event, payload = {}) {
    const settings = getSettings();
    if (!settings.debugVerbose) return;
    console.debug(`[${MODULE_NAME}] ${event}`, payload);
}

function buildDebugStatusText() {
    const inj = runtimeDebug.lastInjection || {};
    const rescan = runtimeDebug.lastRescan || {};
    const marker = runtimeDebug.lastMarker || {};
    const scanDiag = runtimeDebug.lastScanDiagnostics || {};
    const parts = [
        `mode=${inj.mode || '?'}`,
        `inject=${inj.injectState || '?'}`,
        `prepared=${inj.preparedAvailable ?? '?'}/${inj.preparedTotal ?? '?'}`,
        `cooldown_remaining=${inj.cooldownRemaining ?? '?'}`,
        `prompt=${inj.promptType || '?'}`,
        `parsed_marker=${marker.found ? 'yes' : 'no'}`,
        `scanned=${rescan.scanned ?? '?'}`,
        `new_scanned=${rescan.newScanned ?? '?'}`,
        `parsed_total=${scanDiag.parsedTotal ?? '?'}`,
        `last_skip=${scanDiag.lastSkipReason || '-'}`,
    ];
    return parts.join('\n');
}

function refreshDebugStatus() {
    const el = document.getElementById('stsa_debug_status');
    if (!el) return;
    el.textContent = buildDebugStatusText();
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
    if (settings.cooldownMode === undefined) settings.cooldownMode = settings.useCooldown === false ? 'off' : 'fixed';
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
    const modeDefaults = getDefaultModePromptsForLocale();
    if (!settings.modePromptPreparedOnly) settings.modePromptPreparedOnly = modeDefaults.preparedOnly;
    if (!settings.modePromptHybrid) settings.modePromptHybrid = modeDefaults.hybrid;
    if (!settings.modePromptCreativeOnly) settings.modePromptCreativeOnly = modeDefaults.creativeOnly;

    const hadModePresets = Array.isArray(settings.modePromptPresets) && settings.modePromptPresets.length > 0;
    if (!hadModePresets) {
        settings.modePromptPresets = createDefaultModePromptPresets();
    }
    settings.modePromptPresets = ensureUniquePresetIds(
        settings.modePromptPresets.map((item, index) => normalizeModePromptPreset(item, `mode_prompt_${index + 1}`)),
        'mode_prompt',
    );
    const defaultModePromptPresets = createDefaultModePromptPresets();
    for (const required of defaultModePromptPresets) {
        if (!settings.modePromptPresets.some((item) => item.id === required.id)) {
            settings.modePromptPresets.push(required);
        }
    }
    if (Number(settings.modePromptSchemaVersion || 1) < 2) {
        for (const required of defaultModePromptPresets) {
            const existing = settings.modePromptPresets.find((item) => item.id === required.id);
            if (existing) {
                existing.name = required.name;
                existing.mode = required.mode;
                existing.template = required.template;
            }
        }
        settings.modePromptSchemaVersion = 2;
    }
    if (!settings.activeModePromptPresetIds || typeof settings.activeModePromptPresetIds !== 'object') {
        settings.activeModePromptPresetIds = { prepared_only: '', hybrid: '', creative_only: '' };
    }
    const localeSuffix = getUiLang() === 'ru' ? 'ru' : 'en';
    const defaultActiveByMode = {
        prepared_only: `mode_prepared_only_${localeSuffix}`,
        hybrid: `mode_hybrid_${localeSuffix}`,
        creative_only: `mode_creative_only_${localeSuffix}`,
    };
    for (const modeKey of ['prepared_only', 'hybrid', 'creative_only']) {
        const hasCurrent = settings.modePromptPresets.some((item) => item.id === settings.activeModePromptPresetIds[modeKey] && item.mode === modeKey);
        if (!hasCurrent) {
            const fallback = settings.modePromptPresets.find((item) => item.id === defaultActiveByMode[modeKey])
                || settings.modePromptPresets.find((item) => item.mode === modeKey);
            settings.activeModePromptPresetIds[modeKey] = fallback?.id || '';
        }
    }

    // Migration from pre-preset mode templates.
    const legacyTemplates = {
        prepared_only: settings.modePromptPreparedOnly,
        hybrid: settings.modePromptHybrid,
        creative_only: settings.modePromptCreativeOnly,
    };
    if (!hadModePresets) {
        for (const modeKey of ['prepared_only', 'hybrid', 'creative_only']) {
            const legacy = String(legacyTemplates[modeKey] || '').trim();
            if (legacy) {
                const active = settings.modePromptPresets.find((item) =>
                    item.id === settings.activeModePromptPresetIds[modeKey] && item.mode === modeKey,
                ) || settings.modePromptPresets.find((item) => item.mode === modeKey);
                if (active) active.template = legacy;
            }
        }
    }
    for (const modeKey of ['prepared_only', 'hybrid', 'creative_only']) {
        const active = settings.modePromptPresets.find((item) => item.id === settings.activeModePromptPresetIds[modeKey] && item.mode === modeKey);
        if (active && !active.template && legacyTemplates[modeKey]) {
            active.template = String(legacyTemplates[modeKey]);
        }
    }

    const mode = String(settings.achievementMode || 'hybrid');
    settings.achievementMode = ['prepared_only', 'hybrid', 'creative_only'].includes(mode) ? mode : 'hybrid';
    settings.cooldownMode = ['off', 'fixed', 'floating'].includes(String(settings.cooldownMode))
        ? String(settings.cooldownMode)
        : (settings.useCooldown ? 'fixed' : 'off');
    settings.cooldown = Math.max(1, Number(settings.cooldown) || 1);
    settings.cooldownMin = Math.max(1, Number(settings.cooldownMin) || Math.max(1, settings.cooldown - 2));
    settings.cooldownMax = Math.max(1, Number(settings.cooldownMax) || Math.max(settings.cooldownMin, settings.cooldown + 2));
    if (settings.cooldownMin > settings.cooldownMax) {
        const tmp = settings.cooldownMin;
        settings.cooldownMin = settings.cooldownMax;
        settings.cooldownMax = tmp;
    }
    settings.useCooldown = settings.cooldownMode !== 'off';
    if (Number(settings.autoCollectPreparedDefaultVersion || 1) < 2) {
        settings.autoCollectPreparedFromAi = false;
        settings.autoCollectPreparedDefaultVersion = 2;
    }
    settings.autoCollectPreparedFromAi = Boolean(settings.autoCollectPreparedFromAi);
    settings.achievementSoundEnabled = Boolean(settings.achievementSoundEnabled);
    settings.achievementSoundVolume = Math.min(100, Math.max(0, Number(settings.achievementSoundVolume) || 0));
    settings.debugVerbose = Boolean(settings.debugVerbose);
    const externalSource = String(settings.externalApiSource || 'disabled');
    settings.externalApiSource = ['disabled', 'quick_api', 'connection_profile'].includes(externalSource)
        ? externalSource
        : 'disabled';
    const endpointPreset = String(settings.externalQuickApiEndpointPreset || 'custom');
    settings.externalQuickApiEndpointPreset = EXTERNAL_API_ENDPOINT_PRESETS.some((item) => item.id === endpointPreset)
        ? endpointPreset
        : 'custom';
    settings.externalQuickApiUrl = normalizeBaseUrl(settings.externalQuickApiUrl);
    settings.externalQuickApiKey = String(settings.externalQuickApiKey || '').trim();
    settings.externalQuickApiModel = String(settings.externalQuickApiModel || '').trim();
    if (!Array.isArray(settings.externalQuickApiModelOptions)) settings.externalQuickApiModelOptions = [];
    settings.externalQuickApiModelOptions = settings.externalQuickApiModelOptions
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    settings.externalConnectionProfile = String(settings.externalConnectionProfile || '');
    const preparedGenLang = String(settings.preparedGenLang || 'auto');
    settings.preparedGenLang = ['auto', 'ru', 'en'].includes(preparedGenLang) ? preparedGenLang : 'auto';
    settings.preparedGenCount = Math.max(1, Math.min(60, Number(settings.preparedGenCount) || 12));
    settings.preparedGenIncludeRecentEvents = Boolean(settings.preparedGenIncludeRecentEvents);
    settings.preparedGenRecentMessages = Math.max(1, Math.min(40, Number(settings.preparedGenRecentMessages) || 8));
    settings.preparedGenPromptRu = String(settings.preparedGenPromptRu || '').trim() || DEFAULT_PREPARED_GENERATION_PROMPT_RU;
    settings.preparedGenPromptEn = String(settings.preparedGenPromptEn || '').trim() || DEFAULT_PREPARED_GENERATION_PROMPT_EN;

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
            preparedAchievements: [],
        };
    }
    if (!Array.isArray(context.chatMetadata[META_KEY].ignoredIds)) {
        context.chatMetadata[META_KEY].ignoredIds = [];
    }
    if (!Array.isArray(context.chatMetadata[META_KEY].debugAchievements)) {
        context.chatMetadata[META_KEY].debugAchievements = [];
    }
    if (!Array.isArray(context.chatMetadata[META_KEY].preparedAchievements)) {
        context.chatMetadata[META_KEY].preparedAchievements = [];
    }
    return context.chatMetadata[META_KEY];
}

function persistChat() {
    const context = getContext();
    if (typeof context?.saveChat === 'function') {
        context.saveChat();
    }
}

function parseMarkerFromMessage(text) {
    const parsed = parseMarkerFromMessageModule(text, MARKER_REGEX_GLOBAL, rarityMeta, normalizeText);
    runtimeDebug.lastMarker = {
        found: Boolean(parsed),
        title: parsed?.title || '',
        rarity: parsed?.rarity || '',
    };
    debugLog('marker_parse', runtimeDebug.lastMarker);
    refreshDebugStatus();
    return parsed;
}

function getInjectState(interval) {
    return getInjectStateModule(interval, getContext());
}

function refreshInjectCounter(state, interval) {
    refreshInjectCounterModule(state, interval, uiText);
}

function getAchievementCooldownInfo(cooldownInput = getSettings()) {
    return getAchievementCooldownInfoModule(cooldownInput, getContext(), parseMarkerFromMessage, hashString);
}

function getCooldownThreshold(seed = 'initial') {
    return cooldownThresholdModule(getSettings(), seed, hashString);
}

function applyTemplateVars(template, vars) {
    return applyTemplateVarsModule(template, vars);
}

function getUserNameForPrompt() {
    const context = getContext();
    return normalizeText(context?.name1 || context?.userName || context?.user_name)
        || (getUiLang() === 'ru' ? 'Пользователь' : 'User');
}

function getPromptTemplateVars(extra = {}) {
    return {
        user: getUserNameForPrompt(),
        ...extra,
    };
}

function getDefaultNegativePromptForLocale() {
    return getDefaultNegativePromptForLocaleModule(getUiLang(), DEFAULT_NEGATIVE_PROMPT_RU, DEFAULT_NEGATIVE_PROMPT_EN);
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

    const position = Number(settings.injectPosition ?? extension_prompt_types.IN_CHAT);
    const depth = position === extension_prompt_types.IN_CHAT ? settings.injectDepth : 0;
    const role = settings.injectRole;
    const cooldownInfo = settings.useCooldown
        ? getAchievementCooldownInfo(settings)
        : { hasAchievement: false, cooldown: 0, messagesSinceLast: null, remaining: 0 };
    const vars = getPromptTemplateVars({
        cooldown: cooldownInfo.cooldown,
        remaining: cooldownInfo.remaining,
        since_last: cooldownInfo.messagesSinceLast ?? 0,
    });
    const modePrompt = buildModeInjectionBlock(vars);
    const fallbackPrompt = applyTemplateVars(settings.promptTemplate, vars);
    const negativePrompt = applyTemplateVars(settings.negativePromptTemplate || getDefaultNegativePromptForLocale(), vars);
    const prompt = settings.useCooldown && cooldownInfo.hasAchievement && cooldownInfo.remaining > 0
        ? negativePrompt
        : (modePrompt || fallbackPrompt);
    runtimeDebug.lastInjection = {
        mode: settings.achievementMode,
        injectState: injectState.shouldInject ? 'on' : 'off',
        preparedTotal: getPreparedAchievements().length,
        preparedAvailable: getAvailablePreparedAchievements().length,
        cooldownRemaining: cooldownInfo.remaining,
        promptType: (settings.useCooldown && cooldownInfo.hasAchievement && cooldownInfo.remaining > 0) ? 'negative' : 'base',
        promptLength: String(prompt || '').length,
    };
    debugLog('apply_injection', runtimeDebug.lastInjection);
    refreshDebugStatus();
    setExtensionPrompt(PROMPT_KEY, prompt, position, depth, false, role);
}

function buildScannedAchievements() {
    return buildScannedAchievementsModule(
        getContext(),
        getSettings(),
        ensureChatStore(),
        parseMarkerFromMessage,
        hashString,
    );
}

function analyzeScanDiagnostics() {
    const context = getContext();
    const settings = getSettings();
    const store = ensureChatStore();
    const ignored = new Set(store.ignoredIds || []);
    const chat = Array.isArray(context?.chat) ? context.chat : [];
    let lastGrantedMessageIndex = -99999;
    let lastGrantedSeed = '';
    const dedupe = new Set();
    let parsedTotal = 0;
    let accepted = 0;
    let lastSkipReason = '';

    for (let i = 0; i < chat.length; i++) {
        const message = chat[i];
        if (!message || message.is_user) continue;
        const parsed = parseMarkerFromMessage(message.mes);
        if (!parsed) continue;
        parsedTotal += 1;

        if (settings.enforceLocalCooldown && settings.useCooldown) {
            const diff = i - lastGrantedMessageIndex;
            const threshold = cooldownThresholdModule(settings, lastGrantedSeed || 'initial', hashString);
            if (diff < threshold) {
                lastSkipReason = `cooldown(diff=${diff},target=${threshold})`;
                continue;
            }
        }

        if (settings.dedupeByName) {
            const dedupeKey = `${parsed.title.toLowerCase()}|${parsed.description.toLowerCase()}`;
            if (dedupe.has(dedupeKey)) {
                lastSkipReason = 'dedupe';
                continue;
            }
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
        if (ignored.has(id)) {
            lastSkipReason = `ignored(${id})`;
            continue;
        }

        accepted += 1;
        lastGrantedMessageIndex = i;
        lastGrantedSeed = id;
    }

    return {
        parsedTotal,
        accepted,
        ignoredCount: ignored.size,
        lastSkipReason,
    };
}

function getDebugAchievements() {
    const store = ensureChatStore();
    return store.debugAchievements;
}

function getAchievements() {
    const debug = getDebugAchievements();
    return [...scannedAchievements, ...debug].sort((a, b) => Number(a.awardedAt) - Number(b.awardedAt));
}

function achievementSignature(item) {
    const title = normalizeText(item?.title).toLowerCase();
    const description = normalizeText(item?.description).toLowerCase();
    const rarity = normalizeText(item?.rarity).toLowerCase();
    return `${title}|${description}|${rarity}`;
}

function normalizePreparedAchievement(input) {
    const emoji = normalizeText(input?.emoji) || '🏆';
    const title = normalizeText(input?.title);
    const description = normalizeText(input?.description);
    const rarityRaw = normalizeText(input?.rarity).toLowerCase();
    const rarity = rarityMeta[rarityRaw] ? rarityRaw : 'common';
    if (!title || !description) return null;
    return {
        id: `prepared_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source: 'prepared',
        emoji,
        title,
        description,
        rarity,
        awardedAt: Number(input?.awardedAt) || Date.now(),
    };
}

function getPreparedAchievements() {
    const store = ensureChatStore();
    return store.preparedAchievements;
}

function addPreparedAchievement(input, persist = true) {
    const store = ensureChatStore();
    const prepared = normalizePreparedAchievement(input);
    if (!prepared) return false;
    const sig = achievementSignature(prepared);
    const exists = store.preparedAchievements.some((item) => achievementSignature(item) === sig);
    if (exists) return false;
    store.preparedAchievements.push(prepared);
    if (persist) persistChat();
    return true;
}

function getAvailablePreparedAchievements() {
    const prepared = getPreparedAchievements();
    const achieved = new Set(getAchievements().map((item) => achievementSignature(item)));
    return prepared.filter((item) => !achieved.has(achievementSignature(item)));
}

function getPreparedGenerationLanguage(settings) {
    const selected = String(settings.preparedGenLang || 'auto');
    if (selected === 'ru' || selected === 'en') return selected;
    return getUiLang() === 'ru' ? 'ru' : 'en';
}

function stripCodeFence(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenced ? String(fenced[1]).trim() : raw;
}

function parsePreparedJsonArray(rawText) {
    const cleaned = stripCodeFence(rawText);
    if (!cleaned) return null;
    try {
        const direct = JSON.parse(cleaned);
        return Array.isArray(direct) ? direct : null;
    } catch {}
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start < 0 || end <= start) return null;
    try {
        const sliced = JSON.parse(cleaned.slice(start, end + 1));
        return Array.isArray(sliced) ? sliced : null;
    } catch {
        return null;
    }
}

function buildPreparedGenerationContext(settings) {
    const context = getContext();
    const chat = Array.isArray(context?.chat) ? context.chat : [];
    const firstAssistant = chat.find((item) => item && !item.is_user && normalizeText(item.mes));
    const rpStart = normalizeText(firstAssistant?.mes || '')
        .replace(/\[ACHIEVEMENT:[^\]]*\]/gi, '')
        .slice(0, 1200);

    const recentLimit = Math.max(1, Math.min(40, Number(settings.preparedGenRecentMessages) || 8));
    let recentCandidates = chat.slice(-recentLimit);
    if (!settings.preparedGenIncludeRecentEvents) {
        recentCandidates = [];
    }
    const recentEvents = recentCandidates
        .filter((item) => item && normalizeText(item.mes))
        .map((item) => {
            const who = item.is_user ? 'User' : (normalizeText(item.name) || 'Assistant');
            const text = normalizeText(String(item.mes || '').replace(/\[ACHIEVEMENT:[^\]]*\]/gi, ''));
            return `[${who}] ${text.slice(0, 220)}`;
        })
        .filter(Boolean)
        .join('\n');

    const names = new Set();
    for (const item of chat.slice(-30)) {
        if (!item) continue;
        if (item.is_user) names.add(getUiLang() === 'ru' ? 'Пользователь' : 'User');
        else if (normalizeText(item.name)) names.add(normalizeText(item.name));
    }
    if (!names.size) names.add(getUiLang() === 'ru' ? 'Пользователь, Ассистент' : 'User, Assistant');
    const characters = [...names].slice(0, 8).join(', ');

    return {
        rp_start: rpStart || (getUiLang() === 'ru' ? 'Нет данных' : 'No data'),
        recent_events: recentEvents || (getUiLang() === 'ru' ? 'Нет данных' : 'No data'),
        characters: characters || (getUiLang() === 'ru' ? 'Нет данных' : 'No data'),
    };
}

function buildPreparedGenerationPrompt(settings) {
    const lang = getPreparedGenerationLanguage(settings);
    const template = lang === 'ru' ? settings.preparedGenPromptRu : settings.preparedGenPromptEn;
    const count = Math.max(1, Math.min(60, Number(settings.preparedGenCount) || 12));
    const ctx = buildPreparedGenerationContext(settings);
    return applyTemplateVars(template, getPromptTemplateVars({
        count,
        rp_start: ctx.rp_start,
        recent_events: ctx.recent_events,
        characters: ctx.characters,
    }));
}

async function requestPreparedGeneration(prompt) {
    const settings = getSettings();
    if (settings.externalApiSource === 'quick_api') {
        const response = await postQuickApiChatCompletions({
            url: settings.externalQuickApiUrl,
            apiKey: settings.externalQuickApiKey,
            model: settings.externalQuickApiModel,
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 2200,
            temperature: 0.8,
        });
        return extractTextFromApiResponse(response) || '';
    }

    if (settings.externalApiSource === 'connection_profile') {
        const context = getContext();
        const response = await sendWithConnectionProfile({
            context,
            profileName: settings.externalConnectionProfile,
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 2200,
            getRequestHeaders,
        });
        return extractTextFromApiResponse(response) || '';
    }

    throw new Error(uiText('prepared_generate_no_source'));
}

async function generatePreparedAchievements() {
    const settings = getSettings();
    if (settings.externalApiSource === 'disabled') {
        throw new Error(uiText('prepared_generate_no_source'));
    }
    const prompt = buildPreparedGenerationPrompt(settings);
    const text = await requestPreparedGeneration(prompt);
    const parsed = parsePreparedJsonArray(text);
    if (!Array.isArray(parsed)) {
        throw new Error(uiText('prepared_generate_invalid_json'));
    }
    if (!parsed.length) {
        throw new Error(uiText('prepared_generate_empty'));
    }

    let added = 0;
    let skipped = 0;
    for (const item of parsed) {
        if (addPreparedAchievement(item, false)) added += 1;
        else skipped += 1;
    }
    if (added > 0) persistChat();
    renderPreparedList();
    applyPromptInjection();
    return { added, skipped };
}

function getActiveModePromptPreset(modeKey) {
    const settings = getSettings();
    const activeId = settings.activeModePromptPresetIds?.[modeKey];
    return settings.modePromptPresets.find((item) => item.id === activeId && item.mode === modeKey)
        || settings.modePromptPresets.find((item) => item.mode === modeKey)
        || null;
}

function buildModeInjectionBlock(vars = {}) {
    const settings = getSettings();
    const mode = settings.achievementMode;
    const template = String(getActiveModePromptPreset(mode)?.template || '');
    if (!template) return '';

    const available = mode === 'creative_only' ? [] : getAvailablePreparedAchievements();
    const preparedList = available.length
        ? available.slice(0, 80).map((item) =>
            `[ACHIEVEMENT: ${item.emoji} | ${item.title} | ${item.description} | ${item.rarity}]`,
        ).join('\n')
        : (mode === 'creative_only'
            ? ''
            : (getUiLang() === 'ru' ? 'Список заготовок пуст.' : 'Prepared list is empty.'));
    return applyTemplateVars(template, { ...vars, prepared_list: preparedList });
}

function getToastContainer() {
    return getToastContainerModule(getSettings);
}

function playAchievementSound() {
    const settings = getSettings();
    if (!settings.achievementSoundEnabled) return;

    const audio = new Audio(ACHIEVEMENT_SOUND_URL);
    audio.volume = Math.min(1, Math.max(0, Number(settings.achievementSoundVolume) / 100));
    audio.play().catch((error) => {
        debugLog('sound_play_failed', { message: String(error?.message || error) });
    });
}

function showToast(achievement) {
    showToastModule(achievement, {
        getSettings,
        toastThemes: TOAST_THEMES,
        escapeHtml,
        uiText,
    });
}

function refreshFloatingCount() {
    const countEl = document.getElementById('stsa_fab_count');
    if (!countEl) return;
    countEl.textContent = String(getAchievements().length);
}

function updateFloatingButtonVisibility() {
    const fab = document.getElementById('stsa_fab');
    if (!fab) return;
    const settings = getSettings();
    fab.style.display = settings.showFloatingButton ? '' : 'none';
}

function renderModalList() {
    const listEl = document.getElementById('stsa_modal_list');
    const statsEl = document.getElementById('stsa_modal_stats');
    if (!listEl || !statsEl) return;

    const list = [...getAchievements()].reverse();
    const settings = getSettings();
    const cooldownInfo = settings.useCooldown
        ? getAchievementCooldownInfo(settings)
        : { hasAchievement: false, cooldown: 0, messagesSinceLast: null, remaining: 0 };
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

    const cooldownText = !settings.useCooldown
        ? uiText('cooldown_disabled')
        : !cooldownInfo.hasAchievement
        ? uiText('cooldown_no_achievements')
        : (cooldownInfo.remaining > 0
            ? (settings.cooldownMode === 'floating'
                ? uiText('cooldown_left_floating', { count: cooldownInfo.remaining, target: cooldownInfo.cooldown })
                : uiText('cooldown_left', { count: cooldownInfo.remaining }))
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

function renderPreparedList() {
    const listEl = document.getElementById('stsa_prepared_list');
    const statsEl = document.getElementById('stsa_prepared_stats');
    if (!listEl || !statsEl) return;

    const prepared = [...getPreparedAchievements()].reverse();
    const availableKeys = new Set(getAvailablePreparedAchievements().map((item) => achievementSignature(item)));
    if (!prepared.length) {
        statsEl.innerHTML = `<span>${escapeHtml(uiText('total', { count: 0 }))}</span>`;
        listEl.innerHTML = `<div class="stsa_empty">${escapeHtml(uiText('prepared_empty'))}</div>`;
        return;
    }

    const availableCount = prepared.filter((item) => availableKeys.has(achievementSignature(item))).length;
    statsEl.innerHTML = `
        <span>${escapeHtml(uiText('total', { count: prepared.length }))}</span>
        <span>${escapeHtml(uiText('prepared_status_available'))}: ${availableCount}</span>
    `;

    listEl.innerHTML = prepared.map((item) => {
        const meta = rarityMeta[item.rarity] || rarityMeta.common;
        const isAvailable = availableKeys.has(achievementSignature(item));
        const statusText = isAvailable ? uiText('prepared_status_available') : uiText('prepared_status_earned');
        return `
            <div class="stsa_item stsa_rarity_${escapeHtml(item.rarity)}">
                <div class="stsa_item_icon">${escapeHtml(item.emoji)}</div>
                <div class="stsa_item_body">
                    <div class="stsa_item_top">
                        <div class="stsa_item_title">${escapeHtml(item.title)}</div>
                        <div class="stsa_item_rarity">${meta.icon} ${meta.label}</div>
                    </div>
                    <div class="stsa_item_desc">${escapeHtml(item.description)}</div>
                    <div class="stsa_item_date">${escapeHtml(statusText)}</div>
                </div>
                <button class="stsa_item_delete" title="${escapeHtml(uiText('delete'))}" data-prepared-id="${escapeHtml(item.id)}">🗑</button>
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

function removePreparedById(id) {
    if (!id) return;
    const store = ensureChatStore();
    const before = store.preparedAchievements.length;
    store.preparedAchievements = store.preparedAchievements.filter((item) => item.id !== id);
    if (store.preparedAchievements.length === before) return;
    persistChat();
    renderPreparedList();
    applyPromptInjection();
}

function clearPreparedAchievements() {
    const store = ensureChatStore();
    store.preparedAchievements = [];
    persistChat();
    renderPreparedList();
    applyPromptInjection();
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
    const last = store.debugAchievements[store.debugAchievements.length - 1];
    if (getSettings().showToasts) {
        showToast(last);
    }
    playAchievementSound();
}

function rescanAchievements(notifyNew = false) {
    runtimeDebug.lastScanDiagnostics = analyzeScanDiagnostics();
    const nextScanned = buildScannedAchievements();
    const nextIds = new Set(nextScanned.map((item) => item.id));
    const settings = getSettings();
    let addedPrepared = false;

    if (settings.autoCollectPreparedFromAi) {
        for (const item of nextScanned) {
            if (addPreparedAchievement(item, false)) {
                addedPrepared = true;
            }
        }
        if (addedPrepared) {
            persistChat();
        }
    }

    if (notifyNew) {
        for (const item of nextScanned) {
            if (!lastScannedIds.has(item.id)) {
                if (settings.showToasts) showToast(item);
                playAchievementSound();
            }
        }
    }

    const newScannedCount = Math.max(0, [...nextIds].filter((id) => !lastScannedIds.has(id)).length);
    scannedAchievements = nextScanned;
    lastScannedIds = nextIds;
    runtimeDebug.lastRescan = {
        scanned: nextScanned.length,
        newScanned: newScannedCount,
        notifyNew: Boolean(notifyNew),
        autoPreparedAdded: Boolean(addedPrepared),
        ignoredCount: runtimeDebug.lastScanDiagnostics?.ignoredCount ?? 0,
    };
    debugLog('rescan', runtimeDebug.lastRescan);
    refreshFloatingCount();
    renderModalList();
    renderPreparedList();
    refreshDebugStatus();
    applyPromptInjection();
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
    hideAchievementMarkersInDOMModule(MARKER_HIDE_REGEX_GLOBAL);
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
    document.getElementById('stsa_prepared_panel')?.classList.remove('stsa_panel_open');
    positionPanelNearFab(panel);
    renderModalList();
    panel.classList.add('stsa_panel_open');
    bindPanelOutsideClose();
}

function openPreparedModal() {
    ensurePreparedPanel();
    const panel = document.getElementById('stsa_prepared_panel');
    if (!panel) return;
    document.getElementById('stsa_panel')?.classList.remove('stsa_panel_open');
    positionPanelNearFab(panel);
    renderPreparedList();
    panel.classList.add('stsa_panel_open');
    bindPanelOutsideClose();
}

function closeModal() {
    document.getElementById('stsa_panel')?.classList.remove('stsa_panel_open');
    document.getElementById('stsa_prepared_panel')?.classList.remove('stsa_panel_open');
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
                <button id="stsa_open_prepared" class="menu_button">${escapeHtml(uiText('prepared_manage'))}</button>
                <button id="stsa_clear_all" class="menu_button stsa_clear_all">${escapeHtml(uiText('delete_all'))}</button>
            </div>
        </div>
    `;
    panel.querySelector('#stsa_modal_close')?.addEventListener('click', closeModal);
    panel.querySelector('#stsa_clear_all')?.addEventListener('click', () => {
        if (!window.confirm(uiText('confirm_delete_all'))) return;
        clearAchievements();
    });
    panel.querySelector('#stsa_open_prepared')?.addEventListener('click', openPreparedModal);
    panel.querySelector('#stsa_modal_list')?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-ach-id]');
        if (!btn) return;
        removeAchievementById(btn.getAttribute('data-ach-id'));
    });
    document.body.appendChild(panel);
}

function ensurePreparedPanel() {
    const existing = document.getElementById('stsa_prepared_panel');
    if (existing) {
        // Rebuild stale panel markup from previous versions (no generator controls).
        if (existing.querySelector('#stsa_prepared_generate')) return;
        existing.remove();
    }
    const panel = document.createElement('div');
    panel.id = 'stsa_prepared_panel';
    panel.className = 'stsa_panel';
    panel.innerHTML = `
        <div class="stsa_modal">
            <div class="stsa_modal_header">
                <div class="stsa_modal_title">${escapeHtml(uiText('prepared_title'))}</div>
                <button id="stsa_prepared_close" class="stsa_modal_close" title="${escapeHtml(uiText('close'))}">✕</button>
            </div>
            <div class="stsa_modal_body">
                <div id="stsa_prepared_stats" class="stsa_modal_stats"></div>
                <div class="stsa_debug stsa_prepared_form">
                    <div class="stsa_debug_grid">
                        <input id="stsa_prepared_emoji" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_emoji'))}" value="🏆">
                        <input id="stsa_prepared_title" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_title'))}">
                        <input id="stsa_prepared_desc" class="text_pole" placeholder="${escapeHtml(uiText('placeholder_desc'))}">
                        <select id="stsa_prepared_rarity" class="text_pole">
                            <option value="common">common</option>
                            <option value="rare">rare</option>
                            <option value="epic">epic</option>
                            <option value="legendary">legendary</option>
                        </select>
                    </div>
                    <div class="stsa_debug_actions">
                        <button id="stsa_prepared_add" class="menu_button">${escapeHtml(uiText('prepared_add'))}</button>
                    </div>
                </div>
                <details class="stsa_debug stsa_prepared_generate" id="stsa_prepared_generate_details">
                    <summary class="stsa_prepared_generate_summary">${escapeHtml(uiText('prepared_generate_title'))}</summary>
                    <div class="stsa_prepared_generate_body">
                        <div class="stsa_grid stsa_preset_grid">
                            <label>${escapeHtml(uiText('prepared_generate_count'))}
                                <input id="stsa_prepared_gen_count" class="text_pole" type="number" min="1" max="60" step="1">
                            </label>
                            <label>${escapeHtml(uiText('prepared_generate_lang'))}
                                <select id="stsa_prepared_gen_lang" class="text_pole">
                                    <option value="auto">${escapeHtml(uiText('prepared_generate_lang_auto'))}</option>
                                    <option value="ru">${escapeHtml(uiText('prepared_generate_lang_ru'))}</option>
                                    <option value="en">${escapeHtml(uiText('prepared_generate_lang_en'))}</option>
                                </select>
                            </label>
                        </div>
                        <label class="checkbox_label">
                            <input id="stsa_prepared_gen_events" type="checkbox">
                            <span>${escapeHtml(uiText('prepared_generate_events'))}</span>
                        </label>
                        <label>${escapeHtml(uiText('prepared_generate_recent_count'))}
                            <input id="stsa_prepared_gen_recent_count" class="text_pole" type="number" min="1" max="40" step="1">
                        </label>
                        <label>${escapeHtml(uiText('prepared_generate_prompt_ru'))}
                            <textarea id="stsa_prepared_prompt_ru" class="text_pole" rows="8"></textarea>
                        </label>
                        <label>${escapeHtml(uiText('prepared_generate_prompt_en'))}
                            <textarea id="stsa_prepared_prompt_en" class="text_pole" rows="8"></textarea>
                        </label>
                        <div class="stsa_debug_actions">
                            <button id="stsa_prepared_generate" class="menu_button">${escapeHtml(uiText('prepared_generate_button'))}</button>
                        </div>
                    </div>
                </details>
                <div id="stsa_prepared_list" class="stsa_modal_list"></div>
            </div>
            <div class="stsa_modal_footer">
                <button id="stsa_prepared_back" class="menu_button">${escapeHtml(uiText('achievements_chat_title'))}</button>
                <button id="stsa_prepared_clear" class="menu_button stsa_clear_all">${escapeHtml(uiText('prepared_clear'))}</button>
            </div>
        </div>
    `;
    panel.querySelector('#stsa_prepared_close')?.addEventListener('click', closeModal);
    panel.querySelector('#stsa_prepared_back')?.addEventListener('click', openModal);
    panel.querySelector('#stsa_prepared_clear')?.addEventListener('click', () => {
        if (!window.confirm(uiText('confirm_prepared_clear'))) return;
        clearPreparedAchievements();
    });
    panel.querySelector('#stsa_prepared_add')?.addEventListener('click', () => {
        const created = addPreparedAchievement({
            emoji: $('#stsa_prepared_emoji').val(),
            title: $('#stsa_prepared_title').val(),
            description: $('#stsa_prepared_desc').val(),
            rarity: $('#stsa_prepared_rarity').val(),
        }, true);
        if (!created) return;
        $('#stsa_prepared_title').val('');
        $('#stsa_prepared_desc').val('');
        renderPreparedList();
        applyPromptInjection();
    });
    const settings = getSettings();
    const genCountEl = panel.querySelector('#stsa_prepared_gen_count');
    const genLangEl = panel.querySelector('#stsa_prepared_gen_lang');
    const genEventsEl = panel.querySelector('#stsa_prepared_gen_events');
    const genRecentCountEl = panel.querySelector('#stsa_prepared_gen_recent_count');
    const promptRuEl = panel.querySelector('#stsa_prepared_prompt_ru');
    const promptEnEl = panel.querySelector('#stsa_prepared_prompt_en');
    if (genCountEl) genCountEl.value = String(settings.preparedGenCount);
    if (genLangEl) genLangEl.value = String(settings.preparedGenLang);
    if (genEventsEl) genEventsEl.checked = Boolean(settings.preparedGenIncludeRecentEvents);
    if (genRecentCountEl) genRecentCountEl.value = String(settings.preparedGenRecentMessages);
    if (!String(settings.preparedGenPromptRu || '').trim()) {
        settings.preparedGenPromptRu = DEFAULT_PREPARED_GENERATION_PROMPT_RU;
        saveSettings();
    }
    if (!String(settings.preparedGenPromptEn || '').trim()) {
        settings.preparedGenPromptEn = DEFAULT_PREPARED_GENERATION_PROMPT_EN;
        saveSettings();
    }
    if (promptRuEl) promptRuEl.value = settings.preparedGenPromptRu;
    if (promptEnEl) promptEnEl.value = settings.preparedGenPromptEn;
    if (genRecentCountEl) {
        genRecentCountEl.disabled = !settings.preparedGenIncludeRecentEvents;
    }
    panel.querySelector('#stsa_prepared_gen_count')?.addEventListener('input', () => {
        settings.preparedGenCount = Math.max(1, Math.min(60, Number(genCountEl?.value) || 12));
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_gen_lang')?.addEventListener('change', () => {
        settings.preparedGenLang = String(genLangEl?.value || 'auto');
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_gen_events')?.addEventListener('change', () => {
        settings.preparedGenIncludeRecentEvents = Boolean(genEventsEl?.checked);
        if (genRecentCountEl) genRecentCountEl.disabled = !settings.preparedGenIncludeRecentEvents;
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_gen_recent_count')?.addEventListener('input', () => {
        settings.preparedGenRecentMessages = Math.max(1, Math.min(40, Number(genRecentCountEl?.value) || 8));
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_prompt_ru')?.addEventListener('input', () => {
        settings.preparedGenPromptRu = String(promptRuEl?.value || '').trim() || DEFAULT_PREPARED_GENERATION_PROMPT_RU;
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_prompt_en')?.addEventListener('input', () => {
        settings.preparedGenPromptEn = String(promptEnEl?.value || '').trim() || DEFAULT_PREPARED_GENERATION_PROMPT_EN;
        saveSettings();
    });
    panel.querySelector('#stsa_prepared_generate')?.addEventListener('click', async () => {
        const btn = panel.querySelector('#stsa_prepared_generate');
        if (!btn) return;
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = `${uiText('prepared_generate_button')}...`;
        try {
            const result = await generatePreparedAchievements();
            toastr.success(uiText('prepared_generate_result', result));
        } catch (error) {
            toastr.error(String(error?.message || error));
        } finally {
            btn.disabled = false;
            btn.textContent = original;
        }
    });
    panel.querySelector('#stsa_prepared_list')?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-prepared-id]');
        if (!btn) return;
        removePreparedById(btn.getAttribute('data-prepared-id'));
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
        const preparedPanel = document.getElementById('stsa_prepared_panel');
        const hasOpenPanel = panel?.classList.contains('stsa_panel_open') || preparedPanel?.classList.contains('stsa_panel_open');
        if (!hasOpenPanel) return;
        const fab = document.getElementById('stsa_fab');
        if (panel?.contains(event.target) || preparedPanel?.contains(event.target) || fab?.contains(event.target)) return;
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
    updateFloatingButtonVisibility();

    window.addEventListener('resize', () => {
        applyFabPosition(fab, parseInt(fab.style.left, 10) || def.x, parseInt(fab.style.top, 10) || def.y);
        const panel = document.getElementById('stsa_panel');
        if (panel?.classList.contains('stsa_panel_open')) {
            positionPanelNearFab(panel);
        }
        const preparedPanel = document.getElementById('stsa_prepared_panel');
        if (preparedPanel?.classList.contains('stsa_panel_open')) {
            positionPanelNearFab(preparedPanel);
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
                    <div class="stsa_grid" id="stsa_cooldown_grid">
                        <label>${escapeHtml(uiText('cooldown_mode'))}
                            <select id="stsa_cooldown_mode" class="text_pole">
                                <option value="off">${escapeHtml(uiText('cooldown_off'))}</option>
                                <option value="fixed">${escapeHtml(uiText('cooldown_fixed'))}</option>
                                <option value="floating">${escapeHtml(uiText('cooldown_floating'))}</option>
                            </select>
                        </label>
                        <label class="stsa_cooldown_fixed_field">${escapeHtml(uiText('cooldown_messages'))}
                            <input id="stsa_cooldown" class="text_pole" type="number" min="1" max="200" step="1">
                        </label>
                        <label class="stsa_cooldown_float_field">${escapeHtml(uiText('cooldown_min'))}
                            <input id="stsa_cooldown_min" class="text_pole" type="number" min="1" max="200" step="1">
                        </label>
                        <label class="stsa_cooldown_float_field">${escapeHtml(uiText('cooldown_max'))}
                            <input id="stsa_cooldown_max" class="text_pole" type="number" min="1" max="200" step="1">
                        </label>
                    </div>
                    <label class="checkbox_label stsa_hidden_legacy">
                        <input type="checkbox" id="stsa_use_cooldown">
                        <span>${escapeHtml(uiText('use_cooldown'))}</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_enforce_local_cooldown">
                        <span>${escapeHtml(uiText('enforce_local_cooldown'))}</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_dedupe">
                        <span>${escapeHtml(uiText('dedupe_exact'))}</span>
                    </label>
                    <label>${escapeHtml(uiText('achievement_mode'))}
                        <select id="stsa_achievement_mode" class="text_pole">
                            <option value="prepared_only">${escapeHtml(uiText('mode_prepared_only'))}</option>
                            <option value="hybrid">${escapeHtml(uiText('mode_hybrid'))}</option>
                            <option value="creative_only">${escapeHtml(uiText('mode_creative_only'))}</option>
                        </select>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_auto_collect_prepared">
                        <span>${escapeHtml(uiText('prepared_auto_collect'))}</span>
                    </label>
                    <div id="stsa_prepared_tools" class="stsa_debug">
                        <div class="stsa_debug_title">${escapeHtml(uiText('prepared_tools'))}</div>
                        <div class="stsa_debug_actions">
                            <button id="stsa_settings_open_prepared" class="menu_button" type="button">${escapeHtml(uiText('open_prepared_panel'))}</button>
                        </div>
                    </div>
                    <div id="stsa_external_api" class="stsa_debug">
                        <div class="stsa_debug_title">${escapeHtml(uiText('external_api_title'))}</div>
                        <label>${escapeHtml(uiText('external_api_source'))}
                            <select id="stsa_external_source" class="text_pole">
                                <option value="disabled">${escapeHtml(uiText('external_api_disabled'))}</option>
                                <option value="quick_api">${escapeHtml(uiText('external_api_quick'))}</option>
                                <option value="connection_profile">${escapeHtml(uiText('external_api_profile'))}</option>
                            </select>
                        </label>
                        <div id="stsa_external_quick_fields" class="stsa_external_fields">
                            <label>${escapeHtml(uiText('external_api_endpoint_preset'))}
                                <select id="stsa_external_endpoint_preset" class="text_pole"></select>
                            </label>
                            <label>${escapeHtml(uiText('external_api_url'))}
                                <input id="stsa_external_quick_url" class="text_pole" type="text" placeholder="https://your-endpoint.example/v1">
                            </label>
                            <label>${escapeHtml(uiText('external_api_key'))}
                                <input id="stsa_external_quick_key" class="text_pole" type="password" placeholder="sk-...">
                            </label>
                            <label>${escapeHtml(uiText('external_api_model'))}
                                <div class="stsa_external_row">
                                    <select id="stsa_external_quick_model_select" class="text_pole"></select>
                                    <button id="stsa_external_fetch_models" class="menu_button" type="button">${escapeHtml(uiText('external_api_fetch_models'))}</button>
                                </div>
                            </label>
                            <label>${escapeHtml(uiText('external_api_model_manual'))}
                                <input id="stsa_external_quick_model_input" class="text_pole" type="text" placeholder="gpt-4.1, claude-3.7-sonnet, ...">
                            </label>
                        </div>
                        <div id="stsa_external_profile_fields" class="stsa_external_fields">
                            <label>${escapeHtml(uiText('external_api_profile_name'))}
                                <div class="stsa_external_row">
                                    <select id="stsa_external_profile" class="text_pole"></select>
                                    <button id="stsa_external_refresh_profiles" class="menu_button" type="button">${escapeHtml(uiText('external_api_refresh_profiles'))}</button>
                                </div>
                            </label>
                        </div>
                        <div class="stsa_debug_actions">
                            <button id="stsa_external_check" class="menu_button" type="button">${escapeHtml(uiText('external_api_check'))}</button>
                        </div>
                        <div id="stsa_external_status" class="stsa_external_status">${escapeHtml(uiText('external_api_status_off'))}</div>
                    </div>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_toasts">
                        <span>${escapeHtml(uiText('show_toasts'))}</span>
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_achievement_sound">
                        <span>${escapeHtml(uiText('achievement_sound'))}</span>
                    </label>
                    <label>${escapeHtml(uiText('achievement_sound_volume'))}
                        <input id="stsa_achievement_sound_volume" class="text_pole" type="range" min="0" max="100" step="5">
                    </label>
                    <label class="checkbox_label">
                        <input type="checkbox" id="stsa_show_floating_button">
                        <span>${escapeHtml(uiText('show_floating_button'))}</span>
                    </label>
                    <label class="stsa_legacy_fallback_prompt">${escapeHtml(uiText('prompt_for_injection'))}
                        <textarea id="stsa_prompt" class="text_pole" rows="14"></textarea>
                    </label>
                    <label>${escapeHtml(uiText('negative_prompt_for_cooldown'))}
                        <textarea id="stsa_negative_prompt" class="text_pole" rows="8"></textarea>
                    </label>
                    <div id="stsa_mode_prompt_presets" class="stsa_debug">
                        <div class="stsa_debug_title">${escapeHtml(uiText('mode_inject_presets'))}</div>
                        <div class="stsa_grid stsa_preset_grid">
                            <label>${escapeHtml(uiText('mode_inject_preset'))}
                                <select id="stsa_mode_prompt_preset_select" class="text_pole"></select>
                            </label>
                            <label>${escapeHtml(uiText('preset_name'))}
                                <input id="stsa_mode_prompt_preset_name" class="text_pole" type="text" maxlength="60" placeholder="${escapeHtml(uiText('preset_name_placeholder'))}">
                            </label>
                        </div>
                        <label>
                            <textarea id="stsa_mode_prompt_template" class="text_pole" rows="8"></textarea>
                        </label>
                        <div class="stsa_debug_actions">
                            <button id="stsa_mode_prompt_new" class="menu_button">${escapeHtml(uiText('new_preset'))}</button>
                            <button id="stsa_mode_prompt_save" class="menu_button">${escapeHtml(uiText('save_changes'))}</button>
                            <button id="stsa_mode_prompt_delete" class="menu_button">${escapeHtml(uiText('delete_preset'))}</button>
                        </div>
                    </div>
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
                            <button id="stsa_debug_dump" class="menu_button">${escapeHtml(uiText('debug_dump'))}</button>
                        </div>
                        <label class="checkbox_label">
                            <input type="checkbox" id="stsa_debug_verbose">
                            <span>${escapeHtml(uiText('debug_verbose'))}</span>
                        </label>
                        <div class="stsa_debug_title">${escapeHtml(uiText('debug_status'))}</div>
                        <pre id="stsa_debug_status" class="stsa_debug_status">-</pre>
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
    const cooldownGrid = document.getElementById('stsa_cooldown_grid');
    const useCooldown = document.getElementById('stsa_use_cooldown')?.closest('label');
    const enforce = document.getElementById('stsa_enforce_local_cooldown')?.closest('label');
    const dedupe = document.getElementById('stsa_dedupe')?.closest('label');
    const achievementMode = document.getElementById('stsa_achievement_mode')?.closest('label');
    const autoCollectPrepared = document.getElementById('stsa_auto_collect_prepared')?.closest('label');
    const preparedTools = document.getElementById('stsa_prepared_tools');
    const externalApi = document.getElementById('stsa_external_api');
    const toasts = document.getElementById('stsa_toasts')?.closest('label');
    const sound = document.getElementById('stsa_achievement_sound')?.closest('label');
    const soundVolume = document.getElementById('stsa_achievement_sound_volume')?.closest('label');
    const showFloatingButton = document.getElementById('stsa_show_floating_button')?.closest('label');
    const glow = document.getElementById('stsa_toast_glow')?.closest('label');
    const prompt = document.getElementById('stsa_prompt')?.closest('label');
    const promptPresets = document.getElementById('stsa_prompt_presets');
    prompt?.classList.add('stsa_hidden_legacy');
    promptPresets?.classList.add('stsa_hidden_legacy');
    const negativePrompt = document.getElementById('stsa_negative_prompt')?.closest('label');
    const negativePromptPresets = document.getElementById('stsa_negative_prompt_presets');
    const modePromptPresets = document.getElementById('stsa_mode_prompt_presets');
    const injection = document.getElementById('stsa_inject_counter')?.closest('.stsa_debug');
    const appearance = document.getElementById('stsa_toast_appearance');
    const colors = document.getElementById('stsa_toast_theme_section');
    const debug = document.getElementById('stsa_debug_grant')?.closest('.stsa_debug');

    const createSection = (id, title, nodes, collapsed = true) => {
        const section = document.createElement('div');
        section.className = `stsa_section${collapsed ? ' stsa_section_collapsed' : ''}`;
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
    root.appendChild(createSection('core', uiText('section_core'), [achievementMode, cooldownGrid, enforce, dedupe], false));
    root.appendChild(createSection('mode_prompts', uiText('section_prompt'), [modePromptPresets], false));
    root.appendChild(createSection('injection', uiText('section_injection'), [injection], true));
    root.appendChild(createSection('prepared', uiText('section_prepared'), [autoCollectPrepared, preparedTools, externalApi], true));
    root.appendChild(createSection('notifications', uiText('section_notifications'), [toasts, sound, soundVolume, glow, showFloatingButton], false));
    root.appendChild(createSection('appearance', uiText('section_appearance'), [appearance, colors], true));
    root.appendChild(createSection('advanced', uiText('section_advanced'), [negativePrompt, negativePromptPresets], true));
    root.appendChild(createSection('debug', uiText('section_debug'), [debug], true));
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
    const getModePromptPresets = () => settings.modePromptPresets.filter((item) => item.mode === settings.achievementMode);
    const getModePromptPreset = () => {
        const list = getModePromptPresets();
        const activeId = settings.activeModePromptPresetIds?.[settings.achievementMode];
        return list.find((item) => item.id === activeId) || list[0];
    };
    const fillModePromptPresetSelect = () => {
        const select = $('#stsa_mode_prompt_preset_select');
        const options = getModePromptPresets().map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join('');
        select.html(options);
        const active = getModePromptPreset();
        select.val(active?.id || '');
    };
    const syncModePromptPresetFields = () => {
        const active = getModePromptPreset();
        if (!active) {
            $('#stsa_mode_prompt_preset_name').val('');
            $('#stsa_mode_prompt_template').val('');
            return;
        }
        settings.activeModePromptPresetIds[settings.achievementMode] = active.id;
        $('#stsa_mode_prompt_preset_name').val(active.name);
        $('#stsa_mode_prompt_template').val(active.template);
    };
    const setExternalStatus = (text, kind = 'info') => {
        const el = document.getElementById('stsa_external_status');
        if (!el) return;
        el.textContent = text;
        el.classList.remove('is-ok', 'is-error', 'is-warning');
        if (kind === 'ok') el.classList.add('is-ok');
        if (kind === 'error') el.classList.add('is-error');
        if (kind === 'warning') el.classList.add('is-warning');
    };
    const fillExternalEndpointPresetSelect = () => {
        const select = $('#stsa_external_endpoint_preset');
        const options = EXTERNAL_API_ENDPOINT_PRESETS
            .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
            .join('');
        select.html(options);
        select.val(settings.externalQuickApiEndpointPreset);
    };
    const fillExternalModelSelect = () => {
        const select = $('#stsa_external_quick_model_select');
        const options = ['<option value="">-</option>']
            .concat(settings.externalQuickApiModelOptions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`))
            .join('');
        select.html(options);
        select.val(settings.externalQuickApiModel);
    };
    const fillExternalProfiles = () => {
        const context = getContext();
        const profiles = getConnectionProfiles(context);
        const select = $('#stsa_external_profile');
        const options = ['<option value="">-</option>']
            .concat(profiles
                .filter((item) => item?.name)
                .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`))
            .join('');
        select.html(options);
        select.val(settings.externalConnectionProfile);
        if (settings.externalConnectionProfile && !profiles.some((item) => item?.name === settings.externalConnectionProfile)) {
            settings.externalConnectionProfile = '';
            select.val('');
            saveSettings();
        }
    };
    const refreshExternalSourceVisibility = () => {
        const source = settings.externalApiSource;
        $('#stsa_external_quick_fields').toggle(source === 'quick_api');
        $('#stsa_external_profile_fields').toggle(source === 'connection_profile');
        if (source === 'disabled') {
            setExternalStatus(uiText('external_api_status_off'));
        } else if (source === 'quick_api') {
            if (!settings.externalQuickApiUrl) setExternalStatus(uiText('external_api_status_need_url'), 'warning');
            else if (!settings.externalQuickApiModel) setExternalStatus(uiText('external_api_status_need_model'), 'warning');
            else setExternalStatus(`${settings.externalQuickApiUrl} -> ${settings.externalQuickApiModel}`);
        } else if (source === 'connection_profile') {
            if (!settings.externalConnectionProfile) setExternalStatus(uiText('external_api_status_need_profile'), 'warning');
            else setExternalStatus(settings.externalConnectionProfile);
        }
    };

    $('#stsa_enabled').prop('checked', settings.enabled);
    $('#stsa_cooldown_mode').val(settings.cooldownMode);
    $('#stsa_cooldown').val(settings.cooldown);
    $('#stsa_cooldown_min').val(settings.cooldownMin);
    $('#stsa_cooldown_max').val(settings.cooldownMax);
    $('#stsa_use_cooldown').prop('checked', settings.useCooldown);
    $('#stsa_depth').val(settings.injectDepth);
    $('#stsa_role').val(settings.injectRole);
    $(`input[name="stsa_inject_position"][value="${settings.injectPosition}"]`).prop('checked', true);
    $('#stsa_inject_interval').val(settings.injectInterval);
    $('#stsa_enforce_local_cooldown').prop('checked', settings.enforceLocalCooldown);
    $('#stsa_dedupe').prop('checked', settings.dedupeByName);
    $('#stsa_achievement_mode').val(settings.achievementMode);
    $('#stsa_auto_collect_prepared').prop('checked', settings.autoCollectPreparedFromAi);
    $('#stsa_external_source').val(settings.externalApiSource);
    $('#stsa_external_quick_url').val(settings.externalQuickApiUrl);
    $('#stsa_external_quick_key').val(settings.externalQuickApiKey);
    $('#stsa_external_quick_model_input').val(settings.externalQuickApiModel);
    fillExternalEndpointPresetSelect();
    fillExternalModelSelect();
    fillExternalProfiles();
    refreshExternalSourceVisibility();
    $('#stsa_debug_verbose').prop('checked', settings.debugVerbose);
    $('#stsa_toasts').prop('checked', settings.showToasts);
    $('#stsa_achievement_sound').prop('checked', settings.achievementSoundEnabled);
    $('#stsa_achievement_sound_volume').val(settings.achievementSoundVolume);
    $('#stsa_achievement_sound_volume').prop('disabled', !settings.achievementSoundEnabled);
    $('#stsa_show_floating_button').prop('checked', settings.showFloatingButton);
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
    fillModePromptPresetSelect();
    syncModePromptPresetFields();
    const refreshCooldownModeVisibility = () => {
        const mode = settings.cooldownMode;
        $('.stsa_cooldown_fixed_field').toggle(mode === 'fixed');
        $('.stsa_cooldown_float_field').toggle(mode === 'floating');
        $('#stsa_enforce_local_cooldown').prop('disabled', mode === 'off');
    };
    refreshCooldownModeVisibility();
    refreshInjectCounter(getInjectState(settings.injectInterval), settings.injectInterval);
    refreshDebugStatus();

    $('#stsa_enabled').on('change', function() {
        settings.enabled = Boolean($(this).prop('checked'));
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_cooldown_mode').on('change', function() {
        settings.cooldownMode = String($(this).val() || 'fixed');
        settings.useCooldown = settings.cooldownMode !== 'off';
        $('#stsa_use_cooldown').prop('checked', settings.useCooldown);
        refreshCooldownModeVisibility();
        saveSettings();
        applyPromptInjection();
        scheduleRescan(false);
    });
    $('#stsa_cooldown').on('input', function() {
        settings.cooldown = Math.max(1, Number($(this).val()) || 1);
        saveSettings();
        applyPromptInjection();
        scheduleRescan(false);
    });
    $('#stsa_cooldown_min').on('input', function() {
        settings.cooldownMin = Math.max(1, Number($(this).val()) || 1);
        if (settings.cooldownMin > settings.cooldownMax) {
            settings.cooldownMax = settings.cooldownMin;
            $('#stsa_cooldown_max').val(settings.cooldownMax);
        }
        saveSettings();
        applyPromptInjection();
        scheduleRescan(false);
    });
    $('#stsa_cooldown_max').on('input', function() {
        settings.cooldownMax = Math.max(1, Number($(this).val()) || 1);
        if (settings.cooldownMax < settings.cooldownMin) {
            settings.cooldownMin = settings.cooldownMax;
            $('#stsa_cooldown_min').val(settings.cooldownMin);
        }
        saveSettings();
        applyPromptInjection();
        scheduleRescan(false);
    });
    $('#stsa_use_cooldown').on('change', function() {
        settings.useCooldown = Boolean($(this).prop('checked'));
        settings.cooldownMode = settings.useCooldown ? 'fixed' : 'off';
        $('#stsa_cooldown_mode').val(settings.cooldownMode);
        refreshCooldownModeVisibility();
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
    $('#stsa_achievement_mode').on('change', function() {
        settings.achievementMode = String($(this).val() || 'hybrid');
        fillModePromptPresetSelect();
        syncModePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_auto_collect_prepared').on('change', function() {
        settings.autoCollectPreparedFromAi = Boolean($(this).prop('checked'));
        saveSettings();
        scheduleRescan(false);
    });
    $('#stsa_external_source').on('change', function() {
        settings.externalApiSource = String($(this).val() || 'disabled');
        saveSettings();
        refreshExternalSourceVisibility();
    });
    $('#stsa_external_endpoint_preset').on('change', function() {
        const id = String($(this).val() || 'custom');
        settings.externalQuickApiEndpointPreset = id;
        const preset = EXTERNAL_API_ENDPOINT_PRESETS.find((item) => item.id === id);
        if (preset?.url) {
            settings.externalQuickApiUrl = preset.url;
            $('#stsa_external_quick_url').val(preset.url);
        }
        saveSettings();
    });
    $('#stsa_external_quick_url').on('change', function() {
        settings.externalQuickApiUrl = normalizeBaseUrl($(this).val());
        $(this).val(settings.externalQuickApiUrl);
        const preset = EXTERNAL_API_ENDPOINT_PRESETS.find((item) => item.url === settings.externalQuickApiUrl);
        settings.externalQuickApiEndpointPreset = preset?.id || 'custom';
        $('#stsa_external_endpoint_preset').val(settings.externalQuickApiEndpointPreset);
        saveSettings();
    });
    $('#stsa_external_quick_key').on('change', function() {
        settings.externalQuickApiKey = String($(this).val() || '').trim();
        saveSettings();
    });
    $('#stsa_external_quick_model_select').on('change', function() {
        settings.externalQuickApiModel = String($(this).val() || '').trim();
        if (settings.externalQuickApiModel) {
            $('#stsa_external_quick_model_input').val(settings.externalQuickApiModel);
        }
        saveSettings();
    });
    $('#stsa_external_quick_model_input').on('input', function() {
        settings.externalQuickApiModel = String($(this).val() || '').trim();
        if (settings.externalQuickApiModel) {
            $('#stsa_external_quick_model_select').val('');
        }
        saveSettings();
    });
    $('#stsa_external_refresh_profiles').on('click', function() {
        fillExternalProfiles();
        setExternalStatus(uiText('external_api_status_ok'), 'ok');
    });
    $('#stsa_external_profile').on('change', function() {
        settings.externalConnectionProfile = String($(this).val() || '');
        saveSettings();
    });
    $('#stsa_external_fetch_models').on('click', async function() {
        const btn = this;
        if (!settings.externalQuickApiUrl) {
            setExternalStatus(uiText('external_api_status_need_url'), 'warning');
            return;
        }
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = '...';
        try {
            const models = await fetchQuickApiModels(settings.externalQuickApiUrl, settings.externalQuickApiKey);
            settings.externalQuickApiModelOptions = models;
            if (!settings.externalQuickApiModel && models.length) {
                settings.externalQuickApiModel = models[0];
                $('#stsa_external_quick_model_input').val(settings.externalQuickApiModel);
            }
            fillExternalModelSelect();
            saveSettings();
            setExternalStatus(`OK: ${models.length}`, 'ok');
        } catch (error) {
            setExternalStatus(String(error?.message || error), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = original;
        }
    });
    $('#stsa_external_check').on('click', async function() {
        const btn = this;
        const source = settings.externalApiSource;
        if (source === 'disabled') {
            setExternalStatus(uiText('external_api_status_off'));
            return;
        }
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = '...';
        try {
            if (source === 'quick_api') {
                if (!settings.externalQuickApiUrl) throw new Error(uiText('external_api_status_need_url'));
                if (!settings.externalQuickApiModel) throw new Error(uiText('external_api_status_need_model'));
                const result = await checkQuickApiConnection(settings.externalQuickApiUrl, settings.externalQuickApiKey);
                setExternalStatus(`${uiText('external_api_status_ok')} (${result.modelsCount})`, 'ok');
            } else if (source === 'connection_profile') {
                if (!settings.externalConnectionProfile) throw new Error(uiText('external_api_status_need_profile'));
                const context = getContext();
                const profile = getConnectionProfile(context, settings.externalConnectionProfile);
                if (!profile) throw new Error(uiText('external_api_status_profile_missing'));
                if (!isConnectionProfileSupported(context, profile)) throw new Error(uiText('external_api_status_profile_unsupported'));
                if (typeof getRequestHeaders !== 'function') throw new Error('getRequestHeaders unavailable');
                setExternalStatus(`${uiText('external_api_status_ok')} (${profile.name})`, 'ok');
            }
        } catch (error) {
            setExternalStatus(String(error?.message || error), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = original;
        }
    });
    $('#stsa_debug_verbose').on('change', function() {
        settings.debugVerbose = Boolean($(this).prop('checked'));
        saveSettings();
    });
    $('#stsa_settings_open_prepared').on('click', openPreparedModal);
    $('#stsa_debug_dump').on('click', function() {
        const payload = {
            injection: runtimeDebug.lastInjection,
            rescan: runtimeDebug.lastRescan,
            marker: runtimeDebug.lastMarker,
            scanDiagnostics: runtimeDebug.lastScanDiagnostics,
            settings: {
                mode: settings.achievementMode,
                useCooldown: settings.useCooldown,
                cooldownMode: settings.cooldownMode,
                cooldown: settings.cooldown,
                cooldownMin: settings.cooldownMin,
                cooldownMax: settings.cooldownMax,
                injectInterval: settings.injectInterval,
                autoCollectPreparedFromAi: settings.autoCollectPreparedFromAi,
                externalApiSource: settings.externalApiSource,
                externalQuickApiUrl: settings.externalQuickApiUrl,
                externalQuickApiModel: settings.externalQuickApiModel,
                externalConnectionProfile: settings.externalConnectionProfile,
            },
            prepared: {
                total: getPreparedAchievements().length,
                available: getAvailablePreparedAchievements().length,
            },
        };
        console.log(`[${MODULE_NAME}] debug dump`, payload);
        toastr.info('STSA debug dump written to console');
    });
    $('#stsa_toasts').on('change', function() {
        settings.showToasts = Boolean($(this).prop('checked'));
        saveSettings();
    });
    $('#stsa_achievement_sound').on('change', function() {
        settings.achievementSoundEnabled = Boolean($(this).prop('checked'));
        $('#stsa_achievement_sound_volume').prop('disabled', !settings.achievementSoundEnabled);
        saveSettings();
    });
    $('#stsa_achievement_sound_volume').on('input', function() {
        settings.achievementSoundVolume = Math.min(100, Math.max(0, Number($(this).val()) || 0));
        saveSettings();
    });
    $('#stsa_show_floating_button').on('change', function() {
        settings.showFloatingButton = Boolean($(this).prop('checked'));
        saveSettings();
        updateFloatingButtonVisibility();
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
    $('#stsa_mode_prompt_preset_select').on('change', function() {
        const selectedId = String($(this).val() || '');
        const active = getModePromptPresets().find((item) => item.id === selectedId);
        if (!active) return;
        settings.activeModePromptPresetIds[settings.achievementMode] = active.id;
        syncModePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_mode_prompt_template').on('input', function() {
        const active = getModePromptPreset();
        if (!active) return;
        active.template = String($(this).val() || '');
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_mode_prompt_new').on('click', function() {
        const source = getModePromptPreset();
        const name = normalizeText($('#stsa_mode_prompt_preset_name').val()) || uiText('new_prompt_default');
        const created = normalizeModePromptPreset({
            id: makePresetId('mode_prompt', `${settings.achievementMode}_${name}`),
            mode: settings.achievementMode,
            name,
            template: source?.template || '',
        }, 'mode_prompt');
        settings.modePromptPresets.push(created);
        settings.activeModePromptPresetIds[settings.achievementMode] = created.id;
        fillModePromptPresetSelect();
        syncModePromptPresetFields();
        saveSettings();
    });
    $('#stsa_mode_prompt_save').on('click', function() {
        const active = getModePromptPreset();
        if (!active) return;
        active.name = normalizeText($('#stsa_mode_prompt_preset_name').val()) || active.name;
        active.template = String($('#stsa_mode_prompt_template').val() || '');
        fillModePromptPresetSelect();
        syncModePromptPresetFields();
        saveSettings();
        applyPromptInjection();
    });
    $('#stsa_mode_prompt_delete').on('click', function() {
        const list = getModePromptPresets();
        if (list.length <= 1) {
            toastr.warning(uiText('warning_keep_one_prompt'));
            return;
        }
        const active = getModePromptPreset();
        if (!active) return;
        settings.modePromptPresets = settings.modePromptPresets.filter((item) => item.id !== active.id);
        const next = getModePromptPresets()[0];
        settings.activeModePromptPresetIds[settings.achievementMode] = next?.id || '';
        fillModePromptPresetSelect();
        syncModePromptPresetFields();
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
    ensurePreparedPanel();
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













