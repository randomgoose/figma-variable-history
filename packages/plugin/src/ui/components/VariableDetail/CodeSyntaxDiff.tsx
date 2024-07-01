import styles from '../../styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { IconArrowRight16 } from '@create-figma-plugin/ui';

export function CodeSyntaxDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  const showCodeSyntax =
    (prev &&
      (prev.codeSyntax.ANDROID !== current.codeSyntax.ANDROID ||
        prev.codeSyntax.iOS !== current.codeSyntax.iOS ||
        prev.codeSyntax.WEB !== current.codeSyntax.WEB)) ||
    !prev;

  const renderSyntax = (text?: string) => (
    <div style={{ color: text ? 'var(--figma-color-text)' : 'var(--figma-color-text-disabled)' }}>
      {text || 'No code syntax'}
    </div>
  );

  const platforms: CodeSyntaxPlatform[] = ['WEB', 'ANDROID', 'iOS'];

  return !showCodeSyntax ? null : (
    <div className={styles.variableDetail__section}>
      <h3 className={styles.variableDetail__sectionTitle}>Code Syntax</h3>
      {prev
        ? Object.keys({ ...prev.codeSyntax, ...current.codeSyntax }).map((platform) => {
            const prevSyntax = prev.codeSyntax[platform as CodeSyntaxPlatform];
            const currentSyntax = current.codeSyntax[platform as CodeSyntaxPlatform];

            return prevSyntax === currentSyntax ? null : (
              <div key={platform} className={styles.variableDetail__item}>
                <div>{platform}</div>
                {renderSyntax(prevSyntax)}
                <div className={styles.variableDetail__itemArrow}>
                  <IconArrowRight16 />
                </div>
                {renderSyntax(currentSyntax)}
              </div>
            );
          })
        : platforms.map((platform) => {
            return (
              <div
                key={platform}
                className={styles.variableDetail__item}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <div>{platform}</div>
                {renderSyntax(current.codeSyntax[platform])}
              </div>
            );
          })}
    </div>
  );
}
