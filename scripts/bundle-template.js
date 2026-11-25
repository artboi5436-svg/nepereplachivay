/**
 * Единый самодостаточный бандл «ТарифДетокс».
 * Включает встроенную базу данных, калькулятор TCO, проверку дубликатов,
 * мастер ввода (Wizard), шаблоны заявлений и SPA-навигацию.
 * Работает без серверов: как локально (file://), так и на GitHub Pages.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. ВСТРОЕННАЯ БАЗА ДАННЫХ (ОФФЛАЙН / СТАТИКА)
  // ==========================================
  const DEFAULT_DATA = {
    mobile: /*__MOBILE__*/,
    internet: /*__INTERNET__*/,
    subscriptions: /*__SUBSCRIPTIONS__*/,
    insurance: /*__INSURANCE__*/
  };

  let dbMobile = DEFAULT_DATA.mobile;
  let dbInternet = DEFAULT_DATA.internet;
  let dbSubscriptions = DEFAULT_DATA.subscriptions;
  let dbInsurance = DEFAULT_DATA.insurance;

  /**
   * Фоновое обновление базы данных (только по http/https, не блокирует UI)
   */
  async function loadDatabase() {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      try {
        const [resMob, resNet, resSub, resIns] = await Promise.all([
          fetch('data/mobile.json').then(r => r.ok ? r.json() : null),
          fetch('data/internet.json').then(r => r.ok ? r.json() : null),
          fetch('data/subscriptions.json').then(r => r.ok ? r.json() : null),
          fetch('data/insurance.json').then(r => r.ok ? r.json() : null)
        ]);
        let subsChanged = false;
        let insChanged = false;
        if (resMob) dbMobile = resMob;
        if (resNet) dbInternet = resNet;
        if (resSub && JSON.stringify(resSub) !== JSON.stringify(dbSubscriptions)) {
          dbSubscriptions = resSub;
          subsChanged = true;
        }
        if (resIns && JSON.stringify(resIns) !== JSON.stringify(dbInsurance)) {
          dbInsurance = resIns;
          insChanged = true;
        }
        if (wizard) {
          if (subsChanged) {
            renderSubscriptionsGrid(
              wizard.state.subscriptions.selectedIds,
              wizard.state.subscriptions.unusedIds,
              wizard.state.subscriptions.customItems
            );
          }
          if (insChanged) {
            renderInsuranceSelector(wizard.state.insurance.selectedTypes);
          }
        }
      } catch (err) {
        // При ошибке сети продолжаем использовать встроенную базу данных
        console.warn('Фоновое обновление данных не удалось, используется встроенная база:', err);
      }
    }
  }

  // ==========================================
  // 1.1. УТИЛИТЫ БЕЗОПАСНОСТИ, TOAST И БУФЕР
  // ==========================================
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeHref(url) {
    if (!url || typeof url !== 'string') return '#';
    try {
      const parsed = new URL(url, window.location.href);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return escapeHtml(parsed.href);
      }
    } catch (_) {}
    return '#';
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3200);
  }

  function copyToClipboard(text, btn, feedbackMsg) {
    const onSuccess = () => {
      if (btn) {
        const orig = btn.dataset.origText || btn.textContent;
        btn.dataset.origText = orig;
        btn.textContent = '✓ Скопировано!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = orig;
          btn.disabled = false;
        }, 1800);
      }
      showToast(feedbackMsg || 'Скопировано в буфер обмена', 'success');
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      try {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'fixed';
        tmp.style.left = '-9999px';
        document.body.appendChild(tmp);
        tmp.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(tmp);
        if (ok) onSuccess();
        else showToast('Выделите текст и нажмите Ctrl+C', 'error');
      } catch (_) {
        showToast('Выделите текст и нажмите Ctrl+C', 'error');
      }
    }
  }

  // ==========================================
  // 2. ХРАНИЛИЩЕ LOCALSTORAGE И ЭКСПОРТ/ИМПОРТ
  // ==========================================
  const STORAGE_KEY = 'ne_pereplachivay_user_data_v1';

  function saveUserData(data) {
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

  function loadUserData() {
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

  function clearUserData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // 3. АНАЛИЗАТОР ДУБЛИКАТОВ ПОДПИСОК
  // ==========================================
  function analyzeSubscriptionDuplicates(selectedIds = [], subscriptionsList = []) {
    const selectedSet = new Set(selectedIds);
    const dbMap = new Map(subscriptionsList.map(s => [s.id, s]));
    const issues = [];
    const processedDuplicates = new Set();

    for (const id of selectedIds) {
      const sub = dbMap.get(id);
      if (!sub) continue;

      if (sub.bundledInside && selectedSet.has(sub.bundledInside) && !processedDuplicates.has(sub.id)) {
        const parent = dbMap.get(sub.bundledInside);
        processedDuplicates.add(sub.id);
        issues.push({
          type: 'direct_bundle_duplicate',
          severity: 'high',
          duplicateId: sub.id,
          duplicateName: sub.name,
          parentName: parent ? parent.name : 'пакет экосистемы',
          monthlySavings: Number(sub.monthlyPrice) || 0,
          message: '«' + sub.name + '» уже полностью входит в вашу подписку «' + (parent ? parent.name : '') + '». Вы переплачиваете дважды за один и тот же контент!'
        });
      }

      if (Array.isArray(sub.includesServices)) {
        for (const childId of sub.includesServices) {
          if (selectedSet.has(childId) && !processedDuplicates.has(childId)) {
            const childSub = dbMap.get(childId);
            processedDuplicates.add(childId);
            issues.push({
              type: 'direct_bundle_duplicate',
              severity: 'high',
              duplicateId: childId,
              duplicateName: childSub ? childSub.name : childId,
              parentName: sub.name,
              monthlySavings: childSub ? Number(childSub.monthlyPrice) || 0 : 0,
              message: '«' + (childSub ? childSub.name : childId) + '» уже входит в подписку «' + sub.name + '». Рекомендуется отменить отдельную оплату.'
            });
          }
        }
      }
    }

    const cinemas = selectedIds
      .map(id => dbMap.get(id))
      .filter(s => s && s.category === 'cinema');

    if (cinemas.length >= 2) {
      const names = cinemas.map(c => '«' + c.name + '»').join(', ');
      const cheaperCinemas = [...cinemas].sort((a, b) => b.monthlyPrice - a.monthlyPrice).slice(1);
      const potentialSavings = cheaperCinemas.reduce((acc, c) => acc + (Number(c.monthlyPrice) || 0), 0);

      issues.push({
        type: 'category_cinema_overlap',
        severity: 'medium',
        duplicateId: null,
        duplicateName: 'Несколько онлайн-кинотеатров',
        monthlySavings: potentialSavings,
        message: 'У вас подключено ' + cinemas.length + ' кинотеатра: ' + names + '. Исследования показывают, что большинство людей не смотрят более одного сервиса одновременно. Выгоднее чередовать подписки по очереди, экономя до ' + potentialSavings + ' ₽/мес.'
      });
    }

    const musics = selectedIds
      .map(id => dbMap.get(id))
      .filter(s => s && s.category === 'music');

    if (musics.length >= 2) {
      const names = musics.map(m => '«' + m.name + '»').join(' и ');
      const cheaperMusics = [...musics].sort((a, b) => b.monthlyPrice - a.monthlyPrice).slice(1);
      const musicSavings = cheaperMusics.reduce((acc, m) => acc + (Number(m.monthlyPrice) || 0), 0);
      issues.push({
        type: 'category_music_overlap',
        severity: 'medium',
        duplicateId: null,
        duplicateName: 'Несколько музыкальных сервисов',
        monthlySavings: musicSavings,
        message: 'У вас одновременно оплачивается музыка в ' + names + '. Музыкальные каталоги практически идентичны — достаточно оставить один сервис, экономя ' + musicSavings + ' ₽/мес.'
      });
    }

    const clouds = selectedIds
      .map(id => dbMap.get(id))
      .filter(s => s && s.category === 'cloud');

    if (clouds.length >= 2) {
      const names = clouds.map(c => '«' + c.name + '»').join(', ');
      const cheaperClouds = [...clouds].sort((a, b) => b.monthlyPrice - a.monthlyPrice).slice(1);
      const cloudSavings = cheaperClouds.reduce((acc, c) => acc + (Number(c.monthlyPrice) || 0), 0);
      issues.push({
        type: 'category_cloud_overlap',
        severity: 'medium',
        duplicateId: null,
        duplicateName: 'Несколько облачных хранилищ',
        monthlySavings: cloudSavings,
        message: 'У вас подключено ' + clouds.length + ' облачных хранилища: ' + names + '. Консолидируйте файлы в одном сервисе и экономьте ' + cloudSavings + ' ₽/мес.'
      });
    }

    const books = selectedIds
      .map(id => dbMap.get(id))
      .filter(s => s && s.category === 'books');

    if (books.length >= 2) {
      const names = books.map(b => '«' + b.name + '»').join(' и ');
      const cheaperBooks = [...books].sort((a, b) => b.monthlyPrice - a.monthlyPrice).slice(1);
      const bookSavings = cheaperBooks.reduce((acc, b) => acc + (Number(b.monthlyPrice) || 0), 0);
      issues.push({
        type: 'category_books_overlap',
        severity: 'medium',
        duplicateId: null,
        duplicateName: 'Несколько книжных сервисов',
        monthlySavings: bookSavings,
        message: 'У вас оплачиваются книжные сервисы ' + names + '. Читать две библиотеки параллельно редко имеет смысл — можно сэкономить ' + bookSavings + ' ₽/мес.'
      });
    }

    return issues;
  }

  // ==========================================
  // 4. КАЛЬКУЛЯТОР ТАРИФОВ И TCO ЗА 12 МЕСЯЦЕВ
  // ==========================================
  const LNR_REGIONS = new Set([
    'Луганск',
    'Алчевск',
    'Краснодон',
    'Свердловск',
    'Стаханов',
    'Ровеньки',
    'Антрацит',
    'Брянка',
    'Красный Луч',
    'Северодонецк',
    'Лисичанск',
    'Рубежное',
    'Первомайск',
    'Все города ЛНР',
    'Луганская Народная Республика (ЛНР)'
  ]);

  function isAllLnrRegion(region) {
    return region === 'Все города ЛНР' || region === 'Луганская Народная Республика (ЛНР)';
  }

  function isTariffAvailableInRegion(tariffRegion, userRegion) {
    if (tariffRegion === userRegion) return true;
    if (tariffRegion === 'Все регионы' || userRegion === 'Все регионы') return true;
    if (isAllLnrRegion(tariffRegion) && LNR_REGIONS.has(userRegion)) return true;
    if (isAllLnrRegion(userRegion) && LNR_REGIONS.has(tariffRegion)) return true;
    return false;
  }

  function calculateTariffTCO12(tariff, options = {}) {
    const setupFee = Number(tariff.setupFee) || 0;
    const regularPrice = Number(tariff.monthlyPrice) || 0;
    const promoMonths = Math.min(12, Math.max(0, Number(tariff.promoDurationMonths) || 0));
    const hasPromo = promoMonths > 0 && tariff.promoMonthlyPrice !== null && tariff.promoMonthlyPrice !== undefined;
    const promoPrice = hasPromo ? Number(tariff.promoMonthlyPrice) : regularPrice;

    const regularMonths = 12 - promoMonths;
    const baseServiceCost = (promoPrice * promoMonths) + (regularPrice * regularMonths);

    const routerRentMonthly = options.needsRouter ? (Number(tariff.routerRentMonthly) || 0) : 0;
    const equipmentCost = routerRentMonthly * 12;

    const tco12 = setupFee + baseServiceCost + equipmentCost;
    const effectiveMonthly = Math.round(tco12 / 12);

    const standardAnnualCost = (regularPrice * 12) + equipmentCost + setupFee;
    const promoSavings = Math.max(0, standardAnnualCost - tco12);

    return {
      tco12,
      effectiveMonthly,
      promoSavings,
      promoMonths,
      hasPromo,
      promoPrice,
      regularPrice,
      setupFee,
      equipmentCost
    };
  }

  function findBestMobileTariff(user, tariffs = []) {
    const currentMonthly = Math.max(0, Number(user.currentPrice) || 0);
    const currentAnnualTCO = currentMonthly * 12;

    const isUnlimitedGb = Boolean(user.isUnlimitedGb || user.unlimitedGb || Number(user.gb) >= 999);
    const isUnlimitedMin = Boolean(user.isUnlimitedMinutes || user.unlimitedMinutes || Number(user.minutes) >= 5000);
    const isUnlimitedSms = Boolean(user.isUnlimitedSms || user.unlimitedSms);

    const userGb = isUnlimitedGb ? 9999 : (Number(user.gb) || 0);
    const userMin = isUnlimitedMin ? 9999 : (Number(user.minutes) || 0);
    const userSms = isUnlimitedSms ? 100 : (Number(user.sms) || 0);
    const userCity = user.region || 'Все города ЛНР';

    // Фильтруем тарифы по региону
    const regionalTariffs = tariffs.filter(t => isTariffAvailableInRegion(t.region, userCity));

    // Строгое соответствие критериям
    const matchingTariffs = regionalTariffs.filter(t => {
      const gbMatch = isUnlimitedGb
        ? (Boolean(t.isUnlimitedGb) || Number(t.includedGb) >= 999)
        : (Number(t.includedGb) >= userGb);

      const minMatch = isUnlimitedMin
        ? (Boolean(t.isUnlimitedMinutes) || Number(t.includedMinutes) >= 1500)
        : (Number(t.includedMinutes) >= userMin);

      const smsMatch = userSms === 0 || Number(t.includedSms) >= userSms;

      return gbMatch && minMatch && smsMatch;
    });

    // Подбор близких тарифов (по максимальному объёму пакетов и выгодности)
    const scoredRegional = regionalTariffs.map(t => {
      const tco = calculateTariffTCO12(t);
      const tGb = Boolean(t.isUnlimitedGb) ? 9999 : (Number(t.includedGb) || 0);
      const tMin = Boolean(t.isUnlimitedMinutes) ? 9999 : (Number(t.includedMinutes) || 0);

      const targetGb = isUnlimitedGb ? 100 : Math.max(1, userGb);
      const targetMin = isUnlimitedMin ? 1000 : Math.max(1, userMin);

      const gbRatio = Math.min(2.0, tGb / targetGb);
      const minRatio = Math.min(2.0, tMin / targetMin);
      const unlimBonus = (t.isUnlimitedGb ? 1.0 : 0) + (t.isUnlimitedMinutes ? 0.5 : 0);
      const appsBonus = (Array.isArray(t.unlimitedApps) && t.unlimitedApps.length > 0) ? (t.unlimitedApps.length * 0.1) : 0;
      const priceScore = Math.max(0.1, 1 - (tco.tco12 / 15000));

      const proximityScore = (gbRatio * 0.45) + (minRatio * 0.35) + unlimBonus + appsBonus + (priceScore * 0.2);

      return {
        tariff: t,
        ...tco,
        proximityScore,
        savingsYear: currentAnnualTCO - tco.tco12,
        savingsMonth: Math.round((currentAnnualTCO - tco.tco12) / 12)
      };
    });

    scoredRegional.sort((a, b) => b.proximityScore - a.proximityScore || a.tco12 - b.tco12);

    // Выбираем до 3 близких альтернатив от разных операторов
    const closestTariffs = [];
    const seenOps = new Set();
    for (const item of scoredRegional) {
      if (!seenOps.has(item.tariff.operator) || seenOps.size >= 3) {
        closestTariffs.push(item);
        seenOps.add(item.tariff.operator);
        if (closestTariffs.length >= 3) break;
      }
    }

    // Если нет точного совпадения по критериям
    if (matchingTariffs.length === 0) {
      return {
        hasMatch: false,
        isClosestMatch: true,
        currentMonthly,
        currentAnnualTCO,
        bestTariff: closestTariffs.length > 0 ? closestTariffs[0].tariff : null,
        savingsYear: 0,
        savingsMonth: 0,
        isCurrentOptimal: true,
        closestTariffs,
        allAlternatives: scoredRegional,
        reason: 'В базе нет тарифов, которые одновременно полностью покрывают все заданные максимальные критерии. Ниже представлены наиболее близкие тарифы с максимальными пакетами.'
      };
    }

    // Считаем TCO для каждого подходящего тарифа
    const scored = matchingTariffs.map(t => {
      const tco = calculateTariffTCO12(t);
      return {
        tariff: t,
        ...tco,
        savingsYear: currentAnnualTCO - tco.tco12,
        savingsMonth: Math.round((currentAnnualTCO - tco.tco12) / 12)
      };
    });

    // Сортируем: сначала максимальная экономия (минимальный TCO)
    scored.sort((a, b) => a.tco12 - b.tco12);
    const best = scored[0];

    // Другие варианты от разных операторов для выбора
    const otherOptions = [];
    const usedOtherOps = new Set([best.tariff.operator]);
    for (let i = 1; i < scored.length; i++) {
      const opt = scored[i];
      if (!usedOtherOps.has(opt.tariff.operator)) {
        otherOptions.push(opt);
        usedOtherOps.add(opt.tariff.operator);
      }
      if (otherOptions.length >= 2) break;
    }
    if (otherOptions.length < 2) {
      for (let i = 1; i < scored.length; i++) {
        if (!otherOptions.includes(scored[i])) {
          otherOptions.push(scored[i]);
          if (otherOptions.length >= 2) break;
        }
      }
    }

    // Проверка: выгоден ли новый тариф
    if (best.savingsYear > 0) {
      return {
        hasMatch: true,
        isClosestMatch: false,
        currentMonthly,
        currentAnnualTCO,
        bestTariff: best.tariff,
        tco12: best.tco12,
        effectiveMonthly: best.effectiveMonthly,
        savingsYear: best.savingsYear,
        savingsMonth: best.savingsMonth,
        isCurrentOptimal: false,
        allAlternatives: scored,
        otherOptions,
        closestTariffs
      };
    }

    // Если текущий тариф дешевле или равен лучшей альтернативе
    return {
      hasMatch: true,
      isClosestMatch: false,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: best.tariff,
      tco12: best.tco12,
      effectiveMonthly: best.effectiveMonthly,
      savingsYear: 0,
      savingsMonth: 0,
      isCurrentOptimal: true,
      allAlternatives: scored,
      otherOptions,
      closestTariffs,
      reason: 'Ваш текущий тариф уже выгоднее или равен лучшим предложениям на рынке!'
    };
  }

  function findBestInternetTariff(user, tariffs = []) {
    const baseMonthly = Math.max(0, Number(user.currentPrice) || 0);
    const currentRouterRent = Math.max(0, Number(user.currentRouterRent) || 0);
    const currentMonthly = baseMonthly + currentRouterRent;
    const currentAnnualTCO = currentMonthly * 12;
    const userSpeed = Number(user.minSpeedMbps) || 100;
    const userCity = user.region || 'Все города ЛНР';
    const needsRouter = Boolean(user.needsRouter);

    // Фильтруем тарифы по региону
    const regionalTariffs = tariffs.filter(t => isTariffAvailableInRegion(t.region, userCity));

    const matchingTariffs = regionalTariffs.filter(t => {
      return Number(t.speedMbps) >= userSpeed;
    });

    // Оценка близости альтернативных интернет-тарифов
    const scoredRegional = regionalTariffs.map(t => {
      const tco = calculateTariffTCO12(t, { needsRouter });
      const speedRatio = Math.min(2.0, (Number(t.speedMbps) || 100) / userSpeed);
      const tvBonus = t.hasTv ? 0.2 : 0;
      const priceScore = Math.max(0.1, 1 - (tco.tco12 / 12000));
      const proximityScore = (speedRatio * 0.5) + tvBonus + (priceScore * 0.3);

      return {
        tariff: t,
        ...tco,
        proximityScore,
        savingsYear: currentAnnualTCO - tco.tco12,
        savingsMonth: Math.round((currentAnnualTCO - tco.tco12) / 12)
      };
    });

    scoredRegional.sort((a, b) => b.proximityScore - a.proximityScore || a.tco12 - b.tco12);

    // Выбираем до 3 близких альтернатив от разных провайдеров
    const closestTariffs = [];
    const seenOps = new Set();
    for (const item of scoredRegional) {
      if (!seenOps.has(item.tariff.operator) || seenOps.size >= 3) {
        closestTariffs.push(item);
        seenOps.add(item.tariff.operator);
        if (closestTariffs.length >= 3) break;
      }
    }

    if (matchingTariffs.length === 0) {
      return {
        hasMatch: false,
        isClosestMatch: true,
        currentMonthly,
        currentAnnualTCO,
        bestTariff: closestTariffs.length > 0 ? closestTariffs[0].tariff : null,
        savingsYear: 0,
        savingsMonth: 0,
        isCurrentOptimal: true,
        closestTariffs,
        allAlternatives: scoredRegional,
        reason: 'В базе нет тарифов с такой высокой скоростью в вашем городе. Ниже представлены наиболее скоростные альтернативы.'
      };
    }

    const scored = matchingTariffs.map(t => {
      const tco = calculateTariffTCO12(t, { needsRouter });
      return {
        tariff: t,
        ...tco,
        savingsYear: currentAnnualTCO - tco.tco12,
        savingsMonth: Math.round((currentAnnualTCO - tco.tco12) / 12)
      };
    });

    scored.sort((a, b) => a.tco12 - b.tco12);
    const best = scored[0];

    // Другие варианты от разных провайдеров
    const otherOptions = [];
    const usedOps = new Set([best.tariff.operator]);
    for (let i = 1; i < scored.length; i++) {
      const opt = scored[i];
      if (!usedOps.has(opt.tariff.operator)) {
        otherOptions.push(opt);
        usedOps.add(opt.tariff.operator);
      }
      if (otherOptions.length >= 2) break;
    }
    if (otherOptions.length < 2) {
      for (let i = 1; i < scored.length; i++) {
        if (!otherOptions.includes(scored[i])) {
          otherOptions.push(scored[i]);
          if (otherOptions.length >= 2) break;
        }
      }
    }

    if (best.savingsYear > 0) {
      return {
        hasMatch: true,
        isClosestMatch: false,
        currentMonthly,
        currentAnnualTCO,
        bestTariff: best.tariff,
        tco12: best.tco12,
        effectiveMonthly: best.effectiveMonthly,
        savingsYear: best.savingsYear,
        savingsMonth: best.savingsMonth,
        isCurrentOptimal: false,
        allAlternatives: scored,
        otherOptions,
        closestTariffs
      };
    }

    return {
      hasMatch: true,
      isClosestMatch: false,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: best.tariff,
      tco12: best.tco12,
      effectiveMonthly: best.effectiveMonthly,
      savingsYear: 0,
      savingsMonth: 0,
      isCurrentOptimal: true,
      allAlternatives: scored,
      otherOptions,
      closestTariffs,
      reason: 'Ваш текущий тариф домашнего интернета уже оптимален.'
    };
  }

  function calculateSubscriptionsSummary({
    selectedIds = [],
    customItems = [],
    unusedIds = [],
    duplicatesFound = [],
    dbSubscriptions = []
  }) {
    const dbMap = new Map(dbSubscriptions.map(s => [s.id, s]));
    
    let currentMonthlyTotal = 0;
    const activeItems = [];
    const unusedSet = new Set(unusedIds);
    const duplicateIdSet = new Set(duplicatesFound.map(d => d.duplicateId).filter(Boolean));

    for (const id of selectedIds) {
      const sub = dbMap.get(id);
      if (!sub) continue;
      const price = Number(sub.monthlyPrice) || 0;
      currentMonthlyTotal += price;

      const isUnused = unusedSet.has(id);
      const isDuplicate = duplicateIdSet.has(id);

      activeItems.push({
        id: sub.id,
        name: sub.name,
        monthlyPrice: price,
        annualPrice: sub.annualPrice || null,
        isUnused,
        isDuplicate,
        cancelUrl: sub.cancelUrl,
        refundPolicyTip: sub.refundPolicyTip,
        category: sub.category
      });
    }

    for (const item of customItems) {
      const price = Math.max(0, Number(item.price) || 0);
      currentMonthlyTotal += price;
      const isUnused = Boolean(item.unused);

      activeItems.push({
        id: 'custom-' + Math.random().toString(36).substring(2, 7),
        name: item.name || 'Своя подписка',
        monthlyPrice: price,
        annualPrice: null,
        isUnused,
        isDuplicate: false,
        cancelUrl: null,
        refundPolicyTip: null,
        category: 'custom'
      });
    }

    let unusedMonthlySavings = 0;
    for (const item of activeItems) {
      if (item.isUnused) {
        unusedMonthlySavings += item.monthlyPrice;
      }
    }

    let duplicateMonthlySavings = 0;
    for (const item of activeItems) {
      if (item.isDuplicate && !item.isUnused) {
        duplicateMonthlySavings += item.monthlyPrice;
      }
    }

    let annualPlanSavingsYear = 0;
    const annualPlanRecommendations = [];
    for (const item of activeItems) {
      if (!item.isUnused && !item.isDuplicate && item.annualPrice) {
        const yearCostMonthly = item.monthlyPrice * 12;
        const yearCostAnnual = item.annualPrice;
        if (yearCostAnnual < yearCostMonthly) {
          const diff = yearCostMonthly - yearCostAnnual;
          annualPlanSavingsYear += diff;
          annualPlanRecommendations.push({
            name: item.name,
            diffYear: diff,
            monthlyEquivalent: Math.round(yearCostAnnual / 12)
          });
        }
      }
    }

    const totalMonthlyDirectSavings = unusedMonthlySavings + duplicateMonthlySavings;
    const totalAnnualSavings = (totalMonthlyDirectSavings * 12) + annualPlanSavingsYear;

    return {
      currentMonthlyTotal,
      currentAnnualTotal: currentMonthlyTotal * 12,
      activeItems,
      unusedMonthlySavings,
      duplicateMonthlySavings,
      annualPlanSavingsYear,
      annualPlanRecommendations,
      totalMonthlySavings: Math.round(totalAnnualSavings / 12),
      totalAnnualSavings
    };
  }

  function calculateGrandTotal({ mobileResult, internetResult, subsResult }) {
    const mobileCur = mobileResult ? mobileResult.currentMonthly : 0;
    const internetCur = internetResult ? internetResult.currentMonthly : 0;
    const subsCur = subsResult ? subsResult.currentMonthlyTotal : 0;

    const currentMonthlyGrand = mobileCur + internetCur + subsCur;
    const currentAnnualGrand = currentMonthlyGrand * 12;

    const mobileSavingYear = mobileResult ? mobileResult.savingsYear : 0;
    const internetSavingYear = internetResult ? internetResult.savingsYear : 0;
    const subsSavingYear = subsResult ? subsResult.totalAnnualSavings : 0;

    const totalAnnualSavings = mobileSavingYear + internetSavingYear + subsSavingYear;
    const totalMonthlySavings = Math.round(totalAnnualSavings / 12);
    const optimizedMonthlyGrand = Math.max(0, currentMonthlyGrand - totalMonthlySavings);

    return {
      currentMonthlyGrand,
      currentAnnualGrand,
      optimizedMonthlyGrand,
      totalAnnualSavings,
      totalMonthlySavings,
      hasAnySavings: totalAnnualSavings > 0,
      breakdown: {
        mobile: {
          current: mobileCur,
          savingsYear: mobileSavingYear,
          isOptimal: mobileResult ? mobileResult.isCurrentOptimal : true
        },
        internet: {
          current: internetCur,
          savingsYear: internetSavingYear,
          isOptimal: internetResult ? internetResult.isCurrentOptimal : true
        },
        subscriptions: {
          current: subsCur,
          savingsYear: subsSavingYear
        }
      }
    };
  }

  // ==========================================
  // 5. СКРИПТЫ ТОРГА И ПОШАГОВЫЕ ИНСТРУКЦИИ
  // ==========================================
  const RETENTION_SCRIPTS = {
    mobile: {
      title: 'Скрипт для получения персональной скидки 30–50% у текущего оператора',
      description: 'Операторам выгоднее дать постоянную скидку действующему клиенту через отдел удержания (Retention), чем потерять абонента. Достаточно заявить о намерении уйти.',
      steps: [
        'Шаг 1: Напишите в чат поддержки в приложении вашего оператора или позвоните на горячую линию.',
        'Шаг 2: Скопируйте и отправьте шаблон сообщения ниже.',
        'Шаг 3: Если оператор первой линии говорит «скидок нет», попросите перевести обращение в отдел сохранения клиентов или оформите заявку на перенос номера (MNP) у другого оператора — вам перезвонят с персональным предложением в течение 2–4 дней.'
      ],
      template: 'Здравствуйте! Я пользуюсь вашими услугами уже долгое время. Сейчас мне поступило выгодное предложение от другого оператора с более низкой стоимостью при аналогичном пакете минут и гигабайт. В связи с этим планирую подать заявление на перенос номера (MNP). Мне удобно остаться с вами, если вы сможете предложить сопоставимые условия по тарифу или персональную скидку на абонентскую плату. Есть ли у компании возможность сохранить меня как абонента?'
    },

    internet: {
      title: 'Скрипт переговоров с интернет-провайдером',
      description: 'Провайдеры имеют внутренние спецтарифы для удержания клиентов, которые не афишируются на сайте.',
      steps: [
        'Позвоните в службу поддержки или напишите в чат с вопросом: «Как правильно сдать оборудование и расторгнуть договор?».',
        'Оператор системы фиксации оттока обязан будет спросить причину. Назовите предложение конкурента (например: «В моём доме подключили другого провайдера дешевле при той же скорости»).',
        'В 80% случаев вам предложат заморозку цены, скидку на 6–12 месяцев или бесплатную аренду роутера.'
      ],
      template: 'Здравствуйте! Прошу подсказать порядок расторжения договора на домашний интернет. В нашем доме появился другой провайдер с более выгодным тарифом при аналогичной скорости. Хочу уточнить дату возврата оборудования и отсутствие задолженностей, либо узнать, есть ли встречные предложения для сохранения договора.'
    }
  };

  const STEP_BY_STEP_GUIDES = {
    mobileMNP: {
      title: 'Как сменить мобильного оператора с сохранением номера (MNP)',
      legalBasis: 'ФЗ «О связи» № 126-ФЗ, ст. 46 (перенесение абонентского номера).',
      steps: [
        {
          number: 1,
          title: 'Сверьте паспортные данные у старого оператора',
          details: 'Главная причина отказов в переносе номера — несовпадение данных (например, смена паспорта в 20 или 45 лет, опечатка в фамилии). Зайдите в салон или приложение старого оператора и подтвердите актуальность данных через Госуслуги.'
        },
        {
          number: 2,
          title: 'Подайте заявление новому оператору',
          details: 'Это можно сделать онлайн на сайте нового оператора (с доставкой SIM-карты курьером или оформлением eSIM) либо в его салоне связи. Старого оператора уведомлять НЕ нужно.'
        },
        {
          number: 3,
          title: 'Оплатите сбор за перенос номера',
          details: 'По закону сбор за перенос не может превышать 100 ₽. Многие операторы компенсируют эту сумму бонусами на баланс.'
        },
        {
          number: 4,
          title: 'Получите временную SIM-карту и дождитесь переноса',
          details: 'Срок переноса для физлиц составляет от 8 календарных дней (вы можете выбрать любую удобную дату в течение 6 месяцев). До момента X вы пользуетесь старой SIM. В день переноса связь прервется максимум на 30 минут.'
        },
        {
          number: 5,
          title: 'Что происходит со старым балансом и договором?',
          details: 'После завершения переноса старый договор расторгается автоматически. Если на старом номере остались деньги, придите в салон старого оператора с паспортом и напишите заявление на возврат остатка на банковскую карту или другой номер.'
        }
      ]
    },

    internetCancel: {
      title: 'Как расторгнуть договор с интернет-провайдером без лишних штрафов',
      legalBasis: 'Закон РФ «О защите прав потребителей» ст. 32 (право потребителя на отказ от исполнения договора в любое время).',
      steps: [
        {
          number: 1,
          title: 'Проверьте договор на скрытые условия и акции',
          details: 'Если вы подключались по акции «роутер в рассрочку» или «скидка на 12 месяцев», в договоре может быть пункт о доплате полной стоимости при досрочном расторжении. Изучите раздел «Срок действия договора».'
        },
        {
          number: 2,
          title: 'Подайте письменное заявление на расторжение',
          details: 'Недостаточно просто перестать платить! Провайдер может продолжать начислять абонентскую плату за удержание линии или аренду порта, загоняя баланс в минус. Заявление подается в личном кабинете, по почте заказным письмом или в офисе обслуживания.'
        },
        {
          number: 3,
          title: 'Сдайте оборудование по Акту приёма-передачи',
          details: 'Если роутер или ТВ-приставка были в аренде, обязательно верните их и получите подписанный АКТ ПРИЁМА-ПЕРЕДАЧИ с печатью и указанием серийного номера. Храните этот акт не менее 3 лет во избежание претензий.'
        },
        {
          number: 4,
          title: 'Возьмите справку об отсутствии задолженности',
          details: 'Зафиксируйте, что баланс лицевого счёта равен нулю или положителен, а договор официально закрыт.'
        }
      ]
    },

    subscriptionCancel: {
      title: 'Как отключить подписку и вернуть деньги при случайном списании',
      legalBasis: 'Закон РФ «О защите прав потребителей» ст. 32 и 782 ГК РФ (оплата только фактически понесённых расходов исполнителя).',
      steps: [
        {
          number: 1,
          title: 'Сразу отключите автопродление',
          details: 'Зайдите в профиль сервиса и нажмите «Отменить подписку». Обратите внимание: сервис часто предлагает скидки 50–70%, если вы нажмете отмену. Вы можете согласиться или подтвердить отмену до конца.'
        },
        {
          number: 2,
          title: 'Не пользуйтесь контентом после неожиданного списания',
          details: 'Если списание произошло автоматически (например, забыли отключить пробный период), главное правило: НЕ включайте фильмы, музыку и не пользуйтесь привилегиями сервиса в новом расчетном периоде.'
        },
        {
          number: 3,
          title: 'Напишите в службу поддержки сервиса (в первые 24–48 часов)',
          details: 'Большинство крупных российских сервисов (Яндекс, Сбер, Иви, Okko, VK) возвращают деньги в рамках клиентской лояльности, если обращение поступило сразу и сервис не использовался.'
        }
      ],
      refundClaimTemplate: 'Здравствуйте! Недавно с моей банковской карты произошло автоматическое списание денежных средств за продление подписки. Я не планировал(а) продлевать услугу на новый период, контентом и сервисом с момента списания не пользовался(лась). В соответствии со ст. 32 Закона РФ «О защите прав потребителей» и ст. 782 ГК РФ потребитель вправе отказаться от исполнения договора в любое время при условии оплаты фактически понесенных расходов. Поскольку услуга фактически не потреблялась, прошу отключить подписку и вернуть списанную сумму на карту списания.'
    }
  };

  // ==========================================
  // 7. КЛАСС УПРАВЛЕНИЯ МАСТЕРОМ (WIZARD)
  // ==========================================
  class WizardController {
    constructor({ totalSteps = 4, onStepChange, onFinish }) {
      this.currentStep = 1;
      this.totalSteps = totalSteps;
      this.onStepChange = onStepChange;
      this.onFinish = onFinish;

      this.state = {
        mobile: {
          skipped: false,
          operator: 'МКС',
          region: 'Луганск',
          currentPrice: 500,
          gb: 25,
          isUnlimitedGb: false,
          minutes: 400,
          isUnlimitedMinutes: false,
          sms: 0,
          isUnlimitedSms: false
        },
        internet: {
          skipped: false,
          operator: 'Луганет',
          region: 'Луганск',
          currentPrice: 650,
          minSpeedMbps: 200,
          hasRouterRent: false,
          currentRouterRent: 100,
          switchToOwnRouter: false,
          needsRouter: false
        },
        subscriptions: {
          skipped: false,
          selectedIds: ['yandex-plus', 'kinopoisk'],
          unusedIds: ['kinopoisk'],
          customItems: []
        },
        insurance: {
          skipped: false,
          selectedTypes: ['osago']
        }
      };
    }

    goToStep(stepNumber) {
      if (stepNumber < 1) stepNumber = 1;
      if (stepNumber > this.totalSteps) {
        if (typeof this.onFinish === 'function') {
          this.onFinish(this.state);
        }
        return;
      }
      this.currentStep = stepNumber;
      if (typeof this.onStepChange === 'function') {
        this.onStepChange(this.currentStep, this.totalSteps, this.state);
      }
    }

    next() {
      this.goToStep(this.currentStep + 1);
    }

    prev() {
      this.goToStep(this.currentStep - 1);
    }

    skipCurrentCategory() {
      const stepCategories = {
        1: 'mobile',
        2: 'internet',
        3: 'subscriptions',
        4: 'insurance'
      };
      const cat = stepCategories[this.currentStep];
      if (cat && this.state[cat]) {
        this.state[cat].skipped = true;
      }
      this.next();
    }

    updateCategoryState(category, data) {
      if (this.state[category]) {
        this.state[category] = {
          ...this.state[category],
          ...data,
          skipped: false
        };
      }
    }

    loadState(importedState) {
      if (importedState && typeof importedState === 'object') {
        this.state = {
          mobile: { ...this.state.mobile, ...(importedState.mobile || {}) },
          internet: { ...this.state.internet, ...(importedState.internet || {}) },
          subscriptions: { ...this.state.subscriptions, ...(importedState.subscriptions || {}) },
          insurance: { ...this.state.insurance, ...(importedState.insurance || {}) }
        };
      }
    }
  }

  // ==========================================
  // 8. ИНТЕРФЕЙС И ГЕНЕРАЦИЯ HTML
  // ==========================================
  let wizard;
  let lastFocusedElement = null;
  let netRegionManuallyChanged = false;
  const stepDirty = {
    mobile: false,
    internet: false,
    subscriptions: false,
    insurance: false
  };

  function scrollToTopInstant() {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }

  function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('ne_pereplachivay_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const active = document.documentElement.getAttribute('data-theme');
        const nextTheme = active === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('ne_pereplachivay_theme', nextTheme);
        updateThemeIcon(nextTheme);
      });
    }
  }

  const THEME_SUN_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const THEME_MOON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function updateThemeIcon(theme) {
    const iconSpan = document.getElementById('theme-icon');
    if (iconSpan) {
      iconSpan.innerHTML = theme === 'dark' ? THEME_SUN_SVG : THEME_MOON_SVG;
    }
  }

  const SUBSCRIPTION_CATEGORY_LABELS = {
    ecosystem: 'Экосистема',
    cinema: 'Кино',
    music: 'Музыка',
    social: 'Мессенджеры',
    messenger: 'Мессенджеры',
    books: 'Книги',
    cloud: 'Облако',
    delivery: 'Доставка',
    gaming: 'Игры'
  };

  function updateSubscriptionsSummary() {
    const countEl = document.getElementById('subs-selected-count');
    const sumEl = document.getElementById('subs-selected-sum');
    if (!countEl || !sumEl) return;

    const checkedIds = Array.from(document.querySelectorAll('.sub-check:checked')).map(el => el.dataset.id);
    const dbMap = new Map(dbSubscriptions.map(s => [s.id, s]));
    let total = 0;
    checkedIds.forEach(id => {
      const sub = dbMap.get(id);
      if (sub) total += Number(sub.monthlyPrice) || 0;
    });

    const customItems = (wizard && wizard.state && wizard.state.subscriptions && wizard.state.subscriptions.customItems) || [];
    customItems.forEach(item => {
      total += Math.max(0, Number(item.price) || 0);
    });

    countEl.textContent = String(checkedIds.length + customItems.length);
    sumEl.textContent = total.toLocaleString('ru-RU') + ' ₽/мес';
  }

  function renderSubscriptionsGrid(selectedIds = [], unusedIds = [], customItems = []) {
    const container = document.getElementById('subscriptions-list');
    if (!container) return;

    container.innerHTML = '';
    const selSet = new Set(selectedIds);
    const unSet = new Set(unusedIds);

    const allFilterBtn = document.querySelector('.sub-filter-btn[data-cat="all"], .sub-filter-btn[data-filter="all"]');
    if (allFilterBtn) {
      allFilterBtn.textContent = 'Все (' + dbSubscriptions.length + ')';
    }

    const activeFilterBtn = document.querySelector('.sub-filter-btn.active');
    const currentFilter = activeFilterBtn
      ? (activeFilterBtn.getAttribute('data-cat') || activeFilterBtn.getAttribute('data-filter') || 'all')
      : 'all';

    dbSubscriptions.forEach(sub => {
      const isChecked = selSet.has(sub.id);
      const isUnused = isChecked && unSet.has(sub.id);
      const cat = sub.category || 'other';
      const catLabel = SUBSCRIPTION_CATEGORY_LABELS[cat] || 'Сервис';
      const isFilteredOut = (currentFilter !== 'all' && cat !== currentFilter);
      const safeId = escapeHtml(sub.id);

      const card = document.createElement('div');
      card.className = 'sub-item-card ' + (isChecked ? 'active ' : '') + (isFilteredOut ? 'filter-hidden' : '');
      card.id = 'sub-card-' + sub.id;
      card.setAttribute('data-category', cat);

      const descHtml = sub.description ? ('<div class="sub-desc-note">' + escapeHtml(sub.description) + '</div>') : '';

      card.innerHTML = [
        '<div class="sub-header-row">',
        '  <label class="custom-checkbox-label">',
        '    <input type="checkbox" class="sub-check" data-id="' + safeId + '" ' + (isChecked ? 'checked' : '') + '>',
        '    <span class="sub-name">' + escapeHtml(sub.name) + '</span>',
        '    <span class="sub-category-tag sub-cat-' + escapeHtml(cat) + '">' + escapeHtml(catLabel) + '</span>',
        '  </label>',
        '  <span class="sub-price-badge">' + (Number(sub.monthlyPrice) || 0) + ' ₽/мес</span>',
        '</div>',
        descHtml,
        '<div class="sub-footer-row ' + (isChecked ? '' : 'hidden') + '" id="sub-unused-row-' + safeId + '">',
        '  <label class="unused-label">',
        '    <input type="checkbox" class="sub-unused-check" data-id="' + safeId + '" ' + (isUnused ? 'checked' : '') + '>',
        '    <span>Не пользуюсь / забыл(а) отменить</span>',
        '  </label>',
        '</div>'
      ].join('');

      container.appendChild(card);
    });

    renderCustomSubscriptionsList(customItems);
    updateSubscriptionsSummary();
  }

  function renderCustomSubscriptionsList(customItems = []) {
    const customListEl = document.getElementById('custom-subs-container');
    if (!customListEl) return;
    customListEl.innerHTML = '';

    customItems.forEach((item, idx) => {
      const safePrice = Math.max(0, Number(item.price) || 0);
      const el = document.createElement('div');
      el.className = 'custom-sub-pill';
      el.innerHTML = [
        '<span>' + escapeHtml(item.name) + ': <strong>' + safePrice + ' ₽/мес</strong> ' + (item.unused ? '(не пользуюсь)' : '') + '</span>',
        '<button type="button" class="btn-remove-custom" data-idx="' + idx + '" title="Удалить" aria-label="Удалить подписку ' + escapeHtml(item.name) + '">✕</button>'
      ].join('');
      customListEl.appendChild(el);
    });
    updateSubscriptionsSummary();
  }

  function renderInsuranceSelector(selectedTypes = []) {
    const container = document.getElementById('insurance-selector-container');
    if (!container) return;
    container.innerHTML = '';

    const selSet = new Set(selectedTypes);

    dbInsurance.forEach(ins => {
      const isChecked = selSet.has(ins.id);
      const safeId = escapeHtml(ins.id);
      const card = document.createElement('div');
      card.className = 'insurance-item-card ' + (isChecked ? 'selected' : '');
      card.innerHTML = [
        '<label class="custom-checkbox-label">',
        '  <input type="checkbox" class="ins-check" data-id="' + safeId + '" ' + (isChecked ? 'checked' : '') + '>',
        '  <div>',
        '    <strong>' + escapeHtml(ins.name) + '</strong>',
        '    <p class="ins-desc">' + escapeHtml(ins.description) + '</p>',
        '  </div>',
        '</label>'
      ].join('');
      container.appendChild(card);
    });
  }

  function readCurrentStepInputs(step) {
    if (step === 1) {
      const isUnlimGb = Boolean(document.getElementById('mob-gb-unlim')?.checked);
      const isUnlimMin = Boolean(document.getElementById('mob-min-unlim')?.checked);
      const isUnlimSms = Boolean(document.getElementById('mob-sms-unlim')?.checked);
      return {
        operator: document.getElementById('mob-operator')?.value || 'МКС',
        region: document.getElementById('mob-region')?.value || 'Луганск',
        currentPrice: Math.max(0, Number(document.getElementById('mob-price')?.value) || 0),
        gb: isUnlimGb ? 9999 : (Number(document.getElementById('mob-gb')?.value) || 0),
        isUnlimitedGb: isUnlimGb,
        minutes: isUnlimMin ? 9999 : (Number(document.getElementById('mob-min')?.value) || 0),
        isUnlimitedMinutes: isUnlimMin,
        sms: isUnlimSms ? 100 : (Number(document.getElementById('mob-sms')?.value) || 0),
        isUnlimitedSms: isUnlimSms
      };
    } else if (step === 2) {
      const hasRouterRent = Boolean(document.getElementById('net-router-rent')?.checked);
      const rawRent = Math.max(0, Number(document.getElementById('net-router-rent-price')?.value) || 0);
      const switchToOwnRouter = Boolean(document.getElementById('net-own-router-switch')?.checked);
      return {
        operator: document.getElementById('net-operator')?.value || 'Луганет',
        region: document.getElementById('net-region')?.value || 'Луганск',
        currentPrice: Math.max(0, Number(document.getElementById('net-price')?.value) || 0),
        minSpeedMbps: Number(document.getElementById('net-speed')?.value) || 100,
        hasRouterRent,
        currentRouterRent: hasRouterRent ? rawRent : 0,
        switchToOwnRouter: hasRouterRent ? switchToOwnRouter : false,
        needsRouter: hasRouterRent && !switchToOwnRouter
      };
    } else if (step === 3) {
      const selectedIds = Array.from(document.querySelectorAll('.sub-check:checked')).map(el => el.dataset.id);
      const selectedSet = new Set(selectedIds);
      const unusedIds = Array.from(document.querySelectorAll('.sub-unused-check:checked'))
        .map(el => el.dataset.id)
        .filter(id => selectedSet.has(id));
      return {
        selectedIds,
        unusedIds,
        customItems: wizard.state.subscriptions.customItems || []
      };
    } else if (step === 4) {
      const selectedTypes = Array.from(document.querySelectorAll('.ins-check:checked')).map(el => el.dataset.id);
      return {
        selectedTypes
      };
    }
    return {};
  }

  function syncSliderControl(sliderId, valId, toggleId, isUnlimited, numericValue, defaultValue, maxValue, unit) {
    const slider = document.getElementById(sliderId);
    const span = document.getElementById(valId);
    const toggle = document.getElementById(toggleId);
    if (!slider || !span || !toggle) return;

    const checked = Boolean(isUnlimited);
    toggle.checked = checked;
    const toggleLabel = toggle.closest('.unlimited-toggle');
    if (toggleLabel) toggleLabel.classList.toggle('active', checked);

    if (checked) {
      if (!slider.dataset.prevValue) {
        slider.dataset.prevValue = String(defaultValue);
      }
      slider.value = maxValue;
      slider.disabled = true;
      span.textContent = 'Безлимит (∞)';
      span.classList.add('unlimited');
    } else {
      const val = (numericValue !== undefined && numericValue !== null && Number(numericValue) < 9999)
        ? Number(numericValue)
        : defaultValue;
      slider.disabled = false;
      slider.value = val;
      slider.dataset.prevValue = String(val);
      span.textContent = slider.value + ' ' + unit;
      span.classList.remove('unlimited');
    }
  }

  function syncInputsWithState(state) {
    if (document.getElementById('mob-operator')) document.getElementById('mob-operator').value = state.mobile.operator;
    if (document.getElementById('mob-region')) document.getElementById('mob-region').value = state.mobile.region;
    if (document.getElementById('mob-price')) document.getElementById('mob-price').value = state.mobile.currentPrice;

    syncSliderControl('mob-gb', 'mob-gb-val', 'mob-gb-unlim', state.mobile.isUnlimitedGb, state.mobile.gb, 25, 100, 'ГБ');
    syncSliderControl('mob-min', 'mob-min-val', 'mob-min-unlim', state.mobile.isUnlimitedMinutes, state.mobile.minutes, 400, 1200, 'мин');
    syncSliderControl('mob-sms', 'mob-sms-val', 'mob-sms-unlim', state.mobile.isUnlimitedSms, state.mobile.sms, 0, 100, 'шт');

    if (document.getElementById('net-operator')) document.getElementById('net-operator').value = state.internet.operator;
    if (document.getElementById('net-region')) document.getElementById('net-region').value = state.internet.region;
    if (document.getElementById('net-price')) document.getElementById('net-price').value = state.internet.currentPrice;
    if (document.getElementById('net-speed')) document.getElementById('net-speed').value = state.internet.minSpeedMbps;
    const hasRent = Boolean(state.internet.hasRouterRent !== undefined ? state.internet.hasRouterRent : state.internet.needsRouter);
    if (document.getElementById('net-router-rent')) document.getElementById('net-router-rent').checked = hasRent;
    if (document.getElementById('net-router-rent-price')) {
      document.getElementById('net-router-rent-price').value = state.internet.currentRouterRent > 0 ? state.internet.currentRouterRent : 100;
    }
    if (document.getElementById('net-own-router-switch')) {
      document.getElementById('net-own-router-switch').checked = Boolean(state.internet.switchToOwnRouter);
    }
    const rentDetailsEl = document.getElementById('net-router-rent-details');
    if (rentDetailsEl) rentDetailsEl.classList.toggle('hidden', !hasRent);

    renderSubscriptionsGrid(state.subscriptions.selectedIds, state.subscriptions.unusedIds, state.subscriptions.customItems);
    renderInsuranceSelector(state.insurance.selectedTypes);
  }

  function showStepUI(stepIndex, totalSteps) {
    document.getElementById('wizard-section').classList.remove('hidden');
    document.getElementById('report-section').classList.add('hidden');

    for (let i = 1; i <= totalSteps; i++) {
      const el = document.getElementById('step-' + i);
      if (el) {
        el.classList.toggle('hidden', i !== stepIndex);
      }
    }

    const progressText = document.getElementById('wizard-progress-text');
    const progressBar = document.getElementById('wizard-progress-bar');
    if (progressText) {
      const stepNames = {
        1: 'Мобильная связь',
        2: 'Домашний интернет и ТВ',
        3: 'Подписки и сервисы',
        4: 'Страхование (справочно)'
      };
      progressText.textContent = 'Шаг ' + stepIndex + ' из ' + totalSteps + ': ' + (stepNames[stepIndex] || '');
    }
    if (progressBar) {
      progressBar.style.width = ((stepIndex / totalSteps) * 100) + '%';
    }

    const stepCats = { 1: 'mobile', 2: 'internet', 3: 'subscriptions', 4: 'insurance' };
    document.querySelectorAll('.wizard-step-pill').forEach(pill => {
      const pillStep = Number(pill.dataset.step);
      const cat = stepCats[pillStep];
      const isSkipped = Boolean(wizard && wizard.state[cat] && wizard.state[cat].skipped);
      const isActive = pillStep === stepIndex;
      const isDone = pillStep < stepIndex && !isSkipped;

      pill.classList.toggle('active', isActive);
      pill.classList.toggle('done', !isActive && isDone);
      pill.classList.toggle('skipped', !isActive && isSkipped);
      if (isActive) {
        pill.setAttribute('aria-current', 'step');
      } else {
        pill.removeAttribute('aria-current');
      }
    });

    scrollToTopInstant();
  }

  function renderReport(state) {
    saveUserData(state);

    document.getElementById('wizard-section').classList.add('hidden');
    document.getElementById('report-section').classList.remove('hidden');

    let mobileResult = null;
    if (!state.mobile.skipped && state.mobile.currentPrice > 0) {
      mobileResult = findBestMobileTariff(state.mobile, dbMobile);
    }

    let internetResult = null;
    const internetTotalCurrent = (Number(state.internet.currentPrice) || 0) + (state.internet.hasRouterRent ? (Number(state.internet.currentRouterRent) || 0) : 0);
    if (!state.internet.skipped && internetTotalCurrent > 0) {
      internetResult = findBestInternetTariff(state.internet, dbInternet);
    }

    let duplicatesFound = [];
    let subsResult = null;
    if (!state.subscriptions.skipped && (state.subscriptions.selectedIds.length > 0 || state.subscriptions.customItems.length > 0)) {
      duplicatesFound = analyzeSubscriptionDuplicates(state.subscriptions.selectedIds, dbSubscriptions);
      subsResult = calculateSubscriptionsSummary({
        selectedIds: state.subscriptions.selectedIds,
        customItems: state.subscriptions.customItems,
        unusedIds: state.subscriptions.unusedIds,
        duplicatesFound,
        dbSubscriptions
      });
    }

    const hasInsurance = !state.insurance.skipped && state.insurance.selectedTypes && state.insurance.selectedTypes.length > 0;
    const isCompletelyEmpty = !mobileResult && !internetResult && !subsResult && !hasInsurance;

    const emptyStateEl = document.getElementById('report-empty-state');
    const heroCardEl = document.querySelector('.report-hero-card');
    const printBtnEl = document.getElementById('btn-print-report');
    const restartBtnEl = document.getElementById('btn-restart');

    if (emptyStateEl) emptyStateEl.classList.toggle('hidden', !isCompletelyEmpty);
    if (heroCardEl) heroCardEl.classList.toggle('hidden', isCompletelyEmpty);
    if (printBtnEl) printBtnEl.classList.toggle('hidden', isCompletelyEmpty);
    if (restartBtnEl) restartBtnEl.classList.toggle('hidden', isCompletelyEmpty);

    const grandTotal = calculateGrandTotal({ mobileResult, internetResult, subsResult });

    document.getElementById('grand-current-month').textContent = grandTotal.currentMonthlyGrand.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('grand-target-month').textContent = grandTotal.optimizedMonthlyGrand.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('grand-savings-year').textContent = grandTotal.totalAnnualSavings.toLocaleString('ru-RU') + ' ₽';

    const bannerNote = document.getElementById('grand-banner-note');
    if (grandTotal.hasAnySavings) {
      bannerNote.innerHTML = 'Вы можете сохранить до <strong>' + grandTotal.totalMonthlySavings.toLocaleString('ru-RU') + ' ₽ в месяц</strong> без потери качества связи и контента!';
    } else if (!mobileResult && !internetResult && !subsResult && hasInsurance) {
      bannerNote.innerHTML = '<strong>Справочный гид готов:</strong> Ниже собраны официальные инструменты и чек-листы по выбранным видам страхования.';
    } else {
      bannerNote.innerHTML = '<strong>Отличный результат:</strong> Ваши текущие тарифы уже одни из самых выгодных на рынке. Ниже — подсказки, как не переплатить при их продлении.';
    }

    const mobCardContainer = document.getElementById('report-mobile-card');
    if (mobileResult && !state.mobile.skipped) {
      mobCardContainer.classList.remove('hidden');
      renderMobileReportCard(mobCardContainer, mobileResult, state.mobile);
    } else {
      mobCardContainer.classList.add('hidden');
    }

    const netCardContainer = document.getElementById('report-internet-card');
    if (internetResult && !state.internet.skipped) {
      netCardContainer.classList.remove('hidden');
      renderInternetReportCard(netCardContainer, internetResult, state.internet);
    } else {
      netCardContainer.classList.add('hidden');
    }

    const subsCardContainer = document.getElementById('report-subs-card');
    if (subsResult && !state.subscriptions.skipped) {
      subsCardContainer.classList.remove('hidden');
      renderSubscriptionsReportCard(subsCardContainer, subsResult, duplicatesFound);
    } else {
      subsCardContainer.classList.add('hidden');
    }

    const insCardContainer = document.getElementById('report-insurance-card');
    if (hasInsurance) {
      insCardContainer.classList.remove('hidden');
      renderInsuranceReportCard(insCardContainer, state.insurance.selectedTypes);
    } else {
      insCardContainer.classList.add('hidden');
    }

    scrollToTopInstant();
  }

  function buildTariffCardHtml(item, isFeatured = false) {
    const t = item.tariff || item;
    const effPrice = item.effectiveMonthly || t.monthlyPrice;
    const isUnlimGb = Boolean(t.isUnlimitedGb) || Number(t.includedGb) >= 999;
    const isUnlimMin = Boolean(t.isUnlimitedMinutes) || Number(t.includedMinutes) >= 1500;
    
    const gbLabel = isUnlimGb ? '<strong>Безлимитный интернет (4G)</strong>' : (Number(t.includedGb) + ' ГБ интернета');
    const minLabel = isUnlimMin ? ('Безлимит внутри сети + ' + Number(t.includedMinutes) + ' мин по РФ') : (Number(t.includedMinutes) + ' мин звонков');
    const appsItem = (Array.isArray(t.unlimitedApps) && t.unlimitedApps.length > 0)
      ? ('<li>Безлимит: ' + escapeHtml(t.unlimitedApps.slice(0, 3).join(', ')) + '</li>')
      : '';
    const promoPill = (t.promoDurationMonths > 0 && t.promoMonthlyPrice)
      ? ('<div class="promo-pill">Акция: ' + Number(t.promoMonthlyPrice) + ' ₽ первые ' + Number(t.promoDurationMonths) + ' мес.</div>')
      : '';
    const eridHtml = (t.isPartner && t.adErid)
      ? ('<span class="ad-label" title="Реклама. Токен erid: ' + escapeHtml(t.adErid) + '">erid: ' + escapeHtml(t.adErid) + '</span>')
      : '';

    return [
      '<div class="closest-card ' + (isFeatured ? 'featured' : '') + '">',
      '  <div class="closest-card-op">' + escapeHtml(t.operator) + ' ' + eridHtml + '</div>',
      '  <div class="closest-card-name">' + escapeHtml(t.tariffName) + '</div>',
      '  <div class="closest-card-price">' + Number(effPrice).toLocaleString('ru-RU') + ' ₽/мес <small class="effective-hint">(в среднем)</small></div>',
      '  ' + promoPill,
      '  <ul class="closest-card-list">',
      '    <li>' + gbLabel + '</li>',
      '    <li>' + minLabel + '</li>',
      '    ' + appsItem,
      '    <li>Плата за подключение (MNP): ' + (Number(t.setupFee) || 0) + ' ₽</li>',
      '  </ul>',
      '  <a href="' + safeHref(t.officialUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Перейти на сайт ' + escapeHtml(t.operator) + ' ↗</a>',
      '</div>'
    ].join('\n');
  }

  function renderMobileReportCard(container, result, userMob) {
    const { isCurrentOptimal, isClosestMatch, bestTariff, savingsYear, savingsMonth, effectiveMonthly, currentMonthly, closestTariffs, otherOptions } = result;

    let bodyHtml = '';

    if (isClosestMatch) {
      const cardsHtml = (closestTariffs || []).map((item, idx) => buildTariffCardHtml(item, idx === 0)).join('');
      bodyHtml = [
        '<div class="closest-badge">Подобраны наиболее близкие тарифы</div>',
        '<p class="closest-intro-text">Точного тарифа, одновременно покрывающего все максимальные критерии, в базе нет. Мы подобрали для вас <strong>3 наиболее близких тарифа с максимальными пакетами интернета и минут</strong>:</p>',
        '<div class="closest-cards-grid">' + cardsHtml + '</div>',
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-primary btn-guide" data-guide="mobileMNP">Пошаговая инструкция MNP (смена оператора)</button>',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="mobile">Скрипт торга: «Хочу уйти, дайте скидку»</button>',
        '</div>'
      ].join('');
    } else if (isCurrentOptimal) {
      let alternativesHtml = '';
      const alternatives = closestTariffs || otherOptions || [];
      if (alternatives.length > 0) {
        const cardsHtml = alternatives.slice(0, 3).map((item) => buildTariffCardHtml(item, false)).join('');
        alternativesHtml = [
          '<div class="other-options-section">',
          '  <div class="other-options-title">📌 Доступные альтернативные тарифы на рынке ЛНР (если хотите сменить оператора):</div>',
          '  <div class="closest-cards-grid">' + cardsHtml + '</div>',
          '</div>'
        ].join('');
      }

      bodyHtml = [
        '<div class="optimal-badge">Ваш тариф оптимален</div>',
        '<p class="card-desc">Вы платите <strong>' + Number(currentMonthly).toLocaleString('ru-RU') + ' ₽/мес</strong>. Достойных альтернатив с таким пакетом минут и гигабайт дешевле мы не нашли.</p>',
        alternativesHtml,
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="mobile">Скрипт звонка оператору для скидки 30%</button>',
        '</div>'
      ].join('');
    } else {
      const isPartner = bestTariff.isPartner;
      const eridHtml = (isPartner && bestTariff.adErid) ? '<span class="ad-label" title="Реклама. Токен erid: ' + escapeHtml(bestTariff.adErid) + '">Реклама erid: ' + escapeHtml(bestTariff.adErid) + '</span>' : '';
      const promoNote = bestTariff.promoDurationMonths > 0 
        ? '<span class="promo-pill">Акция: ' + Number(bestTariff.promoMonthlyPrice) + ' ₽ первые ' + Number(bestTariff.promoDurationMonths) + ' мес., затем ' + Number(bestTariff.monthlyPrice) + ' ₽</span>'
        : '';

      const gbText = (bestTariff.isUnlimitedGb || bestTariff.includedGb >= 999) ? 'Безлимитный интернет' : Number(bestTariff.includedGb) + ' ГБ';
      const minText = (bestTariff.isUnlimitedMinutes || bestTariff.includedMinutes >= 1500) ? 'Безлимит внутри сети + ' + Number(bestTariff.includedMinutes) + ' мин' : Number(bestTariff.includedMinutes) + ' мин';
      const userGbText = userMob.isUnlimitedGb ? 'Безлимитный интернет' : Number(userMob.gb) + ' ГБ';
      const userMinText = userMob.isUnlimitedMinutes ? 'Безлимитные звонки' : Number(userMob.minutes) + ' минут';
      const showSms = userMob.isUnlimitedSms || Number(userMob.sms) > 0;
      const userSmsLi = showSms ? ('<li>' + (userMob.isUnlimitedSms ? 'Безлимитные СМС' : (Number(userMob.sms) + ' СМС')) + '</li>') : '';
      const bestSmsLi = showSms ? ('<li>' + Number(bestTariff.includedSms || 0) + ' СМС в пакете</li>') : '';
      const bestAppsLi = (Array.isArray(bestTariff.unlimitedApps) && bestTariff.unlimitedApps.length > 0)
        ? ('<li>Безлимит: ' + escapeHtml(bestTariff.unlimitedApps.slice(0, 4).join(', ')) + '</li>')
        : '';

      let otherOptionsHtml = '';
      if (otherOptions && otherOptions.length > 0) {
        const otherCards = otherOptions.map(item => buildTariffCardHtml(item, false)).join('');
        otherOptionsHtml = [
          '<div class="other-options-section">',
          '  <div class="other-options-title">💡 Другие подходящие варианты от других операторов:</div>',
          '  <div class="closest-cards-grid">' + otherCards + '</div>',
          '</div>'
        ].join('');
      }

      bodyHtml = [
        '<div class="savings-highlight">Экономия: <strong>' + savingsYear.toLocaleString('ru-RU') + ' ₽ в год</strong> (~' + savingsMonth.toLocaleString('ru-RU') + ' ₽/мес)</div>',
        '<div class="comparison-grid">',
        '  <div class="comp-col current">',
        '    <div class="comp-label">Сейчас у вас (' + escapeHtml(userMob.operator) + ')</div>',
        '    <div class="comp-price">' + Number(currentMonthly).toLocaleString('ru-RU') + ' ₽/мес</div>',
        '    <ul class="comp-list">',
        '      <li>' + userGbText + '</li>',
        '      <li>' + userMinText + '</li>',
        '      ' + userSmsLi,
        '    </ul>',
        '  </div>',
        '  <div class="comp-col target">',
        '    <div class="comp-label">Выгодная альтернатива: <strong>' + escapeHtml(bestTariff.operator) + '</strong></div>',
        '    <div class="comp-tariff-name">' + escapeHtml(bestTariff.tariffName) + ' ' + eridHtml + '</div>',
        '    <div class="comp-price">' + Number(effectiveMonthly).toLocaleString('ru-RU') + ' ₽/мес <small class="effective-hint">(средняя за 12 мес. с учётом подключения)</small></div>',
        '    ' + promoNote,
        '    <ul class="comp-list">',
        '      <li>' + gbText + '</li>',
        '      <li>' + minText + '</li>',
        '      ' + bestSmsLi,
        '      ' + bestAppsLi,
        '      <li>Плата за переход (MNP): ' + (Number(bestTariff.setupFee) || 0) + ' ₽</li>',
        '    </ul>',
        '    <a href="' + safeHref(bestTariff.officialUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Перейти на сайт ' + escapeHtml(bestTariff.operator) + ' ↗</a>',
        '  </div>',
        '</div>',
        otherOptionsHtml,
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-primary btn-guide" data-guide="mobileMNP">Пошаговая инструкция MNP (смена оператора)</button>',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="mobile">Скрипт торга: «Хочу уйти, дайте скидку»</button>',
        '</div>'
      ].join('');
    }

    container.querySelector('.card-content').innerHTML = bodyHtml;
  }

  function buildInternetCardHtml(item, isFeatured = false, userNet = {}) {
    const t = item.tariff || item;
    const effPrice = item.effectiveMonthly || t.monthlyPrice;
    const routerText = (userNet && userNet.needsRouter) ? ('Аренда роутера: ' + (Number(t.routerRentMonthly) || 0) + ' ₽/мес') : 'Без роутера';
    const tvLi = t.hasTv ? '<li>Интерактивное ТВ включено</li>' : '';
    const promoPill = (t.promoDurationMonths > 0 && t.promoMonthlyPrice)
      ? ('<div class="promo-pill">Акция: ' + Number(t.promoMonthlyPrice) + ' ₽ первые ' + Number(t.promoDurationMonths) + ' мес.</div>')
      : '';
    const eridHtml = (t.isPartner && t.adErid)
      ? ('<span class="ad-label" title="Реклама. Токен erid: ' + escapeHtml(t.adErid) + '">erid: ' + escapeHtml(t.adErid) + '</span>')
      : '';

    return [
      '<div class="closest-card ' + (isFeatured ? 'featured' : '') + '">',
      '  <div class="closest-card-op">' + escapeHtml(t.operator) + ' ' + eridHtml + '</div>',
      '  <div class="closest-card-name">' + escapeHtml(t.tariffName) + '</div>',
      '  <div class="closest-card-price">' + Number(effPrice).toLocaleString('ru-RU') + ' ₽/мес <small class="effective-hint">(в среднем)</small></div>',
      '  ' + promoPill,
      '  <ul class="closest-card-list">',
      '    <li>Скорость: <strong>' + Number(t.speedMbps) + ' Мбит/с</strong> (' + escapeHtml(t.technology || 'GPON/Ethernet') + ')</li>',
      '    ' + tvLi,
      '    <li>' + routerText + '</li>',
      '    <li>Подключение: ' + (Number(t.setupFee) || 0) + ' ₽</li>',
      '  </ul>',
      '  <a href="' + safeHref(t.officialUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Перейти на сайт ' + escapeHtml(t.operator) + ' ↗</a>',
      '</div>'
    ].join('\n');
  }

  function renderInternetReportCard(container, result, userNet) {
    const { isCurrentOptimal, isClosestMatch, bestTariff, savingsYear, savingsMonth, effectiveMonthly, currentMonthly, closestTariffs, otherOptions } = result;

    let bodyHtml = '';

    if (isClosestMatch) {
      const cardsHtml = (closestTariffs || []).map((item, idx) => buildInternetCardHtml(item, idx === 0, userNet)).join('');
      bodyHtml = [
        '<div class="closest-badge">Подобраны наиболее близкие тарифы интернета</div>',
        '<p class="closest-intro-text">Тарифа, строго превосходящего ваш текущий по скорости и одновременно более дешевого, не найдено без компромиссов. Мы подобрали <strong>наиболее близкие тарифы от надежных провайдеров ЛНР</strong> с максимальной скоростью и оптимальной стоимостью:</p>',
        '<div class="closest-cards-grid">' + cardsHtml + '</div>',
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-primary btn-guide" data-guide="internetCancel">Инструкция: как закрыть старый договор без штрафов</button>',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="internet">Скрипт звонка: «Предложите спецтариф»</button>',
        '</div>'
      ].join('');
    } else if (isCurrentOptimal) {
      let alternativesHtml = '';
      const alternatives = closestTariffs || otherOptions || [];
      if (alternatives.length > 0) {
        const cardsHtml = alternatives.slice(0, 3).map((item) => buildInternetCardHtml(item, false, userNet)).join('');
        alternativesHtml = [
          '<div class="other-options-section">',
          '  <div class="other-options-title">📌 Доступные альтернативные тарифы других провайдеров в ЛНР:</div>',
          '  <div class="closest-cards-grid">' + cardsHtml + '</div>',
          '</div>'
        ].join('');
      }

      bodyHtml = [
        '<div class="optimal-badge">Ваш тариф интернета оптимален</div>',
        '<p class="card-desc">Вы платите <strong>' + Number(currentMonthly).toLocaleString('ru-RU') + ' ₽/мес</strong>. Для выбранной скорости это отличная рыночная ставка среди провайдеров вашего региона.</p>',
        alternativesHtml,
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="internet">Скрипт диалога с провайдером для скидки</button>',
        '</div>'
      ].join('');
    } else {
      const isPartner = bestTariff.isPartner;
      const eridHtml = (isPartner && bestTariff.adErid) ? '<span class="ad-label" title="Реклама. Токен erid: ' + escapeHtml(bestTariff.adErid) + '">Реклама erid: ' + escapeHtml(bestTariff.adErid) + '</span>' : '';
      const promoNote = bestTariff.promoDurationMonths > 0 && bestTariff.promoMonthlyPrice
        ? '<span class="promo-pill">Акция: ' + Number(bestTariff.promoMonthlyPrice) + ' ₽ первые ' + Number(bestTariff.promoDurationMonths) + ' мес., затем ' + Number(bestTariff.monthlyPrice) + ' ₽</span>'
        : '';
      const tvLi = bestTariff.hasTv ? '<li>Интерактивное ТВ включено в тариф</li>' : '';
      const currentRent = userNet.hasRouterRent ? (Number(userNet.currentRouterRent) || 0) : 0;
      const currentRentLi = currentRent > 0
        ? '<li>Аренда оборудования: ' + currentRent.toLocaleString('ru-RU') + ' ₽/мес (' + (currentRent * 12).toLocaleString('ru-RU') + ' ₽/год)</li>'
        : '';
      const routerText = userNet.needsRouter
        ? 'Включает аренду роутера (' + Number(bestTariff.routerRentMonthly || 0) + ' ₽/мес)'
        : (currentRent > 0 ? 'Со своим роутером (экономия на аренде ' + (currentRent * 12).toLocaleString('ru-RU') + ' ₽/год)' : 'Со своим роутером');

      let otherOptionsHtml = '';
      if (otherOptions && otherOptions.length > 0) {
        const otherCards = otherOptions.map(item => buildInternetCardHtml(item, false, userNet)).join('');
        otherOptionsHtml = [
          '<div class="other-options-section">',
          '  <div class="other-options-title">💡 Другие подходящие варианты от других провайдеров:</div>',
          '  <div class="closest-cards-grid">' + otherCards + '</div>',
          '</div>'
        ].join('');
      }

      bodyHtml = [
        '<div class="savings-highlight">Экономия: <strong>' + savingsYear.toLocaleString('ru-RU') + ' ₽ в год</strong> (~' + savingsMonth.toLocaleString('ru-RU') + ' ₽/мес)</div>',
        '<div class="comparison-grid">',
        '  <div class="comp-col current">',
        '    <div class="comp-label">Сейчас (' + escapeHtml(userNet.operator) + ')</div>',
        '    <div class="comp-price">' + Number(currentMonthly).toLocaleString('ru-RU') + ' ₽/мес</div>',
        '    <ul class="comp-list">',
        '      <li>Скорость: от ' + Number(userNet.minSpeedMbps) + ' Мбит/с</li>',
        '      ' + currentRentLi,
        '    </ul>',
        '  </div>',
        '  <div class="comp-col target">',
        '    <div class="comp-label">Альтернатива: <strong>' + escapeHtml(bestTariff.operator) + '</strong></div>',
        '    <div class="comp-tariff-name">' + escapeHtml(bestTariff.tariffName) + ' ' + eridHtml + '</div>',
        '    <div class="comp-price">' + Number(effectiveMonthly).toLocaleString('ru-RU') + ' ₽/мес <small class="effective-hint">(с учётом акций за 12 мес)</small></div>',
        '    ' + promoNote,
        '    <ul class="comp-list">',
        '      <li>Скорость: ' + Number(bestTariff.speedMbps) + ' Мбит/с (' + escapeHtml(bestTariff.technology || 'GPON/Ethernet') + ')</li>',
        '      ' + tvLi,
        '      <li>' + routerText + '</li>',
        '      <li>Плата за подключение: ' + (Number(bestTariff.setupFee) || 0) + ' ₽</li>',
        '    </ul>',
        '    <a href="' + safeHref(bestTariff.officialUrl) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Сайт провайдера ↗</a>',
        '  </div>',
        '</div>',
        otherOptionsHtml,
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-primary btn-guide" data-guide="internetCancel">Инструкция: как закрыть старый договор без штрафов</button>',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="internet">Скрипт звонка: «Предложите спецтариф»</button>',
        '</div>'
      ].join('');
    }

    container.querySelector('.card-content').innerHTML = bodyHtml;
  }

  function renderSubscriptionsReportCard(container, subsResult, duplicates) {
    let dupHtml = '';
    if (duplicates.length > 0) {
      dupHtml = [
        '<div class="duplicates-alert-box">',
        '  <h4>Обнаружены дубликаты и лишние подписки:</h4>',
        '  <ul class="duplicates-list">',
        duplicates.map(d => '<li><strong>' + escapeHtml(d.duplicateName || 'Пересечение') + ':</strong> ' + escapeHtml(d.message) + (d.monthlySavings ? ' <span class="saving-tag">+' + Number(d.monthlySavings) + ' ₽/мес</span>' : '') + '</li>').join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }

    const unusedItems = subsResult.activeItems.filter(i => i.isUnused);
    let unusedHtml = '';
    if (unusedItems.length > 0) {
      unusedHtml = [
        '<div class="unused-subs-box">',
        '  <h4>Подписки, которыми вы не пользуетесь (рекомендуется отменить):</h4>',
        '  <ul class="subs-action-list">',
        unusedItems.map(item => '<li><span>' + escapeHtml(item.name) + ' (' + Number(item.monthlyPrice) + ' ₽/мес)</span>' + (item.cancelUrl ? ' <a href="' + safeHref(item.cancelUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-cancel-link">Отключить ↗</a>' : '') + '</li>').join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }

    let annualHtml = '';
    if (subsResult.annualPlanRecommendations.length > 0) {
      annualHtml = [
        '<div class="annual-subs-box">',
        '  <h4>Выгода при переходе на годовую оплату (для постоянных сервисов):</h4>',
        '  <ul>',
        subsResult.annualPlanRecommendations.map(rec => '<li>«' + escapeHtml(rec.name) + '» — экономия <strong>' + Number(rec.diffYear).toLocaleString('ru-RU') + ' ₽ в год</strong> при переходе на ежегодную оплату (выходит ' + Number(rec.monthlyEquivalent) + ' ₽/мес).</li>').join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }

    const content = [
      '<div class="savings-highlight">Общая оптимизация подписок: <strong>' + subsResult.totalAnnualSavings.toLocaleString('ru-RU') + ' ₽ в год</strong></div>',
      dupHtml,
      unusedHtml,
      annualHtml,
      '<div class="action-buttons-row">',
      '  <button type="button" class="btn btn-secondary btn-guide" data-guide="subscriptionCancel">Инструкция: как вернуть деньги при неожиданном списании</button>',
      '</div>'
    ].join('');

    container.querySelector('.card-content').innerHTML = content;
  }

  function renderInsuranceReportCard(container, selectedTypes) {
    const selectedGuides = dbInsurance.filter(i => selectedTypes.includes(i.id));

    const itemsHtml = selectedGuides.map(guide => [
      '<div class="insurance-guide-block">',
      '  <h4>' + escapeHtml(guide.name) + '</h4>',
      '  <p class="ins-desc">' + escapeHtml(guide.description) + '</p>',
      '  <div class="ins-checklist">',
      '    <strong>На что обратить внимание:</strong>',
      '    <ul>',
      guide.whatToWatch.map(w => '<li>' + escapeHtml(w) + '</li>').join(''),
      '    </ul>',
      '  </div>',
      '  <div class="ins-tools">',
      '    <strong>Официальные бесплатные калькуляторы и реестры:</strong>',
      '    <div class="tools-pills">',
      guide.officialTools.map(t => '<a href="' + safeHref(t.url) + '" target="_blank" rel="noopener noreferrer" class="tool-pill">' + escapeHtml(t.name) + ' ↗</a>').join(''),
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')).join('');

    container.querySelector('.card-content').innerHTML = itemsHtml;
  }

  // ==========================================
  // 9. МОДАЛЬНЫЕ ОКНА
  // ==========================================
  function showModal(title, bodyHtml) {
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      requestAnimationFrame(() => closeBtn.focus());
    }
  }

  function closeModal() {
    const modal = document.getElementById('info-modal');
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
      lastFocusedElement = null;
    }
  }

  // ==========================================
  // 10. SPA-НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ
  // ==========================================
  function switchTab(tabId) {
    const calcView = document.getElementById('calculator-view');
    const howCalcView = document.getElementById('view-how-we-calculate');
    const securityView = document.getElementById('view-data-security') || document.getElementById('view-how-we-earn');
    const privacyView = document.getElementById('view-privacy');

    const canonicalTab = (tabId === 'how-we-earn') ? 'data-security' : tabId;

    if (calcView) calcView.classList.toggle('hidden', canonicalTab !== 'calculator');
    if (howCalcView) howCalcView.classList.toggle('hidden', canonicalTab !== 'how-we-calculate');
    if (securityView) securityView.classList.toggle('hidden', canonicalTab !== 'data-security');
    if (privacyView) privacyView.classList.toggle('hidden', canonicalTab !== 'privacy');

    document.querySelectorAll('.header-nav .nav-link, .footer-links .footer-nav-link').forEach(link => {
      const linkTab = link.dataset.tab;
      const isActive = linkTab === canonicalTab || (linkTab === 'how-we-earn' && canonicalTab === 'data-security') || (linkTab === 'data-security' && canonicalTab === 'how-we-earn');
      link.classList.toggle('active', isActive);
    });

    scrollToTopInstant();
  }

  // ==========================================
  // 11. СЛУШАТЕЛИ СОБЫТИЙ
  // ==========================================
  function setupEventListeners() {
    const stepCats = { 1: 'mobile', 2: 'internet', 3: 'subscriptions', 4: 'insurance' };

    const syncCityIfUnchanged = () => {
      if (!netRegionManuallyChanged && wizard && wizard.state && wizard.state.mobile) {
        wizard.state.internet.region = wizard.state.mobile.region;
        const netRegionEl = document.getElementById('net-region');
        if (netRegionEl) netRegionEl.value = wizard.state.mobile.region;
      }
    };

    const saveCurrentStepBeforeLeave = (forceUnskip = false) => {
      const step = wizard.currentStep;
      const cat = stepCats[step];
      if (!cat) return;
      const inputs = readCurrentStepInputs(step);
      if (!forceUnskip && wizard.state[cat].skipped && !stepDirty[cat]) {
        wizard.state[cat] = { ...wizard.state[cat], ...inputs, skipped: true };
      } else {
        wizard.updateCategoryState(cat, inputs);
      }
      if (step === 1) syncCityIfUnchanged();
    };

    // Отслеживание изменений на каждом шаге и синхронизация города
    [1, 2, 3, 4].forEach(num => {
      const stepEl = document.getElementById('step-' + num);
      if (!stepEl) return;
      const cat = stepCats[num];
      const markDirty = () => { stepDirty[cat] = true; };
      stepEl.addEventListener('input', markDirty);
      stepEl.addEventListener('change', markDirty);
    });

    const mobRegionEl = document.getElementById('mob-region');
    if (mobRegionEl) {
      mobRegionEl.addEventListener('change', (e) => {
        if (!netRegionManuallyChanged && wizard && wizard.state) {
          wizard.state.internet.region = e.target.value;
          const netRegionEl = document.getElementById('net-region');
          if (netRegionEl) netRegionEl.value = e.target.value;
        }
      });
    }

    const netRegionEl = document.getElementById('net-region');
    if (netRegionEl) {
      netRegionEl.addEventListener('change', () => {
        netRegionManuallyChanged = true;
      });
    }

    // Навигация мастера (Вперёд, Назад, Пропустить, Кликабельный степпер)
    document.querySelectorAll('.btn-wizard-next').forEach(btn => {
      btn.addEventListener('click', () => {
        saveCurrentStepBeforeLeave(true);
        wizard.next();
      });
    });

    document.querySelectorAll('.btn-wizard-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        saveCurrentStepBeforeLeave(false);
        wizard.prev();
      });
    });

    document.querySelectorAll('.btn-wizard-skip').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = stepCats[wizard.currentStep];
        if (cat) stepDirty[cat] = false;
        wizard.skipCurrentCategory();
      });
    });

    document.querySelectorAll('.wizard-step-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const targetStep = Number(pill.dataset.step);
        if (!targetStep || targetStep === wizard.currentStep) return;
        saveCurrentStepBeforeLeave(false);
        wizard.goToStep(targetStep);
      });
    });

    // Слайдеры с поддержкой выбора безлимита (сохранение предыдущего значения)
    const bindRangeWithUnlimited = (sliderId, spanId, toggleId, unit, maxVal, defaultVal) => {
      const slider = document.getElementById(sliderId);
      const span = document.getElementById(spanId);
      const toggle = document.getElementById(toggleId);
      if (!slider || !span) return;

      if (!slider.dataset.prevValue) {
        slider.dataset.prevValue = String(defaultVal);
      }

      const updateState = (isUnlim) => {
        if (toggle) {
          toggle.checked = isUnlim;
          const toggleLabel = toggle.closest('.unlimited-toggle');
          if (toggleLabel) toggleLabel.classList.toggle('active', isUnlim);
        }
        if (isUnlim) {
          if (!slider.disabled) {
            slider.dataset.prevValue = slider.value || String(defaultVal);
          }
          slider.value = maxVal;
          slider.disabled = true;
          span.textContent = 'Безлимит (∞)';
          span.classList.add('unlimited');
        } else {
          slider.disabled = false;
          const restored = slider.dataset.prevValue !== undefined ? slider.dataset.prevValue : String(defaultVal);
          slider.value = restored;
          span.textContent = slider.value + ' ' + unit;
          span.classList.remove('unlimited');
        }
      };

      slider.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        slider.dataset.prevValue = String(val);
        if (toggle && toggle.checked) {
          toggle.checked = false;
          const toggleLabel = toggle.closest('.unlimited-toggle');
          if (toggleLabel) toggleLabel.classList.remove('active');
        }
        slider.disabled = false;
        span.textContent = val + ' ' + unit;
        span.classList.remove('unlimited');
      });

      if (toggle) {
        toggle.addEventListener('change', (e) => {
          updateState(e.target.checked);
        });
      }
    };

    bindRangeWithUnlimited('mob-gb', 'mob-gb-val', 'mob-gb-unlim', 'ГБ', 100, 25);
    bindRangeWithUnlimited('mob-min', 'mob-min-val', 'mob-min-unlim', 'мин', 1200, 400);
    bindRangeWithUnlimited('mob-sms', 'mob-sms-val', 'mob-sms-unlim', 'шт', 100, 0);

    // Показ/скрытие поля текущей аренды роутера на шаге 2
    const netRouterRentCb = document.getElementById('net-router-rent');
    const netRouterRentDetails = document.getElementById('net-router-rent-details');
    if (netRouterRentCb && netRouterRentDetails) {
      netRouterRentCb.addEventListener('change', () => {
        netRouterRentDetails.classList.toggle('hidden', !netRouterRentCb.checked);
      });
    }

    // Пользовательские подписки
    const nameInput = document.getElementById('custom-sub-name');
    const priceInput = document.getElementById('custom-sub-price');
    const unusedInput = document.getElementById('custom-sub-unused');
    const customErrorEl = document.getElementById('custom-sub-error');

    const showCustomError = (msg) => {
      if (!customErrorEl) return;
      customErrorEl.textContent = msg;
      customErrorEl.classList.remove('hidden');
    };

    const clearCustomError = () => {
      if (!customErrorEl) return;
      customErrorEl.textContent = '';
      customErrorEl.classList.add('hidden');
    };

    const addCustomSubscription = () => {
      if (!nameInput || !priceInput) return;
      const name = nameInput.value.trim();
      const rawPrice = priceInput.value.trim();
      const numericPrice = rawPrice === '' ? 0 : Number(rawPrice);
      const unused = Boolean(unusedInput && unusedInput.checked);

      if (!name) {
        showCustomError('Введите название сервиса или подписки.');
        nameInput.focus();
        return;
      }
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        showCustomError('Укажите корректную цену (0 ₽ или больше).');
        priceInput.focus();
        return;
      }

      clearCustomError();
      wizard.state.subscriptions.customItems.push({ name, price: Math.round(numericPrice), unused });
      stepDirty.subscriptions = true;
      nameInput.value = '';
      priceInput.value = '';
      if (unusedInput) unusedInput.checked = false;

      renderCustomSubscriptionsList(wizard.state.subscriptions.customItems);
      showToast('Подписка «' + name + '» добавлена', 'success');
    };

    const addCustomBtn = document.getElementById('btn-add-custom-sub');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', addCustomSubscription);
    }

    [nameInput, priceInput].forEach(inp => {
      if (!inp) return;
      inp.addEventListener('input', clearCustomError);
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCustomSubscription();
        }
      });
    });

    const resetSubsBtn = document.getElementById('btn-reset-subs');
    if (resetSubsBtn) {
      resetSubsBtn.addEventListener('click', () => {
        wizard.state.subscriptions.selectedIds = [];
        wizard.state.subscriptions.unusedIds = [];
        wizard.state.subscriptions.customItems = [];
        stepDirty.subscriptions = true;
        renderSubscriptionsGrid([], [], []);
        showToast('Выбор подписок сброшен', 'info');
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-remove-custom')) {
        const idx = Number(e.target.dataset.idx);
        wizard.state.subscriptions.customItems.splice(idx, 1);
        stepDirty.subscriptions = true;
        renderCustomSubscriptionsList(wizard.state.subscriptions.customItems);
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('.sub-check')) {
        const id = e.target.dataset.id;
        const card = document.getElementById('sub-card-' + id);
        const unusedRow = document.getElementById('sub-unused-row-' + id);
        if (card) card.classList.toggle('active', e.target.checked);
        if (unusedRow) unusedRow.classList.toggle('hidden', !e.target.checked);
        if (!e.target.checked && card) {
          const unusedCheck = card.querySelector('.sub-unused-check');
          if (unusedCheck) unusedCheck.checked = false;
        }
        updateSubscriptionsSummary();
      } else if (e.target.matches('.ins-check')) {
        const card = e.target.closest('.insurance-item-card');
        if (card) card.classList.toggle('selected', e.target.checked);
      }
    });

    // Фильтрация подписок по категориям
    document.addEventListener('click', (e) => {
      const filterBtn = e.target.closest('.sub-filter-btn');
      if (filterBtn) {
        document.querySelectorAll('.sub-filter-btn').forEach(btn => btn.classList.remove('active'));
        filterBtn.classList.add('active');
        const filter = filterBtn.getAttribute('data-cat') || filterBtn.getAttribute('data-filter') || 'all';
        const cards = document.querySelectorAll('#subscriptions-list .sub-item-card');
        cards.forEach(card => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.classList.remove('filter-hidden');
          } else {
            card.classList.add('filter-hidden');
          }
        });
      }
    });

    // Модальные окна скриптов
    document.addEventListener('click', (e) => {
      const retBtn = e.target.closest('.btn-retention');
      if (retBtn) {
        const type = retBtn.dataset.type;
        const scriptData = RETENTION_SCRIPTS[type];
        if (scriptData) {
          const body = [
            '<p>' + escapeHtml(scriptData.description) + '</p>',
            '<div class="steps-box">',
            scriptData.steps.map(s => '<p class="step-line">' + escapeHtml(s) + '</p>').join(''),
            '</div>',
            '<h4>Шаблон текста обращения:</h4>',
            '<div class="code-copy-box">',
            '  <textarea id="copy-text-area" readonly class="copy-textarea">' + escapeHtml(scriptData.template) + '</textarea>',
            '  <button type="button" class="btn btn-sm btn-primary" id="btn-copy-template">Скопировать текст в буфер</button>',
            '</div>'
          ].join('');
          showModal(scriptData.title, body);

          const copyBtn = document.getElementById('btn-copy-template');
          if (copyBtn) {
            copyBtn.onclick = () => {
              const ta = document.getElementById('copy-text-area');
              if (ta) {
                ta.select();
                copyToClipboard(ta.value, copyBtn, 'Текст обращения скопирован в буфер обмена');
              }
            };
          }
        }
      }
    });

    // Модальные окна инструкций
    document.addEventListener('click', (e) => {
      const guideBtn = e.target.closest('.btn-guide');
      if (guideBtn) {
        const guideKey = guideBtn.dataset.guide;
        const guide = STEP_BY_STEP_GUIDES[guideKey];
        if (guide) {
          let contentHtml = [
            '<div class="legal-badge">Правовое основание: ' + escapeHtml(guide.legalBasis) + '</div>',
            '<div class="guide-steps-list">',
            guide.steps.map(s => [
              '<div class="guide-step-card">',
              '  <div class="step-num">' + Number(s.number) + '</div>',
              '  <div class="step-content">',
              '    <h5>' + escapeHtml(s.title) + '</h5>',
              '    <p>' + escapeHtml(s.details) + '</p>',
              '  </div>',
              '</div>'
            ].join('')).join(''),
            '</div>'
          ].join('');

          if (guide.refundClaimTemplate) {
            contentHtml += [
              '<h4>Шаблон претензии на возврат денежных средств:</h4>',
              '<div class="code-copy-box">',
              '  <textarea id="copy-claim-area" readonly class="copy-textarea">' + escapeHtml(guide.refundClaimTemplate) + '</textarea>',
              '  <button type="button" class="btn btn-sm btn-primary" id="btn-copy-claim">Скопировать шаблон претензии</button>',
              '</div>'
            ].join('');
          }

          showModal(guide.title, contentHtml);

          const copyClaimBtn = document.getElementById('btn-copy-claim');
          if (copyClaimBtn) {
            copyClaimBtn.onclick = () => {
              const ta = document.getElementById('copy-claim-area');
              if (ta) {
                ta.select();
                copyToClipboard(ta.value, copyClaimBtn, 'Шаблон претензии скопирован в буфер обмена');
              }
            };
          }
        }
      }
    });

    // Закрытие модального окна (кнопка, фон, Escape)
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('info-modal');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Кнопки отчёта
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        wizard.goToStep(1);
      });
    }

    const btnEmptyReturn = document.getElementById('btn-empty-return');
    if (btnEmptyReturn) {
      btnEmptyReturn.addEventListener('click', () => {
        wizard.goToStep(1);
      });
    }

    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    const btnClear = document.getElementById('btn-clear-data');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Очистить сохранённые данные из памяти браузера?')) {
          clearUserData();
          window.location.reload();
        }
      });
    }

    // SPA вкладки (Калькулятор, Как мы считаем, Безопасность, Конфиденциальность)
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.dataset.tab;
        switchTab(tab);
        if (history.pushState) {
          history.pushState(null, '', '#' + tab);
        } else {
          location.hash = tab;
        }
      });
    });

    document.querySelectorAll('.btn-return-calc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('calculator');
        if (history.pushState) {
          history.pushState(null, '', '#calculator');
        } else {
          location.hash = 'calculator';
        }
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'calculator';
      if (['calculator', 'how-we-calculate', 'data-security', 'how-we-earn', 'privacy'].includes(hash)) {
        switchTab(hash);
      }
    });
  }

  // ==========================================
  // 12. ТОЧКА ВХОДА
  // ==========================================
  function initApp() {
    initTheme();
    loadDatabase();

    wizard = new WizardController({
      totalSteps: 4,
      onStepChange: (step, total, state) => {
        showStepUI(step, total);
        syncInputsWithState(state);
      },
      onFinish: (state) => {
        renderReport(state);
      }
    });

    setupEventListeners();

    const saved = loadUserData();
    if (saved) {
      wizard.loadState(saved);
      if (saved.internet && saved.mobile && saved.internet.region && saved.internet.region !== saved.mobile.region) {
        netRegionManuallyChanged = true;
      }
    }

    // Обработка начального хэша в URL
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['how-we-calculate', 'data-security', 'how-we-earn', 'privacy'].includes(initialHash)) {
      switchTab(initialHash);
    } else {
      switchTab('calculator');
    }

    // Запуск мастера с 1-го шага
    wizard.goToStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
