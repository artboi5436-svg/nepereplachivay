/**
 * Скрипт валидации данных о тарифах и подписках.
 * Проверяет:
 * 1. Корректность синтаксиса JSON.
 * 2. Наличие всех обязательных полей.
 * 3. Формат URL (официальные ссылки, страницы отмены).
 * 4. Свежесть даты обновления (предупреждение, если старше 90 дней).
 * 5. Наличие рекламных маркировок (erid) у партнёрских ссылок.
 * 
 * Запуск: node scripts/validate-data.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DATA_DIR = resolve('data');
const MAX_AGE_DAYS = 90;
const NOW = new Date();

let errorsCount = 0;
let warningsCount = 0;

function logError(file, id, msg) {
  console.error(`❌ [ОШИБКА] ${file} ${id ? `(${id})` : ''}: ${msg}`);
  errorsCount++;
}

function logWarning(file, id, msg) {
  console.warn(`⚠️ [ПРЕДУПРЕЖДЕНИЕ] ${file} ${id ? `(${id})` : ''}: ${msg}`);
  warningsCount++;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function checkDateFreshness(dateStr, file, id) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    logError(file, id, `Некорректный формат даты '${dateStr}'. Ожидается YYYY-MM-DD.`);
    return;
  }
  const date = new Date(dateStr);
  const diffDays = Math.floor((NOW - date) / (1000 * 60 * 60 * 24));
  if (diffDays > MAX_AGE_DAYS) {
    logWarning(file, id, `Тариф не обновлялся ${diffDays} дн. (дата: ${dateStr}). Пора проверить актуальность!`);
  }
}

function validateMobile(items, filename) {
  const required = ['id', 'operator', 'tariffName', 'region', 'monthlyPrice', 'includedGb', 'includedMinutes', 'officialUrl', 'updatedAt', 'isDemo'];
  const ids = new Set();

  for (const item of items) {
    if (ids.has(item.id)) logError(filename, item.id, `Дубликат id: ${item.id}`);
    ids.add(item.id);

    for (const field of required) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        logError(filename, item.id, `Отсутствует обязательное поле '${field}'`);
      }
    }

    if (typeof item.monthlyPrice !== 'number' || item.monthlyPrice < 0) {
      logError(filename, item.id, `monthlyPrice должен быть неотрицательным числом`);
    }

    if (item.officialUrl && !isValidUrl(item.officialUrl)) {
      logError(filename, item.id, `Некорректный URL официальной страницы: ${item.officialUrl}`);
    }

    if (item.isPartner && !item.adErid) {
      logError(filename, item.id, `Партнёрская ссылка помечена isPartner=true, но отсутствует erid (ФЗ 'О рекламе')`);
    }

    checkDateFreshness(item.updatedAt, filename, item.id);
  }
}

function validateInternet(items, filename) {
  const required = ['id', 'operator', 'tariffName', 'region', 'speedMbps', 'monthlyPrice', 'officialUrl', 'updatedAt', 'isDemo'];
  const ids = new Set();

  for (const item of items) {
    if (ids.has(item.id)) logError(filename, item.id, `Дубликат id: ${item.id}`);
    ids.add(item.id);

    for (const field of required) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        logError(filename, item.id, `Отсутствует обязательное поле '${field}'`);
      }
    }

    if (typeof item.speedMbps !== 'number' || item.speedMbps <= 0) {
      logError(filename, item.id, `speedMbps должен быть положительным числом`);
    }

    if (item.officialUrl && !isValidUrl(item.officialUrl)) {
      logError(filename, item.id, `Некорректный URL: ${item.officialUrl}`);
    }

    checkDateFreshness(item.updatedAt, filename, item.id);
  }
}

function validateSubscriptions(items, filename) {
  const required = ['id', 'name', 'category', 'monthlyPrice', 'officialUrl', 'cancelUrl', 'updatedAt', 'isDemo'];
  const ids = new Set();

  for (const item of items) {
    if (ids.has(item.id)) logError(filename, item.id, `Дубликат id: ${item.id}`);
    ids.add(item.id);

    for (const field of required) {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        logError(filename, item.id, `Отсутствует обязательное поле '${field}'`);
      }
    }

    if (item.cancelUrl && !isValidUrl(item.cancelUrl)) {
      logError(filename, item.id, `Некорректная ссылка на отмену подписки: ${item.cancelUrl}`);
    }

    checkDateFreshness(item.updatedAt, filename, item.id);
  }
}

function validateInsurance(items, filename) {
  const required = ['id', 'name', 'description', 'questions', 'whatToWatch', 'officialTools'];
  for (const item of items) {
    for (const field of required) {
      if (!item[field]) {
        logError(filename, item.id, `Отсутствует поле '${field}'`);
      }
    }
    if (Array.isArray(item.officialTools)) {
      for (const tool of item.officialTools) {
        if (!tool.url || !isValidUrl(tool.url)) {
          logError(filename, item.id, `Некорректный URL инструмента: ${tool.url}`);
        }
      }
    }
  }
}

console.log('🔍 Запуск проверки данных в папке data/...\n');

try {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const fullPath = join(DATA_DIR, file);
    let data;
    try {
      const content = readFileSync(fullPath, 'utf-8');
      data = JSON.parse(content);
    } catch (e) {
      logError(file, null, `Ошибка парсинга JSON: ${e.message}`);
      continue;
    }

    if (!Array.isArray(data)) {
      logError(file, null, 'Корневой элемент JSON должен быть массивом');
      continue;
    }

    console.log(`Проверка ${file} (${data.length} записей)...`);
    if (file === 'mobile.json') validateMobile(data, file);
    else if (file === 'internet.json') validateInternet(data, file);
    else if (file === 'subscriptions.json') validateSubscriptions(data, file);
    else if (file === 'insurance.json') validateInsurance(data, file);
  }

  console.log('\n----------------------------------------');
  console.log(`Итог проверки: Ошибок: ${errorsCount}, Предупреждений: ${warningsCount}`);
  if (errorsCount > 0) {
    console.error('❌ Найдены критические ошибки в данных тарифов. Исправьте их перед публикацией.');
    process.exit(1);
  } else {
    console.log('✅ Все файлы данных прошли проверку успешно.');
  }
} catch (err) {
  console.error(`Критический сбой скрипта валидации: ${err.message}`);
  process.exit(1);
}
