const variables = [
  {
    id: 'VariableID:4:2',
    name: 'white',
    description: '',
    variableCollectionId: 'VariableCollectionId:1:2',
    key: '9961d0fc010b6a4834f1fb36246d435c34f68a4b',
    remote: false,
    resolvedType: 'COLOR',
    valuesByMode: {
      '1:0': {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
      },
    },
    scopes: ['ALL_SCOPES'],
    hiddenFromPublishing: false,
    codeSyntax: {},
  },
];

const collections = [
  {
    id: 'VariableCollectionId:1:2',
    name: 'Collection 1',
    hiddenFromPublishing: false,
    key: 'c863dd366df620f305d002927f68addd0e49b1d3',
    defaultModeId: '1:0',
    modes: [
      {
        name: 'Mode 1',
        modeId: '1:0',
      },
    ],
    remote: false,
    variableIds: ['VariableID:4:2'],
  },
];

const collaborators = [
  {
    id: '1232300847399402794',
    photoUrl: 'https://s3-alpha.figma.com/profile/a93e4d10-df01-4fec-8897-4cf88fd5a373',
    name: 'Helium',
    color: '#667799',
    sessionId: 465,
  },
];

const pluginData = [
  {
    id: '1717658979449',
    date: 1717658979449,
    summary: 'Update color green',
    description: '',
    variables: variables.map((variable) => {
      if (variable.name === 'Red') {
        return {
          ...variable,
          description: 'Color RED',
          valuesByMode: {
            '409:0': {
              r: 0.8273600339889526,
              g: 0.3350381165742874,
              b: 0.4350381165742874,
              a: 1,
            },
          },
          codeSyntax: {
            WEB: 'Hello WEB',
            ANDROID: 'Hello ANDROID',
            iOS: 'Hello iOS',
          },
          scopes: ['TEXT_CONTENT', 'TEXT_FILL'],
        };
      }
      return variable;
    }),
    collections,
    collaborators,
  },
  {
    id: '1717658914999',
    date: 1717658914999,
    summary: 'initial commit',
    description: '',
    variables,
    collections,
    collaborators,
  },
];

window.FIGMA_MOCK_DATA = {
  localVariables: variables,
  localVariableCollections: collections,
  sharedPluginData: pluginData.map((obj) => JSON.stringify(obj)),
};
