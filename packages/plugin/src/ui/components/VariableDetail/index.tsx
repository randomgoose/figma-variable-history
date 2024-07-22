import { useContext } from 'react';
// import { CodeSyntaxDiff } from './CodeSyntaxDiff';
import { DescriptionDiff } from './DescriptionDiff';
import { ValuesByModeDiff } from './ValuesByModeDiff';
import { VariableScopesDiff } from './VariableScopesDiff';
import { AppContext } from '../../../AppContext';
import { CodeSyntaxDiff } from './CodeSyntaxDiff';

export interface VariableDetailProps {
  id: Variable['id'];
  current?: Variable;
  prev?: Variable;
}

export function VariableDetail(props: VariableDetailProps) {
  const { id } = props;
  const { variables, commits } = useContext(AppContext);

  const current = props.current || variables.find((v) => v.id === id);
  const prev: Variable | undefined =
    props.prev || commits?.[0]?.variables.find((v: Variable) => v.id === id);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="overflow-auto">
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
