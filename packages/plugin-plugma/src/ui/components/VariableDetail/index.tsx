import { useContext } from 'react';
// import { CodeSyntaxDiff } from './CodeSyntaxDiff';
import { DescriptionDiff } from './DescriptionDiff';
import { ValuesByModeDiff } from './ValuesByModeDiff';
import { VariableScopesDiff } from './VariableScopesDiff';
import { AppContext } from '../../../AppContext';

import { Boolean } from '../../icons/Boolean';
import { Color } from '../../icons/Color';
import { String } from '../../icons/String';
import { Number } from '../../icons/Number';
import { CodeSyntaxDiff } from './CodeSyntaxDiff';
import styles from '../../styles.module.css';
import { ChevronRight } from 'lucide-react';

export interface VariableDetailProps {
  id: Variable['id'];
  current?: Variable;
  prev?: Variable;
}

export function VariableDetail(props: VariableDetailProps) {
  const { id } = props;
  const { variables, commits, collections } = useContext(AppContext);

  const current = props.current || variables.find((v) => v.id === id);
  const prev: Variable | undefined =
    props.prev || commits?.[0]?.variables.find((v: Variable) => v.id === id);

  const collection = collections.find((c) => c.id === current?.variableCollectionId);

  const renderIcon = (type: Variable['resolvedType']) => {
    switch (type) {
      case 'BOOLEAN':
        return <Boolean />;
      case 'COLOR':
        return <Color />;
      case 'STRING':
        return <String />;
      case 'FLOAT':
        return <Number />;
      default:
        return <Boolean />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className={styles.variableDetail__header}>
        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: 'var(--figma-color-text-secondary)', fontWeight: 'normal' }}>
            {collection ? collection.name : ''}
          </div>
          <ChevronRight size={14} style={{ color: 'var(--figma-color-icon-tertiary)' }} />
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {current ? renderIcon(current?.resolvedType) : null}
            {current?.name}
          </div>
          {/* {prev?.name} */}
        </div>
      </div>

      <div style={{ overflow: 'auto' }}>
        {current ? (
          <>
            <ValuesByModeDiff current={current} prev={prev} />
            <DescriptionDiff current={current} prev={prev} />
            <CodeSyntaxDiff current={current} prev={prev} />
            <VariableScopesDiff current={current} prev={prev} />
          </>
        ) : null}
      </div>
    </div>
  );
}
