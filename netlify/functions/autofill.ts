import { Handler } from "@netlify/functions";
import { handleAutofill } from "../../server/geminiService";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          success: false,
          error: "Method Not Allowed",
        }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const result = await handleAutofill(body);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (error) {
    console.error("Autofill error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Autofill failed",
      }),
    };
  }
};
