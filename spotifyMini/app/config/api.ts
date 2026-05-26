import Constants from "expo-constants";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const envApiUrl = stripTrailingSlash(
    (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim()
);

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

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

    const cleanedHost = hostUri
        .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
        .split(":")[0];
    return cleanedHost || "";
};

const fallbackApiUrl = (() => {
    const expoHost = getExpoHost();
    return expoHost ? `http://${expoHost}:5000` : "http://localhost:5000";
})();

if (envApiUrl && !isHttpUrl(envApiUrl)) {
    console.warn(
        `Ignoring invalid EXPO_PUBLIC_API_BASE_URL "${envApiUrl}". Use an http(s) backend URL.`
    );
}

export const API_URL = isHttpUrl(envApiUrl) ? envApiUrl : fallbackApiUrl;
export default {};
