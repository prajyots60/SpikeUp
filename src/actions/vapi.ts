"use server";

import { aiAgentPrompt } from "@/lib/data";
import { vapiServer } from "@/lib/vapi/vapiServer";
import { ProviderType } from "@/lib/constants/providers";

export const getAllAssistants = async () => {
  try {
    const getAllAgents = await vapiServer.assistants.list();

    // console.log("Fetched assistants:", getAllAgents);
    return {
      status: 200,
      success: true,
      data: getAllAgents,
    };
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to fetch assistants",
    };
  }
};

export const createAssistant = async (
  name: string,
  provider: ProviderType = "openai",
  model: string = "gpt-4o"
) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
      name,
      firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
      model: {
        model,
        provider: provider as any, // Type assertion for now since vapi types might be outdated
        messages: [
          {
            role: "system",
            content: aiAgentPrompt,
          },
        ],
        temperature: 0.5,
      },
    });
    return {
      status: 200,
      success: true,
      data: createAssistant,
    };
  } catch (error) {
    console.error("Error creating assistant:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to create assistant",
    };
  }
};

export const updateAssistant = async (
  assistantId: string,
  firstMessage: string,
  systemPrompt: string,
  provider: ProviderType = "openai",
  model: string = "gpt-4o"
) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(assistantId, {
      firstMessage,
      model: {
        model,
        provider: provider as any, // Type assertion for now since vapi types might be outdated
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
        temperature: 0.5,
      },
    });
    console.log("Assistant updated successfully:", updateAssistant);
    return {
      status: 200,
      success: true,
      data: updateAssistant,
    };
  } catch (error) {
    console.error("Error updating assistant:", error);
    return {
      status: 500,
      success: false,
      message: "Failed to update assistant",
      error,
    };
  }
};
