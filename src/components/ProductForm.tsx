import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  AlertCircle,
  X
} from "lucide-react";
import { Product, Measurement, ProductName, formatProductMeasurement, formatCurrency } from "../types";

interface ProductFormProps {
  initialProduct?: Product | null;
  measurements: Measurement[];
  productNames: ProductName[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ProductForm({
  initialProduct,
  measurements,
  productNames,
  onSubmit,
  onCancel,
  isSubmitting
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [measurementId, setMeasurementId] = useState("");
  const [measurementValue, setMeasurementValue] = useState("1");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description || "");
      setImageUrl(initialProduct.imageUrl || "");
      setImageFileName(initialProduct.imageUrl ? "Current product image" : "");
      setMeasurementId(initialProduct.measurementId);
      setMeasurementValue(initialProduct.measurementValue || "1");
      setPrice(initialProduct.price.toString());
      setStatus(initialProduct.status);
    } else {
      const enabledMeasurements = measurements.filter((m) => m.status === "Enabled");
      if (enabledMeasurements.length > 0) {
        setMeasurementId(enabledMeasurements[0].id);
      }
      const enabledNames = productNames.filter((pn) => pn.status === "Enabled");
      setName(enabledNames.length > 0 ? enabledNames[0].name : "");
      setDescription("");
      setImageUrl("");
      setImageFileName("");
      setMeasurementValue("1");
      setPrice("");
      setStatus("Active");
    }
  }, [initialProduct, measurements, productNames]);

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      tempErrors.name = "Please select a product name from the master list.";
    }
    if (!measurementId) {
      tempErrors.measurementId = "Please select a measurement unit.";
    }
    if (!measurementValue.trim()) {
      tempErrors.measurementValue = "Please enter the volume or quantity (e.g. 1, 2).";
    } else {
      const numValue = Number(measurementValue);
      if (isNaN(numValue) || numValue <= 0) {
        tempErrors.measurementValue = "Volume must be a valid number greater than 0.";
      }
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
      tempErrors.imageUrl = "Please upload a product image.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not load image."));
      };
      img.src = objectUrl;
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, imageUrl: "Please select a valid image file." }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imageUrl: "Image must be smaller than 3 MB." }));
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      setImageUrl(dataUrl);
      setImageFileName(file.name);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch {
      setErrors((prev) => ({ ...prev, imageUrl: "Failed to process image. Try another file." }));
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setImageFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      measurementId,
      measurementValue: measurementValue.trim(),
      price: Number(price),
      status
    });
  };

  const activeMeasurements = measurements.filter((m) => m.status === "Enabled");
  const activeProductNames = productNames.filter((pn) => pn.status === "Enabled");
  const selectedMeasurement = measurements.find((m) => m.id === measurementId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-left space-y-0.5">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            {initialProduct ? "Modify Product Details" : "Register New Product"}
          </h3>
          <p className="text-xs text-slate-400">
            {initialProduct
              ? "Update product details and preview changes before saving."
              : "Fill in product details on the left and preview on the right."}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Form */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-850/80 shadow-md space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 pb-2 border-b border-slate-850">
              Product Details
            </h4>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                id="form-product-name"
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.name
                    ? "border-rose-800 focus:ring-rose-950/30"
                    : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                }`}
              >
                {activeProductNames.length === 0 ? (
                  <option value="" disabled className="bg-[#020617]">
                    No enabled product names (Add names in Product Name master first!)
                  </option>
                ) : (
                  <>
                    {!activeProductNames.some((pn) => pn.name === name) && name && (
                      <option value={name} className="bg-[#020617] text-white">
                        {name}
                      </option>
                    )}
                    {activeProductNames.map((pn) => (
                      <option key={pn.id} value={pn.name} className="bg-[#020617] text-white">
                        {pn.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.name && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Price (INR ₹)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
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

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Measurement</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Volume / Quantity
                  </label>
                  <input
                    id="form-product-measurement-value"
                    disabled={isSubmitting}
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="e.g. 1, 2"
                    value={measurementValue}
                    onChange={(e) => setMeasurementValue(e.target.value)}
                    className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.measurementValue
                        ? "border-rose-800 focus:ring-rose-950/30"
                        : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                    }`}
                  />
                  {errors.measurementValue && (
                    <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.measurementValue}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Unit
                  </label>
                  <select
                    id="form-product-measurement"
                    disabled={isSubmitting}
                    value={measurementId}
                    onChange={(e) => setMeasurementId(e.target.value)}
                    className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 cursor-pointer ${
                      errors.measurementId
                        ? "border-rose-800 focus:ring-rose-950/30"
                        : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                    }`}
                  >
                    {activeMeasurements.length === 0 ? (
                      <option value="" disabled className="bg-[#020617]">
                        No enabled measurements (Configure in Settings first!)
                      </option>
                    ) : (
                      activeMeasurements.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#020617] text-white">
                          {m.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.measurementId && (
                    <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.measurementId}</span>
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Example: volume <span className="text-slate-400">1</span> + unit{" "}
                <span className="text-slate-400">Kilogram (Kg)</span> →{" "}
                <span className="text-slate-400">1 Kilogram (Kg)</span>
              </p>
            </div>

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
                  <span className="text-rose-400">Inactive</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Product Description
              </label>
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

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Image</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                id="form-product-image"
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`w-full p-6 bg-[#020617] border-2 border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                  errors.imageUrl
                    ? "border-rose-800 hover:border-rose-700"
                    : "border-slate-700 hover:border-indigo-600 hover:bg-slate-900/40"
                }`}
              >
                <Upload className="w-8 h-8 text-slate-500" />
                <p className="text-xs font-semibold text-slate-300">Click to upload product image</p>
                <p className="text-[10px] text-slate-500">PNG, JPG or WEBP — max 3 MB</p>
              </div>
              {imageFileName && (
                <div className="flex items-center justify-between p-2 px-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-300 truncate">{imageFileName}</span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {errors.imageUrl && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.imageUrl}</span>
                </p>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-850/80 shadow-md lg:sticky lg:top-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 pb-2 border-b border-slate-850 mb-4">
              Product Preview
            </h4>

            <div className="relative aspect-square w-full bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden mb-4">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={name || "Product preview"}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-indigo-400 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
                    LIVE PREVIEW
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon className="w-12 h-12 text-slate-600" />
                  <p className="text-xs font-semibold">No image uploaded yet</p>
                  <p className="text-[10px] text-slate-600">Upload an image to see preview</p>
                </div>
              )}
            </div>

            <div className="space-y-3 text-left">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Product Name</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {name || "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {price ? formatCurrency(Number(price)) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Measurement</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {formatProductMeasurement(measurementValue, selectedMeasurement?.name)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status</p>
                <span
                  className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    status === "Active"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                      : "bg-rose-950/40 text-rose-400 border-rose-900/50"
                  }`}
                >
                  {status}
                </span>
              </div>
              {description && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Description</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
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
            <span>
              {isSubmitting
                ? "Processing Transaction..."
                : initialProduct
                  ? "Update Product"
                  : "Insert Product"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
