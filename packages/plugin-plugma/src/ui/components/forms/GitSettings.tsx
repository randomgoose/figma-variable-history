import { useContext, useEffect, useMemo, useState } from 'react';
import styles from '../../styles.module.css';
import { AppContext } from '../../../AppContext';
import { throttle } from 'lodash-es';

export function GitSettings() {
  const { setting } = useContext(AppContext);

  const [gitInfo, setGitInfo] = useState({
    repository: '',
    owner: '',
    token: '',
    filePath: '',
  });

  const placeholder: Record<string, string> = {
    token: 'GitHub User Token',
    repository: 'Repository Name',
    owner: 'Repository Owner Username',
    filePath: 'CSS Variable File Path',
  };

  useEffect(() => {
    if (setting?.git) {
      setGitInfo({
        ...gitInfo,
        ...setting?.git,
      });
    }
  }, [setting?.git]);

  useEffect(() => {
    throttle(() => {
      parent.postMessage(
        { pluginMessage: { type: 'SET_PLUGIN_SETTING', payload: { git: gitInfo } }, pluginId: '*' },
        '*'
      );
      // emit<SetPluginSettingHandler>('SET_PLUGIN_SETTING', { git: gitInfo });
    }, 100);
  }, [gitInfo]);

  const isSettingsChanged = useMemo(() => {
    return (
      gitInfo.owner !== setting?.git?.owner ||
      gitInfo.filePath !== setting?.git?.filePath ||
      gitInfo.repository !== setting?.git?.repository ||
      gitInfo.token !== setting?.git?.token
    );
  }, [gitInfo, setting?.git]);

  return (
    <div className={styles.commitForm} style={{ padding: 0 }}>
      {Object.entries(gitInfo)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => {
          return (
            <div key={key}>
              <div
                className="capitalize mb-1"
                style={{ color: 'var(--figma-color-text-secondary)' }}
              >
                {key}
              </div>
              <input
                width={240}
                value={value}
                placeholder={placeholder[key] || key}
                onChange={(e) =>
                  setGitInfo({
                    ...gitInfo,
                    [key]: e.target.value,
                  })
                }
              />
            </div>
          );
        })}

      <button
        onClick={() => {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'SET_PLUGIN_SETTING',
                payload: { git: { enabled: setting?.git?.enabled, ...gitInfo } },
              },
              pluginId: '*',
            },
            '*'
          );
        }}
        disabled={!isSettingsChanged}
      >
        Save configuration
      </button>
    </div>
  );
}
