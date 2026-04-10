import { PluginManager, Hook } from "@server/utils/PluginManager";
import config from "../plugin.json";
import router from "./auth/discord";
import integrationRouter from "./api/integrations";
import env from "./env";
import DiscordProcessor from "./processors/DiscordProcessor";

const enabled = !!env.DISCORD_CLIENT_ID && !!env.DISCORD_CLIENT_SECRET;

PluginManager.add([
  {
    ...config,
    type: Hook.API,
    value: integrationRouter,
  },
  {
    type: Hook.Processor,
    value: DiscordProcessor,
  },
]);

if (enabled) {
  PluginManager.add([
    {
      ...config,
      type: Hook.AuthProvider,
      value: { router, id: config.id },
    },
  ]);
}
