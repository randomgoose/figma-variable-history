export function getCodeSyntax(name: string): { [platform in CodeSyntaxPlatform]: string } {
  const parts = name.split('/');

  return {
    WEB: `var(--${parts.join('-')})`.replaceAll('_', '-').replaceAll(' ', '-').toLowerCase(),
    ANDROID: `@color/${parts.join('_')}`,
    iOS: `${parts.join('.')}`,
  };
}
