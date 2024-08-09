import { ArrowRight } from 'lucide-react';
import { CopyTextWrapper } from '../CopyWrapper';

interface NameDiffProps {
  current: Variable;
  prev?: Variable;
}

export function NameDiff({ current, prev }: NameDiffProps) {
  const hasNameChanged = prev && prev.name !== current.name;

  return (
    <div className="variableDetail-section">
      {hasNameChanged ? (
        <div className="variableDetail-item items-center">
          <h3 className={'variableDetail-sectionTitle'}>Name</h3>
          <CopyTextWrapper text={prev.name}>{prev?.name}</CopyTextWrapper>
          <div
            className={'flex items-center justify-center'}
            style={{ color: 'var(--figma-color-icon-tertiary)' }}
          >
            <ArrowRight size={14} />
          </div>
          <CopyTextWrapper text={current.name}>{current.name}</CopyTextWrapper>
        </div>
      ) : (
        <div className="variableDetail-item flex">
          <h3 className={'variableDetail-sectionTitle'}>Name</h3>
          <CopyTextWrapper text={current.name}>{current?.name}</CopyTextWrapper>
        </div>
      )}
    </div>
  );
}
