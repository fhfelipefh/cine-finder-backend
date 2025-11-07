export function toStringId(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof input === "number") return String(input);
  if (typeof input === "object") {
    if (typeof input.id === "string") return input.id;
    if (input.id && typeof input.id.toString === "function") {
      return input.id.toString();
    }
    if (input._id && typeof input._id.toString === "function") {
      return input._id.toString();
    }
  }
  return String(input);
}
