"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type FileRef = {
  name: string;
  size: number;
  file?: File;
  storageId?: string;
  mediaType?: string;
};

type FilePickerProps = {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: FileRef[]) => void;
};

export function FilePicker({
  id,
  label,
  accept,
  multiple = true,
  onChange,
}: FilePickerProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const list = Array.from(e.target.files || []).map((f) => ({
            name: f.name,
            size: f.size,
            file: f,
          }));
          onChange(list);
        }}
      />
    </div>
  );
}
