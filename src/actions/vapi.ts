"use server";

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
