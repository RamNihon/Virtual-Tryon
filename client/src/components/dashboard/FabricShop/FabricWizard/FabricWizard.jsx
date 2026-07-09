import { useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import API_URL from "../../../../api";
import WizardProgressBar from "../../GarmentWizard/WizardProgressBar";
import FabricStep1Basic from "./FabricStep1Basic";
import FabricStep2Pricing from "./FabricStep2Pricing";
import FabricStep3Attributes from "./FabricStep3Attributes";
import FabricStep4Images from "./FabricStep4Images";
import PublishSuccess from "../../GarmentWizard/PublishSuccess";

const EMPTY_FORM = {
  name: "",
  fabricType: "",
  brand: "",
  material: "",
  description: "",
  price: "",
  pricePerMeter: "",
  colors: [],
  occasion: "",
  pattern: "",
  garmentTypes: [],
  fabricImages: [],
};

/*
  ─── FABRIC ADD WIZARD ──────────────────────────────────────
  Same 4-step shell as the Garment wizard (shared progress bar
  + success screen components), but its own field set and
  validation rules — colors and garment types are required
  here, matching the original FabricDashboard form exactly.

  Submits to POST /api/fabric/products with the exact same
  FormData field names as before (fabricImages, availableGarments,
  colors as JSON, etc.) — no backend changes needed.
--------------------------------------------------------------*/
export default function FabricWizard({ token, shopUrl, onClose, onPublished }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [publishedProduct, setPublishedProduct] = useState(null);

  const clearError = (field) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!form.name || !form.name.trim()) {
        newErrors.name = "Fabric name is necessary!";
      }
      if (!form.description || !form.description.trim()) {
        newErrors.description = "Description is necessary!";
      }
    }

    if (stepNum === 2) {
      if (!form.price) {
        newErrors.price = "Price is required!";
      }
      if (!form.pricePerMeter) {
        newErrors.pricePerMeter = "Price per meter is required!";
      }
    }

    if (stepNum === 3) {
      if (!form.colors || form.colors.length === 0) {
        newErrors.colors = "Select at least one color!";
      }
      if (!form.garmentTypes || form.garmentTypes.length === 0) {
        newErrors.garments = "Choose at least one garment type!";
      }
    }

    if (stepNum === 4) {
      if (!form.fabricImages || form.fabricImages.length === 0) {
        newErrors.images = "Fabric photo is necessary!";
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const jumpToStep = (targetStep) => {
    for (let s = 1; s < targetStep; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = async () => {
    // Step 3's validation (colors/garments) also needs to pass even
    // though the seller is submitting from Step 4 — check both.
    const step3Ok = validateStep(3);
    const step4Ok = validateStep(4);
    if (!step3Ok || !step4Ok) {
      if (!step3Ok) setStep(3);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();

      (form.fabricImages || []).forEach((img) => {
        if (img) formData.append("fabricImages", img);
      });

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("pricePerMeter", form.pricePerMeter);
      formData.append("fabricType", form.fabricType || "");
      formData.append("description", form.description);
      (form.garmentTypes || []).forEach((g) =>
        formData.append("availableGarments", g),
      );
      formData.append("brand", form.brand || "");
      formData.append("material", form.material || "");
      formData.append("occasion", form.occasion || "");
      formData.append("pattern", form.pattern || "");
      formData.append("colors", JSON.stringify(form.colors || []));

      await axios.post(`${API_URL}/api/fabric/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPublishedProduct({ name: form.name });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Something went wrong!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForNewProduct = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setStep(1);
    setPublishedProduct(null);
  };

  if (publishedProduct) {
    return (
      <PublishSuccess
        productName={publishedProduct.name}
        shopUrl={shopUrl}
        onAddAnother={() => {
          resetForNewProduct();
          onPublished();
        }}
        onViewShop={() => {
          onPublished();
          window.open(shopUrl, "_blank", "noopener,noreferrer");
        }}
        onDone={() => {
          onPublished();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-6 pt-5 pb-1">
        <h2 className="text-lg font-bold text-gray-800">Add Fabric Product</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <div className="px-6 pt-4">
        <WizardProgressBar currentStep={step} onStepClick={jumpToStep} />
      </div>

      {submitError && (
        <div className="mx-6 mb-3 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}
      {errors.garments && step === 3 && (
        <div className="mx-6 mb-3 bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">
          ⚠️ {errors.garments}
        </div>
      )}

      <div className="px-6 pb-2 max-h-[55vh] overflow-y-auto">
        {step === 1 && (
          <FabricStep1Basic
            form={form}
            setForm={setForm}
            errors={errors}
            clearError={clearError}
          />
        )}
        {step === 2 && (
          <FabricStep2Pricing
            form={form}
            setForm={setForm}
            errors={errors}
            clearError={clearError}
          />
        )}
        {step === 3 && <FabricStep3Attributes form={form} setForm={setForm} />}
        {step === 4 && (
          <FabricStep4Images form={form} setForm={setForm} errors={errors} />
        )}
      </div>

      <div className="flex gap-3 px-6 py-4 border-t border-gray-100 mt-2">
        {step > 1 && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 px-5 py-2.5 rounded-full
                       text-sm font-semibold text-gray-600 bg-gray-100
                       hover:bg-gray-200 transition"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            Back
          </button>
        )}

        <div className="flex-1" />

        {step < 4 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-6 py-2.5 rounded-full
                       text-sm font-semibold text-white bg-purple-700
                       hover:bg-purple-800 transition"
          >
            Next
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-full text-sm font-semibold
                       text-white bg-gradient-to-r from-purple-600
                       to-fuchsia-500 hover:shadow-md transition-all
                       disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Fabric"}
          </button>
        )}
      </div>
    </div>
  );
}
