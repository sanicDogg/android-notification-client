// src/lib/appState.svelte.ts
const APP_PAGES = ['notifications', 'clipboard', 'files'] as const;
export type AppPage = (typeof APP_PAGES)[number];

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
    this._sseEnabled = this.load(
      this.SSE_STORAGE_KEY,
      true,
      (val): val is boolean => typeof val === 'boolean',
    );
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
      const parsed: unknown = JSON.parse(raw);
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

  private isValidPage(val: unknown): val is AppPage {
    return (
      typeof val === 'string' &&
      (APP_PAGES as readonly string[]).includes(val)
    );
  }
}
