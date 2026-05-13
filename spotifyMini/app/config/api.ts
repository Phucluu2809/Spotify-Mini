import Constants from "expo-constants";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const envApiUrl = stripTrailingSlash(
    (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim()
);

const getExpoHost = () => {
    const hostUri =
        (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
        (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig
            ?.debuggerHost ??
        (
            Constants as {
                manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
            }
        ).manifest2?.extra?.expoClient?.hostUri ??
        (Constants as { manifest?: { debuggerHost?: string } }).manifest
            ?.debuggerHost ??
        "";

    const cleanedHost = hostUri.replace(/^https?:\/\//, "").split(":")[0];
    return cleanedHost || "";
};

const fallbackApiUrl = (() => {
    const expoHost = getExpoHost();
    return expoHost ? `http://${expoHost}:5000` : "http://localhost:5000";
})();

export const API_URL = envApiUrl || fallbackApiUrl;
export default {};
