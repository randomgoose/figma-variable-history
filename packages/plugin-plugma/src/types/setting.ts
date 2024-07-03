export interface PluginSetting {
  git?: {
    enabled?: boolean;
    repository?: string;
    owner?: string;
    filePath?: string;
    token?: string;
  };
}
