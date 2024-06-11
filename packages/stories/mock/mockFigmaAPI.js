(function mockFigmaAPI() {
  const { localVariables, localVariableCollections } = window.FIGMA_MOCK_DATA;

  window.__html__ = '';
  window.figma = {
    showUI() {},
    root: {
      setSharedPluginData(_namespace, key, data) {
        localStorage.setItem(key, data);
      },
      getSharedPluginData(_namespace, key) {
        return localStorage.getItem(key);
      },
    },
    variables: {
      getLocalVariables() {
        return localVariables;
      },
      async getLocalVariablesAsync() {
        return localVariables;
      },
      getLocalVariableCollections() {
        return localVariableCollections;
      },
      async getLocalVariableCollectionsAsync() {
        return localVariableCollections;
      },
    },
    widget: {},
  };
})();
