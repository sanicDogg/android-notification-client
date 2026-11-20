// src/lib/appState.svelte.ts
export type AppPage = 'notifications' | 'clipboard' | 'files';

export class AppStateService {
  private _currentPage = $state<AppPage>('notifications');
  private _sseEnabled = $state<boolean>(true);
  // Future things...
  // private _theme = $state<"light" | "dark">("light");

  private readonly PAGE_STORAGE_KEY = 'app_current_page';
  private readonly SSE_STORAGE_KEY = 'app_sse_enabled';

  constructor() {
    this._currentPage = this.load(
      this.PAGE_STORAGE_KEY,
      'notifications',
      this.isValidPage,
    );
    this._sseEnabled = this.load(this.SSE_STORAGE_KEY, true);
  }

  get currentPage(): AppPage {
    return this._currentPage;
  }

  set currentPage(value: AppPage) {
    this._currentPage = value;
    this.save(this.PAGE_STORAGE_KEY, value);
  }

  get sseEnabled(): boolean {
    return this._sseEnabled;
  }

  set sseEnabled(value: boolean) {
    this._sseEnabled = value;
    this.save(this.SSE_STORAGE_KEY, value);
  }

  private load<T>(
    key: string,
    fallback: T,
    validate?: (val: unknown) => val is T,
  ): T {
    if (typeof window === 'undefined') return fallback;

    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;

    try {
      const parsed = JSON.parse(raw);
      return !validate || validate(parsed) ? (parsed as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private isValidPage(page: string): page is AppPage {
    return ['notifications', 'clipboard', 'files'].includes(page);
  }
}
