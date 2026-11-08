/**
 * Единый самодостаточный бандл «Не переплачивай».
 * Включает встроенную базу данных, калькулятор TCO, проверку дубликатов,
 * мастер ввода (Wizard), экспорт в .ics, шаблоны заявлений и SPA-навигацию.
 * Работает без серверов: как локально (file://), так и на GitHub Pages.
 */

(function () {
  'use strict';

  // ==========================================
  // 1. ВСТРОЕННАЯ БАЗА ДАННЫХ (ОФФЛАЙН / СТАТИКА)
  // ==========================================
  const DEFAULT_DATA = {
    mobile: [
  {
    "id": "mks-optimal-lnr",
    "operator": "МКС",
    "tariffName": "Оптимальный",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 350,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 100,
    "includedGb": 25,
    "includedMinutes": 500,
    "includedSms": 50,
    "unlimitedApps": ["Telegram", "VK", "WhatsApp"],
    "officialUrl": "https://mks-gsm.ru/tariffs",
    "isPartner": false,
    "adErid": null,
    "notes": "Основной региональный оператор ЛНР (+7 959). Включает пакет минут на все номера РФ, безлимитные мессенджеры и стабильное покрытие по всей республике."
  },
  {
    "id": "mks-narodny-lnr",
    "operator": "МКС",
    "tariffName": "Народный (Эконом)",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 220,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 100,
    "includedGb": 8,
    "includedMinutes": 300,
    "includedSms": 0,
    "unlimitedApps": ["Telegram"],
    "officialUrl": "https://mks-gsm.ru/tariffs",
    "isPartner": false,
    "adErid": null,
    "notes": "Самый доступный тариф в ЛНР для повседневных звонков и чтения новостей в Telegram."
  },
  {
    "id": "mks-maximum-lnr",
    "operator": "МКС",
    "tariffName": "Максимум",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 500,
    "promoMonthlyPrice": 380,
    "promoDurationMonths": 2,
    "setupFee": 100,
    "includedGb": 50,
    "includedMinutes": 800,
    "includedSms": 100,
    "unlimitedApps": ["Telegram", "WhatsApp", "VK", "YouTube"],
    "officialUrl": "https://mks-gsm.ru/tariffs",
    "isPartner": false,
    "adErid": null,
    "notes": "Тариф для активных пользователей: 50 ГБ трафика, большой пакет минут по всей России и скидка в первые 2 месяца."
  },
  {
    "id": "7telecom-na-svyazi-lnr",
    "operator": "+7Телеком",
    "tariffName": "На связи",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 300,
    "promoMonthlyPrice": 200,
    "promoDurationMonths": 2,
    "setupFee": 100,
    "includedGb": 15,
    "includedMinutes": 400,
    "includedSms": 20,
    "unlimitedApps": ["Мессенджеры"],
    "officialUrl": "https://7telecom.ru/tariffs",
    "isPartner": false,
    "adErid": null,
    "notes": "Оператор связи в новых регионах РФ. Бесплатные вызовы внутри сетей +7Телеком и МирТелеком."
  },
  {
    "id": "7telecom-vyshe-kryshi-lnr",
    "operator": "+7Телеком",
    "tariffName": "Выше крыши",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 450,
    "promoMonthlyPrice": 320,
    "promoDurationMonths": 3,
    "setupFee": 100,
    "includedGb": 35,
    "includedMinutes": 600,
    "includedSms": 50,
    "unlimitedApps": ["Мессенджеры", "Социальные сети"],
    "officialUrl": "https://7telecom.ru/tariffs",
    "isPartner": false,
    "adErid": null,
    "notes": "Выгодная цена по акции на первые 3 месяца: 35 ГБ и 600 минут на номера РФ."
  },
  {
    "id": "beeline-lnr-up",
    "operator": "билайн",
    "tariffName": "План для новых регионов",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 450,
    "promoMonthlyPrice": 350,
    "promoDurationMonths": 3,
    "setupFee": 100,
    "includedGb": 30,
    "includedMinutes": 500,
    "includedSms": 50,
    "unlimitedApps": ["Telegram", "WhatsApp"],
    "officialUrl": "https://beeline.ru",
    "isPartner": false,
    "adErid": null,
    "notes": "Федеральный оператор с собственной зоной покрытия и прямым роумингом по РФ без доплат."
  },
  {
    "id": "tbank-mobile-lnr",
    "operator": "Т-Мобайл",
    "tariffName": "Конструктор (ЛНР)",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 420,
    "promoMonthlyPrice": 299,
    "promoDurationMonths": 2,
    "setupFee": 0,
    "includedGb": 25,
    "includedMinutes": 500,
    "includedSms": 0,
    "unlimitedApps": ["Мессенджеры"],
    "officialUrl": "https://www.tbank.ru/mobile-operator",
    "isPartner": true,
    "adErid": "2VtzquDEMOerid9871",
    "notes": "Быстрое подключение через eSIM без необходимости посещать салон связи, запись звонков и секретарь."
  },
  {
    "id": "mts-lnr-fit",
    "operator": "МТС",
    "tariffName": "МТС Больше (ЛНР)",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "monthlyPrice": 590,
    "promoMonthlyPrice": 450,
    "promoDurationMonths": 2,
    "setupFee": 100,
    "includedGb": 35,
    "includedMinutes": 600,
    "includedSms": 100,
    "unlimitedApps": ["VK", "Telegram"],
    "officialUrl": "https://mts.ru",
    "isPartner": false,
    "adErid": null,
    "notes": "Федеральный тариф с работой в ЛНР, остатки минут и гигабайтов переносятся на следующий месяц."
  }
],
    internet: [
  {
    "id": "luganet-start-100-lnr",
    "operator": "Луганет",
    "tariffName": "Старт 100",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 100,
    "monthlyPrice": 450,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 0,
    "routerRentMonthly": 100,
    "hasTv": false,
    "tvChannelsCount": 0,
    "officialUrl": "https://luganet.ru",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "При расторжении договора требуется вернуть арендованное оборудование без штрафов.",
    "notes": "Крупнейший интернет-провайдер ЛНР (Луганск, Алчевск, Краснодон, Свердловск, Стаханов, Ровеньки, Антрацит, Брянка, Красный Луч)."
  },
  {
    "id": "luganet-comfort-200-lnr",
    "operator": "Луганет",
    "tariffName": "Комфорт 200",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 200,
    "monthlyPrice": 550,
    "promoMonthlyPrice": 390,
    "promoDurationMonths": 3,
    "setupFee": 100,
    "routerRentMonthly": 100,
    "hasTv": true,
    "tvChannelsCount": 80,
    "officialUrl": "https://luganet.ru",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Без скрытых штрафов при соблюдении стандартных условий договора.",
    "notes": "Скоростной домашний интернет 200 Мбит/с со скидкой на первые 3 месяца и интерактивным ТВ."
  },
  {
    "id": "luganet-comfort-300-lnr",
    "operator": "Луганет",
    "tariffName": "Комфорт 300 (GPON)",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 300,
    "monthlyPrice": 650,
    "promoMonthlyPrice": 490,
    "promoDurationMonths": 2,
    "setupFee": 100,
    "routerRentMonthly": 120,
    "hasTv": true,
    "tvChannelsCount": 120,
    "officialUrl": "https://luganet.ru",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Без скрытых комиссий при возврате оборудования по акту.",
    "notes": "Высокоскоростной оптический интернет GPON для квартир и частного сектора с расширенным ТВ."
  },
  {
    "id": "ltk-home-100-lnr",
    "operator": "Луганские коммуникации (ЛТК)",
    "tariffName": "Домашний 100",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 100,
    "monthlyPrice": 400,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 0,
    "routerRentMonthly": 90,
    "hasTv": false,
    "tvChannelsCount": 0,
    "officialUrl": "https://ltk.su",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Стандартный договор на оказание услуг связи без обязательной минимальной отработки.",
    "notes": "Городская фиксированная связь и проводной интернет от республиканского оператора ЛТК."
  },
  {
    "id": "ltk-home-200-lnr",
    "operator": "Луганские коммуникации (ЛТК)",
    "tariffName": "Домашний 200",
    "region": "Все города ЛНР",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 200,
    "monthlyPrice": 520,
    "promoMonthlyPrice": 380,
    "promoDurationMonths": 3,
    "setupFee": 100,
    "routerRentMonthly": 90,
    "hasTv": false,
    "tvChannelsCount": 0,
    "officialUrl": "https://ltk.su",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Без штрафов за досрочное расторжение договора.",
    "notes": "Оптический интернет 200 Мбит/с со стабильной скоростью в часы пик."
  },
  {
    "id": "magistr-skynet-alchevsk",
    "operator": "Магистр-Телеком / Скайнет",
    "tariffName": "Городской 100",
    "region": "Алчевск",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 100,
    "monthlyPrice": 420,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 0,
    "routerRentMonthly": 80,
    "hasTv": true,
    "tvChannelsCount": 60,
    "officialUrl": "https://luganet.ru",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Без штрафов.",
    "notes": "Популярный локальный тариф в городах Алчевск, Стаханов, Брянка."
  },
  {
    "id": "sverdlovsk-optika-200",
    "operator": "Свердловск-Телеком",
    "tariffName": "Оптика 200",
    "region": "Свердловск",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 200,
    "monthlyPrice": 500,
    "promoMonthlyPrice": 350,
    "promoDurationMonths": 2,
    "setupFee": 0,
    "routerRentMonthly": 90,
    "hasTv": false,
    "tvChannelsCount": 0,
    "officialUrl": "https://ltk.su",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Возврат оборудования без дополнительных платежей.",
    "notes": "Локальная сеть в городах Свердловск (Должанск) и Ровеньки."
  },
  {
    "id": "severodonetsk-online-100",
    "operator": "Северодонецк Онлайн",
    "tariffName": "Восстановление 100",
    "region": "Северодонецк",
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "speedMbps": 100,
    "monthlyPrice": 450,
    "promoMonthlyPrice": null,
    "promoDurationMonths": 0,
    "setupFee": 0,
    "routerRentMonthly": 100,
    "hasTv": false,
    "tvChannelsCount": 0,
    "officialUrl": "https://luganet.ru",
    "isPartner": false,
    "adErid": null,
    "earlyTerminationFeeTerms": "Без штрафов.",
    "notes": "Подключение жителей Северодонецка, Лисичанска и Рубежного к оптоволоконной сети."
  }
],
    subscriptions: [
  {
    "id": "yandex-plus",
    "name": "Яндекс Плюс",
    "category": "ecosystem",
    "monthlyPrice": 399,
    "annualPrice": 2990,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "includesServices": ["kinopoisk", "yandex-music", "yandex-disk"],
    "cancelUrl": "https://plus.yandex.ru/my",
    "refundPolicyTip": "Если произошло неожиданное списание, обратитесь в чат службы поддержки Яндекс Плюс в течение 24–48 часов. Если контентом не пользовались, они оформляют возврат на карту [ПРОВЕРИТЬ: практика лояльности Яндекса по ст. 32 ЗоЗПП].",
    "officialUrl": "https://plus.yandex.ru",
    "notes": "Часто дублируется с отдельными подписками на Кинопоиск и Яндекс Музыку."
  },
  {
    "id": "kinopoisk",
    "name": "Кинопоиск (отдельно)",
    "category": "cinema",
    "monthlyPrice": 299,
    "annualPrice": null,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": "yandex-plus",
    "cancelUrl": "https://hd.kinopoisk.ru",
    "refundPolicyTip": "Кинопоиск входит в любой Яндекс Плюс. Если у вас уже есть Плюс, эта оплата — чистый дубликат!",
    "officialUrl": "https://hd.kinopoisk.ru",
    "notes": "Дубликат подписки Яндекс Плюс."
  },
  {
    "id": "yandex-music",
    "name": "Яндекс Музыка (отдельно)",
    "category": "music",
    "monthlyPrice": 299,
    "annualPrice": null,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": "yandex-plus",
    "cancelUrl": "https://music.yandex.ru",
    "refundPolicyTip": "Музыка входит в тариф Яндекс Плюс. Отдельная оплата не имеет смысла при активном Плюсе.",
    "officialUrl": "https://music.yandex.ru",
    "notes": "Дубликат подписки Яндекс Плюс."
  },
  {
    "id": "sber-prime",
    "name": "СберПрайм",
    "category": "ecosystem",
    "monthlyPrice": 199,
    "annualPrice": 1990,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "includesServices": ["okko", "sber-zvuk", "sber-apteka"],
    "cancelUrl": "https://sberprime.sber.ru",
    "refundPolicyTip": "Отключение автопродления в приложении СберБанк Онлайн (раздел Профиль -> Подписки) или на сайте sberprime.sber.ru.",
    "officialUrl": "https://sberprime.sber.ru",
    "notes": "Включает базовую подписку Okko и сервис Звук."
  },
  {
    "id": "okko",
    "name": "Okko (Оптимум / Лайт)",
    "category": "cinema",
    "monthlyPrice": 199,
    "annualPrice": 1990,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": "sber-prime",
    "cancelUrl": "https://okko.tv/settings",
    "refundPolicyTip": "Проверьте, нет ли у вас активного СберПрайма — в него просмотр фильмов в Okko уже включен.",
    "officialUrl": "https://okko.tv",
    "notes": "Онлайн-кинотеатр экосистемы Сбера."
  },
  {
    "id": "ivi",
    "name": "Иви",
    "category": "cinema",
    "monthlyPrice": 399,
    "annualPrice": 2990,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://www.ivi.ru/profile/subscription",
    "refundPolicyTip": "В личном кабинете Иви можно отключить продление. При неожиданном списании пишите в поддержку (support@ivi.ru) до начала просмотра фильмов в новом периоде.",
    "officialUrl": "https://www.ivi.ru",
    "notes": "Популярный онлайн-кинотеатр. Рекомендуется чередовать с другими кинотеатрами, а не платить за 2–3 одновременно."
  },
  {
    "id": "premier",
    "name": "PREMIER",
    "category": "cinema",
    "monthlyPrice": 299,
    "annualPrice": null,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://premier.one/me/subscriptions",
    "refundPolicyTip": "Управление подпиской в разделе профиля. Возврат при случайном списании рассматривается поддержкой при отсутствии активности.",
    "officialUrl": "https://premier.one",
    "notes": "Онлайн-кинотеатр с российскими сериалами."
  },
  {
    "id": "vk-music",
    "name": "VK Музыка",
    "category": "music",
    "monthlyPrice": 169,
    "annualPrice": null,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://vk.com/settings?act=payments",
    "refundPolicyTip": "Отключается в разделе 'Платежи и подписки' ВКонтакте или через настройки Apple ID / Google Play, если оформлялась в приложении.",
    "officialUrl": "https://music.vk.com",
    "notes": "Музыкальный стриминг ВКонтакте."
  },
  {
    "id": "telegram-premium",
    "name": "Telegram Premium",
    "category": "other",
    "monthlyPrice": 299,
    "annualPrice": 1990,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://t.me/PremiumBot",
    "refundPolicyTip": "Через @PremiumBot оформляется и отменяется дешевле, чем через App Store / Google Play (где комиссия повышает цену).",
    "officialUrl": "https://telegram.org",
    "notes": "Экономия при оплате за год или через бота @PremiumBot."
  },
  {
    "id": "yandex-disk",
    "name": "Яндекс 360 / Диск",
    "category": "cloud",
    "monthlyPrice": 199,
    "annualPrice": 1490,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://mail360.yandex.ru",
    "refundPolicyTip": "Управление тарифом в настройках Яндекс 360.",
    "officialUrl": "https://360.yandex.ru",
    "notes": "Облачное хранилище для фото и файлов."
  },
  {
    "id": "ozon-premium",
    "name": "Ozon Premium",
    "category": "delivery",
    "monthlyPrice": 199,
    "annualPrice": null,
    "isDemo": true,
    "updatedAt": "2026-11-01",
    "bundledInside": null,
    "cancelUrl": "https://www.ozon.ru/my/premium",
    "refundPolicyTip": "Отключение в личном кабинете Ozon во вкладке Premium.",
    "officialUrl": "https://www.ozon.ru",
    "notes": "Кэшбэк и бесплатная курьерская доставка."
  }
]
,
    insurance: [
  {
    "id": "osago",
    "name": "ОСАГО (Обязательное автострахование)",
    "description": "Базовый тариф регулируется Банком России, но страховые компании вправе выбирать базовую ставку внутри тарифного коридора. Разница в цене между компаниями достигает 20–30% при абсолютно одинаковом покрытии.",
    "questions": [
      "Проверяли ли вы свой КБМ (коэффициент бонус-малус) перед продлением полиса?",
      "Сравнивали ли предложения минимум в 3–4 страховых компаниях?",
      "Включали ли в полис водителей с маленьким стажем или авариями (это сразу резко повышает цену)?"
    ],
    "whatToWatch": [
      "КБМ (безаварийный стаж): обновляется ежегодно 1 апреля. Если вы меняли права или фамилию, скидка могла 'слететь' до базовой (1.0). Проверьте бесплатно на сайте РСА.",
      "Навязывание допов: страховые агенты иногда пытаются включить страховку жизни или помощь на дорогах. По ст. 15.34.1 КоАП РФ навязывание запрещено [ПРОВЕРИТЬ].",
      "'Период охлаждения': по указанию ЦБ РФ у вас есть не менее 14 календарных дней на отказ от добровольных навязанных страховок с полным возвратом денег [ПРОВЕРИТЬ: Указание Банка России о периоде охлаждения]."
    ],
    "officialTools": [
      {
        "name": "Официальная бесплатная проверка КБМ на портале РСА",
        "url": "https://autoins.ru"
      },
      {
        "name": "Реестр субъектов страхового дела на сайте Банка России",
        "url": "https://cbr.ru/insurance"
      }
    ]
  },
  {
    "id": "kasko",
    "name": "КАСКО (Добровольное автострахование)",
    "description": "Добровольная защита от угона и ущерба. Стоимость не регулируется государством и сильно варьируется.",
    "questions": [
      "Готовы ли вы оплачивать мелкий ремонт сами (царапины до 15 000 ₽)?",
      "Нужен ли полис с ограничением пробега (если ездите мало)?",
      "Установлена ли телематика или противоугонная система?"
    ],
    "whatToWatch": [
      "Франшиза со второго случая или безусловная франшиза (15–30 тыс. ₽) снижает цену полиса на 30–50%.",
      "Программа 'Тотал + Угон' (только критические риски) стоит в 2–3 раза дешевле полного КАСКО.",
      "Ремонт у неофициального дилера для негарантийных машин экономит до 40% стоимости полиса."
    ],
    "officialTools": [
      {
        "name": "Памятка потребителя страховых услуг Банка России",
        "url": "https://fincult.info/article/kasko-chto-nuzhno-znat-o-dobrovolnom-avtostrakhovanii"
      }
    ]
  },
  {
    "id": "mortgage",
    "name": "Ипотечное страхование (Жизнь, имущество, титул)",
    "description": "Банки часто предлагают свою 'партнёрскую' страховку при выдаче ипотеки, цена которой в 1.5–2.5 раза выше рынка.",
    "questions": [
      "Оформляете ли вы страховку напрямую в аккредитованной страховой или соглашаетесь на предложение банка?",
      "Учитывается ли снижающийся остаток основного долга при расчёте суммы на следующий год?"
    ],
    "whatToWatch": [
      "По закону об ипотеке и антимонопольным правилам вы имеете право купить полис в ЛЮБОЙ страховой компании, аккредитованной банком, и банк обязан его принять без повышения ставки [ПРОВЕРИТЬ: Постановление Правительства РФ № 39 об общих исключениях в отношении соглашений между кредитными и страховыми организациями].",
      "Сумма страховки должна уменьшаться каждый год пропорционально остатку долга перед банком."
    ],
    "officialTools": [
      {
        "name": "Разъяснения ФАС России по страхованию при ипотеке",
        "url": "https://fas.gov.ru"
      }
    ]
  }
]

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
        if (resMob) dbMobile = resMob;
        if (resNet) dbInternet = resNet;
        if (resSub) dbSubscriptions = resSub;
        if (resIns) dbInsurance = resIns;
      } catch (err) {
        // При ошибке сети продолжаем использовать встроенную базу данных
        console.warn('Фоновое обновление данных не удалось, используется встроенная база:', err);
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

  function exportDataAsJson(data) {
    const exportPayload = {
      appName: 'Не переплачивай',
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
    a.download = 'ne-pereplachivay-data-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importDataFromJson(file) {
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
      issues.push({
        type: 'category_music_overlap',
        severity: 'medium',
        duplicateId: null,
        duplicateName: 'Несколько музыкальных сервисов',
        monthlySavings: 169,
        message: 'У вас одновременно оплачивается музыка в ' + names + '. Музыкальные каталоги практически идентичны — достаточно оставить один сервис.'
      });
    }

    return issues;
  }

  // ==========================================
  // 4. КАЛЬКУЛЯТОР ТАРИФОВ И TCO ЗА 12 МЕСЯЦЕВ
  // ==========================================
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
    const currentMonthly = Number(user.currentPrice) || 0;
    const currentAnnualTCO = currentMonthly * 12;
    const userGb = Number(user.gb) || 0;
    const userMin = Number(user.minutes) || 0;
    const userSms = Number(user.sms) || 0;
    const userCity = user.region || 'Все города ЛНР';

    const matchingTariffs = tariffs.filter(t => {
      const regionMatch = t.region === userCity || 
                          t.region === 'Все города ЛНР' || 
                          userCity === 'Все города ЛНР' ||
                          t.region === 'Луганская Народная Республика (ЛНР)' ||
                          userCity === 'Луганская Народная Республика (ЛНР)';
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

    const scored = matchingTariffs.map(t => {
      const tco = calculateTariffTCO12(t);
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
      reason: 'Ваш текущий тариф уже выгоднее или равен лучшим предложениям на рынке!'
    };
  }

  function findBestInternetTariff(user, tariffs = []) {
    const currentMonthly = Number(user.currentPrice) || 0;
    const currentAnnualTCO = currentMonthly * 12;
    const userSpeed = Number(user.minSpeedMbps) || 100;
    const userCity = user.region || 'Все города ЛНР';
    const needsRouter = Boolean(user.needsRouter);

    const matchingTariffs = tariffs.filter(t => {
      const regionMatch = t.region === userCity || 
                          t.region === 'Все города ЛНР' || 
                          userCity === 'Все города ЛНР' ||
                          t.region === 'Луганская Народная Республика (ЛНР)' ||
                          userCity === 'Луганская Народная Республика (ЛНР)';
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
    const duplicateIdSet = new Set(duplicatesFound.map(d => d.duplicateId));

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
      const price = Number(item.price) || 0;
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
  // 5. ЭКСПОРТ НАПОМИНАНИЙ В КАЛЕНДАРЬ (.ICS)
  // ==========================================
  function formatIcsDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return '' + year + month + day + 'T' + hours + minutes + seconds + 'Z';
  }

  function exportEventsToIcs(events = [], filename = 'ne-pereplachivay-reminders.ics') {
    if (events.length === 0) {
      alert('Нет активных напоминаний для экспорта в календарь.');
      return;
    }

    const nowStr = formatIcsDate(new Date());

    const vEvents = events.map((ev, idx) => {
      const startStr = formatIcsDate(ev.date);
      const endDate = new Date(ev.date.getTime() + (ev.durationHours || 1) * 60 * 60 * 1000);
      const endStr = formatIcsDate(endDate);
      const uid = 'reminder-' + Date.now() + '-' + idx + '@nepereplachivay.ru';

      const cleanTitle = (ev.title || 'Напоминание').replace(/,/g, '\\,').replace(/;/g, '\\;');
      const cleanDesc = (ev.description || '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

      return [
        'BEGIN:VEVENT',
        'UID:' + uid,
        'DTSTAMP:' + nowStr,
        'DTSTART:' + startStr,
        'DTEND:' + endStr,
        'SUMMARY:' + cleanTitle,
        'DESCRIPTION:' + cleanDesc,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Напоминание: ' + cleanTitle,
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ne Pereplachivay//Ru//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      vEvents,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // 6. СКРИПТЫ ТОРГА И ПОШАГОВЫЕ ИНСТРУКЦИИ
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
          minutes: 400,
          sms: 0
        },
        internet: {
          skipped: false,
          operator: 'Луганет',
          region: 'Луганск',
          currentPrice: 650,
          minSpeedMbps: 200,
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

  function updateThemeIcon(theme) {
    const iconSpan = document.getElementById('theme-icon');
    if (iconSpan) {
      iconSpan.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  function renderSubscriptionsGrid(selectedIds = [], unusedIds = [], customItems = []) {
    const container = document.getElementById('subscriptions-list');
    if (!container) return;

    container.innerHTML = '';
    const selSet = new Set(selectedIds);
    const unSet = new Set(unusedIds);

    dbSubscriptions.forEach(sub => {
      const isChecked = selSet.has(sub.id);
      const isUnused = unSet.has(sub.id);

      const card = document.createElement('div');
      card.className = 'sub-item-card ' + (isChecked ? 'active' : '');
      card.id = 'sub-card-' + sub.id;

      card.innerHTML = [
        '<div class="sub-header-row">',
        '  <label class="custom-checkbox-label">',
        '    <input type="checkbox" class="sub-check" data-id="' + sub.id + '" ' + (isChecked ? 'checked' : '') + '>',
        '    <span class="sub-name">' + sub.name + '</span>',
        '  </label>',
        '  <span class="sub-price-badge">' + sub.monthlyPrice + ' ₽/мес</span>',
        '</div>',
        '<div class="sub-footer-row ' + (isChecked ? '' : 'hidden') + '" id="sub-unused-row-' + sub.id + '">',
        '  <label class="unused-label">',
        '    <input type="checkbox" class="sub-unused-check" data-id="' + sub.id + '" ' + (isUnused ? 'checked' : '') + '>',
        '    <span>Не пользуюсь / забыл(а) отменить</span>',
        '  </label>',
        '</div>'
      ].join('');

      container.appendChild(card);
    });

    renderCustomSubscriptionsList(customItems);
  }

  function renderCustomSubscriptionsList(customItems = []) {
    const customListEl = document.getElementById('custom-subs-container');
    if (!customListEl) return;
    customListEl.innerHTML = '';

    customItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'custom-sub-pill';
      el.innerHTML = [
        '<span>' + item.name + ': <strong>' + item.price + ' ₽/мес</strong> ' + (item.unused ? '(не пользуюсь)' : '') + '</span>',
        '<button type="button" class="btn-remove-custom" data-idx="' + idx + '" title="Удалить">✕</button>'
      ].join('');
      customListEl.appendChild(el);
    });
  }

  function renderInsuranceSelector(selectedTypes = []) {
    const container = document.getElementById('insurance-selector-container');
    if (!container) return;
    container.innerHTML = '';

    const selSet = new Set(selectedTypes);

    dbInsurance.forEach(ins => {
      const isChecked = selSet.has(ins.id);
      const card = document.createElement('div');
      card.className = 'insurance-item-card ' + (isChecked ? 'selected' : '');
      card.innerHTML = [
        '<label class="custom-checkbox-label">',
        '  <input type="checkbox" class="ins-check" data-id="' + ins.id + '" ' + (isChecked ? 'checked' : '') + '>',
        '  <div>',
        '    <strong>' + ins.name + '</strong>',
        '    <p class="ins-desc">' + ins.description + '</p>',
        '  </div>',
        '</label>'
      ].join('');
      container.appendChild(card);
    });
  }

  function readCurrentStepInputs(step) {
    if (step === 1) {
      return {
        operator: document.getElementById('mob-operator')?.value || 'МКС',
        region: document.getElementById('mob-region')?.value || 'Луганск',
        currentPrice: Number(document.getElementById('mob-price')?.value) || 0,
        gb: Number(document.getElementById('mob-gb')?.value) || 0,
        minutes: Number(document.getElementById('mob-min')?.value) || 0,
        sms: Number(document.getElementById('mob-sms')?.value) || 0
      };
    } else if (step === 2) {
      return {
        operator: document.getElementById('net-operator')?.value || 'Луганет',
        region: document.getElementById('net-region')?.value || 'Луганск',
        currentPrice: Number(document.getElementById('net-price')?.value) || 0,
        minSpeedMbps: Number(document.getElementById('net-speed')?.value) || 100,
        needsRouter: Boolean(document.getElementById('net-router-rent')?.checked)
      };
    } else if (step === 3) {
      const selectedIds = Array.from(document.querySelectorAll('.sub-check:checked')).map(el => el.dataset.id);
      const unusedIds = Array.from(document.querySelectorAll('.sub-unused-check:checked')).map(el => el.dataset.id);
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

  function syncInputsWithState(state) {
    if (document.getElementById('mob-operator')) document.getElementById('mob-operator').value = state.mobile.operator;
    if (document.getElementById('mob-region')) document.getElementById('mob-region').value = state.mobile.region;
    if (document.getElementById('mob-price')) document.getElementById('mob-price').value = state.mobile.currentPrice;
    if (document.getElementById('mob-gb')) {
      document.getElementById('mob-gb').value = state.mobile.gb;
      document.getElementById('mob-gb-val').textContent = state.mobile.gb;
    }
    if (document.getElementById('mob-min')) {
      document.getElementById('mob-min').value = state.mobile.minutes;
      document.getElementById('mob-min-val').textContent = state.mobile.minutes;
    }
    if (document.getElementById('mob-sms')) {
      document.getElementById('mob-sms').value = state.mobile.sms;
      document.getElementById('mob-sms-val').textContent = state.mobile.sms;
    }

    if (document.getElementById('net-operator')) document.getElementById('net-operator').value = state.internet.operator;
    if (document.getElementById('net-region')) document.getElementById('net-region').value = state.internet.region;
    if (document.getElementById('net-price')) document.getElementById('net-price').value = state.internet.currentPrice;
    if (document.getElementById('net-speed')) document.getElementById('net-speed').value = state.internet.minSpeedMbps;
    if (document.getElementById('net-router-rent')) document.getElementById('net-router-rent').checked = state.internet.needsRouter;

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!state.internet.skipped && state.internet.currentPrice > 0) {
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

    const grandTotal = calculateGrandTotal({ mobileResult, internetResult, subsResult });

    document.getElementById('grand-current-month').textContent = grandTotal.currentMonthlyGrand + ' ₽';
    document.getElementById('grand-target-month').textContent = grandTotal.optimizedMonthlyGrand + ' ₽';
    document.getElementById('grand-savings-year').textContent = grandTotal.totalAnnualSavings.toLocaleString('ru-RU') + ' ₽';

    const bannerNote = document.getElementById('grand-banner-note');
    if (grandTotal.hasAnySavings) {
      bannerNote.innerHTML = 'Вы можете сохранить до <strong>' + grandTotal.totalMonthlySavings.toLocaleString('ru-RU') + ' ₽ в месяц</strong> без потери качества связи и контента!';
    } else {
      bannerNote.innerHTML = '🎉 <strong>Поздравляем!</strong> Ваши текущие тарифы уже одни из самых выгодных на рынке. Ниже — подсказки, как не переплатить при их продлении.';
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
    if (!state.insurance.skipped && state.insurance.selectedTypes && state.insurance.selectedTypes.length > 0) {
      insCardContainer.classList.remove('hidden');
      renderInsuranceReportCard(insCardContainer, state.insurance.selectedTypes);
    } else {
      insCardContainer.classList.add('hidden');
    }

    setupIcsExportButton(mobileResult, internetResult, subsResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderMobileReportCard(container, result, userMob) {
    const { isCurrentOptimal, bestTariff, savingsYear, savingsMonth, effectiveMonthly, currentMonthly } = result;

    let bodyHtml = '';
    if (isCurrentOptimal) {
      bodyHtml = [
        '<div class="optimal-badge">👍 Ваш тариф оптимален</div>',
        '<p class="card-desc">Вы платите <strong>' + currentMonthly + ' ₽/мес</strong>. Достойных альтернатив с таким пакетом минут и гигабайт дешевле мы не нашли.</p>',
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="mobile">Скрипт звонка оператору для скидки 30%</button>',
        '</div>'
      ].join('');
    } else {
      const isPartner = bestTariff.isPartner;
      const eridHtml = isPartner ? '<span class="ad-label" title="Реклама. Токен erid: ' + bestTariff.adErid + '">Реклама erid: ' + bestTariff.adErid + '</span>' : '';
      const promoNote = bestTariff.promoDurationMonths > 0 
        ? '<span class="promo-pill">Акция: ' + bestTariff.promoMonthlyPrice + ' ₽ первые ' + bestTariff.promoDurationMonths + ' мес., затем ' + bestTariff.monthlyPrice + ' ₽</span>'
        : '';

      bodyHtml = [
        '<div class="savings-highlight">Экономия: <strong>' + savingsYear.toLocaleString('ru-RU') + ' ₽ в год</strong> (~' + savingsMonth + ' ₽/мес)</div>',
        '<div class="comparison-grid">',
        '  <div class="comp-col current">',
        '    <div class="comp-label">Сейчас у вас (' + userMob.operator + ')</div>',
        '    <div class="comp-price">' + currentMonthly + ' ₽/мес</div>',
        '    <ul class="comp-list">',
        '      <li>' + userMob.gb + ' ГБ интернета</li>',
        '      <li>' + userMob.minutes + ' минут звонков</li>',
        '    </ul>',
        '  </div>',
        '  <div class="comp-col target">',
        '    <div class="comp-label">Выгодная альтернатива: <strong>' + bestTariff.operator + '</strong></div>',
        '    <div class="comp-tariff-name">' + bestTariff.tariffName + ' ' + eridHtml + '</div>',
        '    <div class="comp-price">' + effectiveMonthly + ' ₽/мес <small class="effective-hint">(средняя за 12 мес. с учётом подключения)</small></div>',
        '    ' + promoNote,
        '    <ul class="comp-list">',
        '      <li>' + bestTariff.includedGb + ' ГБ</li>',
        '      <li>' + bestTariff.includedMinutes + ' мин</li>',
        '      <li>Плата за переход (MNP): ' + bestTariff.setupFee + ' ₽</li>',
        '    </ul>',
        '    <a href="' + bestTariff.officialUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Перейти на сайт ' + bestTariff.operator + ' ↗</a>',
        '  </div>',
        '</div>',
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-primary btn-guide" data-guide="mobileMNP">Пошаговая инструкция MNP (смена оператора)</button>',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="mobile">Скрипт торга: «Хочу уйти, дайте скидку»</button>',
        '</div>'
      ].join('');
    }

    container.querySelector('.card-content').innerHTML = bodyHtml;
  }

  function renderInternetReportCard(container, result, userNet) {
    const { isCurrentOptimal, bestTariff, savingsYear, savingsMonth, effectiveMonthly, currentMonthly } = result;

    let bodyHtml = '';
    if (isCurrentOptimal) {
      bodyHtml = [
        '<div class="optimal-badge">👍 Ваш тариф интернета оптимален</div>',
        '<p class="card-desc">Вы платите <strong>' + currentMonthly + ' ₽/мес</strong>. В вашем регионе это отличная рыночная ставка.</p>',
        '<div class="action-buttons-row">',
        '  <button type="button" class="btn btn-secondary btn-retention" data-type="internet">Скрипт диалога с провайдером для скидки</button>',
        '</div>'
      ].join('');
    } else {
      const isPartner = bestTariff.isPartner;
      const eridHtml = isPartner ? '<span class="ad-label">Реклама erid: ' + bestTariff.adErid + '</span>' : '';
      const routerText = userNet.needsRouter ? 'Включает аренду роутера (' + bestTariff.routerRentMonthly + ' ₽/мес)' : 'Со своим роутером';

      bodyHtml = [
        '<div class="savings-highlight">Экономия: <strong>' + savingsYear.toLocaleString('ru-RU') + ' ₽ в год</strong> (~' + savingsMonth + ' ₽/мес)</div>',
        '<div class="comparison-grid">',
        '  <div class="comp-col current">',
        '    <div class="comp-label">Сейчас (' + userNet.operator + ')</div>',
        '    <div class="comp-price">' + currentMonthly + ' ₽/мес</div>',
        '    <ul class="comp-list">',
        '      <li>Скорость: от ' + userNet.minSpeedMbps + ' Мбит/с</li>',
        '    </ul>',
        '  </div>',
        '  <div class="comp-col target">',
        '    <div class="comp-label">Альтернатива: <strong>' + bestTariff.operator + '</strong></div>',
        '    <div class="comp-tariff-name">' + bestTariff.tariffName + ' ' + eridHtml + '</div>',
        '    <div class="comp-price">' + effectiveMonthly + ' ₽/мес <small class="effective-hint">(с учётом акций за 12 мес)</small></div>',
        '    <ul class="comp-list">',
        '      <li>Скорость: ' + bestTariff.speedMbps + ' Мбит/с</li>',
        '      <li>' + routerText + '</li>',
        '      <li>Плата за подключение: ' + bestTariff.setupFee + ' ₽</li>',
        '    </ul>',
        '    <a href="' + bestTariff.officialUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Сайт провайдера ↗</a>',
        '  </div>',
        '</div>',
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
        '  <h4>🚨 Обнаружены дубликаты и лишние подписки:</h4>',
        '  <ul class="duplicates-list">',
        duplicates.map(d => '<li><strong>' + (d.duplicateName || 'Пересечение') + ':</strong> ' + d.message + (d.monthlySavings ? ' <span class="saving-tag">+' + d.monthlySavings + ' ₽/мес</span>' : '') + '</li>').join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }

    const unusedItems = subsResult.activeItems.filter(i => i.isUnused);
    let unusedHtml = '';
    if (unusedItems.length > 0) {
      unusedHtml = [
        '<div class="unused-subs-box">',
        '  <h4>🗑️ Подписки, которыми вы не пользуетесь (отменить прямо сейчас):</h4>',
        '  <ul class="subs-action-list">',
        unusedItems.map(item => '<li><span>' + item.name + ' (' + item.monthlyPrice + ' ₽/мес)</span>' + (item.cancelUrl ? ' <a href="' + item.cancelUrl + '" target="_blank" rel="noopener noreferrer" class="btn-cancel-link">Отключить ↗</a>' : '') + '</li>').join(''),
        '  </ul>',
        '</div>'
      ].join('');
    }

    let annualHtml = '';
    if (subsResult.annualPlanRecommendations.length > 0) {
      annualHtml = [
        '<div class="annual-subs-box">',
        '  <h4>💡 Выгода при переходе на годовую оплату (для сервисов, которыми точно пользуетесь):</h4>',
        '  <ul>',
        subsResult.annualPlanRecommendations.map(rec => '<li>«' + rec.name + '» — экономия <strong>' + rec.diffYear + ' ₽ в год</strong> при переходе на ежегодную оплату (выходит ' + rec.monthlyEquivalent + ' ₽/мес).</li>').join(''),
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
      '  <h4>' + guide.name + '</h4>',
      '  <p class="ins-desc">' + guide.description + '</p>',
      '  <div class="ins-checklist">',
      '    <strong>На что обратить внимание:</strong>',
      '    <ul>',
      guide.whatToWatch.map(w => '<li>' + w + '</li>').join(''),
      '    </ul>',
      '  </div>',
      '  <div class="ins-tools">',
      '    <strong>Официальные бесплатные калькуляторы и реестры:</strong>',
      '    <div class="tools-pills">',
      guide.officialTools.map(t => '<a href="' + t.url + '" target="_blank" rel="noopener noreferrer" class="tool-pill">' + t.name + ' ↗</a>').join(''),
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')).join('');

    container.querySelector('.card-content').innerHTML = itemsHtml;
  }

  function setupIcsExportButton(mobileResult, internetResult, subsResult) {
    const exportBtn = document.getElementById('btn-export-ics');
    if (!exportBtn) return;

    exportBtn.onclick = () => {
      const events = [];

      if (mobileResult && !mobileResult.isCurrentOptimal && mobileResult.bestTariff && mobileResult.bestTariff.promoDurationMonths > 0) {
        const promoMonths = mobileResult.bestTariff.promoDurationMonths;
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + promoMonths);
        targetDate.setDate(targetDate.getDate() - 3);

        events.push({
          title: 'Проверить тариф связи (' + mobileResult.bestTariff.operator + ')',
          description: 'Заканчивается промо-период тарифа «' + mobileResult.bestTariff.tariffName + '». Проверьте списание абонентской платы или запросите скидку в чате поддержки!',
          date: targetDate
        });
      }

      if (internetResult && !internetResult.isCurrentOptimal && internetResult.bestTariff && internetResult.bestTariff.promoDurationMonths > 0) {
        const promoMonths = internetResult.bestTariff.promoDurationMonths;
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + promoMonths);
        targetDate.setDate(targetDate.getDate() - 3);

        events.push({
          title: 'Проверить интернет-тариф (' + internetResult.bestTariff.operator + ')',
          description: 'Истекает промо-цена на домашний интернет. Проверьте условия продления.',
          date: targetDate
        });
      }

      const checkSubsDate = new Date();
      checkSubsDate.setDate(checkSubsDate.getDate() + 25);
      events.push({
        title: 'Ревизия подписок (Не переплачивай)',
        description: 'Проверьте активные подписки на смартфоне и в онлайн-банках, чтобы не списались деньги за неиспользуемые сервисы.',
        date: checkSubsDate
      });

      exportEventsToIcs(events, 'ne-pereplachivay-reminders.ics');
    };
  }

  // ==========================================
  // 9. МОДАЛЬНЫЕ ОКНА
  // ==========================================
  function showModal(title, bodyHtml) {
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('info-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  // ==========================================
  // 10. SPA-НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ
  // ==========================================
  function switchTab(tabId) {
    const calcView = document.getElementById('calculator-view');
    const howCalcView = document.getElementById('view-how-we-calculate');
    const howEarnView = document.getElementById('view-how-we-earn');
    const privacyView = document.getElementById('view-privacy');

    const views = {
      calculator: calcView,
      'how-we-calculate': howCalcView,
      'how-we-earn': howEarnView,
      privacy: privacyView
    };

    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('hidden', key !== tabId);
      }
    });

    document.querySelectorAll('.header-nav .nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // 11. СЛУШАТЕЛИ СОБЫТИЙ
  // ==========================================
  function setupEventListeners() {
    // Навигация мастера (Вперёд, Назад, Пропустить)
    document.querySelectorAll('.btn-wizard-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const inputs = readCurrentStepInputs(wizard.currentStep);
        const stepCats = { 1: 'mobile', 2: 'internet', 3: 'subscriptions', 4: 'insurance' };
        wizard.updateCategoryState(stepCats[wizard.currentStep], inputs);
        wizard.next();
      });
    });

    document.querySelectorAll('.btn-wizard-prev').forEach(btn => {
      btn.addEventListener('click', () => wizard.prev());
    });

    document.querySelectorAll('.btn-wizard-skip').forEach(btn => {
      btn.addEventListener('click', () => wizard.skipCurrentCategory());
    });

    // Слайдеры
    const setupSlider = (sliderId, valueSpanId) => {
      const slider = document.getElementById(sliderId);
      const valueSpan = document.getElementById(valueSpanId);
      if (slider && valueSpan) {
        slider.addEventListener('input', (e) => {
          valueSpan.textContent = e.target.value;
        });
      }
    };
    setupSlider('mob-gb', 'mob-gb-val');
    setupSlider('mob-min', 'mob-min-val');
    setupSlider('mob-sms', 'mob-sms-val');

    // Пользовательские подписки
    const addCustomBtn = document.getElementById('btn-add-custom-sub');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('custom-sub-name');
        const priceInput = document.getElementById('custom-sub-price');
        const unusedInput = document.getElementById('custom-sub-unused');

        const name = nameInput.value.trim();
        const price = Number(priceInput.value) || 0;
        const unused = Boolean(unusedInput.checked);

        if (!name) {
          alert('Введите название подписки');
          return;
        }

        wizard.state.subscriptions.customItems.push({ name, price, unused });
        nameInput.value = '';
        priceInput.value = '';
        unusedInput.checked = false;

        renderCustomSubscriptionsList(wizard.state.subscriptions.customItems);
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-remove-custom')) {
        const idx = Number(e.target.dataset.idx);
        wizard.state.subscriptions.customItems.splice(idx, 1);
        renderCustomSubscriptionsList(wizard.state.subscriptions.customItems);
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('.sub-check')) {
        const card = document.getElementById('sub-card-' + e.target.dataset.id);
        const unusedRow = document.getElementById('sub-unused-row-' + e.target.dataset.id);
        if (card) card.classList.toggle('active', e.target.checked);
        if (unusedRow) unusedRow.classList.toggle('hidden', !e.target.checked);
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
            '<p>' + scriptData.description + '</p>',
            '<div class="steps-box">',
            scriptData.steps.map(s => '<p class="step-line">' + s + '</p>').join(''),
            '</div>',
            '<h4>Шаблон текста обращения:</h4>',
            '<div class="code-copy-box">',
            '  <textarea id="copy-text-area" readonly class="copy-textarea">' + scriptData.template + '</textarea>',
            '  <button type="button" class="btn btn-sm btn-primary" id="btn-copy-template">Скопировать текст в буфер</button>',
            '</div>'
          ].join('');
          showModal(scriptData.title, body);

          document.getElementById('btn-copy-template').onclick = () => {
            const ta = document.getElementById('copy-text-area');
            ta.select();
            navigator.clipboard.writeText(ta.value).then(() => {
              alert('Текст обращения скопирован в буфер обмена!');
            });
          };
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
            '<div class="legal-badge">Правовое основание: ' + guide.legalBasis + '</div>',
            '<div class="guide-steps-list">',
            guide.steps.map(s => [
              '<div class="guide-step-card">',
              '  <div class="step-num">' + s.number + '</div>',
              '  <div class="step-content">',
              '    <h5>' + s.title + '</h5>',
              '    <p>' + s.details + '</p>',
              '  </div>',
              '</div>'
            ].join('')).join(''),
            '</div>'
          ].join('');

          if (guide.refundClaimTemplate) {
            contentHtml += [
              '<h4>Шаблон претензии на возврат денежных средств:</h4>',
              '<div class="code-copy-box">',
              '  <textarea id="copy-claim-area" readonly class="copy-textarea">' + guide.refundClaimTemplate + '</textarea>',
              '  <button type="button" class="btn btn-sm btn-primary" id="btn-copy-claim">Скопировать шаблон претензии</button>',
              '</div>'
            ].join('');
          }

          showModal(guide.title, contentHtml);

          const copyClaimBtn = document.getElementById('btn-copy-claim');
          if (copyClaimBtn) {
            copyClaimBtn.onclick = () => {
              const ta = document.getElementById('copy-claim-area');
              ta.select();
              navigator.clipboard.writeText(ta.value).then(() => {
                alert('Претензия скопирована в буфер обмена!');
              });
            };
          }
        }
      }
    });

    // Закрытие модального окна
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('info-modal');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Кнопки отчёта
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (confirm('Начать заново? Введённые данные останутся сохранены в браузере.')) {
          wizard.goToStep(1);
        }
      });
    }

    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    const btnExportJson = document.getElementById('btn-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        exportDataAsJson(wizard.state);
      });
    }

    const btnImportJson = document.getElementById('btn-import-json');
    const fileInput = document.getElementById('import-file-input');
    if (btnImportJson && fileInput) {
      btnImportJson.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const imported = await importDataFromJson(file);
          wizard.loadState(imported);
          syncInputsWithState(wizard.state);
          alert('Данные успешно загружены!');
          wizard.goToStep(1);
        } catch (err) {
          alert('Ошибка при импорте: ' + err.message);
        }
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

    // SPA вкладки (Калькулятор, Как мы считаем, Как мы зарабатываем, Конфиденциальность)
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
      if (['calculator', 'how-we-calculate', 'how-we-earn', 'privacy'].includes(hash)) {
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
    }

    // Обработка начального хэша в URL
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['how-we-calculate', 'how-we-earn', 'privacy'].includes(initialHash)) {
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
