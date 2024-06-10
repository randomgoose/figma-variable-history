import { ICommit } from '../types';
import { convertFigmaRGBtoString } from './convert-figma-rgb-to-string';

export async function convertVariablesToCss(commit: ICommit) {
  const { variables, collections } = commit;
  const modes = [];

  for (const collection of collections) {
    for (const mode of collection.modes) {
      modes.push(mode);
    }
  }

  return (
    await Promise.all(
      modes.map(async ({ name: modeName, modeId }) => {
        const variableCSSStatements = (
          await Promise.all(
            variables.map(async ({ name, valuesByMode }) => {
              if (!valuesByMode[modeId]) return '';

              const value = valuesByMode[modeId];
              let cssValue = '';

              switch (typeof value) {
                case 'object':
                  if ('type' in value) {
                    const alias = (await figma.variables.getVariableByIdAsync(value.id))?.name;
                    alias && (cssValue = `var(--${alias})`);
                  } else if ('r' in value) {
                    cssValue = convertFigmaRGBtoString(value);
                  }
                  break;
                default:
                  break;
              }

              return cssValue ? `  --${name.replaceAll('/', '-').toLowerCase()}: ${cssValue};` : '';
            })
          )
        ).filter(Boolean);

        return `[data-theme="${modeName}"] {
${variableCSSStatements.join('\n')}
}
`;
      })
    )
  ).join('\n');

  // const { modes, variableIds } = collection

  // // const variables = await Promise.all(variableIds.map(async id => await figma.variables.getVariableByIdAsync(id)))

  // return modes.map(mode => (
  //     `[data-theme=${mode.name}] {`
  //     + variables.map(v => v?.codeSyntax.WEB).join('\n')
  //     + `}`
  // ))
  // // const str = variables.map(v => `${v?.codeSyntax.WEB}: ${v?.valuesByMode}`)
}
