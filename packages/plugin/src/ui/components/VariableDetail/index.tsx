import { DescriptionDiff } from './DescriptionDiff';
import { ValuesByModeDiff } from './ValuesByModeDiff';
import { VariableScopesDiff } from './VariableScopesDiff';
import { CodeSyntaxDiff } from './CodeSyntaxDiff';

export interface VariableDetailProps {
  current?: Variable;
  currentCollection?: VariableCollection;
  prev?: Variable;
  prevCollection?: VariableCollection;
}

export function VariableDetail(props: VariableDetailProps) {
  const { prevCollection, currentCollection, current, prev } = props;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="overflow-auto">
        {current ? (
          <>
            <ValuesByModeDiff
              current={current}
              prev={prev}
              currentCollection={currentCollection}
              prevCollection={prevCollection}
            />
            <DescriptionDiff current={current} prev={prev} />
            <CodeSyntaxDiff current={current} prev={prev} />
            <VariableScopesDiff current={current} prev={prev} />
          </>
        ) : null}
      </div>
    </div>
  );
}
