import { Content, Title, Dialog, Portal, Overlay, Trigger, Close } from '@radix-ui/react-dialog';
import { useTranslation } from '../../hooks/useTranslation';
import { IconCheck, IconCloudFilled, IconLoader, IconX } from '@tabler/icons-react';
import { AppContext } from '../../AppContext';
import { useContext, useState } from 'react';
import clsx from 'clsx';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import { downloadAsJson } from '../../utils/download';

export function SwitchToCloudDialog() {
  const { t } = useTranslation();
  const { fileUUID, legacyCommits } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const isLegacy = legacyCommits?.length > 0 && !fileUUID;
  const isNewFile = !fileUUID && !legacyCommits;

  return (
    <Dialog>
      <Trigger asChild>
        <button
          className={clsx(
            'ml-auto border rounded-md px-2 py-0.5 flex items-center gap-1',
            !fileUUID
              ? ' border-[var(--figma-color-border-warning)] text-[var(--figma-color-text-warning)] bg-[var(--figma-color-bg-warning-tertiary)]'
              : 'border-[var(--figma-color-border-success)] text-[var(--figma-color-text-success)] bg-[var(--figma-color-bg-success-tertiary)]'
          )}
        >
          {isLegacy ? t('action_needed') : t('action_done')}
          {fileUUID && <IconCheck size={14} />}
        </button>
      </Trigger>
      <Portal>
        <Overlay className="dialog-overlay" />
        <Content className="dialog-content h-fit p-5">
          <Close className="absolute top-2 right-2 ml-auto" asChild>
            <button className="btn-icon">
              <IconX size={14} />
            </button>
          </Close>

          <div className="w-12 h-12 flex items-center justify-center bg-[var(--figma-color-bg-success-tertiary)] rounded-full mx-auto">
            <IconCloudFilled size={24} className="mx-auto text-[var(--figma-color-text-success)]" />
          </div>
          <Title className="h-9 font-semibold px-3 pr-2 flex items-center justify-center text-center text-lg">
            {t('data_migration_notification_title')}
          </Title>

          <div className={clsx('rounded-lg text-center mt-2')}>
            <p className="text-xs">
              {isLegacy
                ? t('data_migration_notification_description')
                : isNewFile
                ? t('data_migration_notification_description_done')
                : t('action_new_file')}
            </p>

            <div className="flex flex-col gap-1.5 mt-4">
              {isLegacy && (
                <button
                  onClick={() => {
                    setIsLoading(true);
                    sendMessage(MESSAGE_TYPE.CREATE_FILE_MIGRATION);
                  }}
                  className={clsx('btn-primary grow', isLoading && 'opacity-50')}
                >
                  {isLoading ? (
                    <IconLoader size={14} className="animate-spin" />
                  ) : (
                    t('data_migration_notification_button_migrate')
                  )}
                </button>
              )}

              {legacyCommits?.length > 0 && (
                <button className="btn-outline grow" onClick={() => downloadAsJson(legacyCommits)}>
                  {t('data_migration_notification_button_export')}
                </button>
              )}
            </div>
          </div>
        </Content>
      </Portal>
    </Dialog>
  );
}
