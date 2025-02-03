import { useParams } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../components/Breadcrumb';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AppContext } from '../../AppContext';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { VariableNode } from '../components/nodes/VariableNode';
import InfiniteViewer from 'react-infinite-viewer';
import EditableLabel from '../components/EditableLabel';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { ClipboardItemType } from '../../types/clipboard';
import { MESSAGE_TYPE, sendMessage } from '../../utils/message';
import { Close, Content, Overlay, Portal, Root } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { VariableDetailPanel } from '../components/VariableDetailPanel';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface Group {
  name: string;
  variables: Variable[];
  subgroups: Record<string, Group>;
}

export function Map() {
  const { collectionId } = useParams();
  const { zoom, setZoom } = useContext(AppContext);
  const { collections, variables, setTab } = useContext(AppContext);
  const viewerRef = useRef<InfiniteViewer>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [openVariablePanel, setOpenVariablePanel] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);

  const currentCollection = collections.find((c) => c.id === collectionId);
  const { selection, setSelection, setClipboard, clipboard } = useContext(AppContext);
  const variablesInCollection = variables.filter((v) => v.variableCollectionId === collectionId);

  const variablesWithNoDescriptions = useMemo(() => {
    return variablesInCollection.filter((v) => !v.description);
  }, [variablesInCollection]);

  const selectNextVariableWithNoDescription = useCallback(() => {
    const nextVariable = variablesWithNoDescriptions.find(
      (v) => !selection.includes(`variable__${v.id}`)
    );
    if (nextVariable) {
      setSelection([`variable__${nextVariable.id}`]);
    }
  }, [variablesWithNoDescriptions, selection, setSelection]);

  const copy = () => {
    toast('Copied to clipboard');

    if (selection.length > 0) {
      const [, variableId, modeId] = selection[0].split('__');
      const variable = variables.find((v) => v.id === variableId);
      const value = variable?.valuesByMode[modeId];
      setClipboard([
        {
          type: ClipboardItemType.VARIABLE_VALUE,
          payload: {
            variable,
            modeId,
            value,
          },
        },
      ]);
    }
  };

  const paste = () => {
    toast('Pasted from clipboard');

    if (clipboard.length === 0) return;

    if (clipboard.length === 1) {
      switch (clipboard[0].type) {
        case ClipboardItemType.VARIABLE_VALUE:
          const items = selection.filter((item) => item.startsWith('mode__'));
          items.forEach((item) => {
            const [, variableId, modeId] = item.split('__');
            sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_VALUE, {
              id: variableId,
              modeId,
              value: clipboard[0].payload.value,
            });
          });
          break;
      }
    }
  };

  useHotkeys('meta+c', copy);
  useHotkeys('meta+v', paste);

  const getCursor = () => {
    if (isSpacePressed) {
      return 'grab';
    }
    return 'default';
  };

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    });

    // clear()
    setTimeout(() => {
      viewerRef.current!.scrollCenter();
    }, 100);
  }, []);

  const breadcrumbs = (
    <Breadcrumb className="absolute top-4 left-4 bg-[var(--figma-color-bg)] border border-[var(--figma-color-border)] rounded-[5px] px-2 h-6 flex items-center shadow-lg text-[var(--figma-color-text)] z-50">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="text-[var(--figma-color-text-secondary)] hover:text-[var(--figma-color-text)] cursor-pointer"
            onClick={() => {
              setTab('editor');
            }}
          >
            All variables
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="flex items-center gap-1" asChild>
                <button>{currentCollection?.name}</button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="start" className="dropdown-content">
                  {collections.map((c) => (
                    <DropdownMenu.Item
                      key={c.id}
                      className="dropdown-item"
                      onClick={() => {
                        setTab('editor');
                      }}
                    >
                      {c.name}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  const getNestedGroup = (root: Record<string, Group>, path: string[]): Group | null => {
    let current = root;
    let group = null;

    for (const part of path) {
      group = current[part];
      if (!group) return null;
      current = group.subgroups;
    }

    return group;
  };

  // Helper function to build the group structure
  const buildGroups = (vars: typeof variables) => {
    const root: Record<string, Group> = {};

    vars.forEach((variable) => {
      const parts = variable.name.split('/');
      let currentLevel = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            variables: [],
            subgroups: {},
          };
        }
        currentLevel = currentLevel[part].subgroups;
      }

      // Add the variable to its immediate parent group
      const parentGroup = parts.length > 1 ? getNestedGroup(root, parts.slice(0, -1)) : null;

      if (parentGroup) {
        parentGroup.variables.push(variable);
      }
    });

    return root;
  };

  // Render a group and its contents
  const renderGroup = (group: Group, level = 0) => {
    return (
      <div
        key={group.name}
        className={`relative border bg-purple-500/5 rounded-[13px] p-2 grid gap-3 ${
          level > 0 ? 'col-span-3 pt-10' : ''
        }`}
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <EditableLabel
          style={{ transform: `scale(${1 / zoom})`, transformOrigin: 'center left' }}
          className={level > 0 ? 'top-2 left-2' : '-top-8'}
          onSave={() => {}}
        >
          {group.name}
        </EditableLabel>
        {group.variables.map((v) => {
          return (
            <VariableNode
              key={v.id}
              data={{ variable: v }}
              onDbClick={() => {
                setSelectedVariable(v);
                setOpenVariablePanel(true);
              }}
            />
          );
        })}
        {Object.values(group.subgroups).map((subgroup) => renderGroup(subgroup, level + 1))}
      </div>
    );
  };

  const groups = buildGroups(variablesInCollection);

  const [rowData] = useState([
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  // const [colDefs, setColDefs] = useState([
  //     { field: 'make' },
  //     { field: 'model' },
  //     { field: 'price' },
  //     { field: 'electric' },
  // ]);

  return (
    <div
      style={{ height: 'calc(100vh - 41px)', cursor: getCursor() }}
      className="flex relative bg-[#f5f5f5]"
      onMouseDown={(e) => {
        // viewerRef.current?.scrollTo(0, 0)
        if (isSpacePressed) {
          e.preventDefault();
          e.stopPropagation();

          let lastX = e.clientX;
          let lastY = e.clientY;
          let animationFrameId: number;

          const handleMouseMove = (e: MouseEvent) => {
            const dx = (e.clientX - lastX) / zoom;
            const dy = (e.clientY - lastY) / zoom;

            lastX = e.clientX;
            lastY = e.clientY;

            animationFrameId = requestAnimationFrame(() => {
              viewerRef.current?.scrollBy(-dx, -dy);
            });
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrameId);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }
      }}
    >
      <div className="ag-material" style={{ height: '500px', width: 500 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={[
            { field: 'make' },
            { field: 'model' },
            { field: 'price' },
            { field: 'electric' },
          ]}
        />
      </div>
      <div className="absolute top-4 right-4 z-50" onClick={selectNextVariableWithNoDescription}>
        {variablesWithNoDescriptions.length} variables with no descriptions
      </div>
      {breadcrumbs}
      {/* <Selecto
                container={document.body}
                selectableTargets={['.target']}
                onSelect={e => {
                    console.log(e)
                }} /> */}
      <InfiniteViewer
        ref={viewerRef}
        className="viewer flex-grow"
        useAutoZoom
        zoom={zoom}
        zoomRangeX={[0, 100]}
        zoomRangeY={[0, 100]}
        displayHorizontalScroll
        displayVerticalScroll
        usePinch={true}
        pinchDirection="all"
        wheelPinchKey="meta"
        useWheelPinch
        pinchThreshold={25}
        zoomRange={[0.1, 10]}
        maxPinchWheel={5}
        onPinch={(e) => {
          setZoom(e.zoom);
        }}
      >
        <div className="viewport">
          <div className="mt-16 grid gap-16" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {Object.values(groups).map((group) => renderGroup(group, 0))}
          </div>
        </div>
      </InfiniteViewer>

      <Root modal={false} open={openVariablePanel} onOpenChange={setOpenVariablePanel}>
        <Portal>
          <Overlay />
          <Content
            className="bg-white rounded-[13px] shadow-2xl fixed right-4 bottom-4 w-[280px] shrink-0"
            style={{
              boxShadow:
                '0px 0px .5px rgba(0, 0, 0, .08), 0px 10px 24px rgba(0, 0, 0, .18), 0px 2px 5px rgba(0, 0, 0, .15)',
            }}
          >
            <Tabs.Root className="w-full" defaultValue="details">
              <div className="flex items-center justify-between relative border-b border-[var(--figma-color-border)]">
                <Tabs.List className="tabs-list">
                  <Tabs.Trigger value="details" className="tabs-trigger">
                    Details
                  </Tabs.Trigger>
                  <Tabs.Trigger value="scope" className="tabs-trigger">
                    Scope
                  </Tabs.Trigger>
                </Tabs.List>

                <Close className="w-6 h-6 absolute top-1/2 -translate-y-1/2 right-2 rounded-[5px] hover:bg-[var(--figma-color-bg-secondary)] flex items-center justify-center">
                  <X size={16} strokeWidth={1} />
                </Close>
              </div>
              <Tabs.Content value="details">
                {selectedVariable && (
                  <VariableDetailPanel
                    variable={selectedVariable}
                    onChange={(variable) => {
                      sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE, variable);
                    }}
                  />
                )}
                {/* <HexAlphaColorPicker style={{ width: '100%', height: 240 }} /> */}
              </Tabs.Content>
            </Tabs.Root>
          </Content>
        </Portal>
      </Root>
    </div>
  );
}
