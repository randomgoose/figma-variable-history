(function mockFigmaAPI() {
  const { localVariables, localVariableCollections, sharedPluginData } = window.FIGMA_MOCK_DATA;
  const dataArr = sharedPluginData
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch (e) {}
      return null;
    })
    .filter(Boolean);

  window.__html__ = '';
  window.figma = {
    showUI() {},
    root: {
      getSharedPluginDataKeys(namespace) {
        return dataArr.map(({ date }) => `${namespace}${date}`);
      },
      getSharedPluginData(namespace, key) {
        for (let i = 0; i < key.length; i++) {
          const { date } = dataArr[i];
          if (key.endsWith(date)) {
            return sharedPluginData[i];
          }
        }
        return null;
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
