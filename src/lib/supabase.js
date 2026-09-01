const LOGS_KEY = 'dashboard_activity_logs';
const USERS_KEY = 'dashboard_local_users';
const MAX_LOGS = 200;

const readStore = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

const writeStore = (key, rows) => {
    try {
        localStorage.setItem(key, JSON.stringify(rows));
    } catch (e) {
        console.error('Failed to persist local store:', e);
    }
};

export const logAction = async (action, details, performedBy) => {
    const logs = readStore(LOGS_KEY);
    logs.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        action,
        details,
        performed_by: performedBy || 'system',
        timestamp: new Date().toISOString()
    });
    writeStore(LOGS_KEY, logs.slice(0, MAX_LOGS));
};

export const fetchLocalLogs = () => readStore(LOGS_KEY);
