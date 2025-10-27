"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Eye } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type FileRef = {
  name: string;
  size: number;
  storageId?: string;
  mediaType?: string;
};

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file: FileRef) {
  return (
    file.mediaType === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function FileList({ files }: { files: FileRef[] }) {
  if (!files?.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {files.map((f, i) => (
        <FileItem key={`${f.name}-${i}`} file={f} />
      ))}
    </div>
  );
}

function FileItem({ file }: { file: FileRef }) {
  const fileUrl = file.storageId
    ? useQuery(api.founders.getFileUrl, { storageId: file.storageId })
    : null;
  const isPdfFile = isPdf(file);

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{file.name}</span>
          <Badge variant="outline" className="text-xs">
            {humanSize(file.size)}
          </Badge>
        </div>
      </div>
      <div className="flex gap-1">
        {isPdfFile && file.storageId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{file.name}</DialogTitle>
              </DialogHeader>
              {fileUrl && (
                <div className="w-full h-[75vh]">
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border rounded"
                    title={file.name}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        {file.storageId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!fileUrl}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
