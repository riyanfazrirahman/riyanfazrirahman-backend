export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(dateStr))
    .replaceAll("/", "-")
    .replace(",", "");
}
