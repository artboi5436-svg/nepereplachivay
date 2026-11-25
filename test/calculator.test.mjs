import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTariffTCO12,
  findBestMobileTariff,
  findBestInternetTariff,
  calculateSubscriptionsSummary,
  calculateGrandTotal
} from '../js/calculator.js';
import { analyzeSubscriptionDuplicates } from '../js/duplicates.js';

describe('Модуль расчётов calculator.js', () => {

  describe('calculateTariffTCO12: Расчёт TCO на 12 месяцев', () => {
    it('Сценарий 1: Учёт акции на N месяцев (3 мес по 300 ₽, затем 9 мес по 500 ₽, подключение 100 ₽)', () => {
      const tariff = {
        monthlyPrice: 500,
        promoMonthlyPrice: 300,
        promoDurationMonths: 3,
        setupFee: 100
      };
      // TCO = 100 + (300 * 3) + (500 * 9) = 100 + 900 + 4500 = 5500
      const res = calculateTariffTCO12(tariff);
      assert.equal(res.tco12, 5500);
      assert.equal(res.effectiveMonthly, Math.round(5500 / 12)); // 458 ₽
      assert.equal(res.promoSavings, 600); // (500 - 300) * 3 = 600
    });

    it('Сценарий 2: Без акции и с нулевой платой за подключение', () => {
      const tariff = {
        monthlyPrice: 600,
        promoMonthlyPrice: null,
        promoDurationMonths: 0,
        setupFee: 0
      };
      const res = calculateTariffTCO12(tariff);
      assert.equal(res.tco12, 7200);
      assert.equal(res.effectiveMonthly, 600);
      assert.equal(res.promoSavings, 0);
    });

    it('Сценарий 3: С арендой роутера (150 ₽/мес)', () => {
      const tariff = {
        monthlyPrice: 500,
        promoMonthlyPrice: null,
        promoDurationMonths: 0,
        setupFee: 0,
        routerRentMonthly: 150
      };
      // TCO = (500 * 12) + (150 * 12) = 6000 + 1800 = 7800
      const res = calculateTariffTCO12(tariff, { needsRouter: true });
      assert.equal(res.tco12, 7800);
      assert.equal(res.effectiveMonthly, 650);
    });
  });

  describe('findBestMobileTariff: Поиск тарифа мобильной связи', () => {
    const mockTariffs = [
      {
        id: 't-cheap',
        operator: 'Опер-А',
        tariffName: 'Эконом',
        region: 'Все регионы',
        monthlyPrice: 400,
        promoMonthlyPrice: 300,
        promoDurationMonths: 3,
        setupFee: 100,
        includedGb: 20,
        includedMinutes: 300,
        includedSms: 0
      },
      {
        id: 't-heavy',
        operator: 'Опер-Б',
        tariffName: 'Макс',
        region: 'Все регионы',
        monthlyPrice: 800,
        promoMonthlyPrice: null,
        promoDurationMonths: 0,
        setupFee: 0,
        includedGb: 50,
        includedMinutes: 1000,
        includedSms: 100
      }
    ];

    it('Сценарий: Найдена реальная экономия', () => {
      // Пользователь платит 600 ₽/мес, тратит 15 ГБ и 200 мин
      // Текущие расходы в год: 600 * 12 = 7200 ₽
      // Тариф t-cheap: TCO = 100 + (300*3) + (400*9) = 100 + 900 + 3600 = 4600 ₽
      // Экономия в год: 7200 - 4600 = 2600 ₽
      const user = {
        currentPrice: 600,
        gb: 15,
        minutes: 200,
        sms: 0,
        region: 'Все регионы'
      };
      const res = findBestMobileTariff(user, mockTariffs);
      assert.equal(res.hasMatch, true);
      assert.equal(res.isCurrentOptimal, false);
      assert.equal(res.savingsYear, 2600);
      assert.equal(res.bestTariff.id, 't-cheap');
    });

    it('Сценарий с нулевой/отрицательной экономией: «Текущий тариф уже самый выгодный»', () => {
      // Пользователь платит 350 ₽/мес за 15 ГБ и 200 мин
      // Текущий год: 350 * 12 = 4200 ₽
      // Лучший кандидат t-cheap TCO = 4600 ₽. Пользователь платит меньше рынка!
      const user = {
        currentPrice: 350,
        gb: 15,
        minutes: 200,
        sms: 0,
        region: 'Все регионы'
      };
      const res = findBestMobileTariff(user, mockTariffs);
      assert.equal(res.isCurrentOptimal, true);
      assert.equal(res.savingsYear, 0);
      assert.match(res.reason, /выгоднее/i);
    });

    it('Сценарий: Ни один тариф не подходит по запрошенному трафику (предлагает близкие альтернативы)', () => {
      const user = {
        currentPrice: 1500,
        gb: 200, // В базе макс 50 ГБ
        minutes: 2000,
        sms: 0,
        region: 'Все регионы'
      };
      const res = findBestMobileTariff(user, mockTariffs);
      assert.equal(res.hasMatch, false);
      assert.equal(res.isCurrentOptimal, true);
      assert.equal(res.isClosestMatch, true);
      assert.ok(res.closestTariffs && res.closestTariffs.length > 0);
    });

    it('Сценарий: Выбор безлимита на интернет и подбор безлимитного тарифа', () => {
      const tariffsWithUnlim = [
        ...mockTariffs,
        {
          id: 't-unlim',
          operator: 'МКС',
          tariffName: 'МКС Безлимит',
          region: 'Все регионы',
          monthlyPrice: 800,
          promoMonthlyPrice: null,
          promoDurationMonths: 0,
          setupFee: 100,
          includedGb: 9999,
          isUnlimitedGb: true,
          includedMinutes: 1500,
          isUnlimitedMinutes: true,
          includedSms: 100
        }
      ];

      const user = {
        currentPrice: 1200,
        isUnlimitedGb: true,
        minutes: 500,
        sms: 0,
        region: 'Все регионы'
      };

      const res = findBestMobileTariff(user, tariffsWithUnlim);
      assert.equal(res.hasMatch, true);
      assert.equal(res.bestTariff.id, 't-unlim');
      assert.equal(res.isCurrentOptimal, false);
    });

    it('Сценарий: Учёт региональной принадлежности тарифов (ЛНР)', () => {
      const regionalTariffs = [
        {
          id: 'spb-only',
          operator: 'ПитерТел',
          tariffName: 'Питерский',
          region: 'Санкт-Петербург и ЛО',
          monthlyPrice: 300,
          promoDurationMonths: 0,
          setupFee: 0,
          includedGb: 30,
          includedMinutes: 500,
          includedSms: 0
        },
        {
          id: 'lnr-mks',
          operator: 'МКС',
          tariffName: 'Оптимальный',
          region: 'Луганская Народная Республика (ЛНР)',
          monthlyPrice: 350,
          promoDurationMonths: 0,
          setupFee: 100,
          includedGb: 25,
          includedMinutes: 500,
          includedSms: 0
        }
      ];

      const userInLnr = {
        currentPrice: 600,
        gb: 20,
        minutes: 400,
        sms: 0,
        region: 'Луганская Народная Республика (ЛНР)'
      };

      const res = findBestMobileTariff(userInLnr, regionalTariffs);
      assert.equal(res.hasMatch, true);
      // Тариф ПитерТел дешевле, но он для СПб! Должен быть выбран именно lnr-mks
      assert.equal(res.bestTariff.id, 'lnr-mks');
    });

    it('Сценарий: Конкретный город ЛНР (Алчевск) получает общие тарифы ЛНР и отсекает чужие регионы', () => {
      const tariffs = [
        {
          id: 'msk-only',
          operator: 'МскТел',
          tariffName: 'Московский',
          region: 'Москва и МО',
          monthlyPrice: 100,
          promoDurationMonths: 0,
          setupFee: 0,
          includedGb: 50,
          includedMinutes: 1000,
          includedSms: 0
        },
        {
          id: 'lnr-all',
          operator: 'МКС',
          tariffName: 'Оптимальный',
          region: 'Все города ЛНР',
          monthlyPrice: 200,
          promoDurationMonths: 0,
          setupFee: 100,
          includedGb: 15,
          includedMinutes: 600,
          includedSms: 0
        }
      ];

      const res = findBestMobileTariff({
        currentPrice: 500,
        gb: 15,
        minutes: 400,
        sms: 0,
        region: 'Алчевск'
      }, tariffs);
      assert.equal(res.hasMatch, true);
      assert.equal(res.bestTariff.id, 'lnr-all');
    });

    it('Сценарий: Отрицательная или нулевая текущая цена корректно ограничивается 0', () => {
      const res = findBestMobileTariff({
        currentPrice: -200,
        gb: 10,
        minutes: 200,
        sms: 0,
        region: 'Все регионы'
      }, mockTariffs);
      assert.equal(res.currentMonthly, 0);
      assert.equal(res.isCurrentOptimal, true);
      assert.equal(res.savingsYear, 0);
    });
  });

  describe('findBestInternetTariff: Поиск тарифа интернета', () => {
    const mockInternet = [
      {
        id: 'net-100',
        operator: 'Провайдер 1',
        tariffName: 'Стандарт 100',
        region: 'Все регионы',
        speedMbps: 100,
        monthlyPrice: 500,
        promoMonthlyPrice: 350,
        promoDurationMonths: 2,
        setupFee: 0,
        routerRentMonthly: 100
      }
    ];

    it('Учитывает аренду роутера при расчёте экономии', () => {
      // Пользователь платит 700 ₽/мес (8400 в год), нужен роутер
      // net-100 TCO = 0 + (350*2) + (500*10) + (100*12) = 700 + 5000 + 1200 = 6900 ₽
      // Экономия = 8400 - 6900 = 1500 ₽
      const user = {
        currentPrice: 700,
        minSpeedMbps: 100,
        needsRouter: true,
        region: 'Все регионы'
      };
      const res = findBestInternetTariff(user, mockInternet);
      assert.equal(res.isCurrentOptimal, false);
      assert.equal(res.savingsYear, 1500);
      assert.equal(res.tco12, 6900);
    });

    it('Учитывает текущую плату за аренду роутера и переход на свой роутер', () => {
      // Пользователь платит 500 ₽/мес за тариф + 150 ₽/мес за аренду роутера = 650 ₽/мес (7800 ₽/год)
      // Переходит на свой роутер (needsRouter: false)
      // net-100 TCO без роутера = (350*2) + (500*10) = 5700 ₽
      // Экономия = 7800 - 5700 = 2100 ₽
      const user = {
        currentPrice: 500,
        currentRouterRent: 150,
        minSpeedMbps: 100,
        needsRouter: false,
        region: 'Все регионы'
      };
      const res = findBestInternetTariff(user, mockInternet);
      assert.equal(res.isCurrentOptimal, false);
      assert.equal(res.currentMonthly, 650);
      assert.equal(res.tco12, 5700);
      assert.equal(res.savingsYear, 2100);
    });

    it('Фильтрует интернет-тарифы по городу ЛНР и отсекает другие регионы', () => {
      const cityTariffs = [
        {
          id: 'spb-net',
          operator: 'ПитерНет',
          tariffName: 'Питер 200',
          region: 'Санкт-Петербург',
          speedMbps: 200,
          monthlyPrice: 250,
          promoDurationMonths: 0,
          setupFee: 0,
          routerRentMonthly: 0
        },
        {
          id: 'alchevsk-net',
          operator: 'Магистр-Телеком',
          tariffName: 'Городской 200',
          region: 'Алчевск',
          speedMbps: 200,
          monthlyPrice: 490,
          promoDurationMonths: 0,
          setupFee: 0,
          routerRentMonthly: 80
        },
        {
          id: 'lugansk-only-net',
          operator: 'ЛДС',
          tariffName: 'Безлим 300',
          region: 'Луганск',
          speedMbps: 300,
          monthlyPrice: 450,
          promoDurationMonths: 0,
          setupFee: 0,
          routerRentMonthly: 100
        }
      ];

      const resAlchevsk = findBestInternetTariff({
        currentPrice: 700,
        minSpeedMbps: 200,
        needsRouter: false,
        region: 'Алчевск'
      }, cityTariffs);
      assert.equal(resAlchevsk.bestTariff.id, 'alchevsk-net');

      const resAllLnr = findBestInternetTariff({
        currentPrice: 700,
        minSpeedMbps: 200,
        needsRouter: false,
        region: 'Все города ЛНР'
      }, cityTariffs);
      assert.equal(resAllLnr.bestTariff.id, 'lugansk-only-net');
    });

    it('Обрабатывает отрицательную текущую цену интернета без отрицательной экономии', () => {
      const res = findBestInternetTariff({
        currentPrice: -300,
        minSpeedMbps: 100,
        needsRouter: false,
        region: 'Все регионы'
      }, mockInternet);
      assert.equal(res.currentMonthly, 0);
      assert.equal(res.isCurrentOptimal, true);
      assert.equal(res.savingsYear, 0);
    });
  });

  describe('analyzeSubscriptionDuplicates: Поиск дублей и избытка', () => {
    const mockSubs = [
      { id: 'yandex-plus', name: 'Яндекс Плюс', category: 'ecosystem', monthlyPrice: 399, includesServices: ['kinopoisk'] },
      { id: 'kinopoisk', name: 'Кинопоиск', category: 'cinema', monthlyPrice: 299, bundledInside: 'yandex-plus' },
      { id: 'ivi', name: 'Иви', category: 'cinema', monthlyPrice: 399 },
      { id: 'okko', name: 'Okko', category: 'cinema', monthlyPrice: 199 }
    ];

    it('Находит прямой дубликат сервиса, входящего в родительский пакет', () => {
      const selected = ['yandex-plus', 'kinopoisk'];
      const duplicates = analyzeSubscriptionDuplicates(selected, mockSubs);
      assert.equal(duplicates.length, 1);
      assert.equal(duplicates[0].duplicateId, 'kinopoisk');
      assert.equal(duplicates[0].monthlySavings, 299);
    });

    it('Предупреждает о нескольких кинотеатрах одновременно', () => {
      const selected = ['ivi', 'okko'];
      const duplicates = analyzeSubscriptionDuplicates(selected, mockSubs);
      assert.ok(duplicates.some(d => d.type === 'category_cinema_overlap'));
    });
  });

  describe('calculateSubscriptionsSummary & calculateGrandTotal', () => {
    it('Корректно суммирует экономию от неиспользуемых сервисов и годовых планов', () => {
      const mockSubs = [
        { id: 's1', name: 'Сервис 1', monthlyPrice: 200, annualPrice: 1800, category: 'other' },
        { id: 's2', name: 'Сервис 2 (не нужный)', monthlyPrice: 300, annualPrice: null, category: 'other' }
      ];

      const res = calculateSubscriptionsSummary({
        selectedIds: ['s1', 's2'],
        unusedIds: ['s2'],
        dbSubscriptions: mockSubs
      });

      // s2 не используется -> экономия 300 ₽/мес (3600 ₽/год)
      // s1 переход на год -> (200 * 12) - 1800 = 600 ₽/год
      // Итого в год: 3600 + 600 = 4200 ₽
      assert.equal(res.unusedMonthlySavings, 300);
      assert.equal(res.annualPlanSavingsYear, 600);
      assert.equal(res.totalAnnualSavings, 4200);
    });

    it('Не суммирует дважды экономию для подписки, которая одновременно не используется и дублирует экосистему, и клампит отрицательную цену', () => {
      const mockSubs = [
        { id: 'yandex-plus', name: 'Яндекс Плюс', category: 'ecosystem', monthlyPrice: 399, includesServices: ['kinopoisk'] },
        { id: 'kinopoisk', name: 'Кинопоиск', category: 'cinema', monthlyPrice: 299, bundledInside: 'yandex-plus' }
      ];
      const duplicates = analyzeSubscriptionDuplicates(['yandex-plus', 'kinopoisk'], mockSubs);
      const res = calculateSubscriptionsSummary({
        selectedIds: ['yandex-plus', 'kinopoisk'],
        unusedIds: ['kinopoisk'],
        customItems: [{ name: 'Своя', price: -500, unused: true }],
        duplicatesFound: duplicates,
        dbSubscriptions: mockSubs
      });

      assert.equal(res.unusedMonthlySavings, 299);
      assert.equal(res.duplicateMonthlySavings, 0);
      assert.equal(res.currentMonthlyTotal, 698);
      assert.equal(res.totalAnnualSavings, 299 * 12);
    });

    it('Сводит общий Grand Total по всем трём категориям', () => {
      const mobileResult = { currentMonthly: 600, savingsYear: 2400, isCurrentOptimal: false };
      const internetResult = { currentMonthly: 500, savingsYear: 1200, isCurrentOptimal: false };
      const subsResult = { currentMonthlyTotal: 500, totalAnnualSavings: 3600 };

      const grand = calculateGrandTotal({ mobileResult, internetResult, subsResult });
      assert.equal(grand.currentMonthlyGrand, 1600);
      assert.equal(grand.totalAnnualSavings, 7200); // 2400 + 1200 + 3600
      assert.equal(grand.totalMonthlySavings, 600); // 7200 / 12
      assert.equal(grand.optimizedMonthlyGrand, 1000); // 1600 - 600
      assert.equal(grand.hasAnySavings, true);
    });
  });
});
