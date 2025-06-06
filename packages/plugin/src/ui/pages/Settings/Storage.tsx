import { useContext } from 'react';
import { AppContext } from '../../../AppContext';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from '../../../hooks/useTranslation';
import { downloadAsJson } from '../../../utils/download';

export function Storage() {
  const { fileUUID, legacyCommits } = useContext(AppContext);
  const { t } = useTranslation();

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

  return (
    <div>
      <h3 className="settingPage-title mb-4">{t('storage')}</h3>
      {legacyCommits?.length > 0 && (
        <button className="btn-outline" onClick={async () => downloadAsJson(legacyCommits)}>
          {t('storage_download_legacy_data')}
        </button>
      )}
      {fileUUID && (
        <button className="btn-outline" onClick={async () => downloadAsJson(await downloadData())}>
          {t('storage_download_data')}
        </button>
      )}
    </div>
  );
}
