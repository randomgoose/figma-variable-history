import clsx from 'clsx';
import styles from '../../styles.module.css';
import { difference, intersection } from 'lodash-es';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

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
      <label className="ml-2">{label}</label>
    </div>
  );
}

export function VariableScopesDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderScopeGroups = () => {
    let scopeGroups: { label: string; sub?: boolean; scopes: VariableScope[] }[] = [];
    switch (current.resolvedType) {
      case 'STRING':
        scopeGroups = [
          { label: t('scoping_all'), scopes: ['ALL_SCOPES'] },
          { label: t('scoping_text_content'), scopes: ['ALL_SCOPES', 'TEXT_CONTENT'] },
          { label: t('scoping_font_family'), scopes: ['ALL_SCOPES', 'FONT_FAMILY'] },
          { label: t('scoping_font_style'), scopes: ['ALL_SCOPES', 'FONT_STYLE'] },
        ];
        break;
      case 'BOOLEAN':
        scopeGroups = [{ label: t('scoping_all'), scopes: ['ALL_SCOPES'] }];
        break;
      case 'FLOAT':
        scopeGroups = [
          { label: t('scoping_all'), scopes: ['ALL_SCOPES'] },
          { label: t('scoping_corner_radius'), scopes: ['ALL_SCOPES', 'CORNER_RADIUS'] },
          { label: t('scoping_width_height'), scopes: ['ALL_SCOPES', 'WIDTH_HEIGHT'] },
          { label: t('scoping_gap'), scopes: ['ALL_SCOPES', 'GAP'] },
          { label: t('scoping_text_content'), scopes: ['ALL_SCOPES', 'TEXT_CONTENT'] },
          { label: t('scoping_stroke'), scopes: ['ALL_SCOPES', 'STROKE_FLOAT'] },
          { label: t('scoping_layer_opacity'), scopes: ['ALL_SCOPES', 'OPACITY'] },
          { label: t('scoping_effects'), scopes: ['ALL_SCOPES', 'EFFECT_FLOAT'] },
          { label: t('scoping_font_weight'), scopes: ['ALL_SCOPES', 'FONT_WEIGHT'] },
          { label: t('scoping_font_size'), scopes: ['ALL_SCOPES', 'FONT_SIZE'] },
          { label: t('scoping_line_height'), scopes: ['ALL_SCOPES', 'LINE_HEIGHT'] },
          { label: t('scoping_letter_spacing'), scopes: ['ALL_SCOPES', 'LETTER_SPACING'] },
          { label: t('scoping_paragraph_spacing'), scopes: ['ALL_SCOPES', 'PARAGRAPH_SPACING'] },
          { label: t('scoping_paragraph_indent'), scopes: ['ALL_SCOPES', 'PARAGRAPH_INDENT'] },
        ];
        break;
      default:
        scopeGroups = [
          { label: t('scoping_all'), scopes: ['ALL_SCOPES'] },
          { label: t('scoping_fill'), scopes: ['ALL_SCOPES', 'ALL_FILLS'] },
          {
            label: t('scoping_frame'),
            scopes: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL'],
            sub: true,
          },
          {
            label: t('scoping_shape'),
            scopes: ['ALL_SCOPES', 'ALL_FILLS', 'SHAPE_FILL'],
            sub: true,
          },
          { label: t('scoping_text'), scopes: ['ALL_SCOPES', 'ALL_FILLS', 'TEXT_FILL'], sub: true },
          { label: t('scoping_stroke'), scopes: ['ALL_SCOPES', 'STROKE_COLOR'] },
          { label: t('scoping_effects'), scopes: ['ALL_SCOPES', 'EFFECT_COLOR'] },
        ];
        break;
    }

    const hasChangedScopes = prev
      ? difference(current.scopes, prev.scopes).length !== 0 ||
        (difference(current.scopes, prev.scopes).length === 0 &&
          current?.scopes.length !== prev?.scopes.length)
      : false;

    return (
      <div>
        <h3 className={clsx(styles.variableDetail__sectionTitle, 'capitalize')}>
          {t(`${current.resolvedType.toLowerCase()}_scoping`)}
        </h3>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 40px minmax(0, 1fr)' }}>
          {prev ? (
            hasChangedScopes ? (
              <>
                <div className="flex flex-col">
                  {scopeGroups.map(({ label, scopes, sub }) => {
                    const checked = intersection(scopes, prev.scopes).length > 0;
                    return (
                      <ScopeCheckbox
                        key={label}
                        label={label}
                        sub={sub || false}
                        checked={checked}
                      />
                    );
                  })}
                </div>
                <div className={styles.variableDetail__itemArrow}>
                  <ArrowRight size={14} style={{ color: 'var(--figma-color-icon-tertiary)' }} />
                </div>
                <div className="flex flex-col">
                  {scopeGroups.map(({ label, scopes, sub }) => {
                    const checked = intersection(scopes, current.scopes).length > 0;
                    return (
                      <ScopeCheckbox
                        key={label}
                        label={label}
                        sub={sub || false}
                        checked={checked}
                      />
                    );
                  })}
                </div>
              </>
            ) : null
          ) : (
            <div>
              {scopeGroups.map(({ label, scopes, sub }) => {
                const checked = intersection(scopes, current.scopes).length > 0;
                return (
                  <ScopeCheckbox key={label} label={label} sub={sub || false} checked={checked} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (prev && difference(current.scopes, prev.scopes).length !== 0) || !prev ? (
    <div className={styles.variableDetail__section}>{renderScopeGroups()}</div>
  ) : null;
}
