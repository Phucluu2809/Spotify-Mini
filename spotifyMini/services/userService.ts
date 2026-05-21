import { API } from "./api";
import type { AuthUser } from "../context/AuthContext";

type UpdateProfilePayload = {
  name: string;
  avatarUri?: string;
};

const getImageType = (uri: string) => {
  const ext = uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  if (ext === "jpg") return { ext, mime: "image/jpeg" };
  return { ext, mime: `image/${ext}` };
};

export const getProfile = async () => {
  const res = await API.get<AuthUser>("/user/profile");
  return res.data;
};

export const updateProfile = async ({ name, avatarUri }: UpdateProfilePayload) => {
  const form = new FormData();
  form.append("name", name);

  if (avatarUri) {
    const { ext, mime } = getImageType(avatarUri);
    form.append("avatar", {
      uri: avatarUri,
      name: `avatar.${ext}`,
      type: mime,
    } as any);
  }

  const res = await API.patch<AuthUser>("/user/profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
