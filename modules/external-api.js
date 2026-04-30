const PROFILE_API_TO_SECRET_KEY = {
    oai: 'api_key_openai',
    google: 'api_key_makersuite',
    'openrouter-text': 'api_key_openrouter',
    kcpp: 'api_key_koboldcpp',
    oobabooga: 'api_key_ooba',
    textgenerationwebui: 'api_key_ooba',
};

function normalizeBaseUrl(url) {
    return String(url || '').trim().replace(/\/+$/, '');
}

function makeAuthHeaders(apiKey, withJson = false) {
    const headers = withJson ? { 'Content-Type': 'application/json' } : {};
    const key = String(apiKey || '').trim();
    if (key) headers.Authorization = `Bearer ${key}`;
    return headers;
}

async function fetchQuickApiModels(url, apiKey = '') {
    const base = normalizeBaseUrl(url);
    if (!base) throw new Error('Quick API URL is empty');
    const res = await fetch(`${base}/models`, { headers: makeAuthHeaders(apiKey, false) });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 140)}` : ''}`);
    }
    const json = await res.json();
    return (json?.data || json?.models || [])
        .map((item) => (typeof item === 'string' ? item : item?.id))
        .filter(Boolean)
        .sort();
}

async function checkQuickApiConnection(url, apiKey = '') {
    const models = await fetchQuickApiModels(url, apiKey);
    return { ok: true, modelsCount: models.length };
}

async function postQuickApiChatCompletions({
    url,
    apiKey = '',
    model,
    messages,
    maxTokens = 300,
    temperature = 0.7,
}) {
    const base = normalizeBaseUrl(url);
    if (!base) throw new Error('Quick API URL is empty');
    if (!model) throw new Error('Quick API model is empty');
    const payload = {
        model: String(model),
        messages: Array.isArray(messages) ? messages : [],
        max_tokens: Math.max(1, Number(maxTokens) || 300),
        temperature: Number.isFinite(Number(temperature)) ? Number(temperature) : 0.7,
    };
    const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: makeAuthHeaders(apiKey, true),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 140)}` : ''}`);
    }
    return res.json();
}

function extractTextFromApiResponse(response) {
    if (!response) return null;
    if (typeof response === 'string') return response;
    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content.trim();
    if (Array.isArray(content)) {
        const text = content
            .filter((part) => part?.type === 'text' && typeof part.text === 'string')
            .map((part) => part.text)
            .join('\n')
            .trim();
        return text || null;
    }
    if (typeof response?.text === 'string') return response.text.trim();
    if (typeof response?.message === 'string') return response.message.trim();
    return null;
}

function profileApiToSecretKey(apiName) {
    if (!apiName) return null;
    const lower = String(apiName).toLowerCase();
    if (PROFILE_API_TO_SECRET_KEY[lower]) return PROFILE_API_TO_SECRET_KEY[lower];
    return `api_key_${lower}`;
}

function getConnectionProfiles(context) {
    const profiles = context?.extensionSettings?.connectionManager?.profiles;
    return Array.isArray(profiles) ? profiles : [];
}

function getConnectionProfile(context, profileName) {
    if (!profileName) return null;
    return getConnectionProfiles(context).find((item) => item?.name === profileName) || null;
}

function getSupportedConnectionSources(context) {
    const raw = context?.ConnectionManagerRequestService?.supportedSources;
    return Array.isArray(raw) ? raw.map((item) => String(item || '').toLowerCase()) : [];
}

function isConnectionProfileSupported(context, profile) {
    if (!profile?.api) return false;
    const supported = getSupportedConnectionSources(context);
    if (!supported.length) return true;
    return supported.includes(String(profile.api).toLowerCase());
}

async function getActiveSecretId(secretKey, getRequestHeaders) {
    try {
        const res = await fetch('/api/secrets/read', {
            method: 'POST',
            headers: getRequestHeaders(),
        });
        if (!res.ok) return null;
        const state = await res.json();
        const list = state?.[secretKey];
        if (!Array.isArray(list)) return null;
        const active = list.find((item) => item?.active);
        return active?.id || null;
    } catch {
        return null;
    }
}

async function rotateSecretServerOnly(secretKey, secretId, getRequestHeaders) {
    try {
        const res = await fetch('/api/secrets/rotate', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ key: secretKey, id: secretId }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

async function sendWithConnectionProfile({
    context,
    profileName,
    messages,
    maxTokens = 300,
    getRequestHeaders,
}) {
    if (!context?.ConnectionManagerRequestService) {
        throw new Error('ConnectionManagerRequestService is not available');
    }
    const profile = getConnectionProfile(context, profileName);
    if (!profile) throw new Error(`Profile "${profileName}" not found`);
    if (!isConnectionProfileSupported(context, profile)) {
        throw new Error(`Profile source "${profile.api || '-'}" is not supported`);
    }

    const profileSecretId = profile['secret-id'] || null;
    const secretKey = profileApiToSecretKey(profile.api);
    let previousSecretId = null;
    let rotated = false;

    if (profileSecretId && secretKey) {
        previousSecretId = await getActiveSecretId(secretKey, getRequestHeaders);
        if (previousSecretId !== profileSecretId) {
            rotated = await rotateSecretServerOnly(secretKey, profileSecretId, getRequestHeaders);
        }
    }

    try {
        return await context.ConnectionManagerRequestService.sendRequest(
            profile.id,
            Array.isArray(messages) ? messages : [],
            Math.max(1, Number(maxTokens) || 300),
            {
                stream: false,
                extractData: true,
                includePreset: true,
                includeInstruct: true,
            },
        );
    } finally {
        if (rotated && previousSecretId && secretKey) {
            await rotateSecretServerOnly(secretKey, previousSecretId, getRequestHeaders).catch(() => {});
        }
    }
}

export {
    PROFILE_API_TO_SECRET_KEY,
    normalizeBaseUrl,
    fetchQuickApiModels,
    checkQuickApiConnection,
    postQuickApiChatCompletions,
    extractTextFromApiResponse,
    profileApiToSecretKey,
    getConnectionProfiles,
    getConnectionProfile,
    getSupportedConnectionSources,
    isConnectionProfileSupported,
    getActiveSecretId,
    rotateSecretServerOnly,
    sendWithConnectionProfile,
};
