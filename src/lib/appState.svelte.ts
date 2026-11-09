export type AppPage = "notifications" | "clipboard" | "files";

export class AppStateService {
  private _currentPage = $state<AppPage>("notifications");
  private readonly STORAGE_KEY = "app_current_page";

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof window !== "undefined") {
      const savedPage = localStorage.getItem(this.STORAGE_KEY);

      if (savedPage && this.isValidPage(savedPage)) {
        this._currentPage = savedPage;
      }
    }
  }

  get currentPage(): AppPage {
    return this._currentPage;
  }

  set currentPage(value: AppPage) {
    this._currentPage = value;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, value);
    }
  }

  private isValidPage(page: string): page is AppPage {
    return ["notifications", "clipboard", "files"].includes(page);
  }

  // Future things...
  // private _theme = $state<"light" | "dark">("light");
}
