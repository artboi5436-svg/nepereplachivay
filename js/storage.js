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

/**
 * Скачивание введённых данных в формате JSON-файла.
 */
export function exportDataAsJson(data) {
  const exportPayload = {
    appName: 'ТарифДетокс',
    siteUrl: window.location.origin,
    exportedAt: new Date().toISOString(),
    notice: 'Все данные сохранены локально в вашем браузере.',
    data
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `ne-pereplachivay-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Чтение загруженного пользователем JSON-файла.
 */
export function importDataFromJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Файл не выбран'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json && json.data) {
          resolve(json.data);
        } else if (json && typeof json === 'object') {
          resolve(json);
        } else {
          reject(new Error('Некорректный формат файла резервной копии.'));
        }
      } catch (err) {
        reject(new Error('Не удалось прочитать JSON: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла.'));
    reader.readAsText(file, 'utf-8');
  });
}
