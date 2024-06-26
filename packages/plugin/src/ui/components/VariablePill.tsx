// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

interface VariablePillProps {
  type: Variable['resolvedType'] | 'TRUE' | 'FALSE';
  value: string | boolean | number;
}

export function VariablePill(props: VariablePillProps) {
  const { type, value } = props;

  const styles = {
    width: 'fit-content',
    height: 20,
    backgroundColor: 'var(--figma-color-bg-secondary)',
    color: 'var(--figma-color-text-primary)',
    border: '1px solid var(--figma-color-border)',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 3,
    paddingRight: 5,
    gap: 3,
  };

  const renderIcon = () => {
    switch (type) {
      case 'TRUE':
        return (
          <svg
            class="svg"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="17"
            viewBox="0 0 16 17"
          >
            <path
              fill="#000"
              fill-opacity=".5"
              fill-rule="evenodd"
              stroke="none"
              d="M5.5 4.672c-2.21 0-4 1.791-4 4 0 2.21 1.79 4 4 4h5c2.21 0 4-1.79 4-4 0-2.209-1.79-4-4-4h-5zm5 1c-1.657 0-3 1.344-3 3 0 1.657 1.343 3 3 3 1.657 0 3-1.343 3-3 0-1.656-1.343-3-3-3z"
            ></path>
          </svg>
        );
      case 'FALSE':
        return (
          <svg
            class="svg"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="17"
            viewBox="0 0 16 17"
          >
            <path
              fill="#000"
              fill-opacity=".5"
              fill-rule="evenodd"
              stroke="none"
              d="M5.5 5.672c1.657 0 3 1.344 3 3 0 1.657-1.343 3-3 3-1.657 0-3-1.343-3-3 0-1.656 1.343-3 3-3zm2.646 6c.83-.733 1.354-1.805 1.354-3 0-1.194-.524-2.267-1.354-3H10.5c1.657 0 3 1.344 3 3 0 1.657-1.343 3-3 3H8.146zm6.354-3c0-2.209-1.79-4-4-4h-5c-2.21 0-4 1.791-4 4 0 2.21 1.79 4 4 4h5c2.21 0 4-1.79 4-4z"
            ></path>
          </svg>
        );
      case 'STRING':
        return (
          <svg
            class="svg"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path
              fill="#000"
              fill-opacity=".5"
              fill-rule="evenodd"
              stroke="none"
              d="M3 3h10v3h-1V4H8.5v8H10v1H6v-1h1.5V4H4v2H3V3z"
            ></path>
          </svg>
        );
      case 'FLOAT':
        return (
          <svg
            class="svg"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path
              fill="#000"
              fill-opacity=".5"
              fill-rule="evenodd"
              stroke="none"
              d="M6.276 3.002c.275.025.473.267.443.542l-.213 1.913h3.438l.223-2.003c.03-.274.278-.477.553-.452.275.025.473.267.443.542l-.213 1.913h1.55c.276 0 .5.224.5.5 0 .276-.224.5-.5.5h-1.66l-.334 3H12.5c.276 0 .5.224.5.5 0 .276-.224.5-.5.5h-2.105l-.233 2.093c-.03.274-.278.477-.553.452-.275-.025-.473-.267-.443-.542l.223-2.003H5.95l-.232 2.093c-.03.274-.278.477-.553.452-.275-.025-.474-.267-.443-.542l.222-2.003H3.5c-.276 0-.5-.224-.5-.5 0-.276.224-.5.5-.5h1.556l.333-3H3.5c-.276 0-.5-.224-.5-.5 0-.276.224-.5.5-.5h2l.223-2.003c.03-.274.278-.477.553-.452zM9.5 9.457l.333-3H6.395l-.334 3H9.5z"
            ></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ ...styles }}>
      {renderIcon()}
      {value}
    </div>
  );
}
