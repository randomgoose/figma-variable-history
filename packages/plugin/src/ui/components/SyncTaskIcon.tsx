import { SlackLogo } from '../icons/SlackLogo';
import { GitHubLogo } from '../icons/GitHubLogo';
import { IconWorld } from '@tabler/icons-react';

import { SyncTaskType } from '../../types';

export function SyncTaskIcon({ type }: { type: SyncTaskType }) {
  switch (type) {
    case 'github':
      return <GitHubLogo size={14} />;
    case 'slack':
      return <SlackLogo size={14} />;
    case 'custom':
      return <IconWorld size={14} className="shrink-0" />;
    default:
      return null;
  }
}
