import { ICommit } from '../types';

export async function sendCustomRequest({
  url,
  commit,
  content,
  onStageChange,
}: {
  url: string;
  commit: ICommit;
  content: string;
  onStageChange: (stage: string) => void;
}) {
  // const headers = new Headers()
  // headers.append('')

  const formdata = new FormData();

  const blob = new Blob([content], { type: 'text/css' });
  const file = new File([blob], 'variables.css', { type: 'text/css' });

  formdata.append('summary', commit.summary);
  formdata.append('description', commit.description || '');
  formdata.append('date', new Date(commit.date).toISOString());
  formdata.append('file', file);

  try {
    onStageChange('fetch');
    const res = await fetch(url, { method: 'POST', body: formdata });
    await res.json();
    onStageChange('success');
  } catch (e) {
    onStageChange('error');
    console.error(e);
  }
}
