// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Button, Textbox } from '@create-figma-plugin/ui';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import styles from '../../styles.module.css';
import { AppContext } from '../../../AppContext';
import { throttle } from 'lodash-es';
import { emit } from '@create-figma-plugin/utilities';
import { SetPluginSettingHandler } from '../../../types';

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
      emit<SetPluginSettingHandler>('SET_PLUGIN_SETTING', { git: gitInfo });
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
                style={{
                  textTransform: 'capitalize',
                  marginBottom: 4,
                  color: 'var(--figma-color-text-secondary)',
                }}
              >
                {key}
              </div>
              <Textbox
                width={240}
                variant="border"
                value={value}
                placeholder={placeholder[key] || key}
                onChange={(e) =>
                  setGitInfo({
                    ...gitInfo,
                    [key]: e.currentTarget.value,
                  })
                }
              />
            </div>
          );
        })}

      <Button
        onClick={() => {
          emit<SetPluginSettingHandler>('SET_PLUGIN_SETTING', {
            git: { enabled: setting?.git?.enabled, ...gitInfo },
          });
        }}
        disabled={!isSettingsChanged}
      >
        Save configuration
      </Button>
    </div>
  );
}
