export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  warning?: string;
  validating?: boolean;
  animalType?: string;
}
