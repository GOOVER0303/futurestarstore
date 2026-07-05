"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

type FieldType = { id?: string; name: string; label: string; type: "text"|"number"|"select"|"textarea"|"boolean"; options: string[]; required: boolean; sortOrder: number; isActive: boolean; };
type Category = { id: string; name: string; slug: string; };

export default function SettingsPage() {
  const [fields, setFields] = useState<FieldType[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editing, setEditing] = useState<FieldType | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [f, setF] = useState<FieldType>({ name:"", label:"", type:"text", options:[], required:false, sortOrder:0, isActive:true });

  function loadData() {
    fetch("/api/custom-fields").then(r=>r.json()).then(setFields);
    fetch("/api/categories").then(r=>r.json()).then(setCats);
  }
  useEffect(() => { loadData(); }, []);

  function resetForm() { setF({ name:"", label:"", type:"text", options:[], required:false, sortOrder:0, isActive:true }); setShowFieldForm(false); setEditing(null); }
  function editField(ff: any) { setF({ ...ff, options: ff.options||[] }); setEditing(ff); setShowFieldForm(true); }

  async function saveField() {
    if (!f.name || !f.label) { toast.error("请填写字段名和标签"); return; }
    const body = { ...f };
    if (editing) {
      await fetch(`/api/custom-fields/${editing.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      toast.success("已更新");
    } else {
      await fetch("/api/custom-fields", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      toast.success("已添加");
    }
    resetForm(); loadData();
  }

  async function deleteField(id: string) { if(!confirm("确定删除？")) return; await fetch(`/api/custom-fields/${id}`, { method:"DELETE" }); toast.success("已删除"); loadData(); }

  async function addCat() {
    if (!catName) return;
    await fetch("/api/categories", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ name:catName, slug:catSlug||catName }) });
    toast.success("已添加分类");
    setCatName(""); setCatSlug(""); loadData();
  }

  async function deleteCat(id: string) {
    if (!confirm("确定删除该分类？")) return;
    await fetch(`/api/categories?id=${id}`, { method:"DELETE" });
    toast.success("已删除");
    loadData();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">商店设置</h1>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold mb-3">商品分类</h2>
        <div className="flex gap-2 mb-3">
          <input value={catName} onChange={e=>setCatName(e.target.value)} placeholder="分类名称" className="flex-1 rounded-lg border px-3 py-1.5 text-sm" />
          <input value={catSlug} onChange={e=>setCatSlug(e.target.value)} placeholder="英文标识(可选)" className="w-32 rounded-lg border px-3 py-1.5 text-sm" />
          <Button size="sm" onClick={addCat}>添加</Button>
        </div>
        <div className="space-y-1">
          {cats.map(c => (
            <div key={c.id} className="text-sm text-gray-600 px-3 py-1.5 rounded-lg bg-gray-50 flex items-center justify-between">
              <span>{c.name} <span className="text-gray-400">({c.slug})</span></span>
              <button onClick={() => deleteCat(c.id)} className="text-gray-400 hover:text-red-500 font-bold text-lg leading-none">&times;</button>
            </div>
          ))}
          {cats.length === 0 && <p className="text-sm text-gray-400 py-2">暂无分类</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">增值信息字段</h2>
          <Button size="sm" onClick={() => { resetForm(); setShowFieldForm(true); }}><Plus size={14} className="mr-1" />添加字段</Button>
        </div>
        {showFieldForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">字段标识(英文)</label><input value={f.name} onChange={e=>setF({...f, name:e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></div>
              <div><label className="text-xs text-gray-500">显示标签</label><input value={f.label} onChange={e=>setF({...f, label:e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">类型</label>
                <select value={f.type} onChange={e=>setF({...f, type:e.target.value as any})} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="text">文本</option><option value="number">数字</option><option value="select">下拉选择</option><option value="textarea">多行文本</option><option value="boolean">开关</option>
                </select>
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.required} onChange={e=>setF({...f, required:e.target.checked})} />必填</label>
              </div>
            </div>
            {f.type === "select" && (
              <div>
                <label className="text-xs text-gray-500">选项（逗号分隔）</label>
                <input value={f.options.join(",")} onChange={e=>setF({...f, options: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}
                  className="w-full border rounded px-2 py-1 text-sm" placeholder="如：棉,麻,丝绸" />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={saveField}>{editing ? "更新" : "保存"}</Button>
              <Button size="sm" variant="secondary" onClick={resetForm}>取消</Button>
            </div>
          </div>
        )}
        <div className="space-y-1">
          {fields.map(ff => (
            <div key={ff.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
              <div className="text-sm">
                <span className="font-medium">{ff.label}</span>
                <span className="text-gray-400 ml-2">({ff.name})</span>
                <span className="ml-2 text-xs bg-gray-200 rounded px-1.5">{ff.type}</span>
                {!ff.isActive && <span className="ml-1 text-xs text-red-400">已停用</span>}
              </div>
              <div className="flex gap-1">
                <button onClick={()=>editField(ff)} className="p-1 text-gray-400 hover:text-brand-500"><Edit3 size={14} /></button>
                <button onClick={()=>deleteField(ff.id!)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
