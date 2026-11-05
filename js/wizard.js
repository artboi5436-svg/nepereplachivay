/**
 * Логика управления пошаговым мастером (Wizard).
 */

export class WizardController {
  constructor({ totalSteps = 4, onStepChange, onFinish }) {
    this.currentStep = 1;
    this.totalSteps = totalSteps;
    this.onStepChange = onStepChange;
    this.onFinish = onFinish;

    // Внутреннее состояние формы
    this.state = {
      mobile: {
        skipped: false,
        operator: 'МКС',
        region: 'Луганская Народная Республика (ЛНР)',
        currentPrice: 500,
        gb: 20,
        minutes: 400,
        sms: 0
      },
      internet: {
        skipped: false,
        operator: 'Луганет',
        region: 'Луганская Народная Республика (ЛНР)',
        currentPrice: 550,
        minSpeedMbps: 100,
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
        skipped: false // если пользователь заполнил данные, сбрасываем признак пропуска
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
