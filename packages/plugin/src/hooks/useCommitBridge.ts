import { ICommit } from '../types';
import { supabase } from '../lib/supabase';
import { Delta } from 'jsondiffpatch';
import { omit } from 'lodash-es';
import { jsonDiff, jsonPatch, jsonUnpatch } from '../utils/json-patch';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MESSAGE_TYPE, sendMessage } from '../utils/message';
import { useQueryClient } from '@tanstack/react-query';
import { PLUGIN_DATA_KEY_FILE_UUID } from '../config';
import { updateObjectValues } from '../utils/object';

type CommitInPluginData = Omit<ICommit, 'variables' | 'collections'> & {
  delta: { variables: Delta; collections: Delta };
};

export function useCommitBridge(fileUUID: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['file', fileUUID],
    queryFn: async () => await supabase.from('files').select('*').eq('id', fileUUID).single(),
    enabled: !!fileUUID,
    refetchOnWindowFocus: true,
  });

  const commitDiffPatches: CommitInPluginData[] = data?.data?.commits || [];
  const head: ICommit | null = data?.data?.head || null;

  function getCommitByIndex(index: number, baseCommitInfo?: { commit: ICommit; index: number }) {
    if (!head || !(index > -1)) return null;

    const targetCommit = commitDiffPatches?.[index];
    const baseCommit = baseCommitInfo ? baseCommitInfo.commit : head;
    const baseIndex = baseCommitInfo ? baseCommitInfo.index : 0;

    const recoverJson = (type: 'variables' | 'collections') => {
      const deltas = commitDiffPatches
        ?.slice(...[baseIndex, index].sort((a, b) => a - b))
        .map(({ delta }) => delta[type]);

      return baseIndex < index
        ? jsonUnpatch(baseCommit[type] || [], deltas)
        : jsonPatch(baseCommit[type] || [], deltas?.reverse());
    };

    return {
      ...omit(targetCommit, ['delta']),
      variables: recoverJson('variables'),
      collections: recoverJson('collections'),
    };
  }

  const getCommits = (commitDiffPatches: CommitInPluginData[]) => {
    let lastCommitInfo: { commit: ICommit; index: number } | null = null;

    return commitDiffPatches
      ?.map((_, index) => {
        const commit = getCommitByIndex(index, lastCommitInfo || undefined);
        commit && (lastCommitInfo = { index, commit });
        return commit;
      })
      .filter(Boolean) as ICommit[];
  };

  async function commitAsync(data: ICommit) {
    const commitDiffPatch: CommitInPluginData = {
      ...omit(data, ['variables', 'collections', 'ignoredVariableIds']),
      collaborators: data.collaborators,
      delta: { variables: undefined, collections: undefined },
    };

    const { variables: headVariables = [], collections: headCollections = [] } = head || {};
    const ignoredIds = data.ignoredVariableIds || [];

    const filteredVariables = [
      ...data.variables.filter(({ id }) => !ignoredIds.includes(id)),
      ...headVariables.filter(({ id }) => ignoredIds.includes(id)),
    ];

    commitDiffPatch.delta.variables = jsonDiff(headVariables, filteredVariables);
    commitDiffPatch.delta.collections = jsonDiff(headCollections, data.collections);

    const res = await supabase
      .from('files')
      .upsert(
        fileUUID
          ? {
              id: fileUUID,
              commits: [commitDiffPatch, ...(commitDiffPatches || [])],
              head: { ...data, variables: filteredVariables },
            }
          : {
              commits: [commitDiffPatch, ...(commitDiffPatches || [])],
              head: { ...data, variables: filteredVariables },
            }
      )
      .select()
      .single();

    if (res.error) {
      console.error(res.error);
      return;
    }

    return res.data;
  }

  const commitMutation = useMutation({
    mutationFn: commitAsync,
    onSuccess: (data) => {
      const { id } = data;

      sendMessage(MESSAGE_TYPE.SET_PLUGIN_DATA, {
        [PLUGIN_DATA_KEY_FILE_UUID]: id,
      });

      queryClient.invalidateQueries({ queryKey: ['file', id] });
    },
  });

  async function updateIdInStorageAsync(idChangeMap: Record<string, string>) {
    if (!head) return;

    const updatedHead = updateObjectValues(head, (value) => idChangeMap[value] || value);
    const updatedCommits = updateObjectValues(
      commitDiffPatches,
      (value) => idChangeMap[value] || value
    );

    const res = await supabase
      .from('files')
      .update({
        head: updatedHead,
        commits: updatedCommits,
      })
      .eq('id', fileUUID)
      .select()
      .single();

    if (res.error) {
      console.error(res.error);
      return;
    }

    return res.data;
  }

  const updateIdInStorageMutation = useMutation({
    mutationFn: updateIdInStorageAsync,
  });

  // const getCommits = useCallback(() => { })

  // const commit = useCallback((data: ICommit) => {
  //     const commitInPluginData: CommitInPluginData = {
  //         ...omit(data, ['variables', 'collections', 'ignoredVariableIds']),
  //         collaborators: figma.currentUser ? [figma.currentUser] : [],
  //         delta: { variables: undefined, collections: undefined },
  //     };

  //     const { variables: headVariables = [], collections: headCollections = [] } = head
  //         // this.pluginData.head || {};

  //     const ignoredIds = data.ignoredVariableIds || [];
  //     const filteredVariables = [
  //         ...data.variables.filter(({ id }) => !ignoredIds.includes(id)),
  //         ...headVariables.filter(({ id }) => ignoredIds.includes(id)),
  //     ];

  // }, [])

  return {
    isLoading,
    commits: getCommits(commitDiffPatches),
    commitAsync,
    commitMutation,
    isCommitPending: commitMutation.isPending,
    updateIdInStorageAsync,
    updateIdInStorageMutation,
  };
}
