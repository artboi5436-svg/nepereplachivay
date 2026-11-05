/**
 * Чистый модуль расчётов «Не переплачивай».
 * Без зависимостей от DOM. Полностью покрывается модульными тестами.
 */

/**
 * Расчёт полной стоимости владения (TCO) тарифа связи за 12 месяцев с учётом акций и платы за подключение.
 * @param {Object} tariff - Объект тарифа
 * @param {Object} [options] - Дополнительные параметры (например, плата за аренду роутера)
 * @returns {{ tco12: number, effectiveMonthly: number, promoSavings: number }}
 */
export function calculateTariffTCO12(tariff, options = {}) {
  const setupFee = Number(tariff.setupFee) || 0;
  const regularPrice = Number(tariff.monthlyPrice) || 0;
  const promoMonths = Math.min(12, Math.max(0, Number(tariff.promoDurationMonths) || 0));
  const hasPromo = promoMonths > 0 && tariff.promoMonthlyPrice !== null && tariff.promoMonthlyPrice !== undefined;
  const promoPrice = hasPromo ? Number(tariff.promoMonthlyPrice) : regularPrice;

  const regularMonths = 12 - promoMonths;
  const baseServiceCost = (promoPrice * promoMonths) + (regularPrice * regularMonths);

  // Аренда оборудования (для интернета)
  const routerRentMonthly = options.needsRouter ? (Number(tariff.routerRentMonthly) || 0) : 0;
  const equipmentCost = routerRentMonthly * 12;

  const tco12 = setupFee + baseServiceCost + equipmentCost;
  const effectiveMonthly = Math.round(tco12 / 12);

  // Сколько пользователь экономит благодаря промо-периоду за год
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

/**
 * Подбор наиболее выгодного мобильного тарифа.
 * @param {Object} user - Потребности пользователя { currentPrice, gb, minutes, sms, region, currentOperator }
 * @param {Array} tariffs - Список тарифов из базы данных
 * @returns {Object} Результат сравнения
 */
export function findBestMobileTariff(user, tariffs = []) {
  const currentMonthly = Number(user.currentPrice) || 0;
  const currentAnnualTCO = currentMonthly * 12;
  const userGb = Number(user.gb) || 0;
  const userMin = Number(user.minutes) || 0;
  const userSms = Number(user.sms) || 0;
  const userRegion = user.region || 'Все регионы';

  // Фильтруем тарифы по региону и достаточности пакета
  const matchingTariffs = tariffs.filter(t => {
    const regionMatch = t.region === userRegion || t.region === 'Все регионы' || userRegion === 'Все регионы';
    const gbMatch = Number(t.includedGb) >= userGb;
    const minMatch = Number(t.includedMinutes) >= userMin;
    const smsMatch = userSms === 0 || Number(t.includedSms) >= userSms;
    return regionMatch && gbMatch && minMatch && smsMatch;
  });

  if (matchingTariffs.length === 0) {
    return {
      hasMatch: false,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: null,
      savingsYear: 0,
      savingsMonth: 0,
      isCurrentOptimal: true,
      reason: 'В базе нет альтернативных тарифов с таким большим объёмом минут или гигабайт.'
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

  // Проверка: выгоден ли новый тариф
  if (best.savingsYear > 0) {
    return {
      hasMatch: true,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: best.tariff,
      tco12: best.tco12,
      effectiveMonthly: best.effectiveMonthly,
      savingsYear: best.savingsYear,
      savingsMonth: best.savingsMonth,
      isCurrentOptimal: false,
      allAlternatives: scored
    };
  }

  // Если текущий тариф дешевле или равен лучшей альтернативе
  return {
    hasMatch: true,
    currentMonthly,
    currentAnnualTCO,
    bestTariff: best.tariff,
    tco12: best.tco12,
    effectiveMonthly: best.effectiveMonthly,
    savingsYear: 0,
    savingsMonth: 0,
    isCurrentOptimal: true,
    reason: 'Ваш текущий тариф уже выгоднее или равен лучшим предложениям на рынке!'
  };
}

/**
 * Подбор наиболее выгодного тарифа домашнего интернета.
 * @param {Object} user - { currentPrice, minSpeedMbps, needsRouter, region, currentOperator }
 * @param {Array} tariffs - Список тарифов
 * @returns {Object}
 */
export function findBestInternetTariff(user, tariffs = []) {
  const currentMonthly = Number(user.currentPrice) || 0;
  const currentAnnualTCO = currentMonthly * 12;
  const userSpeed = Number(user.minSpeedMbps) || 100;
  const userRegion = user.region || 'Все регионы';
  const needsRouter = Boolean(user.needsRouter);

  const matchingTariffs = tariffs.filter(t => {
    const regionMatch = t.region === userRegion || t.region === 'Все регионы' || userRegion === 'Все регионы';
    const speedMatch = Number(t.speedMbps) >= userSpeed;
    return regionMatch && speedMatch;
  });

  if (matchingTariffs.length === 0) {
    return {
      hasMatch: false,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: null,
      savingsYear: 0,
      savingsMonth: 0,
      isCurrentOptimal: true,
      reason: 'В базе нет тарифов с такой высокой скоростью в вашем регионе.'
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

  if (best.savingsYear > 0) {
    return {
      hasMatch: true,
      currentMonthly,
      currentAnnualTCO,
      bestTariff: best.tariff,
      tco12: best.tco12,
      effectiveMonthly: best.effectiveMonthly,
      savingsYear: best.savingsYear,
      savingsMonth: best.savingsMonth,
      isCurrentOptimal: false,
      allAlternatives: scored
    };
  }

  return {
    hasMatch: true,
    currentMonthly,
    currentAnnualTCO,
    bestTariff: best.tariff,
    tco12: best.tco12,
    effectiveMonthly: best.effectiveMonthly,
    savingsYear: 0,
    savingsMonth: 0,
    isCurrentOptimal: true,
    reason: 'Ваш текущий тариф домашнего интернета уже оптимален.'
  };
}

/**
 * Расчёт расходов и оптимизации подписок.
 * @param {Array} selectedIds - Выбранные идентификаторы подписок
 * @param {Array} customItems - Пользовательские подписки [{ name, price, unused }]
 * @param {Array} unusedIds - Идентификаторы подписок, помеченных как «не пользуюсь»
 * @param {Array} duplicatesFound - Найденные дубликаты { duplicateService, bundledInside, reason }
 * @param {Array} dbSubscriptions - База всех подписок
 * @returns {Object}
 */
export function calculateSubscriptionsSummary({
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
  const duplicateIdSet = new Set(duplicatesFound.map(d => d.duplicateId));

  // Обработка стандартных подписок из базы
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

  // Пользовательские добавленные подписки
  for (const item of customItems) {
    const price = Number(item.price) || 0;
    currentMonthlyTotal += price;
    const isUnused = Boolean(item.unused);

    activeItems.push({
      id: `custom-${Math.random().toString(36).substring(2, 7)}`,
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

  // Расчёт экономии:
  // 1. Отказ от неиспользуемых
  let unusedMonthlySavings = 0;
  for (const item of activeItems) {
    if (item.isUnused) {
      unusedMonthlySavings += item.monthlyPrice;
    }
  }

  // 2. Отказ от дубликатов (если они уже не посчитаны в unused)
  let duplicateMonthlySavings = 0;
  for (const item of activeItems) {
    if (item.isDuplicate && !item.isUnused) {
      duplicateMonthlySavings += item.monthlyPrice;
    }
  }

  // 3. Выгода при переходе на годовой тариф (для оставшихся нужных)
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

/**
 * Итоговая сводка по всем категориям расходов.
 */
export function calculateGrandTotal({ mobileResult, internetResult, subsResult }) {
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
