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

export {
    normalizeText,
    escapeHtml,
    hashString,
};
