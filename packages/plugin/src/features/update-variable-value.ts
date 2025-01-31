export const updateVariableValue = async (id: string, modeId: string, value: VariableValue) => {
  const variable = await figma.variables.getVariableByIdAsync(id);

  if (!variable) return;

  variable.setValueForMode(modeId, value);
};
