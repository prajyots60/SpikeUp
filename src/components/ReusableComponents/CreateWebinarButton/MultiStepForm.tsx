import { useWebinarStore } from "@/store/useWebinarStore";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronRight, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createWebinar } from "@/actions/webinar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import GlobalUploadStatus from "./GlobalUploadStatus";
import { useVideoUpload } from "@/hooks/useVideoUpload";

type Step = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
};

type Props = {
  steps: Step[];
  onComplete: (id: string) => void;
};

const MultiStepForm = ({ steps, onComplete }: Props) => {
  const { formData, validateStep, isSubmitting, setSubmitting, setModalOpen } =
    useWebinarStore();

  const { deleteVideoFromCloudflare, clearVideoUpload } = useVideoUpload();

  const router = useRouter();

  // Get video upload state
  const isVideoUploading = formData.basicInfo.isVideoUploading || false;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Cleanup video on page unload/refresh if webinar wasn't completed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const videoKey = formData.basicInfo.videoKey;
      if (videoKey) {
        // Use sendBeacon for cleanup on page unload
        navigator.sendBeacon(
          "/api/upload/delete",
          JSON.stringify({ key: videoKey })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData.basicInfo.videoKey]);

  const handleBack = async () => {
    if (isFirstStep) {
      // Clean up any uploaded video before closing modal
      const videoKey = formData.basicInfo.videoKey;
      if (videoKey) {
        console.log("Cleaning up video before closing modal");
        await deleteVideoFromCloudflare(videoKey);
        await clearVideoUpload();
      }
      setModalOpen(false);
    } else {
      setCurrentStepIndex(currentStepIndex - 1);
      setValidationErrors(null);
    }
  };
  const handleNext = async () => {
    setValidationErrors(null);
    const isValid = validateStep(currentStep.id as keyof typeof formData);
    if (!isValid) {
      setValidationErrors("Please fill out all required fields correctly.");
      return;
    }

    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps([...completedSteps, currentStep.id]);
    }

    if (isLastStep) {
      setSubmitting(true);
      try {
        // Clean form data by removing File objects to prevent body size limit errors
        const cleanedFormData = {
          ...formData,
          basicInfo: {
            ...formData.basicInfo,
            // Remove File objects - keep only URLs and keys
            videoFile: undefined,
            thumbnailFile: undefined,
            // Remove XMLHttpRequest reference
            uploadXhr: undefined,
          }
        };

        console.log("Sending cleaned form data:", cleanedFormData);
        
        const result = await createWebinar(cleanedFormData);
        if (result.status === 200 && result.webinarId) {
          // SUCCESS: Don't clean up video - it's now part of the webinar
          toast.success("Your webinar has been created successfully!");
          onComplete(result.webinarId);
        } else {
          // FAILURE: Clean up video since webinar creation failed
          const videoKey = formData.basicInfo.videoKey;
          if (videoKey) {
            console.log("Webinar creation failed, cleaning up video");
            await deleteVideoFromCloudflare(videoKey);
            await clearVideoUpload();
          }
          toast.error(result.message || "Failed to create webinar");
        }

        router.refresh();
      } catch (error) {
        console.error("Error submitting form:", error);

        // FAILURE: Clean up video since webinar creation failed
        const videoKey = formData.basicInfo.videoKey;
        if (videoKey) {
          console.log("Webinar creation error, cleaning up video");
          await deleteVideoFromCloudflare(videoKey);
          await clearVideoUpload();
        }

        toast.error(
          "An error occurred while submitting the form. Please try again."
        );
        setValidationErrors(
          "An error occurred while submitting the form. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center bg-[#27272A]/20 border border-border rounded-3xl overflow-hidden max-w-6xl mx-auto backdrop-blur-[106px]">
      <div className="flex items-center justify-start">
        <div className="w-full md:w-1/3 p-6">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <div key={step.id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor:
                            isCurrent || isCompleted
                              ? "rgb(147, 51, 234)"
                              : "rgb(31, 41, 55)", // slate-800
                          scale: [isCurrent && !isCompleted ? 0.8 : 1, 1],
                          transition: { duration: 0.3 },
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "2rem",
                          height: "2rem",
                          borderRadius: "9999px",
                          zIndex: 10,
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {isCompleted ? (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                color: "white",
                                fontSize: "1.125rem",
                                fontWeight: "bold",
                              }}
                            >
                              <Check className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="number"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                color: "white",
                                fontSize: "1.125rem",
                                fontWeight: "bold",
                              }}
                            >
                              <Check className="w-5 h-5 text-white/50" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {index < steps.length - 1 && (
                        <div className="absolute top-8 left-4 w-0.5 h-16 bg-gray-700 overflow-hidden">
                          <motion.div
                            initial={{
                              height: isPast || isCompleted ? "100%" : "0%",
                            }}
                            animate={{
                              height: isPast || isCompleted ? "100%" : "0%",
                              backgroundColor: "rgb(147, 51, 234)", // purple-600
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ width: "100%", height: "100%" }}
                          ></motion.div>
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      <motion.h3
                        animate={{
                          color:
                            isCurrent || isCompleted
                              ? "rgb(255, 255, 255)"
                              : "rgb(156, 163, 175)",
                          fontWeight: isCurrent ? "bold" : "normal",
                          scale: isCurrent && !isCompleted ? 1.05 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ fontWeight: "500" }}
                      >
                        {step.title}
                      </motion.h3>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Show upload status below Additional Information step */}
                  <div className="mt-12">
                    {step.id === "additionalInfo" && <GlobalUploadStatus />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-1/2"
        />
        <div className="w-full md:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{currentStep.title}</h2>
                <p className="text-gray-500">{currentStep.description}</p>
              </div>

              <div className="space-y-4">{currentStep.component}</div>

              {validationErrors && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>{validationErrors}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="w-full p-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
          className={cn(
            "border-gray-700 text-white hover:bg-gray-800",
            isFirstStep && "opacity-50 cursor-not-allowed"
          )}
        >
          {isFirstStep ? "Cancel" : "Back"}
        </Button>
        <Button
          type="submit"
          onClick={handleNext}
          disabled={isSubmitting || (isLastStep && isVideoUploading)}
        >
          {isLastStep ? (
            isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : isVideoUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading video...
              </>
            ) : (
              "Complete"
            )
          ) : (
            "Next"
          )}
          {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default MultiStepForm;
