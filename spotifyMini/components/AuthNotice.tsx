import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type AuthNoticeVariant = "success" | "error" | "info";

type AuthNoticeProps = {
  message: string;
  variant?: AuthNoticeVariant;
};

const variantConfig: Record<AuthNoticeVariant, { icon: keyof typeof Ionicons.glyphMap; color: string; backgroundColor: string; borderColor: string }> = {
  success: {
    icon: "checkmark-circle",
    color: "#47E06F",
    backgroundColor: "rgba(71, 224, 111, 0.10)",
    borderColor: "rgba(71, 224, 111, 0.28)"
  },
  error: {
    icon: "alert-circle",
    color: "#FF6B6B",
    backgroundColor: "rgba(255, 107, 107, 0.10)",
    borderColor: "rgba(255, 107, 107, 0.28)"
  },
  info: {
    icon: "mail",
    color: "#A8F0BF",
    backgroundColor: "rgba(168, 240, 191, 0.09)",
    borderColor: "rgba(168, 240, 191, 0.22)"
  }
};

export function AuthNotice({ message, variant = "info" }: AuthNoticeProps) {
  const config = variantConfig[variant];

  if (!message) return null;

  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor
        }
      ]}
    >
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={[styles.noticeText, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  }
});
