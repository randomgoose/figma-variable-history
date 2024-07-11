import { request } from '../utils/request';

export type SyncToGitStage = 'fetch_repo_info' | 'create_branch' | 'update_file' | 'create_pr';
export type SyncToGitResult = { success: boolean; message?: string; prURL?: string };

export async function syncToGit({
  branch,
  path,
  content,
  commitMessage,
  repository,
  pullRequest,
  onStageChange,
}: {
  branch: string;
  path: string;
  content: string;
  commitMessage: string;
  pullRequest: {
    title: string;
    body: string;
  };
  repository: { owner: string; name: string; token: string };
  onStageChange: (stage: SyncToGitStage) => void;
}): Promise<SyncToGitResult> {
  const baseUrl = `https://api.github.com/repos/${repository.owner}/${repository.name}`;
  const headers = {
    Authorization: `token ${repository.token}`,
    Accept: 'application/vnd.github.v3+json',
  };
  const response: { success: boolean; message?: string; prURL?: string } = { success: true };

  const checkoutNewBranch = async () => {
    let defaultBranchSha1 = '';
    let defaultBranch = '';

    try {
      const { default_branch } = await request({
        url: baseUrl,
        headers,
      });

      const {
        object: { sha },
      } = await request({
        url: `${baseUrl}/git/ref/heads/${default_branch}`,
        headers,
      });

      defaultBranchSha1 = sha;
      defaultBranch = default_branch;
    } catch (error) {
      console.error('Error fetching sha1 of repository base branch:', error);
      throw error;
    }

    try {
      await request({
        url: `${baseUrl}/git/refs`,
        method: 'POST',
        headers,
        data: {
          ref: `refs/heads/${branch}`,
          sha: defaultBranchSha1,
        },
      });
    } catch (error: any) {
      // status 422: branch already exists
      if (error.status !== 422) {
        console.error(`Error creating branch ${branch}:`, error);
        throw error;
      }
    }

    return { branch, defaultBranch };
  };

  const commitToBranch = async () => {
    const url = `${baseUrl}/contents/${path}`;

    try {
      const response = await request({ url: `${url}?ref=${branch}`, headers });
      await request({
        url,
        headers,
        method: 'PUT',
        data: {
          message: commitMessage,
          // Added a replacement to remove non Latin-1 characters
          content: btoa(
            decodeURIComponent(encodeURIComponent(content)).replaceAll(/[\u0250-\ue007]/g, '')
          ),
          branch,
          sha: response?.sha,
        },
      });
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw error;
    }
  };

  async function createPullRequest(baseBranch: string) {
    try {
      const { html_url } = await request({
        url: `${baseUrl}/pulls`,
        method: 'POST',
        headers,
        data: {
          title: pullRequest.title,
          body: pullRequest.body,
          head: branch,
          base: baseBranch,
        },
      });
      response.prURL = html_url;
    } catch (error: any) {
      // status 422: branch already exists
      if (error.status === 422) {
        error.message = `A pull request already exists for ${repository.name}/${branch}`;
      }
      console.error(`Error creating pull request ${pullRequest.title}:`, error);
      throw error;
    }
  }

  try {
    onStageChange('fetch_repo_info');
    const { defaultBranch } = await checkoutNewBranch();
    onStageChange('create_branch');
    await commitToBranch();
    onStageChange('update_file');
    await createPullRequest(defaultBranch);
    onStageChange('create_pr');
  } catch (error) {
    return { success: false, message: (error as any)?.message || 'Failed to create pull request' };
  }

  return response;
}
