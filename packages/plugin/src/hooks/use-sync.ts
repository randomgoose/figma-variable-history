import { useContext, useState } from 'preact/hooks';
import { SyncToGitResult, SyncToGitStage, syncToGit } from '../features/sync-to-git';
import { AppContext } from '../AppContext';

export function useSync() {
  const { commits } = useContext(AppContext);
  const [stage, setStage] = useState<SyncToGitStage | ''>('');
  const [, setResult] = useState<SyncToGitResult | null>(null);
  const [cssContent] = useState<string | null>(null);

  // const commitId = useMemo(() => {
  //   return commits[0]?.id;
  // }, [commits]);

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
        title: `Auto update css variables via Figma plugin`,
        body: `This PR is created by FigmaVariableHistory plugin`,
      },
      onStageChange: (stage) => setStage(stage),
    });
    setResult(_result);
  };

  return {
    syncGit,
    stage,
  };
}
