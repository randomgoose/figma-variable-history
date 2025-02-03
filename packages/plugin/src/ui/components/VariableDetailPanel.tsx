import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const variableCodeSyntaxPlatforms: CodeSyntaxPlatform[] = ['WEB', 'ANDROID', 'iOS'];

export function VariableDetailPanel({
  variable,
  onChange,
}: {
  variable: Variable;
  onChange: (variable: Variable) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="p-4 grid grid-cols-[3fr_7fr] items-center gap-2 border-b border-[var(--figma-color-border)]">
        <label className="text-[var(--figma-color-text-secondary)]">{t('name')}</label>
        <input
          className="input"
          defaultValue={variable.name}
          onBlur={(e) => onChange({ ...variable, name: e.target.value })}
          placeholder="Used in design properties"
        />
        <label className="text-[var(--figma-color-text-secondary)]">{t('description')}</label>
        <input
          className="input-filled"
          defaultValue={variable.description}
          onBlur={(e) => onChange({ ...variable, description: e.target.value })}
          placeholder="How to use the variable"
        />
      </div>

      <div className="p-4 border-b border-[var(--figma-color-border)] font-medium">
        <div>{t('values')}</div>
      </div>

      <div className="px-4 pr-2 py-2 border-b border-[var(--figma-color-border)] font-medium">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <div className="h-6 flex justify-between items-center">
              {t('code_syntax')}{' '}
              <button className="btn-icon">
                <Plus strokeWidth={1} size={16} />
              </button>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="dropdown-content w-60">
            {variableCodeSyntaxPlatforms.map((platform) => (
              <DropdownMenu.Item className="dropdown-item" key={platform}>
                {platform}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>

      <div className="p-4 flex items-center gap-2">
        <Checkbox.Root
          className="bg-[var(--figma-color-bg-secondary)] rounded-[5px] border border-[var(--figma-color-border)] size-4 flex items-center justify-center"
          id="visibility"
          checked
          onCheckedChange={(checked) =>
            onChange({ ...variable, hiddenFromPublishing: checked ? true : false })
          }
        >
          <Checkbox.Indicator>
            {/* <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="manually-labeled-checkbox-module--iconMixed--mWIut"><path fill="var(--color-icon)" d="M4 8a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 8"></path></svg> */}
            <svg
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
              className="manually-labeled-checkbox-module--iconCheck--JwqOz"
            >
              <path
                fill="var(--figma-color-icon)"
                fill-rule="evenodd"
                d="M11.777 4.084a.5.5 0 0 1 .139.693l-4 6a.5.5 0 0 1-.77.077l-3-3a.5.5 0 1 1 .708-.708l2.568 2.57 3.662-5.493a.5.5 0 0 1 .693-.139"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label htmlFor="visibility">Hiding from publishing</label>
      </div>
    </div>
  );
}
