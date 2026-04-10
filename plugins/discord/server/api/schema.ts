import { z } from "zod";
import { BaseSchema } from "@server/routes/api/schema";

const DISCORD_WEBHOOK_REGEX =
  /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/;

export const DiscordWebhooksCreateSchema = BaseSchema.extend({
  body: z.object({
    /** The ID of the collection to connect to the Discord channel. */
    collectionId: z.uuid(),

    /** The Discord incoming webhook URL. */
    url: z
      .string()
      .regex(
        DISCORD_WEBHOOK_REGEX,
        "Must be a valid Discord webhook URL (https://discord.com/api/webhooks/...)"
      ),
  }),
});

export type DiscordWebhooksCreateReq = z.infer<
  typeof DiscordWebhooksCreateSchema
>;
