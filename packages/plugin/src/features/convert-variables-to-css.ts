import { isUndefined } from 'lodash-es';
import { ICommit } from '../types';
import {
  convertFigmaRGBtoHexString,
  convertFigmaRGBtoHSLString,
  convertFigmaRGBtoString,
} from '../utils/color';

export async function convertVariablesToCss(
  commit: ICommit,
  colorFormat: 'HEX' | 'RGB' | 'HSL' = 'RGB'
) {
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
              if (isUndefined(valuesByMode[modeId])) return '';

              const value = valuesByMode[modeId];
              let cssValue = '';

              switch (typeof value) {
                case 'object':
                  if ('type' in value) {
                    const alias = (
                      await figma.variables.getVariableByIdAsync(value.id)
                    )?.name.replaceAll('/', '-');
                    alias && (cssValue = `var(--${alias})`);
                    // Remove this code because both remote and local variables can be imported with getVariableByIdAsync

                    // if (value.id.includes('/')) {
                    //   const key = value.id.split('/')[0].split(':')[1];
                    //   const alias = (
                    //     await figma.variables.importVariableByKeyAsync(key)
                    //   )?.name.replaceAll('/', '-');
                    //   alias && (cssValue = `var(--${alias})`);
                    // } else {
                    //   const alias = (
                    //     await figma.variables.getVariableByIdAsync(value.id)
                    //   )?.name.replaceAll('/', '-');
                    //   alias && (cssValue = `var(--${alias})`);
                    // }
                  } else if ('r' in value) {
                    if (colorFormat === 'RGB') {
                      cssValue = convertFigmaRGBtoString(value);
                    } else if (colorFormat === 'HSL') {
                      cssValue = convertFigmaRGBtoHSLString(value);
                    } else {
                      cssValue = convertFigmaRGBtoHexString(value);
                    }
                  }
                  break;
                case 'number':
                  cssValue = value.toString() + 'px';
                  break;
                default:
                  break;
              }

              return cssValue ? `  --${name.replaceAll('/', '-')}: ${cssValue};` : '';
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
