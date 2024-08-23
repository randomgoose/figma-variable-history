export function sendMessage(type: string, payload?: any) {
  parent.postMessage(
    {
      pluginMessage: {
        type,
        payload,
      },
      pluginId: '*',
    },
    '*'
  );
}
