"use client";
import React, { useState, useEffect } from "react";
import { ImageUpload } from "./ImageUpload";
import { Button } from "../ui/Button";

interface CustomFieldDef { id: string; name: string; label: string; type: string; options: string[]; required: boolean; }
interface Category { id: string; name: string; }

interface ProductFormProps {
  initial?: any;
  onSave: (data: any) => void;
  saving?: boolean;
}

export function ProductForm({ initial, onSave, saving }: ProductFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes || ["S","M","L","XL"]);
  const [sizeInput, setSizeInput] = useState("");
  const [stock, setStock] = useState<Record<string, number>>(initial?.stock || {});
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [fieldDefs, setFieldDefs] = useState<CustomFieldDef[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    fetch("/api/custom-fields").then(r => r.json()).then(defs => {
      setFieldDefs(defs.filter((d: any) => d.isActive));
      if (initial?.customFields) {
        const m: Record<string,string> = {};
        for (const d of defs) {
          if (initial.customFields[d.name]) m[d.id] = initial.customFields[d.name];
        }
        setFieldValues(m);
      }
    });
  }, []);

  function addSize() {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setStock(prev => ({ ...prev, [s]: prev[s] || 0 }));
    }
    setSizeInput("");
  }

  function removeSize(s: string) {
    setSizes(sizes.filter(x => x !== s));
    const ns = { ...stock }; delete ns[s]; setStock(ns);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || price == null) { alert("商品名称和价格必填"); return; }

    // Check required custom fields
    for (const d of fieldDefs) {
      if (d.required && !fieldValues[d.id]) {
        alert(`请填写"${d.label}"`);
        return;
      }
    }

    onSave({
      title, description, price: Number(price), images, sizes,
      stock, categoryId: categoryId || null,
      customFields: fieldValues,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">商品图片</label>
        <ImageUpload images={images} onChange={setImages} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">商品名称 *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="如：简约纯棉T恤" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">价格 (元) *</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="89.00" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">商品描述</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="描述商品的特点和卖点..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">-- 请选择 --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">尺码 & 库存</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {sizes.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-sm">
              {s} &times;
              <input type="number" min="0" value={stock[s] ?? 0}
                onChange={e => setStock(prev => ({ ...prev, [s]: parseInt(e.target.value)||0 }))}
                className="w-12 text-center border border-gray-300 rounded text-xs py-0"
              />
              <button type="button" onClick={() => removeSize(s)} className="text-gray-400 hover:text-red-500">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSize())}
            className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm" placeholder="XL" />
          <Button type="button" size="sm" variant="secondary" onClick={addSize}>添加尺码</Button>
        </div>
      </div>

      {fieldDefs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">增值信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fieldDefs.map(d => (
              <div key={d.id}>
                <label className="block text-sm text-gray-600 mb-0.5">{d.label}{d.required && " *"}</label>
                {d.type === "select" ? (
                  <select value={fieldValues[d.id] || ""} onChange={e => setFieldValues(prev => ({ ...prev, [d.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">-- 请选择 --</option>
                    {(d.options as string[]).map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : d.type === "textarea" ? (
                  <textarea value={fieldValues[d.id] || ""} onChange={e => setFieldValues(prev => ({ ...prev, [d.id]: e.target.value }))}
                    rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                ) : d.type === "boolean" ? (
                  <input type="checkbox" checked={fieldValues[d.id] === "true"} onChange={e => setFieldValues(prev => ({ ...prev, [d.id]: e.target.checked ? "true" : "false" }))} />
                ) : d.type === "number" ? (
                  <input type="number" value={fieldValues[d.id] || ""} onChange={e => setFieldValues(prev => ({ ...prev, [d.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                ) : (
                  <input value={fieldValues[d.id] || ""} onChange={e => setFieldValues(prev => ({ ...prev, [d.id]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={saving}>{saving ? "保存中..." : (initial ? "更新商品" : "添加商品")}</Button>
    </form>
  );
}
