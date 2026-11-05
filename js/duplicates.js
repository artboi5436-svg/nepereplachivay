/**
 * Модуль поиска пересечений, дубликатов и избыточных подписок.
 */

/**
 * Анализирует список выбранных пользователем ID подписок и возвращает найденные проблемы.
 * @param {Array<string>} selectedIds - массив выбранных ID подписок
 * @param {Array<Object>} dbSubscriptions - база данных подписок
 * @returns {Array<Object>} Список обнаруженных дубликатов и предупреждений
 */
export function analyzeSubscriptionDuplicates(selectedIds = [], dbSubscriptions = []) {
  const selectedSet = new Set(selectedIds);
  const dbMap = new Map(dbSubscriptions.map(s => [s.id, s]));
  const issues = [];
  const processedDuplicates = new Set();

  // 1. Поиск прямого вхождения (сервис входит в пакет, но оплачивается отдельно)
  for (const id of selectedIds) {
    const sub = dbMap.get(id);
    if (!sub) continue;

    // Вариант А: текущая подписка ссылается на родительский пакет
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
        message: `«${sub.name}» уже полностью входит в вашу подписку «${parent ? parent.name : ''}». Вы переплачиваете дважды за один и тот же контент!`
      });
    }

    // Вариант Б: текущая подписка является пакетом и содержит другие выбранные сервисы
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
            message: `«${childSub ? childSub.name : childId}» уже входит в подписку «${sub.name}». Рекомендуется отменить отдельную оплату.`
          });
        }
      }
    }
  }

  // 2. Поиск избыточных подписок одной категории (например, 2+ онлайн-кинотеатра)
  const cinemas = selectedIds
    .map(id => dbMap.get(id))
    .filter(s => s && s.category === 'cinema');

  if (cinemas.length >= 2) {
    const names = cinemas.map(c => `«${c.name}»`).join(', ');
    const cheaperCinemas = [...cinemas].sort((a, b) => b.monthlyPrice - a.monthlyPrice).slice(1);
    const potentialSavings = cheaperCinemas.reduce((acc, c) => acc + (Number(c.monthlyPrice) || 0), 0);

    issues.push({
      type: 'category_cinema_overlap',
      severity: 'medium',
      duplicateId: null,
      duplicateName: 'Несколько онлайн-кинотеатров',
      monthlySavings: potentialSavings,
      message: `У вас подключено ${cinemas.length} кинотеатра: ${names}. Исследования показывают, что большинство людей не смотрят более одного сервиса одновременно. Выгоднее чередовать подписки по очереди, экономя до ${potentialSavings} ₽/мес.`
    });
  }

  // 3. Поиск дублей музыкальных сервисов
  const musics = selectedIds
    .map(id => dbMap.get(id))
    .filter(s => s && s.category === 'music');

  if (musics.length >= 2) {
    const names = musics.map(m => `«${m.name}»`).join(' и ');
    issues.push({
      type: 'category_music_overlap',
      severity: 'medium',
      duplicateId: null,
      duplicateName: 'Несколько музыкальных сервисов',
      monthlySavings: 169,
      message: `У вас одновременно оплачивается музыка в ${names}. Музыкальные каталоги практически идентичны — достаточно оставить один сервис.`
    });
  }

  return issues;
}
