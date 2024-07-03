import { GitHubLogo } from '../icons/GitHubLogo';
import styles from '../styles.module.css';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { GitSettings } from '../components/forms/GitSettings';

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
            <label className="switch">
              <input
                type="checkbox"
                onChange={(e) => {
                  parent.postMessage(
                    {
                      pluginMessage: {
                        type: 'SET_PLUGIN_SETTING',
                        payload: { git: { ...setting.git, enabled: e.target.checked } },
                      },
                      pluginId: '*',
                    },
                    '*'
                  );
                }}
                checked={setting.git?.enabled}
              />
              <span className="slider"></span>
            </label>

            {/* <Toggle
              value={setting?.git?.enabled || false}
              onChange={(e) =>
                emit('SET_PLUGIN_SETTING', {
                  git: { ...setting?.git, enabled: e.currentTarget.checked },
                })
              }
            >
              <Text style={{ opacity: 0 }}>On</Text>
            </Toggle> */}
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
