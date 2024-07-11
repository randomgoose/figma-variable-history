import { ICommit } from '../types';
import { COLORS } from './widget-styles';
import { parseDate } from '../utils/date';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { h, AutoLayout: AL, Text, Image } = figma.widget;

export function CommitMeta(commit: ICommit) {
  return (
    <AL direction="vertical" width={320} spacing={8}>
      {/* Commit Summary */}
      <AL width={'fill-parent'} direction="vertical" spacing={16}>
        <Text fontSize={16} fill={COLORS.text.default} fontWeight={'semi-bold'}>
          {parseDate(commit.date, { relative: false })}
        </Text>

        {/* Commit Description */}
        <AL direction="vertical" spacing={4}>
          <Text fontSize={11} fontWeight="semi-bold">
            {commit.summary}
          </Text>
          <Text
            fontSize={11}
            fill={commit.description ? COLORS.text.default : COLORS.text.disabled}
          >
            {commit.description || 'No description'}
          </Text>
        </AL>
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
          {commit.collaborators?.[0].name}
        </Text>
      </AL>
    </AL>
  );
}
