import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type AppLanguage = 'sr' | 'en' | 'de';

const LANGUAGE_STORAGE_KEY = 'gym_language';
const SUPPORTED_LANGUAGES: AppLanguage[] = ['sr', 'en', 'de'];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);

  readonly languages = SUPPORTED_LANGUAGES;

  constructor() {
    this.translate.addLangs(this.languages);
    this.translate.setDefaultLang('sr');

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
    const initialLanguage = stored && this.isSupportedLanguage(stored) ? stored : 'sr';
    this.setLanguage(initialLanguage);
  }

  setLanguage(language: AppLanguage): void {
    if (!this.isSupportedLanguage(language)) {
      return;
    }

    this.translate.use(language);
    this.document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  currentLanguage(): AppLanguage {
    const language = this.translate.currentLang as AppLanguage | undefined;
    return language && this.isSupportedLanguage(language) ? language : 'sr';
  }

  private isSupportedLanguage(value: string): value is AppLanguage {
    return this.languages.includes(value as AppLanguage);
  }
}
