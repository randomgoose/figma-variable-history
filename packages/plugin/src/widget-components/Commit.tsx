//@ts-nocheck
import { getVariableChangesGroupedByCollection, isSameVariableValue } from '../utils/variable';
import { ParsedValue } from './ParsedValue';
import { ICommit } from '../types';
import { SVGs } from './svg-strings';
import { COLORS } from './widget-styles';
import * as Diff from 'diff';
import { CommitMeta } from './CommitMeta';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { AutoLayout: AL, Text, h, SVG, Span } = figma.widget;

function ArrowRight() {
  return (
    <Text
      fontSize={11}
      width={16}
      height={16}
      fill={COLORS.text.secondary}
      horizontalAlignText="center"
      verticalAlignText="center"
    >
      {'->'}
    </Text>
  );
}

export function Commit({ commits, index }: { commits: ICommit[]; index: number }) {
  const commit = commits[index];
  const lastCommit = commits[index + 1];

  const groups = getVariableChangesGroupedByCollection({
    prev: lastCommit ? lastCommit.variables : [],
    current: commit.variables || [],
  });

  return (
    <AL
      name={`Commit ${commit.id}`}
      width={960}
      padding={48}
      cornerRadius={24}
      fill={'#ffffff'}
      spacing={48}
    >
      <CommitMeta {...commit} />

      <AL direction="vertical" width={'fill-parent'} spacing={48}>
        {Object.entries(groups)
          .filter(
            ([, { added, modified, removed }]) => added.length || modified.length || removed.length
          )
          .map(([id, { added, modified, removed }]) => (
            <AL key={id} direction="vertical" width={'fill-parent'} spacing={24}>
              <Text fontSize={16} fontWeight={'bold'}>
                {figma.variables.getLocalVariableCollections().find((c) => c.id === id)?.name ||
                  'Unknown collection'}
              </Text>

              <AL direction="vertical" width="fill-parent" spacing={72} name="Changes">
                {added?.length ? (
                  <AL direction="vertical" width="fill-parent" spacing={12}>
                    <AL
                      verticalAlignItems="center"
                      horizontalAlignItems="center"
                      height={20}
                      padding={{ horizontal: 8 }}
                      fill={'#F0FDF4'}
                      cornerRadius={4}
                    >
                      <Text fill={'#15803D'} fontSize={11}>
                        Added
                      </Text>
                    </AL>
                    <AL
                      padding={16}
                      wrap={true}
                      width="fill-parent"
                      fill="#fcfcfc"
                      spacing={4}
                      cornerRadius={6}
                    >
                      {added.map((v) => (
                        <AL key={v.id} width={149} height={20} verticalAlignItems="center">
                          <Text fontSize={11} fontWeight="normal" truncate>
                            {v.name}
                          </Text>
                        </AL>
                      ))}
                    </AL>
                  </AL>
                ) : null}

                {modified?.length ? (
                  <AL direction="vertical" width={'fill-parent'} spacing={12}>
                    <AL
                      verticalAlignItems="center"
                      horizontalAlignItems="center"
                      height={20}
                      padding={{ horizontal: 8 }}
                      fill={'#FEFCE8'}
                      cornerRadius={4}
                    >
                      <Text fill={'#A16207'} fontSize={11}>
                        Modified
                      </Text>
                    </AL>
                    {modified.map((v) => {
                      const collection = commit.collections.find(
                        ({ id }) => id === v.variableCollectionId
                      );
                      const prev = lastCommit?.variables.find(({ id }) => id === v.id);
                      const isSameDescription = v.description === prev?.description;

                      const content = prev
                        ? Diff.diffWords(prev.description, v.description).map((part, index) =>
                            part.added ? (
                              <Span
                                key={index}
                                fill={'#009951'}
                                // style={{ color: 'var(--figma-color-text-success)' }}
                              >
                                {part.value}
                              </Span>
                            ) : part.removed ? (
                              <Span
                                key={index}
                                fill={'#dc3412'}
                                textDecoration="strikethrough"
                                // style={{ color: 'var(--figma-color-text-danger)', textDecoration: 'line-through' }}
                              >
                                {part.value}
                              </Span>
                            ) : (
                              <Span key={index}>{part.value}</Span>
                            )
                          )
                        : current?.description;

                      return (
                        <AL direction="vertical" width="fill-parent" spacing={4} key={v.id}>
                          <AL height={20} verticalAlignItems="center" spacing={4}>
                            <SVG src={SVGs[v['resolvedType']]} />
                            <Text fontSize={11}>{v.name}</Text>
                          </AL>

                          <AL
                            padding={16}
                            width="fill-parent"
                            fill="#fcfcfc"
                            cornerRadius={6}
                            direction="vertical"
                            spacing={16}
                          >
                            <AL direction="vertical" width="fill-parent">
                              <Text height={24} fontSize={11} verticalAlignText="center">
                                Values
                              </Text>
                              {/* The list of modified variables */}
                              {Object.entries(v.valuesByMode)
                                .filter(
                                  ([modeId, value]) =>
                                    !isSameVariableValue(value, prev?.valuesByMode[modeId])
                                )
                                .map(([modeId]) => {
                                  return (
                                    <AL
                                      width="fill-parent"
                                      verticalAlignItems="center"
                                      key={modeId}
                                    >
                                      <Text width={108} fontSize={11} fill={COLORS.text.secondary}>
                                        {
                                          collection?.modes.find((mode) => mode.modeId === modeId)
                                            ?.name
                                        }
                                      </Text>

                                      <AL
                                        horizontalAlignItems="end"
                                        width={'fill-parent'}
                                        spacing={8}
                                        height={28}
                                        verticalAlignItems="center"
                                      >
                                        <ParsedValue
                                          value={prev?.valuesByMode[modeId]}
                                          variables={commit.variables}
                                          format="RGB"
                                        />
                                        <ArrowRight />
                                        <ParsedValue
                                          value={v.valuesByMode[modeId]}
                                          variables={commit.variables}
                                          format="RGB"
                                        />
                                      </AL>
                                    </AL>
                                  );
                                })}
                            </AL>

                            {isSameDescription ? null : (
                              <AL width="fill-parent" verticalAlignItems="center">
                                <Text
                                  height={24}
                                  fontSize={11}
                                  verticalAlignText="center"
                                  width={108}
                                >
                                  Description
                                </Text>
                                {/* Variable description */}
                                <Text
                                  height={24}
                                  fontSize={11}
                                  width={'hug-contents'}
                                  fill={COLORS.text.default}
                                  verticalAlignText="center"
                                >
                                  {content}
                                </Text>
                              </AL>
                            )}

                            <AL width="fill-parent">
                              <Text
                                height={24}
                                fontSize={11}
                                verticalAlignText="center"
                                width={108}
                              >
                                Scopes
                              </Text>
                              {/* Variable description */}
                              <AL
                                width={'fill-parent'}
                                spacing={8}
                                verticalAlignItems="center"
                                minHeight={24}
                              >
                                <Text fontSize={11} width={'fill-parent'}>
                                  {prev?.scopes
                                    .map((s) => s.split('_').join(' ').toLowerCase())
                                    .join(', ') || 'no_scopes'}
                                </Text>
                                <ArrowRight />
                                <Text fontSize={11} width={'fill-parent'}>
                                  {v.scopes
                                    .map((s) => s.split('_').join(' ').toLowerCase())
                                    .join(', ')}
                                </Text>
                              </AL>
                            </AL>
                          </AL>
                        </AL>
                      );
                    })}
                  </AL>
                ) : null}

                {removed?.length ? (
                  <AL direction="vertical" width="fill-parent" spacing={12}>
                    <AL
                      verticalAlignItems="center"
                      horizontalAlignItems="center"
                      height={20}
                      padding={{ horizontal: 8 }}
                      fill={'#FEF2F2'}
                      cornerRadius={4}
                    >
                      <Text fill={'#B91C1C'} fontSize={11}>
                        Removed
                      </Text>
                    </AL>
                    <AL
                      padding={16}
                      wrap={true}
                      width="fill-parent"
                      fill="#fcfcfc"
                      spacing={4}
                      cornerRadius={6}
                    >
                      {removed.map((v) => (
                        <AL key={v.id} width={149} height={20} verticalAlignItems="center">
                          <Text fontSize={11} fontWeight="normal" truncate>
                            {v.name}
                          </Text>
                        </AL>
                      ))}
                    </AL>
                  </AL>
                ) : null}
              </AL>
            </AL>
          ))}
      </AL>
    </AL>
  );
}
