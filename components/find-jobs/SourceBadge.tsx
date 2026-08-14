type Props = {
  source: "search" | "url";
};

export function SourceBadge({ source }: Props) {
  const isSearch = source === "search";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${
        isSearch ? "bg-accent-light text-accent" : "bg-surface-secondary text-text-secondary"
      }`}
    >
      {isSearch ? "Search" : "URL"}
    </span>
  );
}
