import {
  CloudUpload,
  Trash2,
  FileIcon,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Progress, ProgressLabel, ProgressValue } from "../ui/progress";
import { cn, formatBytes } from "@/lib/utils";

export default function RenderEmptyState({
  isDragActive,
}: {
  isDragActive: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group-hover:bg-muted/5 py-12">
      {/* Dynamic Grid Background with Shimmer */}
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.05)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] -z-10" />

      <div className="relative group/icon mb-6">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div
          className={cn(
            "relative flex items-center justify-center size-16 rounded-2xl bg-background border shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105",
            isDragActive &&
              "border-primary scale-110 shadow-primary/20 shadow-2xl",
          )}
        >
          <CloudUpload
            className={cn(
              "size-8 text-muted-foreground transition-colors duration-300",
              isDragActive
                ? "text-primary animate-bounce"
                : "group-hover:text-primary",
            )}
          />
        </div>
      </div>

      <div className="px-6 text-center space-y-2">
        <p className="text-lg font-bold tracking-tight text-foreground">
          {isDragActive ? "Drop to upload" : "Select a file"}
        </p>
        <p className="text-sm text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
          Drag and drop your thumbnail here, or click to browse your files.
        </p>
      </div>

      <Button
        variant="outline"
        className="mt-6 rounded-full px-8 font-bold border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        type="button"
      >
        Browse Files
      </Button>
    </div>
  );
}

export function RenderError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500 py-12">
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,theme(colors.destructive.DEFAULT/0.05)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_90%)] -z-10" />

      <div className="flex items-center justify-center size-14 rounded-full bg-destructive/10 border border-destructive/20 mb-6 shadow-2xl shadow-destructive/20">
        <AlertCircle className="size-7 text-destructive animate-pulse" />
      </div>

      <div className="text-center space-y-1.5 mb-6">
        <h3 className="text-lg font-bold text-foreground">
          Upload Interrupted
        </h3>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
      </div>

      <Button
        variant="destructive"
        className="rounded-full px-8 font-bold shadow-lg shadow-destructive/20 hover:scale-105 transition-transform"
        type="button"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}

export function RenderUploadedState({
  previewUrl,
  fileType,
  fileName,
  fileSize,
  isDeleting,
  onRemove,
}: {
  previewUrl: string;
  fileType: "image" | "video";
  fileName?: string;
  fileSize?: number;
  isDeleting?: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="relative group w-full h-full flex flex-col items-center justify-center overflow-hidden p-6 transition-all duration-700">
      {/* Premium Backdrop */}
      <div className="absolute inset-0 bg-muted/5 backdrop-blur-[1px] -z-10" />
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.02)_1px,transparent_1px)] [background-size:16px_16px] -z-10" />

      {/* Main Preview Container */}
      <div className="relative w-full h-full max-w-[400px] aspect-video flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-700">
        {fileType === "image" ? (
          <div className="relative w-full h-full rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 group-hover:border-primary/30 transition-colors duration-500">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
              priority
            />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 bg-black group-hover:border-primary/30 transition-colors duration-500">
            <video
              src={previewUrl}
              className="w-full h-full object-cover opacity-90"
              muted
              autoPlay
              loop
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
                <UploadCloud className="size-6 text-white animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Professional Metadata Overlay (Top) */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-tighter">
            <ShieldCheck className="size-3 text-green-400" />
            Verified
          </div>
          <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-tighter">
            {fileType === "video" ? "MP4" : "PNG/JPG"}
          </div>
        </div>

        {/* Floating Controls Layer */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2 group/btn translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              disabled={isDeleting}
              className={cn(
                "rounded-full size-16 shadow-2xl shadow-red-500/20 backdrop-blur-2xl border border-red-500/30 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-red-500 disabled:opacity-50",
                isDeleting && "animate-pulse",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              {isDeleting ? (
                <Loader2 className="size-8 animate-spin" />
              ) : (
                <Trash2 className="size-8" />
              )}
            </Button>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/btn:opacity-100 transition-all duration-300">
              {isDeleting ? "Deleting..." : "Remove File"}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Status Footer */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl bg-background/90 backdrop-blur-xl border border-border shadow-2xl max-w-[92%] animate-in fade-in slide-in-from-bottom-4 duration-1000 group/footer">
        <div className="size-2 rounded-full bg-green-500 shadow-[0_0_12px_theme(colors.green.500)] group-hover/footer:animate-ping" />
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-black uppercase tracking-widest text-foreground truncate">
            {fileName || "Asset Uploaded"}
          </span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            {fileSize ? formatBytes(fileSize) : "Verified Size"} • Securely
            Stored
          </span>
        </div>
        <div className="flex items-center justify-center size-6 rounded-full bg-green-500/10 text-green-500 ml-2">
          <CheckCircle2 className="size-4 animate-in zoom-in duration-500" />
        </div>
      </div>
    </div>
  );
}

export function RenderUploadingState({
  progress,
  fileName,
}: {
  progress: number;
  fileName?: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto px-8 gap-6 animate-in fade-in zoom-in duration-300">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative flex items-center justify-center size-16 rounded-full bg-background border shadow-sm">
          <UploadCloud className="size-8 text-primary animate-bounce" />
        </div>
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileIcon className="size-4" />
            <span className="truncate max-w-[180px] font-medium text-foreground">
              {fileName || "Preparing file..."}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {progress}%
          </span>
        </div>

        <Progress value={progress} className="h-2">
          <ProgressLabel className="sr-only">Uploading file</ProgressLabel>
          <ProgressValue className="sr-only">
            {() => `${progress}%`}
          </ProgressValue>
        </Progress>

        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Uploading your content...
          </p>
        </div>
      </div>
    </div>
  );
}
