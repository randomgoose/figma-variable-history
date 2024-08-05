import { DescriptionDiff } from './DescriptionDiff';
import { ValuesByModeDiff } from './ValuesByModeDiff';
import { VariableScopesDiff } from './VariableScopesDiff';
import { CodeSyntaxDiff } from './CodeSyntaxDiff';
import { NameDiff } from './NameDiff';

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
            <NameDiff current={current} prev={prev} />
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
        ) : prev ? (
          <>
            <NameDiff current={prev} />
            <ValuesByModeDiff
              current={prev}
              currentCollection={currentCollection}
              prevCollection={prevCollection}
            />
            <DescriptionDiff current={prev} />
            <CodeSyntaxDiff current={prev} />
            <VariableScopesDiff current={prev} />
          </>
        ) : null}
      </div>
    </div>
  );
}
