import { createAssistant } from "@/actions/vapi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROVIDERS_CONFIG,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  getModelsForProvider,
  ProviderType,
} from "@/lib/constants/providers";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CreateAssistantModal = ({ isOpen, onClose }: Props) => {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<ProviderType>(DEFAULT_PROVIDER);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Get available models for the selected provider
  const availableModels = getModelsForProvider(provider);

  // Reset model when provider changes (but not on initial load)
  useEffect(() => {
    if (availableModels.length > 0) {
      // Check if current model is valid for the new provider
      const isCurrentModelValid = availableModels.some(
        (m) => m.value === model
      );
      if (!isCurrentModelValid) {
        setModel(availableModels[0].value);
      }
    }
  }, [provider, availableModels, model]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAssistant(name, provider, model);
      if (!res.success) {
        throw new Error("Failed to create assistant");
      }
      router.refresh();
      setName("");
      setProvider(DEFAULT_PROVIDER);
      setModel(DEFAULT_MODEL);
      onClose();
      toast.success("Assistant created successfully");
    } catch (error) {
      console.error("Error creating assistant:", error);
      toast.error("Failed to create assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-muted border-input shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create Assistant
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block font-medium mb-2">Assistant Name</Label>
            <Input
              type="text"
              placeholder="Enter assistant name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white w-full focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-neutral-400 mt-2">
              This name will be used to identify your assistant in the list.
            </p>
          </div>

          <div>
            <Label className="block font-medium mb-2">AI Provider</Label>
            <Select
              value={provider}
              onValueChange={(value: ProviderType) => setProvider(value)}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white focus:ring-2 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {PROVIDERS_CONFIG.map((providerConfig) => (
                  <SelectItem
                    key={providerConfig.value}
                    value={providerConfig.value}
                    className="text-white hover:bg-neutral-700"
                  >
                    <span>{providerConfig.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400 mt-2">
              Choose the AI provider that will power your assistant.
            </p>
          </div>

          <div>
            <Label className="block font-medium mb-2">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white focus:ring-2 focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                {availableModels.map((modelOption) => (
                  <SelectItem
                    key={modelOption.value}
                    value={modelOption.value}
                    className="text-white hover:bg-neutral-700"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{modelOption.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400 mt-2">
              Select the specific model version to use for this assistant.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant={"outline"}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Assistant"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssistantModal;
