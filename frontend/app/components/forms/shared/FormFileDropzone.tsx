import { FileUpload } from '@ark-ui/react/file-upload';
import { ImagePlus, X } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface FormFileDropzoneProps {
  label: string;
  helperText?: string;
  /** Called whenever the set of accepted files changes. */
  onFilesChange: (files: File[]) => void;
}

export function FormFileDropzone({ label, helperText, onFilesChange }: FormFileDropzoneProps) {
  return (
    <FileUpload.Root
      maxFiles={3}
      maxFileSize={MAX_FILE_SIZE}
      accept={['image/jpeg', 'image/png', 'image/webp']}
      onFileChange={(details) => onFilesChange(details.acceptedFiles)}
      className="flex flex-col gap-3"
    >
      <FileUpload.Label className="font-body text-sm font-medium text-white">
        {label}
      </FileUpload.Label>
      {helperText && <p className="-mt-2 text-xs text-silver">{helperText}</p>}

      <FileUpload.Dropzone className="cursor-pointer rounded-xl border-2 border-dashed border-graphite bg-bg-surface p-8 text-center transition-colors duration-200 hover:border-accent/50 data-dragging:border-accent data-dragging:bg-accent/5">
        <ImagePlus size={32} className="mx-auto mb-3 text-silver" aria-hidden="true" />
        <p className="font-body text-sm text-silver">
          Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
        </p>
        <p className="text-xs text-silver/60">JPG, PNG, WEBP • max. 10 MB • do 3 zdjęć</p>
      </FileUpload.Dropzone>

      <FileUpload.ItemGroup className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <FileUpload.Context>
          {({ acceptedFiles, rejectedFiles }) => (
            <>
              {acceptedFiles.map((file) => (
                <FileUpload.Item
                  key={file.name}
                  file={file}
                  className="flex items-center gap-3 rounded-lg border border-graphite bg-bg-surface p-3"
                >
                  <FileUpload.ItemPreview
                    type="image/*"
                    className="h-10 w-10 shrink-0 overflow-hidden rounded"
                  >
                    <FileUpload.ItemPreviewImage className="h-10 w-10 object-cover" />
                  </FileUpload.ItemPreview>
                  <FileUpload.ItemName className="flex-1 truncate text-sm text-white" />
                  <FileUpload.ItemDeleteTrigger
                    className="shrink-0 text-silver transition-colors hover:text-white"
                    aria-label="Usuń zdjęcie"
                  >
                    <X size={16} />
                  </FileUpload.ItemDeleteTrigger>
                </FileUpload.Item>
              ))}
              {rejectedFiles.length > 0 && (
                <p className="text-xs text-red-400 sm:col-span-2">
                  Nie dodano: {rejectedFiles.map((rejected) => rejected.file.name).join(', ')} —
                  sprawdź format (JPG, PNG, WEBP), rozmiar (max. 10 MB) i liczbę zdjęć (do 3).
                </p>
              )}
            </>
          )}
        </FileUpload.Context>
      </FileUpload.ItemGroup>

      <FileUpload.HiddenInput />
    </FileUpload.Root>
  );
}
