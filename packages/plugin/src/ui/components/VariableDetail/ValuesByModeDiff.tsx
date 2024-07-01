import styles from '../../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { ParsedValue } from '../ParsedValue';
import { Dropdown, IconArrowRight16 } from '@create-figma-plugin/ui';
import { AppContext } from '../../../AppContext';
import { isSameVariableValue } from '../../../utils/variable';

export function ValuesByModeDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  const { collections, colorFormat, setColorFormat } = useContext(AppContext);
  const collection = collections.find((c) => c.id === current?.variableCollectionId);

  const changedValues = prev
    ? Object.entries(current?.valuesByMode).filter(
        ([modeId, value]) => !isSameVariableValue(value, prev.valuesByMode[modeId])
      )
    : [];

  const hasNewModes = prev
    ? Object.entries(current?.valuesByMode).find(
        ([modeId]) => prev.valuesByMode[modeId] === undefined
      )
    : false;

  const hasRemovedModes = prev
    ? Object.entries(prev?.valuesByMode).find(
        ([modeId]) => current.valuesByMode[modeId] === undefined
      )
    : false;

  const showValuesByMode =
    (prev && (changedValues.length || hasNewModes || hasRemovedModes)) || !prev;

  const showColorFormatPicker = current.resolvedType === 'COLOR';

  return showValuesByMode ? (
    <div className={styles.variableDetail__section}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 className={styles.variableDetail__sectionTitle} style={{ margin: 0 }}>
          Values
        </h3>
        {showColorFormatPicker ? (
          <Dropdown
            value={colorFormat}
            onChange={(e) => {
              setColorFormat(e.currentTarget.value === 'RGB' ? 'RGB' : 'HEX');
            }}
            options={[{ value: 'RGB' }, { value: 'HEX' }]}
            style={{ marginLeft: 'auto', width: 64 }}
          />
        ) : null}
      </div>

      {prev
        ? changedValues.map(([modeId]) => (
            <div className={styles.variableDetail__item} key={modeId}>
              <div>{collection?.modes.find((mode) => mode.modeId === modeId)?.name}</div>
              <div>
                <ParsedValue variable={prev} modeId={modeId} format={colorFormat} />
              </div>
              <div className={styles.variableDetail__itemArrow}>
                <IconArrowRight16 />
              </div>
              <div>
                <ParsedValue variable={current} modeId={modeId} format={colorFormat} />
              </div>
            </div>
          ))
        : Object.entries(current?.valuesByMode).map(([modeId]) => (
            <div
              className={styles.variableDetail__item}
              style={{ display: 'flex', alignItems: 'center' }}
              key={modeId}
            >
              <div>{collection?.modes.find((mode) => mode.modeId === modeId)?.name}</div>
              <div>
                <ParsedValue variable={current} modeId={modeId} format={colorFormat} />
              </div>
            </div>
          ))}
    </div>
  ) : null;
}
