// src/lib/fileStorage.svelte.ts

import { SvelteMap } from 'svelte/reactivity';
import { BaseSseService } from './baseService';
import { syncMapFromApi } from './api';
import type {
  DeviceFile,
  FileAddedEvent,
  FileDeletedEvent,
  FileListUpdatedEvent,
  SseMessage,
} from './api';

const API_PATHS = {
  upload: (apiBase: string) => `${apiBase}/shared/upload`,
  list: (apiBase: string) => `${apiBase}/shared/list`,
} as const;

export class FileStorageService extends BaseSseService {
  filesMap = new SvelteMap<string, DeviceFile>();

  isUploading = $state<boolean>(false);
  uploadError = $state<string | null>(null);

  get filesList() {
    return Array.from(this.filesMap.values());
  }

  constructor() {
    super();
  }

  async init(): Promise<void> {
    const filesUrl = API_PATHS.list(this.apiBase);

    await syncMapFromApi<DeviceFile, { files: DeviceFile[] }, 'id'>(
      filesUrl,
      this.filesMap,
      (data) => data.files || [],
      'Device Files',
      'id',
    );
  }

  handleSseMessage(msg: SseMessage): void {
    switch (msg.type) {
      case 'FILE_LIST_UPDATED': {
        const event = msg as FileListUpdatedEvent;
        this.filesMap.clear();
        event.files.forEach((file) => this.filesMap.set(file.id, file));
        break;
      }
      case 'FILE_ADDED': {
        const event = msg as FileAddedEvent;
        this.filesMap.set(event.file.id, event.file);
        break;
      }
      case 'FILE_DELETED': {
        const event = msg as FileDeletedEvent;
        this.filesMap.delete(event.fileId);
        break;
      }
    }
  }

  async uploadFiles(files: FileList | File[]): Promise<void> {
    if (!files || files.length === 0) return;

    this.isUploading = true;
    this.uploadError = null;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const uploadUrl = API_PATHS.upload(this.apiBase);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Successfully sent files:', result);

    } catch (error: unknown) {
      console.error('Error uploading files:', error);
      this.uploadError = String(error);
    } finally {
      this.isUploading = false;
    }
  }

  override destroy(): void {
    super.destroy();
    this.filesMap.clear();
    this.uploadError = null;
    this.isUploading = false;
  }
}
