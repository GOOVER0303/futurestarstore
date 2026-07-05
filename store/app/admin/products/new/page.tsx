"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Loader2, X, Plus } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [stock, setStock] = useState<Record<string,number>>({S:0,M:0,L:0,XL:0});
  const [catId, setCatId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [fieldDefs, setFieldDefs] = useState<any[]>([]);
  const [fieldVals, setFieldVals] = useState<Record<string,string>>({});

  useEffect(() => {
    fetch("/api/categories").then(r=>r.json()).then(setCategories);
    fetch("/api/custom-fields").then(r=>r.json()).then(d => setFieldDefs(d.filter((x:any)=>x.isActive)));
  }, []);

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method:"POST", body:fd });
    if (r.ok) { const d = await r.json(); setImages(p => [...p, d.url]); }
    else { const d = await r.json(); toast.error(d.error); }
    e.target.value = "";
  }

  function removeImg(i: number) { setImages(ps => ps.filter((_,j) => j!==i)); }
  function addSize() {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) { setSizes(p => [...p, s]); setStock(p => ({...p, [s]: 0})); }
    setSizeInput("");
  }
  function removeSize(s: string) { setSizes(p => p.filter(x => x!==s)); const ns = {...stock}; delete ns[s]; setStock(ns); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !price) { toast.error("商品名称和价格必填"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/products", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ title, description: desc, price: Number(price), images, sizes, stock, categoryId: catId||null, customFields: fieldVals }),
      });
      if (r.ok) { toast.success("商品已添加"); router.push("/admin/products"); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">添加商品</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1">商品图片</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImg(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X size={12}/></button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-500 cursor-pointer">
              <Upload size={20} /><span className="text-xs">添加</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadFile} />
            </label>
          </div>
          <p className="text-xs text-gray-400">支持 JPG/PNG/WebP，单张 ≤ 5MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">商品名称 *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="如：简约纯棉T恤" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">价格 (元) *</label>
            <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="89.00" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">商品描述</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="描述商品的特点和卖点..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <select value={catId} onChange={e=>setCatId(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option value="">-- 请选择 --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">尺码 & 库存</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sizes.length === 0 && <p className="text-gray-400 text-sm py-1">暂无尺码，请在下方添加</p>}{sizes.map(s => (
              <span key={s} className="inline-flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-sm">
                {s} ×
                <input type="number" min="0" value={stock[s]??0} onChange={e=>setStock(p=>({...p,[s]:parseInt(e.target.value)||0}))}
                  className="w-12 text-center border rounded text-xs py-0" />
                <button type="button" onClick={()=>removeSize(s)} className="text-gray-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input value={sizeInput} onChange={e=>setSizeInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addSize())}
              className="w-20 rounded-lg border px-2 py-1 text-sm" placeholder="XL" />
            <button type="button" onClick={addSize} className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">添加尺码</button>
          </div>
        </div>

        {fieldDefs.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">增值信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fieldDefs.map(d => (
                <div key={d.id}>
                  <label className="block text-xs text-gray-500 mb-0.5">{d.label}</label>
                  {d.type === "select" ? (
                    <select value={fieldVals[d.id]||""} onChange={e=>setFieldVals(p=>({...p,[d.id]:e.target.value}))} className="w-full rounded-lg border px-3 py-2 text-sm">
                      <option value="">-- 请选择 --</option>
                      {d.options.map((o:string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : d.type === "textarea" ? (
                    <textarea value={fieldVals[d.id]||""} onChange={e=>setFieldVals(p=>({...p,[d.id]:e.target.value}))} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  ) : (
                    <input value={fieldVals[d.id]||""} onChange={e=>setFieldVals(p=>({...p,[d.id]:e.target.value}))} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-50">
          {saving ? "保存中..." : "添加商品"}
        </button>
      </form>
    </div>
  );
}
