// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { Number } from '../icons/Number';
import { String } from '../icons/String';

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
        return <String />;
      case 'FLOAT':
        return <Number />;
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
