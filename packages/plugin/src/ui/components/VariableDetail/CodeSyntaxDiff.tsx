// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowRight } from 'lucide-react';

export function CodeSyntaxDiff({ current, prev }: { current: Variable; prev?: Variable }) {
  const showCodeSyntax =
    (prev &&
      (prev.codeSyntax.ANDROID !== current.codeSyntax.ANDROID ||
        prev.codeSyntax.iOS !== current.codeSyntax.iOS ||
        prev.codeSyntax.WEB !== current.codeSyntax.WEB)) ||
    !prev;

  const renderSyntax = (text?: string) => (
    <div
      className="truncate max-w-full leading-8"
      style={{
        color: text ? 'var(--figma-color-text)' : 'var(--figma-color-text-disabled)',
        display: 'block',
      }}
    >
      {text || 'No code syntax'}
    </div>
  );

  const platforms: CodeSyntaxPlatform[] = ['WEB', 'ANDROID', 'iOS'];

  return !showCodeSyntax ? null : (
    <div className={'variableDetail-section'}>
      <h3 className={'variableDetail-sectionTitle'}>Code Syntax</h3>
      {prev
        ? Object.keys({ ...prev.codeSyntax, ...current.codeSyntax }).map((platform) => {
            const prevSyntax = prev.codeSyntax[platform as CodeSyntaxPlatform];
            const currentSyntax = current.codeSyntax[platform as CodeSyntaxPlatform];

            return prevSyntax === currentSyntax ? null : (
              <div key={platform} className={'variableDetail-item'}>
                <div>{platform}</div>
                {renderSyntax(prevSyntax)}
                <div
                  className={'flex items-center justify-center'}
                  style={{ color: 'var(--figma-color-icon-tertiary)' }}
                >
                  <ArrowRight size={14} />
                </div>
                {renderSyntax(currentSyntax)}
              </div>
            );
          })
        : platforms.map((platform) => {
            return (
              <div
                key={platform}
                className={'variableDetail-item'}
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
