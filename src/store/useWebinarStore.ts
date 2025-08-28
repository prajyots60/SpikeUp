import {
  validateAdditionalInfo,
  validateBasicInfo,
  validateCTA,
  ValidationErrors,
} from "@/lib/type";
import { CtaTypeEnum } from "@prisma/client";
import { create } from "zustand";

export type WebinarFormState = {
  basicInfo: {
    webinarName?: string;
    description?: string;
    date?: string;
    time?: string;
    timeFormat?: "AM" | "PM";
    videoFile?: File | null;
    videoUrl?: string;
    videoKey?: string;
    thumbnailFile?: File | null;
    thumbnailUrl?: string;
    thumbnailKey?: string;
    isPreRecorded?: boolean;
  };
  cta: {
    ctaLabel?: string;
    tags?: string[];
    ctaType: CtaTypeEnum;
    aiAgent?: string;
    priceId?: string;
  };
  additionalInfo: {
    lockChat?: boolean;
    couponCode?: string;
    couponEnabled?: boolean;
  };
};

const initialState: WebinarFormState = {
  basicInfo: {
    webinarName: "",
    description: "",
    date: undefined,
    time: "",
    timeFormat: "AM",
    videoFile: null,
    videoUrl: "",
    videoKey: "",
    thumbnailFile: null,
    thumbnailUrl: "",
    thumbnailKey: "",
    isPreRecorded: false,
  },
  cta: {
    ctaLabel: "",
    tags: [],
    ctaType: "BOOK_A_CALL",
    aiAgent: "",
    priceId: "",
  },
  additionalInfo: {
    lockChat: false,
    couponCode: "",
    couponEnabled: false,
  },
};

type ValidationState = {
  basicInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
  cta: {
    valid: boolean;
    errors: ValidationErrors;
  };
  additionalInfo: {
    valid: boolean;
    errors: ValidationErrors;
  };
};

const initialValidation: ValidationState = {
  basicInfo: {
    valid: true,
    errors: {},
  },
  cta: {
    valid: false,
    errors: {},
  },
  additionalInfo: {
    valid: true,
    errors: {},
  },
};

type WebinarStore = {
  isModalOpen: boolean;
  isComplete: boolean;
  isSubmitting: boolean;
  formData: WebinarFormState;
  validation: ValidationState;

  setModalOpen: (open: boolean) => void;
  setComplete: (complete: boolean) => void;
  setSubmitting: (submitting: boolean) => void;

  updateBasicInfoField: <K extends keyof WebinarFormState["basicInfo"]>(
    field: K,
    value: WebinarFormState["basicInfo"][K]
  ) => void;

  updateCTAField: <K extends keyof WebinarFormState["cta"]>(
    field: K,
    value: WebinarFormState["cta"][K]
  ) => void;

  updateAdditionalInfoField: <
    K extends keyof WebinarFormState["additionalInfo"]
  >(
    field: K,
    value: WebinarFormState["additionalInfo"][K]
  ) => void;

  validateStep: (stepId: keyof WebinarFormState) => boolean;
  getStepValidationErrors: (stepId: keyof WebinarFormState) => ValidationErrors;
  resetForm: () => void;
};

export const useWebinarStore = create<WebinarStore>((set, get) => ({
  isModalOpen: false,
  isComplete: false,
  isSubmitting: false,
  formData: initialState,
  validation: initialValidation,

  setModalOpen: (open: boolean) => set({ isModalOpen: open }),
  setComplete: (complete: boolean) => set({ isComplete: complete }),
  setSubmitting: (submitting: boolean) => set({ isSubmitting: submitting }),

  updateBasicInfoField: (field, value) => {
    set((state) => {
      const newBasicInfo = { ...state.formData.basicInfo, [field]: value };

      const ValidationResult = validateBasicInfo(newBasicInfo);

      return {
        formData: { ...state.formData, basicInfo: newBasicInfo },
        validation: { ...state.validation, basicInfo: ValidationResult },
      };
    });
  },

  updateCTAField: (field, value) => {
    set((state) => {
      const newCTA = { ...state.formData.cta, [field]: value };

      const ValidationResult = validateCTA(newCTA);

      return {
        formData: { ...state.formData, cta: newCTA },
        validation: { ...state.validation, cta: ValidationResult },
      };
    });
  },

  updateAdditionalInfoField: (field, value) => {
    set((state) => {
      const newAdditionalInfo = {
        ...state.formData.additionalInfo,
        [field]: value,
      };

      const ValidationResult = validateAdditionalInfo(newAdditionalInfo);

      return {
        formData: { ...state.formData, additionalInfo: newAdditionalInfo },
        validation: { ...state.validation, additionalInfo: ValidationResult },
      };
    });
  },

  validateStep: (stepId: keyof WebinarFormState) => {
    const { formData } = get();
    let validationResult;

    switch (stepId) {
      case "basicInfo":
        validationResult = validateBasicInfo(formData.basicInfo);
        break;
      case "cta":
        validationResult = validateCTA(formData.cta);
        break;
      case "additionalInfo":
        validationResult = validateAdditionalInfo(formData.additionalInfo);
        break;
    }

    set((state) => {
      return {
        validation: {
          ...state.validation,
          [stepId]: validationResult,
        },
      };
    });

    return validationResult.valid;
  },

  getStepValidationErrors: (stepId: keyof WebinarFormState) => {
    return get().validation[stepId].errors;
  },

  resetForm: () =>
    set({
      isComplete: false,
      isSubmitting: false,
      formData: initialState,
      validation: initialValidation,
    }),
}));
