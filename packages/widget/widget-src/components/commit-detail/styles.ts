import { colors } from "fidget-ui"

export const styles: {
    container: AutoLayoutProps;
    header: AutoLayoutProps;
    summary: TextProps;
    description: TextProps;
    body: AutoLayoutProps;
} = {
    container: {
        name: 'Container',
        direction: 'vertical',
        fill: colors.white,
        width: 'fill-parent',
        height: 'fill-parent',
        cornerRadius: 8,
        spacing: 1
    },
    header: {
        name: 'Header',
        padding: 8,
        stroke: colors.neutral[200],
        width: 'fill-parent',
        strokeAlign: 'outside',
        verticalAlignItems: 'center'
    },
    summary: {
        name: 'Summary',
        fontSize: 16,
        width: 'fill-parent',
        fontWeight: 'semi-bold',
        fill: colors.neutral[700]
    },
    description: {
        fontSize: 10,
        fill: colors.neutral[500]
    },
    body: {
        name: 'Body',
        width: 'fill-parent',
        height: 'hug-contents',
        spacing: 1
    }
}