import styles from '../../styles.module.css';
import { difference, intersection } from 'lodash-es';
import { ArrowRight } from 'lucide-react';

function ScopeCheckbox({
  label,
  sub = false,
  checked,
}: {
  label: string;
  sub?: boolean;
  checked: boolean;
}) {
  return (
    <div style={{ height: 32, display: 'flex', alignItems: 'center', paddingLeft: sub ? 24 : 0 }}>
      <input disabled type="checkbox" key={label} checked={checked}></input>
      <label>{label}</label>
    </div>
  );
}

export function VariableScopesDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderScopeGroups = () => {
    let scopeGroups: { label: string; sub?: boolean; scopes: VariableScope[] }[] = [];

    switch (current.resolvedType) {
      case 'STRING':
        scopeGroups = [
          { label: 'Show in all supported properties', scopes: ['ALL_SCOPES'] },
          { label: 'Text content', scopes: ['ALL_SCOPES', 'TEXT_CONTENT'] },
          { label: 'Font family', scopes: ['ALL_SCOPES', 'FONT_FAMILY'] },
          { label: 'Font style', scopes: ['ALL_SCOPES', 'FONT_STYLE'] },
        ];
        break;
      case 'BOOLEAN':
        scopeGroups = [{ label: '', scopes: ['ALL_SCOPES'] }];
        break;
      case 'FLOAT':
        scopeGroups = [];
        break;
      default:
        scopeGroups = [
          { label: 'Show in all supported properties', scopes: ['ALL_SCOPES'] },
          { label: 'Fill', scopes: ['ALL_SCOPES', 'ALL_FILLS'] },
          { label: 'Frame', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL'], sub: true },
          { label: 'Shape', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'SHAPE_FILL'], sub: true },
          { label: 'Text', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'TEXT_FILL'], sub: true },
          { label: 'Stroke', scopes: ['ALL_SCOPES', 'STROKE_COLOR'] },
          { label: 'Effect', scopes: ['ALL_SCOPES', 'EFFECT_COLOR'] },
        ];
        break;
    }

    const hasChangedScopes = prev
      ? difference(current.scopes, prev.scopes).length !== 0 ||
        (difference(current.scopes, prev.scopes).length === 0 &&
          current.scopes.length !== prev.scopes.length)
      : false;

    return prev && hasChangedScopes ? (
      <div>
        <h3 className={styles.variableDetail__sectionTitle} style={{ textTransform: 'capitalize' }}>
          {current.resolvedType.toLowerCase()} Scoping
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {scopeGroups.map(({ label, scopes, sub }) => {
              const checked = intersection(scopes, prev.scopes).length > 0;
              return (
                <ScopeCheckbox key={label} label={label} sub={sub || false} checked={checked} />
              );
            })}
          </div>
          <div className={styles.variableDetail__itemArrow}>
            <ArrowRight />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {scopeGroups.map(({ label, scopes, sub }) => {
              const checked = intersection(scopes, current.scopes).length > 0;
              return (
                <ScopeCheckbox key={label} label={label} sub={sub || false} checked={checked} />
              );
            })}
          </div>
        </div>
      </div>
    ) : null;
  };

  return prev ? (
    difference(current.scopes, prev.scopes).length === 0 ? null : (
      <div className={styles.variableDetail__section}>{renderScopeGroups()}</div>
    )
  ) : null;
}
