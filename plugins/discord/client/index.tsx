import { createLazyComponent } from "~/components/LazyLoad";
import { Hook, PluginManager } from "~/utils/PluginManager";
import config from "../plugin.json";
import Icon from "./Icon";

PluginManager.add([
  {
    ...config,
    type: Hook.Settings,
    value: {
      group: "Integrations",
      icon: Icon,
      description:
        "Get notifications in Discord channels when documents are published or updated.",
      component: createLazyComponent(() => import("./Settings")),
      enabled: () => true,
    },
  },
  {
    ...config,
    type: Hook.Icon,
    value: Icon,
  },
]);
