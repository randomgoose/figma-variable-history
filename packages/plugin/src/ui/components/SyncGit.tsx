// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import { emit, once } from '@create-figma-plugin/utilities';
import { Button, Textbox } from '@create-figma-plugin/ui';

import { syncToGit, SyncToGitStage, SyncToGitResult } from '../../features/sync-to-git';
import { AppContext } from '../../AppContext';
import {
  ConvertCommitVariablesToCssHandler,
  ConvertCommitVariablesToCssDoneHandler,
  SetPluginSettingHandler,
} from '../../types';
import styles from '../styles.module.css';

export function SyncGit() {
  const { setting, commits } = useContext(AppContext);
  const [stage, setStage] = useState<SyncToGitStage | ''>('');
  const [result, setResult] = useState<SyncToGitResult | null>(null);
  const [cssContent, setCssContent] = useState<string | null>(null);
  const [gitInfo, setGitInfo] = useState({
    repository: '',
    owner: '',
    token: '',
    filePath: '',
  });

  const placeholder: Record<string, string> = {
    token: 'GitHub User Token',
    repository: 'Repository Name',
    owner: 'Repository Owner Username',
    filePath: 'CSS Variable File Path',
  };

  const commitId = useMemo(() => {
    return commits[0]?.id;
  }, [commits]);

  const disabled = useMemo(() => {
    return (
      !commitId ||
      cssContent === null ||
      Object.entries(gitInfo).filter(([, value]) => !value).length > 0
    );
  }, [commitId, cssContent, gitInfo]);

  useEffect(() => {
    emit<ConvertCommitVariablesToCssHandler>('CONVERT_VARIABLES_TO_CSS', commitId);
    once<ConvertCommitVariablesToCssDoneHandler>('CONVERT_VARIABLES_TO_CSS_DONE', (css) =>
      setCssContent(decodeURIComponent(css))
    );
  }, [commitId]);

  useEffect(() => {
    if (setting?.git) {
      setGitInfo({
        ...gitInfo,
        ...setting?.git,
      });
    }
  }, [setting?.git]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sync = async (commitId = commits[0]?.id) => {
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

  return (
    <div>
      <div className={styles.commitForm} style={{ padding: 0 }}>
        {Object.entries(gitInfo).map(([key, value]) => {
          return (
            <Textbox
              width={240}
              variant="border"
              value={value}
              placeholder={placeholder[key] || key}
              onChange={(e) =>
                setGitInfo({
                  ...gitInfo,
                  [key]: e.currentTarget.value,
                })
              }
            />
          );
        })}
      </div>

      <div>
        {stage === 'fetch_repo_info'
          ? 'Fetching repository info'
          : stage === 'create_branch'
          ? 'New branch created'
          : stage === 'update_file'
          ? 'Variable file updated'
          : stage === 'create_pr'
          ? 'Pull request created'
          : ''}
        {result ? <div>{JSON.stringify(result, null, 2)}</div> : null}
      </div>

      <div>
        <Button
          onClick={() => {
            emit<SetPluginSettingHandler>('SET_PLUGIN_SETTING', { git: gitInfo });
          }}
        >
          Save Repository Info
        </Button>
        <Button style={{ marginLeft: 20 }} disabled={disabled} onClick={() => sync()}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
