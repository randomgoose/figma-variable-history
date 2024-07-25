import { useContext, useEffect, useState } from 'react';
import { SyncToGitResult, SyncToGitStage, syncToGit } from '../features/sync-to-git';
import { AppContext } from '../AppContext';

export function useSync() {
  const { commits } = useContext(AppContext);
  const [stage, setStage] = useState<SyncToGitStage | 'compile' | 'commit_success' | ''>('');
  const [result, setResult] = useState<SyncToGitResult | null>(null);
  const [cssContent, setCssContent] = useState<string | null>(null);

  // const commitId = useMemo(() => {
  //   return commits[0]?.id;
  // }, [commits]);

  useEffect(() => {
    addEventListener('message', (e) => {
      if (e.data.pluginMessage.type === 'CONVERT_VARIABLES_TO_CSS_DONE') {
        setCssContent(decodeURIComponent(e.data.pluginMessage.payload));
        // setStage('');
      }
    });
  }, []);

  const syncGit = async (commitId = commits[0]?.id, gitInfo: any) => {
    const disabled =
      !commitId ||
      cssContent === null ||
      Object.entries(gitInfo).filter(([, value]) => !value).length > 0;

    if (disabled) return;

    setResult(null);

    const _result = await syncToGit({
      content: cssContent as string,
      path: gitInfo.filePath,
      repository: {
        name: gitInfo.repository,
        owner: gitInfo.owner,
        token: gitInfo.token,
      },
      branch: `figma-variable-${commitId}`,
      commitMessage: `style: auto update css variables via Figma plugin accord to commit:${commitId}`,
      pullRequest: {
        title: `[Figma Variable History] ${commits[0].summary}`,
        body: `${commits[0].description || 'No description'}
        \n\nThis PR is created by Variable History plugin
        `,
      },
      onStageChange: (stage) => setStage(stage),
    });

    setResult(_result);
    setStage('success');
  };

  return {
    syncGit,
    stage,
    setStage,
    cssContent,
    result,
  };
}
