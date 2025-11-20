export interface Theme {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  thumbnail: string;
  icon: React.ReactNode;
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
  themeId: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  VALIDATING = 'VALIDATING',
  READY_TO_GENERATE = 'READY_TO_GENERATE',
  GENERATING = 'GENERATING',
  REVISING = 'REVISING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
