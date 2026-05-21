import { API_URL } from "../app/config/api";

export const getDefaultCoverUrl = (seed: string, size = 400) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;

export async function uploadImageFromUri(uri: string, fileName: string) {
  const ext = fileName.split(".").pop()?.split("?")[0] || "jpg";
  const form = new FormData();
  form.append("image", {
    uri,
    name: fileName,
    type: `image/${ext}`,
  } as any);

  const res = await fetch(`${API_URL}/upload/image`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image");
  }

  const data = await res.json();
  return data.url as string;
}
