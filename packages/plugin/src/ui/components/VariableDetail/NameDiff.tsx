import { ArrowRight } from 'lucide-react';
import { CopyTextWrapper } from '../CopyWrapper';
import { useTranslation } from '../../../hooks/useTranslation';

interface NameDiffProps {
  current: Variable;
  prev?: Variable;
}

export function NameDiff({ current, prev }: NameDiffProps) {
  const hasNameChanged = prev && prev.name !== current.name;
  const { t } = useTranslation();

  return (
    <div className="variableDetail-section">
      {hasNameChanged ? (
        <div className="variableDetail-item items-center">
          <h3 className={'variableDetail-sectionTitle'}>{t('name')}</h3>
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
          <h3 className={'variableDetail-sectionTitle'}>{t('name')}</h3>
          <CopyTextWrapper text={current.name}>{current?.name}</CopyTextWrapper>
        </div>
      )}
    </div>
  );
}
