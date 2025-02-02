import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { useTranslation } from '../../hooks/useTranslation';

interface NoCommitPlaceholderProps {
  title?: string;
  description?: string;
}

export function NoCommitPlaceholder({
  title = 'No commits yet',
  description = 'Committed changes will show up here',
}: NoCommitPlaceholderProps) {
  const { setTab } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h5 className="font-semibold">{title}</h5>
      <div style={{ color: 'var(--figma-color-text-secondary)' }}>{description}</div>
      <button className="btn-primary mt-2" onClick={() => setTab('changes')}>
        {t('view_changes')}
      </button>
    </div>
  );
}
