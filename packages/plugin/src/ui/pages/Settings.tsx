// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Toggle, Text } from '@create-figma-plugin/ui';
import { GitHubLogo } from '../icons/GitHubLogo';
import styles from '../styles.module.css';
import { useContext } from 'preact/hooks';
import { AppContext } from '../../AppContext';
import { GitSettings } from '../components/forms/GitSettings';
import { emit } from '@create-figma-plugin/utilities';

export function Settings() {
  const { setting } = useContext(AppContext);

  return (
    <div className={styles.settings__container}>
      <h3 className={styles.settings__heading}>Settings</h3>

      <div className={styles.settings__block}>
        <div className={styles.settings__blockHeader}>
          <GitHubLogo />
          <div>
            <div className={styles.settings__blockTitle}>Sync to GitHub Repository</div>
            <div className={styles.settings__blockDescription}>
              Modify CSS files and create a pull request
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Toggle
              value={setting?.git?.enabled || false}
              onChange={(e) =>
                emit('SET_PLUGIN_SETTING', {
                  git: { ...setting?.git, enabled: e.currentTarget.checked },
                })
              }
            >
              <Text style={{ opacity: 0 }}>On</Text>
            </Toggle>
          </div>
        </div>

        {setting?.git?.enabled ? (
          <div className={styles.settings__blockContent}>
            <GitSettings />
          </div>
        ) : null}
      </div>
    </div>
  );
}
