const variables = [
  {
    id: 'VariableID:409:3',
    name: 'Green',
    description: 'Green Color',
    variableCollectionId: 'VariableCollectionId:409:2',
    key: 'd5464d58dd0e2767312e3fe801f552ea866c4629',
    remote: false,
    resolvedType: 'COLOR',
    valuesByMode: {
      '409:0': {
        r: 0.1462387591600418,
        g: 0.5413573980331421,
        b: 0.25687211751937866,
        a: 1,
      },
    },
    scopes: ['TEXT_FILL'],
    hiddenFromPublishing: false,
    codeSyntax: {},
  },
  {
    id: 'VariableID:423:4',
    name: 'Red',
    description: 'Red Color',
    variableCollectionId: 'VariableCollectionId:409:2',
    key: '316de60f06a9e4278a2815902ea97ee822e40c0d',
    remote: false,
    resolvedType: 'COLOR',
    valuesByMode: {
      '409:0': {
        r: 0.8273600339889526,
        g: 0.23503811657428741,
        b: 0.23503811657428741,
        a: 1,
      },
    },
    scopes: ['ALL_SCOPES'],
    hiddenFromPublishing: false,
    codeSyntax: {},
  },
  {
    id: 'VariableID:712:3',
    name: 'font-size-small',
    description: '',
    variableCollectionId: 'VariableCollectionId:712:2',
    key: 'b40d51bd624e53380e8934bbae036156e6b3bf56',
    remote: false,
    resolvedType: 'FLOAT',
    valuesByMode: {
      '712:0': 12,
    },
    scopes: ['ALL_SCOPES'],
    hiddenFromPublishing: false,
    codeSyntax: {},
  },
  {
    id: 'VariableID:712:5',
    name: 'font-size-middle',
    description: '',
    variableCollectionId: 'VariableCollectionId:712:2',
    key: '03a11176b3796d324d76809aa89ead565f06be7f',
    remote: false,
    resolvedType: 'FLOAT',
    valuesByMode: {
      '712:0': 14,
    },
    scopes: ['ALL_SCOPES'],
    hiddenFromPublishing: false,
    codeSyntax: {},
  },
];

const collections = [
  {
    id: 'VariableCollectionId:409:2',
    name: 'DefaultCollection',
    hiddenFromPublishing: false,
    key: '8fcaebab303291bec89cca5d732dfcfc30a6f3ed',
    defaultModeId: '409:0',
    modes: [
      {
        name: 'Mode 1',
        modeId: '409:0',
      },
    ],
    remote: false,
    variableIds: ['VariableID:409:3', 'VariableID:423:4'],
  },
  {
    id: 'VariableCollectionId:712:2',
    name: 'Collection2',
    hiddenFromPublishing: false,
    key: '1a9db11ecbf71f3792de54378c8835657bf5bdc3',
    defaultModeId: '712:0',
    modes: [
      {
        name: 'Mode 1',
        modeId: '712:0',
      },
    ],
    remote: false,
    variableIds: ['VariableID:712:3', 'VariableID:712:5'],
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
