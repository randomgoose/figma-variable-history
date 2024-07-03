import { parseDate } from '../utils/date';
import { getVariableChanges, isSameVariableValue } from '../utils/variable';
import { ParsedValue } from './ParsedValue';
import { ICommit } from '../types';
import { SVGs } from './svg-strings';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { AutoLayout: AL, Text, Image, h, SVG } = figma.widget;

const COLORS = {
  text: {
    default: '#000000e5',
    secondary: '#00000080',
    disabled: '#0000004d',
  },
};

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

  const { added, modified, removed } = getVariableChanges({
    current: commit.variables,
    prev: lastCommit ? lastCommit.variables : [],
  });

  return (
    <AL name={`Commit ${commit.id}`} width={960} padding={{ bottom: 48 }}>
      <AL direction="vertical" width={320} spacing={8}>
        {/* Commit Summary */}
        <AL direction="vertical" spacing={4}>
          <Text fontWeight="semi-bold">{commit.summary}</Text>
          <Text fontSize={11} fill={COLORS.text.default}>
            {new Date(commit.date).toLocaleDateString()}
          </Text>
          {/* Commit Description */}
          <Text
            fontSize={11}
            fill={commit.description ? COLORS.text.default : COLORS.text.disabled}
          >
            {commit.description || 'No description'}
          </Text>
        </AL>

        {/* Collaborators */}
        <AL verticalAlignItems="center" spacing={4}>
          {commit.collaborators?.[0].photoUrl ? (
            <Image
              width={18}
              height={18}
              src={commit.collaborators?.[0].photoUrl || ''}
              cornerRadius={100}
            />
          ) : null}
          <Text fontSize={11} fill={COLORS.text.secondary}>
            {commit.collaborators?.[0].name} on {parseDate(commit.date)}
          </Text>
        </AL>
      </AL>

      <AL direction="vertical" width="fill-parent" spacing={16} name="Changes">
        {added.length ? (
          <AL direction="vertical" width="fill-parent" spacing={12}>
            <Text fontSize={11}>🆕 Added</Text>
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

        {removed.length ? (
          <AL direction="vertical" width="fill-parent" spacing={12}>
            <Text fontSize={11}>🚫️ Removed</Text>
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

        {modified.length ? (
          <AL direction="vertical" width="fill-parent" spacing={12}>
            <Text fontSize={11}>🔧 Changed</Text>
            {modified.map((v) => {
              const collection = commit.collections.find(({ id }) => id === v.variableCollectionId);
              const prev = lastCommit?.variables.find(({ id }) => id === v.id);
              const isSameDescription = v.description === prev?.description;

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
                            <AL width="fill-parent" verticalAlignItems="center" key={modeId}>
                              <Text fontSize={11} fill={COLORS.text.secondary}>
                                {collection?.modes.find((mode) => mode.modeId === modeId)?.name}
                              </Text>

                              <AL
                                horizontalAlignItems="end"
                                width="fill-parent"
                                spacing={4}
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
                      <AL width="fill-parent">
                        <Text
                          height={24}
                          fontSize={11}
                          verticalAlignText="center"
                          width="fill-parent"
                        >
                          Description
                        </Text>
                        {/* Variable description */}
                        <AL spacing={4} verticalAlignItems="start" minHeight={24}>
                          <Text
                            fontSize={11}
                            width={240}
                            fill={prev?.description ? COLORS.text.default : COLORS.text.disabled}
                          >
                            {prev?.description || 'No description'}
                          </Text>
                          <ArrowRight />
                          <Text fontSize={11} width={240}>
                            {v.description}
                          </Text>
                        </AL>
                      </AL>
                    )}

                    <AL width="fill-parent">
                      <Text
                        height={24}
                        fontSize={11}
                        verticalAlignText="center"
                        width="fill-parent"
                      >
                        Scopes
                      </Text>
                      {/* Variable description */}
                      <AL spacing={4} verticalAlignItems="start" minHeight={24}>
                        <Text fontSize={11} width={120}>
                          {prev?.description || 'No description'}
                        </Text>
                        <ArrowRight />
                        <Text fontSize={11} width={120}>
                          {v.description}
                        </Text>
                      </AL>
                    </AL>
                  </AL>
                </AL>
              );
            })}
          </AL>
        ) : null}
      </AL>
    </AL>
  );
}
