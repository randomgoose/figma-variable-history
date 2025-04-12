import * as Popover from '@radix-ui/react-popover';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { useContext, useMemo } from 'react';
import { AppContext } from '../../../AppContext';
import { isEmpty } from 'lodash-es';
import { useTranslation } from '../../../hooks/useTranslation';
import { Code, MessageSquare, X } from 'lucide-react';
import { TableContext } from './TableContext';
import clsx from 'clsx';

export function UsabilitySuggestions() {
  const { t } = useTranslation();
  const { variables } = useContext(AppContext);
  const { setFilter, filter } = useContext(TableContext);

  const variablesWithoutDescription = useMemo(
    () => variables.filter((v) => !v.description),
    [variables]
  );
  const variablesWithoutCodeSyntax = useMemo(
    () => variables.filter((v) => isEmpty(v.codeSyntax)),
    [variables]
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={clsx(
            'btn-outline flex gap-1',
            filter
              ? 'bg-[var(--figma-color-bg-warning-tertiary)] border-transparent text-[var(--figma-color-text-warning)]'
              : ''
          )}
        >
          {!filter ? (
            <>
              <IconAlertTriangleFilled
                className="text-[var(--figma-color-icon-warning)]"
                size={12}
              />
              {t('usability_suggestions')}
            </>
          ) : filter === 'no_description' ? (
            <>
              Filter: without description
              <button onClick={() => setFilter(null)}>
                <X size={12} className="text-[var(--figma-color-text-warning)]" />
              </button>
            </>
          ) : (
            <>
              Filter: without code syntax
              <button onClick={() => setFilter(null)}>
                <X size={12} className="text-[var(--figma-color-text-warning)]" />
              </button>
            </>
          )}
        </button>
      </Popover.Trigger>
      {!filter && (
        <Popover.Content className="popover w-[280px] min-h-40">
          <div className="flex flex-col">
            <div className="h-10 flex items-center px-2 border-b border-[var(--figma-color-border)] font-semibold">
              <h3>{t('usability_suggestions')}</h3>
            </div>

            <div>
              <div className="px-2 h-12 border-b flex items-center">
                <div className="w-8 h-8 rounded-[5px] flex items-center justify-center bg-[var(--figma-color-bg-secondary)] p-1">
                  <MessageSquare
                    size={16}
                    strokeWidth={1.5}
                    className="text-[var(--figma-color-text-secondary)]"
                  />
                </div>
                <div className="ml-2">
                  <div className="font-medium">{t('variables_without_description')}</div>
                  <div className="text-[var(--figma-color-text-secondary)]">
                    {variablesWithoutDescription.length}
                  </div>
                </div>

                <button className="ml-auto" onClick={() => setFilter('no_description')}>
                  {t('filter')}
                </button>
              </div>
              <div className="px-2 h-12 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-[5px] flex items-center justify-center bg-[var(--figma-color-bg-secondary)] p-1">
                    <Code
                      size={16}
                      strokeWidth={1.5}
                      className="text-[var(--figma-color-text-secondary)]"
                    />
                  </div>
                  <div className="ml-2">
                    <div className="font-medium">{t('variables_without_code_syntax')}</div>
                    <div className="text-[var(--figma-color-text-secondary)]">
                      {variablesWithoutCodeSyntax.length}
                    </div>
                  </div>
                </div>

                <button className="ml-auto" onClick={() => setFilter('no_code_syntax')}>
                  {t('filter')}
                </button>
                <button className="ml-auto">{t('generate_code_syntax')}</button>
              </div>
            </div>
          </div>
        </Popover.Content>
      )}
    </Popover.Root>
  );
}
