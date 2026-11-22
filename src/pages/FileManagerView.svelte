<script lang="ts">
  import type { DeviceFile } from "../lib/api";
  import { createApiBaseUrl } from "../lib/baseService";

  interface Props {
    files?: DeviceFile[];
    isUploading?: boolean;
    uploadError?: string | null;
    onFilesDropped?: (files: File[]) => void;
    onDeleteFile?: (fileId: string) => void;
  }

  let {
    files = [],
    isUploading = false,
    uploadError = null,
    onFilesDropped,
    onDeleteFile,
  }: Props = $props();

  let isDragOver = $state<boolean>(false);

  const apiBase = createApiBaseUrl();

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (isUploading) return;
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    if (isUploading) return;

    if (e.dataTransfer && e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0 && onFilesDropped) {
        onFilesDropped(droppedFiles);
      }
    }
  }

  function handleInputChange(e: Event & { currentTarget: HTMLInputElement }) {
    if (isUploading) return;

    if (e.currentTarget.files) {
      const selectedFiles = Array.from(e.currentTarget.files);
      if (selectedFiles.length > 0 && onFilesDropped) {
        onFilesDropped(selectedFiles);
      }
    }
  }

  function downloadFile(fileId: string) {
    window.open(`${apiBase}/shared/download/${fileId}`, "_blank");
  }

  function formatBytes(bytes: number, decimals = 2): string {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
</script>

<div
  class="file-manager-container"
  class:dragover={isDragOver}
  class:uploading={isUploading}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="region"
  aria-label="File manager with Drag and Drop"
>
  <!-- Drag and Drop Zone -->
  <div class="drop-zone">
    <div class="drop-zone-content">
      {#if isUploading}
        <svg
          class="drop-icon spinner"
          xmlns="http://w3.org"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
        >
        <p class="drop-text">Uploading files to device...</p>
      {:else}
        <svg
          xmlns="http://w3.org"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="drop-icon"
          ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
            points="17 8 12 3 7 8"
          /><line x1="12" y1="3" x2="12" y2="15" /></svg
        >
        <p class="drop-text">
          Drop files here or
          <label class="file-label">
            choose manually
            <input
              type="file"
              multiple
              onchange={handleInputChange}
              disabled={isUploading}
              class="file-input"
            />
          </label>
        </p>
      {/if}
    </div>
  </div>

  {#if uploadError}
    <div class="error-message" role="alert">
      <svg
        class="error-icon"
        xmlns="http://w3.org"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p class="error-text">{uploadError}</p>
    </div>
  {/if}

  <!-- Shared file list -->
  <div class="file-list-section">
    <h3>Shared files ({files.length})</h3>

    {#if files.length === 0}
      <div class="empty-state">
        <p>No available files or the list is loading...</p>
      </div>
    {:else}
      <div class="files-grid">
        {#each files as file (file.id || file.name)}
          <div class="file-card">
            <div class="file-icon">
              <!-- SVG File Icon -->
              <svg
                xmlns="http://w3.org"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
                /><polyline points="14 2 14 8 20 8" /></svg
              >
            </div>
            <div class="file-info">
              <span class="file-name" title={file.name}>{file.name}</span>
              <span class="file-size">{formatBytes(file.size)}</span>
            </div>

            <div class="file-actions">
              <button
                class="action-btn download-btn"
                aria-label="Download"
                title="Download"
                onclick={() => downloadFile(file.id)}
              >
                <svg
                  xmlns="http://w3.org"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  /><polyline points="7 10 12 15 17 10" /><line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                  /></svg
                >
              </button>

              {#if onDeleteFile}
                <button
                  class="action-btn delete-btn"
                  aria-label="Delete"
                  title="Delete"
                  onclick={() => onDeleteFile(file.id)}
                >
                  <svg
                    xmlns="http://w3.org"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    ><polyline points="3 6 5 6 21 6" /><path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    /><line x1="10" y1="11" x2="10" y2="17" /><line
                      x1="14"
                      y1="11"
                      x2="14"
                      y2="17"
                    /></svg
                  >
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .spinner {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
  .uploading .drop-zone {
    border-color: #3b82f6;
    background-color: #f0f7ff;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #b91c1c;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #ef4444;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 14px;
    line-height: 1.4;
    animation: slideDown 0.2s ease-out;
  }

  .error-icon {
    flex-shrink: 0;
    color: #ef4444;
  }

  .error-text {
    margin: 0;
    font-weight: 500;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .file-manager-container {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-sizing: border-box;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-top: 20px;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease;
    border: 2px solid transparent;
  }

  .file-manager-container.dragover {
    border-color: #4a90e2;
    transform: scale(1.01);
  }

  .drop-zone {
    border: 2px dashed #e0e6ed;
    border-radius: 12px;
    padding: 32px 20px;
    text-align: center;
    background: #f8fafc;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .dragover .drop-zone {
    background: #edf5ff;
    border-color: #4a90e2;
  }

  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .drop-icon {
    color: #a0aec0;
    transition: color 0.2s ease;
  }

  .dragover .drop-icon {
    color: #4a90e2;
  }

  .drop-text {
    font-size: 15px;
    color: #4a5568;
    margin: 0;
  }

  .file-label {
    color: #4a90e2;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }

  .file-input {
    display: none;
  }

  .file-list-section {
    margin-top: 28px;
  }

  .file-list-section h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #2d3748;
  }

  .empty-state {
    text-align: center;
    color: #718096;
    padding: 40px 0;
    font-size: 14px;
  }

  .files-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .file-card {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 16px;
    gap: 14px;
  }

  .file-icon {
    color: #4a90e2;
    display: flex;
    align-items: center;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 12px;
    color: #718096;
    margin-top: 2px;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .download-btn:hover {
    background-color: #e2e8f0;
    color: #2d3748;
  }

  .delete-btn:hover {
    background-color: #fee2e2;
    color: #ef4444;
  }
</style>
