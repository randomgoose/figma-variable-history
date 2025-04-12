import { NoCollectionPlaceHolder } from '../components/NoCollectionPlaceholder';
import { DropdownMenu, Select } from 'radix-ui';
import { Table } from './Table';
import { ChevronDown, Ellipsis } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppContext } from '../../AppContext';
import clsx from 'clsx';
import { MESSAGE_TYPE, variableManager } from '../../utils/message';
import { sendMessage } from '../../utils/message';
import { CMDK } from '../components/CMDK';
import { TableContext } from '../components/table/TableContext';

type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
};

export function Editor() {
  const {
    collections,
    variables,
    currentCollectionId: collectionId,
    setCurrentCollectionId: setCollectionId,
  } = useContext(AppContext);
  const { currentCollection, selectedGroupPath, setSelectedGroupPath } = useContext(TableContext);
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Add small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [isEditing]);

  const removeCollection = useCallback(() => {
    const remainingCollections = collections.filter((c) => c.id !== collectionId);

    if (remainingCollections.length > 0) {
      setCollectionId(remainingCollections[0].id);
    } else {
      setCollectionId(null);
    }
    collectionId && variableManager.deleteVariableCollection(collectionId);
  }, [collectionId, collections, setCollectionId]);

  useEffect(() => {
    if (collections.length > 0) {
      if (!collectionId || collections.find((c) => c.id === collectionId) === undefined) {
        setCollectionId(collections[0].id);
      }
    }
  }, [collections, collectionId]);

  useEffect(() => {
    setSelectedGroupPath(null);
  }, [collectionId]);

  const TreeItem = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(node.name);

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    };

    const handleBlur = () => {
      setIsEditing(false);
      setEditValue(node.name); // Reset to original value
      sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_GROUP, {
        collectionId,
        source: node.name,
        target: editValue,
        slice: depth,
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        // TODO: Add logic to update the node name
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditValue(node.name);
      }
    };

    return (
      <div tabIndex={-1}>
        <button
          className={clsx(
            'w-full text-left h-8 flex items-center px-2 py-1 text-[11px] hover:bg-[var(--figma-color-bg-hover)] cursor-default',
            'flex items-center gap-1',
            selectedGroupPath === node.path && 'bg-[var(--figma-color-bg-secondary)] font-semibold'
          )}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          onClick={() => {
            setSelectedGroupPath(node.path);
          }}
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <input
              className="rounded px-1 w-full focus:outline-none"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-[var(--figma-color-text)]">{node.name}</span>
          )}
        </button>
        {node.children.map((child) => (
          <TreeItem key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const buildGroupTree = useMemo(() => {
    const tree: TreeNode[] = [];

    // Get all unique group paths from all variables in this collection
    const allPaths = variables
      .filter((v) => v.variableCollectionId === collectionId)
      .map((v) => {
        const parts = v.name.split('/');
        return parts.slice(0, -1).join('/'); // Exclude the variable name itself
      })
      .filter((path): path is string => path.length > 0) // Remove empty paths
      .filter((path, index, self) => self.indexOf(path) === index); // Get unique paths

    // Build tree structure
    allPaths.forEach((path) => {
      let currentLevel = tree;
      const parts = path.split('/');

      let currentPath = '';
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        let existingNode = currentLevel.find((n) => n.name === part);

        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            children: [],
          };
          currentLevel.push(existingNode);
        }
        currentLevel = existingNode.children;
      });
    });

    return tree;
  }, [variables, collectionId]);

  return (
    <div className="w-full flex" style={{ height: 'calc(100vh - 40px)' }}>
      {collections.length <= 0 ? (
        <NoCollectionPlaceHolder />
      ) : (
        <>
          <aside
            className="w-[200px] shrink-0 border-r border-[var(--figma-color-border)] flex flex-col"
            tabIndex={-1}
          >
            <div className="p-2 flex items-center gap-2">
              {!isEditing ? (
                <Select.Root
                  value={collectionId ?? ''}
                  onValueChange={(value) => {
                    setCollectionId(value);
                  }}
                >
                  <Select.Trigger className="select-trigger cursor-default">
                    <Select.Value placeholder="Select Collection" />
                    <Select.Icon>
                      <ChevronDown size={12} strokeWidth={1} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="dropdown-content w-44">
                      <Select.Viewport>
                        {collections?.map((c) => (
                          <Select.Item className="dropdown-item" key={c.id} value={c.id}>
                            <Select.ItemText>{c.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              ) : (
                <input
                  ref={inputRef}
                  autoFocus
                  className="input"
                  defaultValue={currentCollection?.name}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      inputRef.current?.blur();
                    }
                  }}
                  onBlur={(e) => {
                    if (currentCollection) {
                      variableManager.renameVariableCollection(
                        currentCollection.id,
                        e.target.value
                      );
                    }
                    setIsEditing(false);
                  }}
                />
              )}

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="btn-icon ml-auto">
                    <Ellipsis size={16} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="dropdown-content w-[200px] z-[100]">
                  <DropdownMenu.Item
                    className="dropdown-item"
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  >
                    Rename
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="dropdown-item" onClick={removeCollection}>
                    Delete
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="dropdown-separator" />
                  <DropdownMenu.Item
                    className="dropdown-item"
                    onClick={() => {
                      variableManager.createVariableCollection();
                    }}
                  >
                    Create collection
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            <button
              className={clsx(
                'w-full mb-1 text-left h-10 flex items-center px-4 py-1 text-xs hover:bg-[var(--figma-color-bg-hover)] border-y border-[var(--figma-color-border)]',
                selectedGroupPath === null && 'bg-[var(--figma-color-bg-secondary)] font-semibold'
              )}
              onClick={() => setSelectedGroupPath(null)}
            >
              All variables{' '}
              <span className="text-[var(--figma-color-text-secondary)] ml-auto font-normal">
                {variables.filter((v) => v.variableCollectionId === collectionId)?.length}
              </span>
            </button>

            <div className="flex-1 overflow-auto">
              {buildGroupTree.map((node) => (
                <TreeItem key={node.path} node={node} />
              ))}
            </div>
          </aside>
          <CMDK />

          {collectionId && currentCollection && currentCollection.variableIds.length > 0 ? (
            <Table />
          ) : (
            <NoCollectionPlaceHolder />
          )}
        </>
      )}
    </div>
  );
}
