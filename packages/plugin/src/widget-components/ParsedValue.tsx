import { convertRgbColorToHexColor } from '@create-figma-plugin/utilities';
// import { SVGs } from './svg-strings';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Text, AutoLayout, Rectangle, useEffect } = figma.widget;

export function ParsedValue({
  value,
  format = 'RGB',
  variables,
}: {
  value?: VariableValue;
  variables: Variable[];
  format?: 'RGB' | 'HEX';
}) {
  let v = '';

  switch (typeof value) {
    case 'string':
      v = value;
      break;
    case 'number':
      v = value.toString();
      break;
    case 'boolean':
      v = value ? 'true' : 'false';
      break;
    case 'undefined':
      return (
        <Text fill="#00000080" fontSize={11} width={'fill-parent'}>
          Not defined
        </Text>
      );
    case 'object':
      if ('type' in value) {
        const target = variables.find((v) => v.id === value.id);
        return (v = target ? (
          <AutoLayout width={'fill-parent'}>
            <AutoLayout
              verticalAlignItems="center"
              fill="#f5f5f5"
              padding={{ vertical: 0, horizontal: 5 }}
              cornerRadius={4}
              stroke="#e6e6e6"
              height={20}
              width={'hug-contents'}
            >
              {/* <SVG src={SVGs.boolean}/> */}
              <Text fontSize={11} lineHeight="16px">
                {target.name}
              </Text>
            </AutoLayout>
          </AutoLayout>
        ) : (
          <Text>undefined</Text>
        ));
      } else {
        if ('a' in value) {
          const _r = Math.round(value.r * 255);
          const _g = Math.round(value.g * 255);
          const _b = Math.round(value.b * 255);
          const v =
            format === 'RGB'
              ? `rgba(${_r}, ${_g}, ${_b}, ${(value.a * 100).toFixed(0) + '%'})`
              : `#${convertRgbColorToHexColor({ r: value.r, g: value.g, b: value.b })}`;

          return (
            <AutoLayout verticalAlignItems="center" spacing={8} width={'fill-parent'}>
              <Rectangle
                cornerRadius={1}
                width={16}
                height={16}
                stroke={{ r: 0, g: 0, b: 0, a: 0.1 }}
                fill={{ r: value.r, g: value.g, b: value.b, a: value.a }}
              />
              <Text fontSize={11} fill="#000000e5">
                {v}
              </Text>
            </AutoLayout>
          );
        } else {
          v = `rgb(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(
            value.b * 255
          )})`;
          break;
        }
      }
    default:
      v = String(value);
  }

  return (
    <Text fontSize={11} fill="#000000e5" width={'fill-parent'}>
      {v}
    </Text>
  );
}
