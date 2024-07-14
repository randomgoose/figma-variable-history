import { useContext } from 'react';
import { ParsedValue } from '../ParsedValue';

import { AppContext } from '../../../AppContext';
import { isSameVariableValue } from '../../../utils/variable';
import { Root, Trigger, Portal, Content, Item } from '@radix-ui/react-dropdown-menu';
import { ArrowRight, ChevronDown } from 'lucide-react';

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
    <div className={'variableDetail-section'}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h3 className={'variableDetail-sectionTitle'} style={{ margin: 0 }}>
          Values
        </h3>
        {showColorFormatPicker ? (
          <Root>
            <Trigger className="ml-auto flex items-center gap-1">
              {colorFormat}
              <ChevronDown size={12} style={{ color: 'var(--figma-color-text-tertiary)' }} />
            </Trigger>
            <Portal>
              <Content className="dropdown-content">
                <Item
                  className="dropdown-item"
                  onClick={() => {
                    setColorFormat('RGB');
                  }}
                >
                  RGB
                </Item>
                <Item
                  className="dropdown-item"
                  onClick={() => {
                    setColorFormat('HEX');
                  }}
                >
                  HEX
                </Item>
              </Content>
            </Portal>
          </Root>
        ) : // <Dropdown
        //   value={colorFormat}
        //   onChange={(e) => {
        //     setColorFormat(e.currentTarget.value === 'RGB' ? 'RGB' : 'HEX');
        //   }}
        //   options={[{ value: 'RGB' }, { value: 'HEX' }]}
        //   style={{ marginLeft: 'auto', width: 64 }}
        // />
        null}
      </div>

      {prev
        ? changedValues.map(([modeId]) => (
            <div className={'variableDetail-item'} key={modeId}>
              <div>
                {collection?.modes.find((mode) => mode.modeId === modeId)?.name || 'Removed mode'}
              </div>
              <div>
                <ParsedValue
                  variable={prev}
                  modeId={modeId}
                  option={{ format: colorFormat, showLabel: true }}
                />
              </div>
              <div className={'variableDetail-itemArrow'}>
                <ArrowRight className="text-[color:var(--figma-color-icon-tertiary)]" size={14} />
                {/* <IconArrowRight16 /> */}
              </div>
              <div>
                <ParsedValue
                  variable={current}
                  modeId={modeId}
                  option={{ format: colorFormat, showLabel: true }}
                />
              </div>
            </div>
          ))
        : Object.entries(current?.valuesByMode).map(([modeId]) => (
            <div
              className={'variableDetail-item'}
              style={{ display: 'flex', alignItems: 'center' }}
              key={modeId}
            >
              <div>
                {collection?.modes.find((mode) => mode.modeId === modeId)?.name || 'Removed mode'}
              </div>
              <div>
                <ParsedValue
                  variable={current}
                  modeId={modeId}
                  option={{ format: colorFormat, showLabel: true }}
                />
              </div>
            </div>
          ))}
    </div>
  ) : null;
}
