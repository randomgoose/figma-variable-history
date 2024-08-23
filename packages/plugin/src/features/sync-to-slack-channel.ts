import { ICommit } from '../types';

export type SyncToSlackChannelStage =
  | 'get_upload_url'
  | 'upload_file'
  | 'finish_upload'
  | 'success';

export async function syncToSlackChannel({
  filename,
  channelId,
  token,
  content,
  commit,
  onStageChange,
}: {
  filename: string;
  channelId: string;
  token: string;
  content: string;
  commit: ICommit;
  onStageChange: (stage: SyncToSlackChannelStage) => void;
}) {
  const blob = new Blob([content], { type: 'text/css' });
  const file = new File([blob], filename, { type: 'text/css' });
  const length = file.size;

  const getUploadURLExternal = async () => {
    const baseUrl = `https://slack.com/api/files.getUploadURLExternal?filename=${filename}&length=${length}&pretty=1`;

    const formData = new FormData();
    formData.append('token', token);

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        redirect: 'follow',
        body: formData,
      });
      const { ok, upload_url, file_id } = await response.json();

      if (ok) {
        return {
          upload_url,
          file_id,
        };
      }
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFile = async (url: string, filename: string) => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('file', file);
    formData.append('title', 'Variables');

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
      mode: 'no-cors',
    });
    return res.status;
  };

  // const sendMessage = async () => {
  //     const baseUrl = `https://slack.com/api/chat.postMessage`

  //     const formData = new FormData()
  //     formData.append('token', token)
  //     formData.append('channel', channelId)
  //     formData.append('text', 'Hello world')

  //     try {
  //         const response = await fetch(baseUrl, {
  //             method: 'POST',
  //             redirect: "follow",
  //             body: formData
  //         })
  //     } catch (error) {
  //         console.error(error)
  //     }
  // }

  const completeUploadExternal = async (file_id: string) => {
    const formData = new FormData();
    formData.append('files', JSON.stringify([{ id: file_id }]));
    formData.append('channel_id', channelId);
    formData.append('token', token);

    const res = await fetch('https://slack.com/api/files.completeUploadExternal', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data;
  };

  try {
    onStageChange('get_upload_url');
    const data = await getUploadURLExternal();

    if (data?.upload_url) {
      const status = await uploadFile(data.upload_url, filename);

      if (status === 0) {
        const formData = new FormData();
        formData.append('channel', channelId);
        formData.append('token', token);
        formData.append(
          'blocks',
          JSON.stringify([
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*[Variable History] Variable chagnes commited*`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Summary: *${commit.summary}*`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Author: *${commit?.collaborators[0]?.name || 'Someone'}*`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Description: *${commit?.description || 'No description'}*`,
              },
            },
          ])
        );

        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          body: formData,
        });

        onStageChange('upload_file');
        await completeUploadExternal(data.file_id);
      }

      onStageChange('finish_upload');
      onStageChange('success');
    }
  } catch (error) {
    console.error(error);
  }
}
