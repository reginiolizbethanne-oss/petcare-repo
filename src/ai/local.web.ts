// Web and offline implementation of Local AI for PetCare
import type { LocalBackend } from '../settings/storage';
import type { ModelStatus } from './local';
import type { ChatProvider } from './types';
import { generateOfflinePetCareReply } from './offlinePetCare';

export type { ModelStatus } from './local';
export const supportsLocalAI = true;
export const LOCAL_CONTEXT_TOKENS = 4096;

const status: ModelStatus = { state: 'loaded' };

export function getModelStatus(): ModelStatus {
  return status;
}

export function subscribeModelStatus(listener: (value: ModelStatus) => void): () => void {
  listener(status);
  return () => {};
}

export function isModelLoaded(): boolean {
  return true;
}

export async function refreshModelStatus(): Promise<ModelStatus> {
  return status;
}

export async function downloadModel(): Promise<void> {}
export async function cancelDownload(): Promise<void> {}
export async function pauseDownload(): Promise<void> {}
export async function deleteModel(): Promise<void> {}
export async function loadLocalModel(_backend: LocalBackend, _systemPrompt?: string): Promise<void> {}
export async function unloadEngine(): Promise<void> {}
export async function releaseLocalConversation(_chatId: string): Promise<void> {}

export function createLocalProvider(_opts: {
  backend: LocalBackend;
  isModelDownloaded: () => boolean;
}): ChatProvider {
  return {
    id: 'local',
    label: 'Local (Offline AI)',
    requiresNetwork: false,
    async generate(history, { signal, onToken, onContext }) {
      const last = history[history.length - 1];
      const query =
        last?.content ||
        (last?.imageUri ? 'Safe food and nutrition for pets' : 'Pet Care consultation');

      const result = generateOfflinePetCareReply(query);

      // Stream tokens with realistic typing cadence
      const chunks = result.reply.match(/(\S+\s*|\n)/g) || [result.reply];
      let accumulated = '';

      for (const chunk of chunks) {
        if (signal?.aborted) break;
        accumulated += chunk;
        onToken(chunk);
        await new Promise((r) => setTimeout(r, 12));
      }

      onContext?.({
        usedTokens: Math.round(accumulated.length / 4),
        maxTokens: LOCAL_CONTEXT_TOKENS,
        estimated: true,
      });

      return accumulated;
    },
  };
}
