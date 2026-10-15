import { generateText, Output } from "ai";
import {
  EXTRACT_PROMPT,
  ROW_VISION_MODEL,
  rowExtractionSchema,
  type RowExtraction,
} from "./row-extract";

export async function extractRowPhoto(input: {
  data: Uint8Array;
  mediaType: string;
}): Promise<RowExtraction> {
  const { output } = await generateText({
    model: ROW_VISION_MODEL,
    output: Output.object({ schema: rowExtractionSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACT_PROMPT },
          { type: "file", mediaType: input.mediaType, data: input.data },
        ],
      },
    ],
  });

  if (!output) {
    throw new Error("Vision model returned no structured row data");
  }
  return output;
}
