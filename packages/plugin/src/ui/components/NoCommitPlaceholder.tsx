import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router';

interface NoCommitPlaceholderProps {
  title?: string;
  description?: string;
}

export function NoCommitPlaceholder({
  title = 'No commits yet',
  description = 'Committed changes will show up here',
}: NoCommitPlaceholderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h5 className="font-semibold">{title}</h5>
      <div style={{ color: 'var(--figma-color-text-secondary)' }}>{description}</div>
      <button className="btn-primary mt-2" onClick={() => navigate('/')}>
        {t('view_changes')}
      </button>
    </div>
  );
}
