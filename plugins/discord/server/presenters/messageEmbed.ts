import type { Document, Collection, Team } from "@server/models";

/**
 * Presents a Discord embed object for a document notification.
 *
 * @param document - the document to present.
 * @param team - the team that owns the document.
 * @param collection - the collection the document belongs to.
 * @returns a Discord embed object.
 */
export function presentMessageEmbed(
  document: Document,
  team: Team,
  collection?: Collection | null
) {
  const color = collection?.color
    ? parseInt(collection.color.replace("#", ""), 16)
    : 0x4a90e2;

  return {
    title: document.title,
    url: `${team.url}${document.url}`,
    description: document.getSummary() ?? undefined,
    color,
    footer: collection
      ? {
          text: collection.name,
        }
      : undefined,
    timestamp: new Date(document.updatedAt).toISOString(),
  };
}
