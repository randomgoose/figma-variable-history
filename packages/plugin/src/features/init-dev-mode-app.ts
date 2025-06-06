import { convertVariablesToCss } from '.';
import { figmaHelper } from '../utils/figma-helper';
import { MESSAGE_TYPE } from '../utils/message';

export async function initDevModeApp() {
  const variables = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  await figmaHelper.loadUI('dev');
  const compiledVariables = await convertVariablesToCss({ variables, collections }, 'RGB');

  figma.ui.postMessage({
    type: MESSAGE_TYPE.EXPORT_CODE_DONE,
    payload: {
      commitId: 'current',
      code: {
        WEB: {
          'variables.css': compiledVariables,
        },
      },
    },
  });
}
