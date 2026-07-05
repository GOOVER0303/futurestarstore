"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [stock, setStock] = useState({});
  const [catId, setCatId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState([]);
  const [fieldDefs, setFieldDefs] = useState([]);
  const [fieldVals, setFieldVals] = useState({});

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/custom-fields").then(r => r.json()).then(fields => fields.map(f => ({...f, options: Array.isArray(f.options) ? f.options : (() => { try { return JSON.parse(f.options); } catch { return []; } })()}))),
      fetch(`/api/products/${params.id}`).then(r => r.json()),
    ]).then(([cats, fields, prod]) => {
      setCategories(cats);
      setFieldDefs(fields.filter(x => x.isActive));
      setTitle(prod.title || "");
      setDesc(prod.description || "");
      setPrice(String(prod.price || ""));
      setImages(prod.images || []);
      setSizes(prod.sizes || []);
      setStock(prod.stock || {});
      setCatId(prod.categoryId || "");
      setIsActive(prod.isActive);
      const fv = {};
      if (prod.customFields) {
        for (const d of fields) {
          if (prod.customFields[d.name]) fv[d.id] = prod.customFields[d.name];
        }
      }
      setFieldVals(fv);
      setLoading(false);
    }).catch(() => { toast.error("加载商品失败"); setLoading(false); });
  }, [params.id]);

  async function uploadFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (r.ok) { const d = await r.json(); setImages(p => [...p, d.url]); }
    else { const d = await r.json(); toast.error(d.error); }
    e.target.value = "";
  }

  function removeImg(i) { setImages(ps => ps.filter((_, j) => j !== i)); }
  function addSize() {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) { setSizes(p => [...p, s]); setStock(p => ({ ...p, [s]: 0 })); }
    setSizeInput("");
  }
  function removeSize(s) { setSizes(p => p.filter(x => x !== s)); const ns = { ...stock }; delete ns[s]; setStock(ns); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !price) { toast.error("商品名称和价格必填"); return; }
    setSaving(true);
    try {
      const r = await fetch(`/api/products/${params.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, price: Number(price), images, sizes, stock, categoryId: catId || null, isActive, customFields: fieldVals }),
      });
      if (r.ok) { toast.success("商品已更新"); router.push("/admin/products"); }
      else { const d = await r.json(); toast.error(d.error); }
    } catch { toast.error("保存失败"); }
    finally { setSaving(false); }
  }

  if (loading) return React.createElement("p", {style:{color:"#999"}}, "加载中...");

  return React.createElement("div", {style:{maxWidth:700}},
    React.createElement("h1", {style:{fontSize:24,fontWeight:"bold",marginBottom:24}}, "编辑商品"),
    React.createElement("form", {onSubmit:handleSubmit, style:{display:"flex",flexDirection:"column",gap:20}},
      React.createElement("div", null,
        React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "商品图片"),
        React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:8}},
          images.map((url,i) =>
            React.createElement("div", {key:i, style:{position:"relative",width:80,height:80,borderRadius:8,overflow:"hidden",border:"1px solid #ddd"}},
              React.createElement("img", {src:url, alt:"", style:{width:"100%",height:"100%",objectFit:"cover"}}),
              React.createElement("button", {type:"button", onClick:()=>removeImg(i), style:{position:"absolute",top:0,right:0,background:"#ef4444",color:"#fff",border:"none",borderRadius:"0 0 0 8px",padding:"2px 6px",cursor:"pointer",fontSize:14}}, "×")
            )
          ),
          React.createElement("label", {style:{width:80,height:80,borderRadius:8,border:"2px dashed #ddd",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,color:"#999",cursor:"pointer",fontSize:12}},
            React.createElement("span", {style:{fontSize:20}}, "+"),
            "上传",
            React.createElement("input", {type:"file", accept:"image/*", style:{display:"none"}, onChange:uploadFile})
          )
        )
      ),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},
        React.createElement("div", null,
          React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "商品名称 *"),
          React.createElement("input", {value:title, onChange:e=>setTitle(e.target.value), style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14}})
        ),
        React.createElement("div", null,
          React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "价格 (元) *"),
          React.createElement("input", {type:"number", step:"0.01", value:price, onChange:e=>setPrice(e.target.value), style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14}})
        )
      ),
      React.createElement("div", null,
        React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "商品描述"),
        React.createElement("textarea", {value:desc, onChange:e=>setDesc(e.target.value), rows:3, style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14}})
      ),
      React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}},
        React.createElement("div", null,
          React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "分类"),
          React.createElement("select", {value:catId, onChange:e=>setCatId(e.target.value), style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14}},
            React.createElement("option", {value:""}, "-- 请选择 --"),
            categories.map(c => React.createElement("option", {key:c.id, value:c.id}, c.name))
          )
        ),
        React.createElement("div", {style:{display:"flex",alignItems:"flex-end"}},
          React.createElement("label", {style:{display:"flex",alignItems:"center",gap:8,fontSize:14}},
            React.createElement("input", {type:"checkbox", checked:isActive, onChange:e=>setIsActive(e.target.checked)}),
            " 上架"
          )
        )
      ),
      React.createElement("div", null,
        React.createElement("label", {style:{fontSize:14,fontWeight:500,display:"block",marginBottom:4}}, "尺码 & 库存"),
        sizes.length === 0 && React.createElement("p", {style:{color:"#999",fontSize:13,padding:"8px 0"}}, "暂无尺码，请在下方添加"),
        React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:8}},
          sizes.map(s => React.createElement("span", {key:s, style:{display:"inline-flex",alignItems:"center",gap:4,background:"#f3f4f6",borderRadius:8,padding:"4px 8px",fontSize:14}},
            s, " × ",
            React.createElement("input", {type:"number", min:"0", value:stock[s]??0, onChange:e=>setStock(p=>({...p,[s]:parseInt(e.target.value)||0})), style:{width:48,textAlign:"center",border:"1px solid #ddd",borderRadius:4,fontSize:12}}),
            React.createElement("button", {type:"button", onClick:()=>removeSize(s), style:{background:"none",border:"none",color:"#999",cursor:"pointer",fontSize:14}}, "×")
          ))
        ),
        React.createElement("div", {style:{display:"flex",gap:8,marginTop:8}},
          React.createElement("input", {value:sizeInput, onChange:e=>setSizeInput(e.target.value), onKeyDown:e=>e.key==="Enter"&&(e.preventDefault(),addSize()), placeholder:"输入尺码", style:{width:100,padding:"6px 8px",border:"1px solid #ddd",borderRadius:8,fontSize:14}}),
          React.createElement("button", {type:"button", onClick:addSize, style:{padding:"6px 12px",border:"1px solid #ddd",borderRadius:8,background:"#fff",fontSize:14,cursor:"pointer"}}, "添加尺码")
        )
      ),
      fieldDefs.length > 0 && React.createElement("div", {style:{borderTop:"1px solid #eee",paddingTop:16}},
        React.createElement("h3", {style:{fontSize:14,fontWeight:500,marginBottom:8}}, "增值信息"),
        React.createElement("div", {style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
          fieldDefs.map(d => React.createElement("div", {key:d.id},
            React.createElement("label", {style:{fontSize:12,color:"#666"}}, d.label),
            d.type === "select"
              ? React.createElement("select", {value:fieldVals[d.id]||"", onChange:e=>setFieldVals(p=>({...p,[d.id]:e.target.value})), style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14,marginTop:4}},
                  React.createElement("option", {value:""}, "-- 请选择 --"),
                  (Array.isArray(d.options) ? d.options : []).map(o => React.createElement("option", {key:o, value:o}, o))
                )
              : d.type === "textarea"
                ? React.createElement("textarea", {value:fieldVals[d.id]||"", onChange:e=>setFieldVals(p=>({...p,[d.id]:e.target.value})), rows:2, style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14,marginTop:4}})
                : React.createElement("input", {value:fieldVals[d.id]||"", onChange:e=>setFieldVals(p=>({...p,[d.id]:e.target.value})), style:{width:"100%",padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:14,marginTop:4}})
          ))
        )
      ),
      React.createElement("button", {type:"submit", disabled:saving, style:{padding:"10px 24px",background:saving?"#999":"#ed7912",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:500,cursor:"pointer"}},
        saving ? "保存中..." : "更新商品"
      )
    )
  );
}
