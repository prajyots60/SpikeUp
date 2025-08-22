"use server";

import { aiAgentPrompt } from "@/lib/data";
import { vapiServer } from "@/lib/vapi/vapiServer";

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

export const createAssistant = async (name: string) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
      name,
      firstMessage: `Hi there, this is ${name} from customer support. How can I help you today?`,
      model: {
        model: "gpt-4o",
        provider: "openai",
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
