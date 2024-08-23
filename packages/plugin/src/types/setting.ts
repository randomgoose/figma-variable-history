export type GitHubSyncConfig = {
  repository: string;
  owner: string;
  filePath: string;
  token: string;
};

export type SlackSyncConfig = {
  channelId: string;
  filename: string;
  token: string;
};

export type CustomHTTPSyncConfig = {
  address: string;
  body: Record<string, any>;
};

export type SyncTaskType = 'github' | 'slack' | 'custom';
export type SyncConfig = GitHubSyncConfig | SlackSyncConfig | CustomHTTPSyncConfig;
export interface PluginSetting {
  git?: {
    enabled?: boolean;
    repository?: string;
    owner?: string;
    filePath?: string;
    token?: string;
  };
  slack?: {
    enabled?: boolean;
    channelId?: string;
    filename?: string;
    token?: string;
  };
  syncTasks: {
    type: SyncTaskType;
    config: SyncConfig;
    enabled: boolean;
  }[];
}
