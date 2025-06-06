export const downloadAsJson = async (data: any) => {
  if (data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variable-history-commits.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const download = (data: any, type: string, filename: string) => {
  const dataStr = 'data:text/' + type + ';charset=utf-8,' + data;
  const dl = document.createElement('a');
  dl.setAttribute('href', dataStr);
  dl.setAttribute('download', filename);
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);
};
