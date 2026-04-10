import { observer } from "mobx-react";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import { IntegrationService } from "@shared/types";
import type { IntegrationType } from "@shared/types";
import type Collection from "~/models/Collection";
import type Integration from "~/models/Integration";
import { IntegrationScene } from "~/scenes/Settings/components/IntegrationScene";
import Button from "~/components/Button";
import Flex from "~/components/Flex";
import Heading from "~/components/Heading";
import CollectionIcon from "~/components/Icons/CollectionIcon";
import Input from "~/components/Input";
import List from "~/components/List";
import ListItem from "~/components/List/Item";
import Text from "~/components/Text";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import usePolicy from "~/hooks/usePolicy";
import useStores from "~/hooks/useStores";
import { client } from "~/utils/ApiClient";
import DiscordIcon from "./Icon";
import DiscordListItem from "./components/DiscordListItem";

type ConnectFormProps = {
  collection: Collection;
  onConnect: () => void;
};

function ConnectForm({ collection, onConnect }: ConnectFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (ev: React.FormEvent) => {
      ev.preventDefault();
      setSaving(true);
      try {
        await client.post("/discord.webhooks.create", {
          collectionId: collection.id,
          url,
        });
        toast.success(t("Discord channel connected"));
        onConnect();
      } catch (err) {
        toast.error(err.message ?? t("Failed to connect Discord channel"));
      } finally {
        setSaving(false);
      }
    },
    [collection.id, url, onConnect, t]
  );

  if (!open) {
    return (
      <Button neutral onClick={() => setOpen(true)}>
        {t("Connect")}
      </Button>
    );
  }

  return (
    <Flex as="form" onSubmit={handleSubmit} gap={8} align="flex-start">
      <Input
        type="url"
        placeholder="https://discord.com/api/webhooks/…"
        value={url}
        onChange={(ev) => setUrl(ev.target.value)}
        style={{ minWidth: 340 }}
        required
      />
      <Button type="submit" disabled={saving}>
        {saving ? t("Saving") + "…" : t("Save")}
      </Button>
      <Button type="button" neutral onClick={() => setOpen(false)}>
        {t("Cancel")}
      </Button>
    </Flex>
  );
}

function Discord() {
  const team = useCurrentTeam();
  const { collections, integrations } = useStores();
  const { t } = useTranslation();
  const can = usePolicy(team);

  React.useEffect(() => {
    void collections.fetchAll();
  }, [collections]);

  const groupedCollections = collections.orderedData
    .map<[Collection, Integration | undefined]>((collection) => {
      const integration = integrations.find({
        service: IntegrationService.Discord,
        collectionId: collection.id,
      });
      return [collection, integration];
    })
    .sort((a) => (a[1] ? -1 : 1));

  const handleConnect = React.useCallback(() => {
    void integrations.fetchAll();
  }, [integrations]);

  return (
    <IntegrationScene title="Discord" icon={<DiscordIcon />}>
      <Heading>Discord</Heading>

      {can.update && (
        <>
          <Heading as="h2">{t("Collections")}</Heading>
          <Text as="p" type="secondary">
            <Trans>
              Connect collections to Discord channels. Messages will be
              automatically posted to Discord when documents are published or
              updated.
            </Trans>
          </Text>
          <Text as="p" type="secondary">
            <Trans>
              To get a webhook URL, go to your Discord server settings →
              Integrations → Webhooks → New Webhook, then copy the webhook URL.
            </Trans>
          </Text>

          <List>
            {groupedCollections.map(([collection, integration]) => {
              if (integration) {
                return (
                  <DiscordListItem
                    key={integration.id}
                    collection={collection}
                    integration={
                      integration as Integration<IntegrationType.Post>
                    }
                  />
                );
              }

              return (
                <ListItem
                  key={collection.id}
                  title={collection.name}
                  image={<CollectionIcon collection={collection} />}
                  actions={
                    <ConnectForm
                      collection={collection}
                      onConnect={handleConnect}
                    />
                  }
                />
              );
            })}
          </List>
        </>
      )}
    </IntegrationScene>
  );
}

export default observer(Discord);
