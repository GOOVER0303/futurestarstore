"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ChevronLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/shop/CartContext";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(setProduct);
  }, [params.id]);

  if (!product) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-gray-100 rounded-xl" />
        <div className="h-6 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );

  function handleAddToCart() {
    if (!product.sizes?.length || !selectedSize) {
      if (product.sizes?.length) { toast.error("请选择尺码"); return; }
      addItem({ productId: product.id, title: product.title, price: product.price, image: product.images?.[0] || "", size: "均码", quantity });
    } else {
      addItem({ productId: product.id, title: product.title, price: product.price, image: product.images?.[0] || "", size: selectedSize, quantity });
    }
    toast.success("已加入购物车");
  }

  const stock = product.stock || {};
  const hasSizes = product.sizes?.length > 0;

  // Collect custom fields
  const customFields = product.customFields || {};
  const fieldEntries = Object.entries(customFields).filter(([_, v]) => v);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-brand-500">
        <ChevronLeft size={16} /> 返回
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-3">
            {product.images?.[activeImg] ? (
              <img src={product.images[activeImg]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">暂无图片</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === activeImg ? "border-brand-500" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand-500">¥{product.price.toFixed(2)}</span>
            </div>
          </div>

          {product.description && <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>}

          {/* Sizes */}
          {hasSizes && (
            <div>
              <p className="text-sm font-medium mb-2">尺码</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => {
                  const st = stock[s] ?? 0;
                  return (
                    <button key={s} onClick={() => st > 0 && setSelectedSize(s)}
                      disabled={st <= 0}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors
                        ${st <= 0 ? "bg-gray-50 text-gray-300 border-gray-200 line-through cursor-not-allowed" :
                          selectedSize === s ? "bg-brand-500 text-white border-brand-500" : "bg-white border-gray-200 hover:border-brand-500"}`}>
                      {s}{st <= 0 ? " (售罄)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-2">数量</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"><Minus size={14} /></button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(q => q+1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"><Plus size={14} /></button>
            </div>
          </div>

          {/* Custom fields */}
          {fieldEntries.length > 0 && (
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {fieldEntries.map(([key, value]) => (
                <div key={key} className="flex text-sm">
                  <span className="text-gray-400 w-20 flex-shrink-0">{key}</span>
                  <span className="text-gray-700">{value as string}</span>
                </div>
              ))}
            </div>
          )}

          <Button size="lg" onClick={handleAddToCart} className="w-full">
            <ShoppingCart size={18} className="mr-2" />加入购物车
          </Button>
        </div>
      </div>
    </div>
  );
}
