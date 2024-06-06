import { ICommit } from '../types';
import { convertFigmaRgbtoString } from './convert-figma-rgb-to-string';

export async function convertVariablesToCss(commit: ICommit) {
  const { variables, collections } = commit;

  return (
    await Promise.all(
      collections.map(async (c) =>
        (
          await Promise.all(
            c.modes.map(async (m) => {
              return (
                `[data-theme="${m.name}"] {\n` +
                (
                  await Promise.all(
                    variables
                      .filter((v) => v.valuesByMode[m.modeId])
                      .map(async (v) => {
                        const value = v.valuesByMode[m.modeId];
                        let cssValue = '';

                        switch (typeof value) {
                          case 'object':
                            if ('type' in value) {
                              cssValue = `var(--${
                                (await figma.variables.getVariableByIdAsync(value.id))?.name || ''
                              })`;
                            } else if ('r' in value) {
                              cssValue = convertFigmaRgbtoString(value);
                            }
                            break;
                          default:
                            cssValue = '';
                            break;
                        }

                        return `  --${v.name.replaceAll('/', '-').toLowerCase()}: ${cssValue};`;
                      })
                  )
                ).join('\n') +
                `\n}\n`
              );
            })
          )
        ).join('\n')
      )
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
