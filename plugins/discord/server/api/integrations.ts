import Router from "koa-router";
import { UserRole, IntegrationService, IntegrationType } from "@shared/types";
import auth from "@server/middlewares/authentication";
import { transaction } from "@server/middlewares/transaction";
import validate from "@server/middlewares/validate";
import { Collection, Integration } from "@server/models";
import { authorize } from "@server/policies";
import { presentIntegration } from "@server/presenters";
import type { APIContext } from "@server/types";
import * as T from "./schema";

const router = new Router();

router.post(
  "discord.webhooks.create",
  auth({ role: UserRole.Admin }),
  validate(T.DiscordWebhooksCreateSchema),
  transaction(),
  async (ctx: APIContext<T.DiscordWebhooksCreateReq>) => {
    const { collectionId, url } = ctx.input.body;
    const { user } = ctx.state.auth;

    const collection = await Collection.findByPk(collectionId, {
      userId: user.id,
    });
    authorize(user, "read", collection);
    authorize(user, "update", user.team);

    // Remove any previous Discord webhook integration for this collection.
    await Integration.destroy({
      where: {
        teamId: user.teamId,
        collectionId,
        service: IntegrationService.Discord,
        type: IntegrationType.Post,
      },
    });

    const integration = await Integration.createWithCtx(
      ctx,
      {
        service: IntegrationService.Discord,
        type: IntegrationType.Post,
        userId: user.id,
        teamId: user.teamId,
        collectionId,
        events: ["documents.update", "documents.publish"],
        settings: {
          url,
        },
      }
    );

    ctx.body = {
      data: presentIntegration(integration),
    };
  }
);

export default router;
