import styles from '../../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Checkbox, IconArrowRight16, Text } from '@create-figma-plugin/ui';
import { difference, intersection } from 'lodash-es';

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
      <Checkbox
        disabled
        onValueChange={() => {
          return;
        }}
        key={label}
        value={checked}
      >
        <Text>{label}</Text>
      </Checkbox>
    </div>
  );
}

export function VariableScopesDiff({ current, prev }: { current: Variable; prev: Variable }) {
  const renderScopeGroups = (scopesApplied: VariableScope[]) => {
    let scopeGroups: { label: string; sub?: boolean; scopes: VariableScope[] }[] = [];

    switch (current.resolvedType) {
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
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {scopeGroups.map(({ label, scopes, sub }) => {
          const checked = intersection(scopes, scopesApplied).length > 0;
          return <ScopeCheckbox label={label} sub={sub} checked={checked} />;
        })}
      </div>
    );
  };

  return difference(current.scopes, prev.scopes).length === 0 ? null : (
    <div className={styles.variableDetail__section}>
      <h3 className={styles.variableDetail__sectionTitle}>Color Scoping</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)' }}>
        {renderScopeGroups(prev.scopes)}
        <div className={styles.variableDetail__itemArrow}>
          <IconArrowRight16 />
        </div>
        {renderScopeGroups(current.scopes)}
      </div>
    </div>
  );
}
