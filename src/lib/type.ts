import { Attendee, CtaTypeEnum, User, Webinar } from "@prisma/client";

export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  valid: boolean;
  errors: ValidationErrors;
};

export const validateBasicInfo = (data: {
  webinarName?: string;
  description?: string;
  date?: string;
  time?: string;
  timeFormat?: "AM" | "PM";
}): ValidationResult => {
  const errors: ValidationErrors = {};

  // Only webinarName is required; others are optional with defaults handled elsewhere
  if (!data.webinarName?.trim()) {
    errors.webinarName = "Webinar name is required";
  }

  // If time is provided, validate format; otherwise allow it to be omitted
  if (data.time?.trim()) {
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.time = "Time must be in the format HH:MM ";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCTA = (data: {
  ctaLabel?: string;
  tags?: string[];
  ctaType: CtaTypeEnum;
  aiAgent?: string;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  // Only ensure a CTA type exists; others are optional
  if (!data.ctaType) {
    errors.ctaType = "CTA type is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAdditionalInfo = (data: {
  lockChat?: boolean;
  couponCode?: string;
  couponEnabled?: boolean;
}): ValidationResult => {
  const errors: ValidationErrors = {};

  if (data.couponEnabled && !data.couponCode?.trim()) {
    errors.couponCode = "Coupon code is required when coupon is enabled";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export type AttendanceData = {
  count: number;
  users: Attendee[];
};

export type WebinarWithPresenter = Webinar & {
  presenter: User;
};

export type RecordedWebinarData = Webinar & {
  presenter: {
    id: string;
    name: string;
    stripeConnectId: string | null;
    profileImage: string;
    creatorType: "CONNECTED_STRIPE" | "MANAGED_CREATOR";
  };
};

export type StreamCallRecording = {
  filename: string;
  url: string;
  start_time: string;
  end_time: string;
  session_id: string;
};
