export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = new URL(url).pathname.split("/");
    const folder = parts[5]; // todo-app
    const fileWithExt = parts[6]; // xxxx.jpg
    const filename = fileWithExt.split(".")[0]; // xxxx
    return `${folder}/${filename}`;
  } catch (err) {
    console.error("Invalid URL", err);
    return null;
  }
}