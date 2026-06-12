import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Upload, 
  X, 
  Image as ImageIcon, 
  DollarSign, 
  Tag, 
  ArrowLeft,
  Save,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Product, Measurement } from "../types";

interface ProductFormProps {
  initialProduct?: Product | null;
  measurements: Measurement[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Preset Premium Unsplash Imagery to avoid broken uploads in mock sessions
const PRESET_MOCK_IMAGES = [
  { id: "honey", url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400", label: "Organic Honey" },
  { id: "coffee", url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400", label: "Coffee Beans" },
  { id: "avocado", url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400", label: "Salad Oil" },
  { id: "salt", url: "https://images.unsplash.com/photo-1626128665085-47372729fac7?auto=format&fit=crop&q=80&w=400", label: "Mineral Salt" },
  { id: "mug", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400", label: "Bamboo Mug" },
  { id: "groceries", url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400", label: "Fresh Box" }
];

export default function ProductForm({
  initialProduct,
  measurements,
  onSubmit,
  onCancel,
  isSubmitting
}: ProductFormProps) {
  // Local state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [measurementId, setMeasurementId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // Validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form if we are editing an existing product
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description || "");
      setImageUrl(initialProduct.imageUrl || "");
      setMeasurementId(initialProduct.measurementId);
      setPrice(initialProduct.price.toString());
      setStatus(initialProduct.status);
    } else {
      // Set default measurement as first enabled option
      const enabled = measurements.filter(m => m.status === "Enabled");
      if (enabled.length > 0) {
        setMeasurementId(enabled[0].id);
      }
      // Reset details
      setName("");
      setDescription("");
      setImageUrl(PRESET_MOCK_IMAGES[0].url);
      setPrice("");
      setStatus("Active");
    }
  }, [initialProduct, measurements]);

  // Validations
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      tempErrors.name = "Product Name is required.";
    } else if (name.trim().length < 3) {
      tempErrors.name = "Product Name must be at least 3 characters.";
    }

    if (!measurementId) {
      tempErrors.measurementId = "Please select a Measurement measurement unit.";
    }

    if (!price) {
      tempErrors.price = "Price is required.";
    } else {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        tempErrors.price = "Price must be a valid number greater than 0.";
      }
    }

    if (!imageUrl.trim()) {
      tempErrors.imageUrl = "Product icon or image path is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      measurementId,
      price: Number(price),
      status
    });
  };

  // Safe measurement unit selection filter
  const activeMeasurements = measurements.filter(m => m.status === "Enabled");

  return (
    <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-850/80 shadow-md max-w-3xl mx-auto space-y-6">
      
      {/* Form Title & Context */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-850/60">
        <div className="text-left space-y-0.5">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            {initialProduct ? "Modify Product Details" : "Register New Product"}
          </h3>
          <p className="text-xs text-slate-400">
            {initialProduct ? "Save changes to sync parameters into MySQL table schemas" : "Populate parameters below to generate a new SQL product insertion metadata row"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column Fields */}
          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="form-product-name"
                disabled={isSubmitting}
                type="text"
                placeholder="e.g. Organic Wild Forest Honey"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name 
                    ? "border-rose-800 focus:ring-rose-950/30" 
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                }`}
              />
              {errors.name && (
                <p className="text-rose-455 text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Price (USD $)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  id="form-product-price"
                  disabled={isSubmitting}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="24.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full text-xs p-3 pl-8 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.price 
                      ? "border-rose-800 focus:ring-rose-950/30" 
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            {/* Measurement Dropdown */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#cbd5e1] uppercase tracking-wider flex items-center gap-1">
                <span>Measurement Master Level</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-product-measurement"
                disabled={isSubmitting}
                value={measurementId}
                onChange={(e) => setMeasurementId(e.target.value)}
                className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.measurementId 
                    ? "border-rose-850 focus:ring-rose-950/30 font-bold" 
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25 text-slate-200"
                }`}
              >
                {activeMeasurements.length === 0 ? (
                  <option value="" disabled className="bg-[#020617]">No enabled measurements (Configure in Settings first!)</option>
                ) : (
                  activeMeasurements.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#020617] text-white">{m.name}</option>
                  ))
                )}
              </select>
              {errors.measurementId && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.measurementId}</span>
                </p>
              )}
              <p className="text-[10px] text-slate-500">Loads dynamic active rows mapped from Product Settings.</p>
            </div>

            {/* Status (Active/Inactive) */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 bg-[#020617] hover:bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-semibold select-none flex-1 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Active"}
                    onChange={() => setStatus("Active")}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-emerald-400">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 bg-[#020617] hover:bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-semibold select-none flex-1 transition-colors">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "Inactive"}
                    onChange={() => setStatus("Inactive")}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-rose-455 text-rose-400">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column Fields */}
          <div className="space-y-4">
            
            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Product Description</label>
              <textarea
                id="form-product-description"
                disabled={isSubmitting}
                placeholder="Describe your product catalog item here..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 bg-[#020617] text-white border border-slate-800 focus:border-indigo-550 focus:ring-2 focus:ring-indigo-950/30 rounded-xl focus:outline-none"
              />
            </div>

            {/* Image Upload URL Picker */}
            <div className="space-y-3.5 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Product Image Cover URL</span>
                  <span className="text-indigo-400 font-bold text-[10px] lowercase">preset library below</span>
                </label>
                <input
                  id="form-product-image"
                  disabled={isSubmitting}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.imageUrl 
                      ? "border-rose-800 focus:ring-rose-950/30" 
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                  }`}
                />
              </div>

              {/* Preset Selection Buttons Grid */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-455 text-slate-400 font-bold uppercase tracking-wider">Quick Asset Templates:</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_MOCK_IMAGES.map((img) => (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => setImageUrl(img.url)}
                      className={`p-1 flex flex-col items-center gap-1 border rounded-lg transition-all cursor-pointer ${
                        imageUrl === img.url 
                          ? "border-indigo-600 bg-indigo-950/40 text-indigo-300 font-extrabold" 
                          : "border-slate-800 bg-[#020617] hover:bg-slate-900 text-slate-400 hover:text-white"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-8 h-8 object-cover rounded bg-slate-950" referrerPolicy="no-referrer" />
                      <span className="text-[8px] font-bold tracking-tight truncate max-w-full">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Live Preview */}
              <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden group">
                {imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt="Product Preview Thumbnail" 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      onError={() => {
                        setErrors(prev => ({ ...prev, imageUrlImg: "Image failed load" }));
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-indigo-400 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                      LIVE PREVIEW
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 py-4 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-semibold">Image Preview Container</p>
                    <p className="text-[10px] text-slate-600">Provide URL to inspect assets</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Submit Operations */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-850/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold bg-indigo-650 text-white rounded-xl shadow-md hover:bg-indigo-600 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-indigo-700"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Processing Transaction..." : initialProduct ? "Update Product" : "Insert Product"}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
