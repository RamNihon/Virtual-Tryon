import { useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import API_URL from "../../../api";
import WizardProgressBar from "./WizardProgressBar";
import Step1BasicInfo from "./Step1BasicInfo";
import Step2Pricing from "./Step2Pricing";
import Step3Attributes from "./Step3Attributes";
import Step4Images from "./Step4Images";
import PublishSuccess from "./PublishSuccess";

const EMPTY_FORM = {
  name: "",
  brandName: "",
  price: "",
  originalPrice: "",
  description: "",
  category: "upper_body",
  productUrl: "",
  sizes: [],
  highlights: {},
  seqImages: [],
};

/*
  ─── GARMENT ADD WIZARD ─────────────────────────────────────
  4-step replacement for the old single long-scroll form.
  Submits to the exact same POST /api/seller/products endpoint
  with the exact same FormData shape — only the UX changed, not
  the backend contract.

  Per-step validation: "Next" is blocked with an inline error
  if the current step's required fields aren't filled, so a
  seller never reaches Step 4 only to be bounced all the way
  back to Step 1.
--------------------------------------------------------------*/
export default function GarmentWizard({ token, shopUrl, onClose, onPublished }) {
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
      if (!form.name || form.name.trim().length < 2) {
        newErrors.name = "Product name must be at least 2 characters long!";
      }
      if (!form.description || form.description.trim().length < 20) {
        newErrors.description = "Description must be at least 20 characters long!";
      }
    }

    if (stepNum === 2) {
      const priceVal = parseFloat(form.price);
      if (!form.price || isNaN(priceVal) || priceVal <= 0) {
        newErrors.price = "Please enter a valid price greater than 0!";
      }
    }

    if (stepNum === 4) {
      const totalImages = (form.seqImages || []).length;
      if (totalImages < 2) {
        newErrors.images = "You need to upload a minimum of 2 photos!";
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
    // Only allow jumping to steps already completed — validate
    // every step in between so nothing gets silently skipped.
    for (let s = 1; s < targetStep; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setStep(targetStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();

      (form.seqImages || []).forEach((img) => {
        if (img) formData.append("productImages", img);
      });

      formData.append("name", form.name);
      formData.append("brandName", form.brandName || "");
      formData.append("description", form.description || "");
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice || 0);
      formData.append("category", form.category);
      formData.append("productUrl", form.productUrl || "");
      formData.append("sizes", JSON.stringify(form.sizes || []));
      formData.append("highlights", JSON.stringify(form.highlights || {}));

      await axios.post(`${API_URL}/api/seller/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPublishedProduct({ name: form.name });
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...err.response.data.fieldErrors }));
        // Field errors always belong to Step 1, 2, or 4 in this
        // form — jump back to whichever one is now failing so the
        // seller immediately sees why the backend rejected it.
        const fe = err.response.data.fieldErrors;
        if (fe.name || fe.description) setStep(1);
        else if (fe.price) setStep(2);
        else if (fe.images) setStep(4);
      } else {
        setSubmitError(err.response?.data?.message || "Something went wrong!");
      }
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

  // ─── Success screen takes over the whole modal ─────────────
  if (publishedProduct) {
    return (
      <PublishSuccess
        productName={publishedProduct.name}
        shopUrl={shopUrl}
        onAddAnother={() => {
          resetForNewProduct();
          onPublished(); // refresh the product list in the background
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
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-1">
        <h2 className="text-lg font-bold text-gray-800">Add New Product</h2>
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

      {/* Step content */}
      <div className="px-6 pb-2 max-h-[55vh] overflow-y-auto">
        {step === 1 && (
          <Step1BasicInfo
            form={form}
            setForm={setForm}
            errors={errors}
            clearError={clearError}
          />
        )}
        {step === 2 && (
          <Step2Pricing
            form={form}
            setForm={setForm}
            errors={errors}
            clearError={clearError}
          />
        )}
        {step === 3 && <Step3Attributes form={form} setForm={setForm} />}
        {step === 4 && (
          <Step4Images form={form} setForm={setForm} errors={errors} />
        )}
      </div>

      {/* Footer nav */}
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
            {submitting ? "Publishing..." : "Publish Product"}
          </button>
        )}
      </div>
    </div>
  );
}
