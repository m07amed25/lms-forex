"use client";

import { useCallback, useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import RenderEmptyState, {
  RenderError,
  RenderUploadedState,
  RenderUploadingState,
} from "./RenderState";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  isUploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

interface UploaderProps {
  value?: string;
  onChange?: (value: string) => void;
}

const Uploader = ({ value, onChange }: UploaderProps) => {
  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    isUploading: false,
    progress: 0,
    isDeleting: false,
    error: false,
    fileType: "image",
    key: value,
  });

  useEffect(() => {
    return () => {
      if (fileState.objectUrl) {
        URL.revokeObjectURL(fileState.objectUrl);
      }
    };
  }, [fileState.objectUrl]);

  const uploadFile = useCallback(
    async (file: File) => {
      console.log("Starting upload for file:", file.name, "type:", file.type);
      setFileState((prev) => ({
        ...prev,
        isUploading: true,
        progress: 0,
      }));

      try {
        // PresignedUrl
        const presignedRespone = await fetch("/api/s3/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            isImage: file.type.startsWith("image/"),
          }),
        });

        if (!presignedRespone.ok) {
          const errorData = await presignedRespone.json().catch(() => ({}));
          console.error(
            "Failed to get Presigned Url:",
            presignedRespone.status,
            errorData,
          );
          toast.error("Failed to upload file. Please try again");

          setFileState((prev) => ({
            ...prev,
            isUploading: false,
            progress: 0,
            error: true,
          }));

          return;
        }

        const { presignedUrl, key } = await presignedRespone.json();
        console.log("Got presigned URL, starting PUT request to S3");

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setFileState((prev) => ({
                ...prev,
                progress,
              }));
            }
          };

          xhr.onload = () => {
            console.log("S3 Upload finished with status:", xhr.status);
            if (xhr.status === 200 || xhr.status === 204) {
              setFileState((prev) => ({
                ...prev,
                isUploading: false,
                progress: 100,
                key,
              }));

              toast.success("File uploaded successfully");
              if (onChange) {
                onChange(key);
              }
              resolve();
            } else {
              console.error(
                "S3 Upload failed status:",
                xhr.status,
                xhr.responseText,
              );
              reject(new Error("Failed to upload file"));
            }
          };
          xhr.onerror = (e) => {
            console.error("S3 Upload network error:", e);
            reject(new Error("Failed to upload file"));
          };

          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (err) {
        console.error("Upload error caught:", err);
        const message =
          err instanceof Error ? err.message : "Network error occurred";
        toast.error(`Upload failed: ${message}`);

        setFileState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: true,
        }));
      }
    },
    [onChange],
  );

  async function handleRemoveFile() {
    if (fileState.isDeleting) return;

    try {
      // If there's a key, we need to delete it from S3
      if (fileState.key || value) {
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
        }));

        const res = await fetch("/api/s3/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: fileState.key || value,
          }),
        });

        if (!res.ok) {
          toast.error("Failed to remove file from storage");
          setFileState((prev) => ({
            ...prev,
            isDeleting: false,
          }));
          return;
        }
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      setFileState({
        id: null,
        file: null,
        isUploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        fileType: "image",
      });

      if (onChange) {
        onChange("");
      }

      toast.success("File removed successfully");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Failed to remove file. Please try again");

      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
      }));
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
          file: file,
          isUploading: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          id: uuidv4(),
          isDeleting: false,
          fileType: file.type.startsWith("video") ? "video" : "image",
          error: false,
        });

        uploadFile(file);
      }
    },
    [fileState.objectUrl, uploadFile],
  );

  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const toManyFiles = fileRejection.find(
        (rejection) => rejection.errors[0].code === "too-many-files",
      );

      const tooLargeFile = fileRejection.find(
        (rejection) => rejection.errors[0].code === "file-too-large",
      );

      if (toManyFiles) {
        toast.error("Too many files selected, max is 1");
      }

      if (tooLargeFile) {
        toast.error("File too large, max is 5MB");
      }
    }
  }

  function renderContent() {
    if (fileState.isUploading) {
      return (
        <RenderUploadingState
          progress={fileState.progress}
          fileName={fileState.file?.name}
        />
      );
    }

    if (fileState.error) {
      return (
        <RenderError
          onRetry={() => {
            if (fileState.file) {
              uploadFile(fileState.file);
            } else {
              setFileState((prev) => ({ ...prev, error: false }));
            }
          }}
        />
      );
    }

    if (fileState.objectUrl || value) {
      return (
        <RenderUploadedState
          previewUrl={
            fileState.objectUrl ||
            `https://salma-forex-lms.t3.storage.dev/${value}`
          }
          fileType={fileState.fileType}
          fileName={fileState.file?.name}
          fileSize={fileState.file?.size}
          isDeleting={fileState.isDeleting}
          onRemove={handleRemoveFile}
        />
      );
    }

    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDrop,
    onDropRejected: rejectedFiles,
    disabled: fileState.isUploading,
  });

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full min-h-80",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary",
        "cursor-pointer",
        (fileState.objectUrl || value) && "border-solid border-primary/50",
        fileState.isUploading &&
          "opacity-50 cursor-not-allowed pointer-events-none",
      )}
      {...getRootProps()}
    >
      <CardContent className="relative flex items-center justify-center min-h-[inherit] p-2 overflow-hidden">
        <input {...getInputProps()} />
        <div className="w-full h-full flex items-center justify-center">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default Uploader;
