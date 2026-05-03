export type CommandCenterApiBaseUrlSource =
  | "hosted_backend_public_env"
  | "backend_public_env"
  | "local_default";

export type CommandCenterApiConfig = {
  apiBaseUrl: string;
  apiBaseUrlSource: CommandCenterApiBaseUrlSource;
  commandCenterApiMode: string;
  hostedBackendConfigured: boolean;
  usesLocalDefault: boolean;
  publicEnvVars: {
    hostedBackendApiBaseUrl: string;
    backendUrl: string;
    commandCenterApiMode: string;
  };
};

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:8000";

function normalizeApiBaseUrl(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\/+$/, "");
  return normalized ? normalized : undefined;
}

export function getCommandCenterApiConfig(): CommandCenterApiConfig {
  const hostedBackendApiBaseUrl = normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_HOSTED_BACKEND_API_BASE_URL,
  );
  const backendUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  const commandCenterApiMode =
    process.env.NEXT_PUBLIC_COMMAND_CENTER_API_MODE?.trim() || "local";

  if (hostedBackendApiBaseUrl) {
    return {
      apiBaseUrl: hostedBackendApiBaseUrl,
      apiBaseUrlSource: "hosted_backend_public_env",
      commandCenterApiMode,
      hostedBackendConfigured: true,
      usesLocalDefault: false,
      publicEnvVars: {
        hostedBackendApiBaseUrl,
        backendUrl: backendUrl ?? "",
        commandCenterApiMode,
      },
    };
  }

  if (backendUrl) {
    return {
      apiBaseUrl: backendUrl,
      apiBaseUrlSource: "backend_public_env",
      commandCenterApiMode,
      hostedBackendConfigured: false,
      usesLocalDefault: false,
      publicEnvVars: {
        hostedBackendApiBaseUrl: "",
        backendUrl,
        commandCenterApiMode,
      },
    };
  }

  return {
    apiBaseUrl: DEFAULT_LOCAL_API_BASE_URL,
    apiBaseUrlSource: "local_default",
    commandCenterApiMode,
    hostedBackendConfigured: false,
    usesLocalDefault: true,
    publicEnvVars: {
      hostedBackendApiBaseUrl: "",
      backendUrl: "",
      commandCenterApiMode,
    },
  };
}

export const commandCenterApiConfig = getCommandCenterApiConfig();
export const commandCenterApiBaseUrl = commandCenterApiConfig.apiBaseUrl;
