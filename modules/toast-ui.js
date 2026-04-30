function getToastContainer(getSettings) {
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

function getToastThemeColors(settings, toastThemes) {
    const active = settings.toastThemePresets?.find((item) => item.id === settings.activeToastThemePresetId);
    if (active) {
        return active;
    }
    return settings.toastThemePresets?.[0] || toastThemes.night;
}

function showToast(achievement, deps) {
    const { getSettings, toastThemes, escapeHtml, uiText } = deps;
    const settings = getSettings();
    const theme = getToastThemeColors(settings, toastThemes);
    const container = getToastContainer(getSettings);
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

export {
    getToastContainer,
    showToast,
};
