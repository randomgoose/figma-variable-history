import { useContext } from 'react';
import { AppContext } from '../../AppContext';

interface NoCommitPlaceholderProps {
  title?: string;
  description?: string;
}

export function NoCommitPlaceholder({
  title = 'No commits yet',
  description = 'Committed changes will show up here',
}: NoCommitPlaceholderProps) {
  const { setTab } = useContext(AppContext);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h5 className="font-semibold">{title}</h5>
      <div style={{ color: 'var(--figma-color-text-secondary)' }}>{description}</div>
      <button className="btn-primary mt-2" onClick={() => setTab('changes')}>
        View changes
      </button>
    </div>
  );
}
