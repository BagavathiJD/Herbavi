import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  AlertCircle,
  X
} from "lucide-react";
import { Product, Measurement, ProductName, PRODUCT_CATEGORIES, normalizeProductCategory, formatProductMeasurement, formatCurrency, getProductDiscountPercent, calculateDiscountPrice, type ProductCategory } from "../types";

interface ProductFormProps {
  initialProduct?: Product | null;
  measurements: Measurement[];
  productNames: ProductName[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const GALLERY_SLOT_COUNT = 4;

export default function ProductForm({
  initialProduct,
  measurements,
  productNames,
  onSubmit,
  onCancel,
  isSubmitting
}: ProductFormProps) {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>(Array(GALLERY_SLOT_COUNT).fill(""));
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>(Array(GALLERY_SLOT_COUNT).fill(""));
  const [previewIndex, setPreviewIndex] = useState(0);
  const [measurementId, setMeasurementId] = useState("");
  const [measurementValue, setMeasurementValue] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [stock, setStock] = useState("100");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const initialFormKey = initialProduct
    ? [
        initialProduct.id,
        initialProduct.category,
        initialProduct.name,
        initialProduct.description,
        initialProduct.imageUrl,
        ...(initialProduct.galleryImages ?? []),
        initialProduct.measurementId,
        initialProduct.measurementValue,
        initialProduct.price,
        initialProduct.originalPrice ?? "",
        initialProduct.stock ?? 100,
        initialProduct.status,
      ].join("|")
    : "new";

  useEffect(() => {
    if (initialProduct) {
      const existing =
        initialProduct.galleryImages && initialProduct.galleryImages.length > 0
          ? initialProduct.galleryImages
          : initialProduct.imageUrl
            ? [initialProduct.imageUrl]
            : [];
      const slots = Array(GALLERY_SLOT_COUNT)
        .fill("")
        .map((_, index) => existing[index] ?? "");
      setName(initialProduct.name);
      setDescription(initialProduct.description || "");
      setGalleryImages(slots);
      setGalleryFileNames(
        slots.map((item, index) => (item ? `Image ${index + 1}` : ""))
      );
      setPreviewIndex(0);
      setMeasurementId(initialProduct.measurementId);
      setMeasurementValue(initialProduct.measurementValue || "1");
      const resolvedActual =
        initialProduct.originalPrice != null && initialProduct.originalPrice > initialProduct.price
          ? initialProduct.originalPrice
          : Math.ceil(initialProduct.price * 1.33);
      setActualPrice(resolvedActual.toString());
      setDiscountPercent(
        getProductDiscountPercent(resolvedActual, initialProduct.price)?.toString() ?? ""
      );
      setStock(String(initialProduct.stock ?? 100));
      setStatus(initialProduct.status);
      setCategory(normalizeProductCategory(initialProduct.category));
    } else {
      setName("");
      setDescription("");
      setGalleryImages(Array(GALLERY_SLOT_COUNT).fill(""));
      setGalleryFileNames(Array(GALLERY_SLOT_COUNT).fill(""));
      setPreviewIndex(0);
      setMeasurementId("");
      setMeasurementValue("");
      setActualPrice("");
      setDiscountPercent("");
      setStock("100");
      setStatus("Active");
      setCategory("");
    }
  }, [initialFormKey]);

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      tempErrors.name = initialProduct
        ? "Product name is required."
        : "Please enter a product name.";
    }
    if (!category) {
      tempErrors.category = "Please select a category.";
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
    if (!actualPrice) {
      tempErrors.actualPrice = "Actual price is required.";
    } else {
      const numActual = Number(actualPrice);
      if (isNaN(numActual) || numActual <= 0) {
        tempErrors.actualPrice = "Actual price must be a valid number greater than 0.";
      }
    }
    if (!discountPercent) {
      tempErrors.discountPercent = "Discount percentage is required.";
    } else {
      const numPercent = Number(discountPercent);
      if (isNaN(numPercent) || numPercent <= 0 || numPercent >= 100) {
        tempErrors.discountPercent = "Discount must be between 1 and 99 percent.";
      }
    }
    if (!stock.trim()) {
      tempErrors.stock = "Stock quantity is required.";
    } else {
      const numStock = Math.floor(Number(stock));
      if (isNaN(numStock) || numStock < 0) {
        tempErrors.stock = "Stock must be a valid number of 0 or greater.";
      }
    }
    if (galleryImages.every((item) => !item.trim())) {
      tempErrors.imageUrl = "Please upload at least one product image.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const imageHasTransparency = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): boolean => {
    const { data } = ctx.getImageData(0, 0, width, height);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true;
    }
    return false;
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

        const preserveAlpha =
          file.type === "image/png" ||
          imageHasTransparency(ctx, canvas.width, canvas.height);

        resolve(
          preserveAlpha
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 0.82)
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not load image."));
      };
      img.src = objectUrl;
    });

  const handleImageUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      setGalleryImages((prev) => {
        const next = [...prev];
        next[slotIndex] = dataUrl;
        return next;
      });
      setGalleryFileNames((prev) => {
        const next = [...prev];
        next[slotIndex] = file.name;
        return next;
      });
      setPreviewIndex(slotIndex);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch {
      setErrors((prev) => ({ ...prev, imageUrl: "Failed to process image. Try another file." }));
    }
  };

  const clearImage = (slotIndex: number) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      next[slotIndex] = "";
      return next;
    });
    setGalleryFileNames((prev) => {
      const next = [...prev];
      next[slotIndex] = "";
      return next;
    });
    if (fileInputRefs.current[slotIndex]) {
      fileInputRefs.current[slotIndex]!.value = "";
    }
    setPreviewIndex((current) => {
      const firstFilled = galleryImages.findIndex((item, index) => index !== slotIndex && item);
      return firstFilled >= 0 ? firstFilled : 0;
    });
  };

  const uploadedImages = galleryImages.filter((item) => item.trim());
  const previewImage = galleryImages[previewIndex] || uploadedImages[0] || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageUrl: uploadedImages[0],
      galleryImages: uploadedImages,
      measurementId,
      measurementValue: measurementValue.trim(),
      price: calculateDiscountPrice(Number(actualPrice), Number(discountPercent)),
      originalPrice: Number(actualPrice),
      stock: Math.floor(Number(stock)),
      status,
      category
    });
  };

  const activeMeasurements = measurements.filter((m) => m.status === "Enabled");
  const selectedMeasurement = measurements.find((m) => m.id === measurementId);
  const computedDiscountPrice = useMemo(() => {
    const numActual = Number(actualPrice);
    const numPercent = Number(discountPercent);
    if (
      !actualPrice ||
      !discountPercent ||
      isNaN(numActual) ||
      isNaN(numPercent) ||
      numActual <= 0 ||
      numPercent <= 0 ||
      numPercent >= 100
    ) {
      return null;
    }
    return calculateDiscountPrice(numActual, numPercent);
  }, [actualPrice, discountPercent]);

  const previewDiscountPercent = Number(discountPercent);
  const isEditing = !!initialProduct;

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {/* Left: Form — fixed on desktop */}
          <div className="lg:sticky lg:top-0 lg:self-start z-10">
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-850/80 shadow-md space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 pb-2 border-b border-slate-850">
              Product Details
            </h4>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Name</span>
                <span className="text-rose-500">*</span>
              </label>
              {isEditing ? (
                <input
                  id="form-product-name"
                  type="text"
                  disabled
                  value={name}
                  className="w-full text-xs p-3 bg-[#020617] text-slate-400 border border-slate-800 rounded-xl cursor-not-allowed opacity-80"
                />
              ) : (
                <input
                  id="form-product-name"
                  disabled={isSubmitting}
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-rose-800 focus:ring-rose-950/30"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                  }`}
                />
              )}
              {errors.name && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
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
                    placeholder="Enter volume or quantity"
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
                      <>
                        <option value="" disabled className="bg-[#020617] text-slate-500">
                          Select item
                        </option>
                        {activeMeasurements.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#020617] text-white">
                            {m.name}
                          </option>
                        ))}
                      </>
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
              <label htmlFor="form-product-category" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Category
              </label>
              <select
                id="form-product-category"
                disabled={isSubmitting}
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.category
                    ? "border-rose-800 focus:ring-rose-950/30"
                    : "border-slate-800 focus:border-indigo-550 focus:ring-indigo-950/30"
                }`}
              >
                <option value="" disabled className="bg-[#020617] text-slate-500">
                  Select item
                </option>
                {PRODUCT_CATEGORIES.map((option) => (
                  <option key={option} value={option} className="bg-[#020617] text-white">
                    {option}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.category}</span>
                </p>
              )}
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

            <div className="pt-2 border-t border-slate-850 space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                Pricing &amp; Discount
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Actual Price (INR ₹)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      id="form-product-actual-price"
                      disabled={isSubmitting}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="399.00"
                      value={actualPrice}
                      onChange={(e) => setActualPrice(e.target.value)}
                      className={`w-full text-xs p-3 pl-8 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.actualPrice
                          ? "border-rose-800 focus:ring-rose-950/30"
                          : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                      }`}
                    />
                  </div>
                  {errors.actualPrice && (
                    <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.actualPrice}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Discount (%)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="form-product-discount-percent"
                      disabled={isSubmitting}
                      type="number"
                      step="0.01"
                      min="1"
                      max="99"
                      placeholder="25"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className={`w-full text-xs p-3 pr-10 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.discountPercent
                          ? "border-rose-800 focus:ring-rose-950/30"
                          : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                  </div>
                  {errors.discountPercent && (
                    <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.discountPercent}</span>
                    </p>
                  )}
                </div>
              </div>

              {computedDiscountPrice != null && previewDiscountPercent > 0 && (
                <p className="text-[11px] text-emerald-400 font-semibold">
                  Customer will see ({Math.round(previewDiscountPercent)}% OFF) — Rs. {computedDiscountPrice.toFixed(0)} from Rs. {Number(actualPrice).toFixed(0)}
                </p>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <span>Stock Quantity</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-product-stock"
                  disabled={isSubmitting}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="100"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`w-full text-xs p-3 bg-[#020617] text-white border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.stock
                      ? "border-rose-800 focus:ring-rose-950/30"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-indigo-950/25"
                  }`}
                />
                {errors.stock && (
                  <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.stock}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Product Images</span>
                <span className="text-rose-500">*</span>
              </label>
              <p className="text-[10px] text-slate-500">
                Upload up to 4 images. The first image is used as the main product photo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: GALLERY_SLOT_COUNT }).map((_, slotIndex) => (
                  <div key={slotIndex} className="space-y-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[slotIndex] = el;
                      }}
                      id={`form-product-image-${slotIndex}`}
                      type="file"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={(event) => handleImageUpload(slotIndex, event)}
                      className="hidden"
                    />
                    <div
                      onClick={() => !isSubmitting && fileInputRefs.current[slotIndex]?.click()}
                      className={`relative aspect-square w-full bg-[#020617] border-2 border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden ${
                        errors.imageUrl && slotIndex === 0
                          ? "border-rose-800 hover:border-rose-700"
                          : "border-slate-700 hover:border-indigo-600 hover:bg-slate-900/40"
                      }`}
                    >
                      {galleryImages[slotIndex] ? (
                        <>
                          <img
                            src={galleryImages[slotIndex]}
                            alt={`Product image ${slotIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-slate-950/80 text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded">
                            {slotIndex === 0 ? "Main" : `Image ${slotIndex + 1}`}
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-500" />
                          <p className="text-[10px] font-semibold text-slate-400">
                            {slotIndex === 0 ? "Main image" : `Image ${slotIndex + 1}`}
                          </p>
                        </>
                      )}
                    </div>
                    {galleryFileNames[slotIndex] && (
                      <div className="flex items-center justify-between p-2 px-3 bg-slate-900/50 border border-slate-800 rounded-lg">
                        <span className="text-[10px] text-slate-300 truncate">{galleryFileNames[slotIndex]}</span>
                        <button
                          type="button"
                          onClick={() => clearImage(slotIndex)}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.imageUrl && (
                <p className="text-rose-400 text-[11px] flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.imageUrl}</span>
                </p>
              )}
            </div>
          </div>
          </div>

          {/* Right: Preview — scrollable on desktop */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-850/80 shadow-md lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 pb-2 border-b border-slate-850 mb-4">
              Product Preview
            </h4>

            <div className="relative aspect-square w-full bg-[#020617] border border-slate-800 rounded-2xl overflow-hidden mb-4">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
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

            {uploadedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {galleryImages.map((item, index) =>
                  item ? (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border ${
                        previewIndex === index ? "border-indigo-400" : "border-slate-800"
                      }`}
                    >
                      <img src={item} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ) : null
                )}
              </div>
            )}

            <div className="space-y-3 text-left">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Product Name</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  {name || "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Selling Price</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {computedDiscountPrice != null ? formatCurrency(computedDiscountPrice) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Actual Price</p>
                  <p className="text-sm font-semibold text-slate-400 mt-0.5 line-through">
                    {actualPrice ? formatCurrency(Number(actualPrice)) : "—"}
                  </p>
                </div>
              </div>
              {previewDiscountPercent > 0 && (
                <p className="text-xs font-bold text-orange-400">({Math.round(previewDiscountPercent)}% OFF)</p>
              )}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Measurement</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">
                  {formatProductMeasurement(measurementValue, selectedMeasurement?.name)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Category</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">{category || "—"}</p>
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
            className="px-6 py-2.5 text-xs font-bold bg-[#1f3a28] text-white rounded-xl shadow-md hover:bg-[#172d22] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-[#1f3a28]"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? initialProduct
                  ? "Updating..."
                  : "Adding..."
                : initialProduct
                  ? "Update Product"
                  : "Add Product"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
