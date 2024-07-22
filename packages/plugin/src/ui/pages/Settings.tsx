import { GitHubLogo } from '../icons/GitHubLogo';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { GitSettings } from '../components/forms/GitSettings';
import { motion, AnimatePresence } from 'framer-motion';
import * as Switch from '@radix-ui/react-switch';

export function Settings() {
  const { setting } = useContext(AppContext);

  return (
    <div className={'p-4'}>
      <h3 className={'text-[13px] font-medium text-[color:var(--figma-color-text)]'}>Settings</h3>

      <div className={'p-4 mt-2 rounded-[4px] border border-[color:var(--figma-color-border)]'}>
        <div className={'flex items-center gap-2'}>
          <GitHubLogo />
          <div>
            <div className={'font-medium'}>Sync to GitHub Repository</div>
            <div className={'text-[color:var(--figma-color-text-secondary)]'}>
              Modify CSS files and create a pull request
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Switch.Root
              className="switch-root"
              checked={setting?.git?.enabled}
              onCheckedChange={(checked) =>
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'SET_PLUGIN_SETTING',
                      payload: { git: { ...setting?.git, enabled: checked } },
                    },
                    pluginId: '*',
                  },
                  '*'
                )
              }
            >
              <Switch.Thumb className="switch-thumb" />
            </Switch.Root>
            {/* <label
              className={clsx(
                'w-6 h-3 p-px flex rounded-full',
                setting?.git?.enabled
                  ? 'justify-end bg-[color:var(--figma-color-bg-inverse)]'
                  : 'justify-start bg-[color:var(--figma-color-bg-disabled-secondary)]'
              )}
              htmlFor="github"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            </label>
            <input
              className="hidden"
              id="github"
              type="checkbox"
              onChange={(e) => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'SET_PLUGIN_SETTING',
                      payload: { git: { ...setting?.git, enabled: e.target.checked } },
                    },
                    pluginId: '*',
                  },
                  '*'
                );
              }}
              checked={setting?.git?.enabled}
            /> */}
          </div>
        </div>

        <AnimatePresence>
          {setting?.git?.enabled ? (
            <motion.div className={'p-4'}>
              <GitSettings />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
