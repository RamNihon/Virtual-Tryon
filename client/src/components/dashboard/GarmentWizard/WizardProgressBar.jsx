import { Check } from "lucide-react";

/*
  ─── WIZARD PROGRESS BAR ────────────────────────────────────
  Shows the 4 steps with the current one highlighted. Completed
  steps get a checkmark and are clickable so the seller can jump
  back without losing anything — steps ahead of the current one
  stay locked until reached, since their content depends on
  earlier answers being valid.
--------------------------------------------------------------*/
const STEPS = [
  { num: 1, label: "Basic Info" },
  { num: 2, label: "Pricing" },
  { num: 3, label: "Attributes" },
  { num: 4, label: "Images" },
];

export default function WizardProgressBar({ currentStep, onStepClick }) {
  return (
    <div className="flex items-center mb-6">
      {STEPS.map((step, i) => {
        const isDone = step.num < currentStep;
        const isActive = step.num === currentStep;
        const isClickable = step.num <= currentStep;

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.num)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center
                            text-xs font-bold transition-colors
                            ${
                              isDone
                                ? "bg-purple-600 text-white"
                                : isActive
                                ? "bg-purple-600 text-white ring-4 ring-purple-100"
                                : "bg-gray-100 text-gray-400"
                            }`}
              >
                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : step.num}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${
                  isActive ? "text-purple-700" : isDone ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </button>

            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  isDone ? "bg-purple-600" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
