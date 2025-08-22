"use client";
import { updateAssistant } from "@/actions/vapi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAiAgentStore } from "@/store/useAiAgentStore";
import { Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfigField from "./ConfigField";
import DropDownSelect from "./DropDownSelect";

type Props = {};

const ModelConfiguration = (props: Props) => {
  const { assistant } = useAiAgentStore();

  const router = useRouter();

  const [firstMessage, setFirstMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assistant) {
      setFirstMessage(assistant?.firstMessage || "");
      setSystemPrompt(assistant?.model?.messages?.[0]?.content || "");
    }
  }, [assistant]);

  if (!assistant) {
    return (
      <div className="flex justify-center items-center h-[500px] w-full">
        <div className="bg-neutral-900 rounded-xl p-6 w-full">
          <p className="text-primary/80 text-center">
            No assistant selected. Please select an assistant to configure the
            settings.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      const res = await updateAssistant(
        assistant?.id,
        firstMessage,
        systemPrompt
      );

      if (!res.success) {
        throw new Error("Failed to update assistant");
      }
      router.refresh();
      toast.success("Assistant updated successfully");
    } catch (error) {
      console.error("Error updating assistant:", error);
      toast.error("Failed to update assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Model Configuration</h2>
        <Button
          onClick={handleUpdateAssistant}
          disabled={!firstMessage || !systemPrompt || loading}
          className="cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Updating...
            </>
          ) : (
            "Update Assistant"
          )}
        </Button>
      </div>
      <p className="text-neutral-400 mb-6">
        Configure the behavior of the assistant.
      </p>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <label className="font-medium">First Message</label>
          <Info className="h-4 w-4 text-neutral-400 ml-2" />
        </div>
        <Input
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          className="bg-primary/10 border-input"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <label className="font-medium">System Prompt</label>
            <Info className="h-4 w-4 text-neutral-400 ml-2" />
          </div>
        </div>
        <Textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="min-h-[300px] max-h-[500px] bg-primary/10 border-input font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ConfigField label="Provider">
          <DropDownSelect value={assistant.model?.provider || ""} />
        </ConfigField>

        <ConfigField label="Model" showInfo={true}>
          <DropDownSelect value={assistant.model?.model || ""} />
        </ConfigField>
      </div>
    </div>
  );
};

export default ModelConfiguration;
