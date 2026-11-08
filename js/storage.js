/**
 * Модуль локального хранения (localStorage) и экспорта/импорта данных в JSON.
 * Вся информация хранится исключительно на устройстве пользователя.
 */

const STORAGE_KEY = 'ne_pereplachivay_user_data_v1';

export function saveUserData(data) {
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      data
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('Ошибка сохранения в localStorage:', e);
    return false;
  }
}

export function loadUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch (e) {
    console.error('Ошибка чтения из localStorage:', e);
    return null;
  }
}

export function clearUserData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

