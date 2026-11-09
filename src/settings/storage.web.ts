// Browser storage implementation using localStorage and sessionStorage.
// Avoids expo-sqlite/kv-store web worker crashes in browser environments.

export type ProviderId = 'cloud' | 'local';
export type LocalBackend = 'auto' | 'npu' | 'gpu' | 'cpu';
export type ThemeMode = 'light' | 'dark';

const KEYS = {
  provider: 'petcare_provider',
  geminiModel: 'petcare_geminiModel',
  localBackend: 'petcare_localBackend',
  systemPrompt: 'petcare_systemPrompt',
  nickname: 'petcare_nickname',
  onboarded: 'petcare_onboarded_flow',
  theme: 'petcare_theme',
  modelResumeData: 'petcare_modelResumeData',
} as const;

const API_KEY_KEY = 'gemini_api_key';

export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';
export const DEFAULT_GEMINI_MODEL = 'auto';

export interface Settings {
  provider: ProviderId;
  geminiApiKey: string;
  geminiModel: string;
  localBackend: LocalBackend;
  systemPrompt: string;
  nickname: string;
  onboarded: boolean;
  theme: ThemeMode;
}

export const DEFAULT_SETTINGS: Settings = {
  provider: 'local',
  geminiApiKey: '',
  geminiModel: DEFAULT_GEMINI_MODEL,
  localBackend: 'auto',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  nickname: '',
  onboarded: false,
  theme: 'light',
};

function getLocalItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return null;
}

function setLocalItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

function removeLocalItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export async function loadSettings(): Promise<Settings> {
  const provider = getLocalItem(KEYS.provider);
  const geminiModel = getLocalItem(KEYS.geminiModel);
  const localBackend = getLocalItem(KEYS.localBackend);
  const systemPrompt = getLocalItem(KEYS.systemPrompt);
  const nickname = getLocalItem(KEYS.nickname);
  const onboarded = getLocalItem(KEYS.onboarded);
  const theme = getLocalItem(KEYS.theme);

  let apiKey: string | null = null;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      apiKey = window.sessionStorage.getItem(API_KEY_KEY);
    }
  } catch {
    apiKey = null;
  }

  const trimmedNickname = (nickname ?? '').trim();
  const hasOnboarded = onboarded === 'true' && Boolean(trimmedNickname);
  const effectiveProvider: ProviderId =
    provider === 'cloud' && Boolean(apiKey) ? 'cloud' : 'local';

  return {
    provider: effectiveProvider,
    geminiApiKey: apiKey ?? '',
    geminiModel: geminiModel || DEFAULT_GEMINI_MODEL,
    localBackend:
      localBackend === 'npu' || localBackend === 'gpu' || localBackend === 'cpu'
        ? (localBackend as LocalBackend)
        : 'auto',
    systemPrompt: systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
    nickname: trimmedNickname,
    onboarded: hasOnboarded,
    theme: theme === 'dark' ? 'dark' : 'light',
  };
}

export async function saveSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  switch (key) {
    case 'geminiApiKey':
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          if (value) window.sessionStorage.setItem(API_KEY_KEY, value as string);
          else window.sessionStorage.removeItem(API_KEY_KEY);
        }
      } catch {
        // Ignore
      }
      return;
    case 'provider':
      setLocalItem(KEYS.provider, value as string);
      return;
    case 'geminiModel':
      setLocalItem(KEYS.geminiModel, value as string);
      return;
    case 'localBackend':
      setLocalItem(KEYS.localBackend, value as string);
      return;
    case 'systemPrompt':
      setLocalItem(KEYS.systemPrompt, value as string);
      return;
    case 'nickname':
      setLocalItem(KEYS.nickname, value as string);
      return;
    case 'onboarded':
      setLocalItem(KEYS.onboarded, String(value));
      return;
    case 'theme':
      setLocalItem(KEYS.theme, value as string);
      return;
  }
}

export async function resetSettings(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(KEYS.provider);
      window.localStorage.removeItem(KEYS.geminiModel);
      window.localStorage.removeItem(KEYS.localBackend);
      window.localStorage.removeItem(KEYS.systemPrompt);
      window.localStorage.removeItem(KEYS.nickname);
      window.localStorage.removeItem(KEYS.onboarded);
      window.localStorage.removeItem(KEYS.theme);
      window.localStorage.removeItem(KEYS.modelResumeData);
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(API_KEY_KEY);
    }
  } catch {
    // Ignore
  }
}

export function buildSystemPrompt(settings: Settings): string {
  const name = settings.nickname.trim();
  return name
    ? `${settings.systemPrompt}\nThe user's name is ${name}.`.trim()
    : settings.systemPrompt;
}

export async function getModelResumeData(): Promise<string | null> {
  return getLocalItem(KEYS.modelResumeData);
}

export async function setModelResumeData(data: string | null): Promise<void> {
  if (data) {
    setLocalItem(KEYS.modelResumeData, data);
  } else {
    removeLocalItem(KEYS.modelResumeData);
  }
}

