"use client";
import React, { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange([...images, data.url]);
      } else {
        const d = await res.json();
        alert(d.error);
      }
    } catch {
      alert("上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X size={12} /></button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs">{uploading ? "上传中" : "添加"}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
      </div>
      <p className="text-xs text-gray-400">支持 JPG/PNG/WebP，单张 ≤ 5MB</p>
    </div>
  );
}
