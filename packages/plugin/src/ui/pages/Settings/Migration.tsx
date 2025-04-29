import { useContext, useState } from 'react';
import { sendMessage, MESSAGE_TYPE } from '../../../utils/message';
import { AppContext } from '../../../AppContext';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../../../lib/supabase';
import { IconCheck } from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from '../../../hooks/useTranslation';

export function Mirgation() {
  const { fileUUID } = useContext(AppContext);
  const [isDataDownloaded, setIsDataDownloaded] = useState(false);
  const { t } = useTranslation();

  const createFileMigration = async () => {
    sendMessage(MESSAGE_TYPE.CREATE_FILE_MIGRATION);
  };

  const downloadData = async () => {
    const { data, error } = await supabase.functions.invoke('get-file-by-id', {
      body: {
        id: fileUUID,
      },
    });

    if (error) {
      console.error(error);
    }

    return data;
  };

  const deleteStorage = async () => {
    sendMessage(MESSAGE_TYPE.DELETE_STORAGE);
  };

  const downloadAsJson = async () => {
    const data = await downloadData();
    if (data) {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file-${fileUUID}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDataDownloaded(true);
    }
  };

  return (
    <div>
      <h3 className="settingPage-title mb-4">{t('variables')}</h3>
      {!fileUUID ? (
        <button className="btn-outline" onClick={() => createFileMigration()}>
          Migrate
        </button>
      ) : (
        <div className="border border-[var(--figma-color-border)] rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--figma-color-text)] font-medium">Data uploaded</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-outline">Download data</button>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="btn-outline border-[var(--figma-color-border-danger-strong)] text-[var(--figma-color-text-danger)]">
                  Delete
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content h-fit">
                  <Dialog.Title className="dialog-title">Delete storage</Dialog.Title>

                  <div className="p-3 flex flex-col gap-2">
                    <p className="text-xs text-[var(--figma-color-text)]">
                      Before deleting your storage, keep a copy of your data.
                    </p>
                    <button
                      className={clsx(
                        'btn-outline w-full',
                        isDataDownloaded &&
                          'bg-[var(--figma-color-bg-success-tertiary)] text-[var(--figma-color-text-success)] border-transparent'
                      )}
                      onClick={downloadAsJson}
                    >
                      Download data
                      {isDataDownloaded ? <IconCheck size={14} className="ml-2" /> : null}
                    </button>
                    <button
                      onClick={deleteStorage}
                      className="btn-outline-danger w-full"
                      disabled={!isDataDownloaded}
                    >
                      Delete storage
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      )}
    </div>
  );
}
