import {backgroundColorVar, themeVars} from '@codeimage/ui';
import {createTheme, fallbackVar, style} from '@vanilla-extract/css';
import {recipe} from '@vanilla-extract/recipes';

export const [terminalTheme, terminalVars] = createTheme({
  headerHeight: '50px',
  radius: '12px',
  headerBackgroundColor: themeVars.backgroundColor.white,
  backgroundColor: themeVars.backgroundColor.white,
  textColor: themeVars.backgroundColor.gray['800'],
  boxShadow: themeVars.boxShadow.lg,
  tabDelta: '10px',
  headerColor: '0, 0, 0',
});

export const wrapper = style([
  terminalTheme,
  {
    position: 'relative',
    backgroundColor: terminalVars.backgroundColor,
    color: terminalVars.textColor,
    overflow: 'hidden',
    borderRadius: terminalVars.radius,
    boxShadow: terminalVars.boxShadow,
    transition: 'box-shadow .2s, border-radius .2s',
    selectors: {
      '&[data-theme-mode=light]': {
        vars: {
          [terminalVars.headerColor]: `255, 255, 255`,
        },
      },
      '&[data-theme-mode=dark] &': {
        vars: {
          [terminalVars.headerColor]: `0, 0, 0`,
        },
      },
    },
  },
]);

export const content = style({
  position: 'relative',
  overflow: 'auto',
  fontSize: themeVars.fontSize.base,
  paddingBottom: themeVars.spacing['4'],
  paddingTop: themeVars.spacing['5'],
  paddingInlineStart: themeVars.spacing['4'],
  paddingInlineEnd: themeVars.spacing['4'],
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  height: terminalVars.headerHeight,
  transition: 'background-color .2s ease-in-out',

  selectors: {
    '[data-theme-mode=light] &[data-accent-visible=true]': {
      backgroundColor: `rgba(0, 0, 0, .06)`,
    },
    '[data-theme-mode=dark] &[data-accent-visible=true]': {
      backgroundColor: `rgba(255, 255, 255, .06)`,
    },
  },
});

export const headerIconRow = style({
  selectors: {
    [`${header} &`]: {
      display: 'flex',
      paddingInlineStart: themeVars.spacing['4'],
      paddingInlineEnd: themeVars.spacing['4'],
      columnGap: themeVars.spacing['2'],
    },
  },
});

export const headerIconRowCircle = style({
  selectors: {
    [`${headerIconRow} &`]: {
      width: '15px',
      height: '15px',
      borderRadius: themeVars.borderRadius.full,
      backgroundColor: fallbackVar(
        backgroundColorVar,
        themeVars.backgroundColor.gray['500'],
      ),
    },
  },
});

export const tab = recipe({
  base: {
    background: 'transparent',
    padding: `0 ${themeVars.spacing['3']}`,
    verticalAlign: 'middle',
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingLeft: 0,
    fontSize: themeVars.fontSize.sm,
    borderRadius: `${themeVars.borderRadius.md} ${themeVars.borderRadius.md} 0 0`,
    position: 'relative',
    lineHeight: 1,
  },
  variants: {
    accent: {
      true: {
        /**
         * ATTENTION: this is a workaround related to https://github.com/riccardoperra/codeimage/issues/41
         *            Flex properties in safari are broken on export with HtmlToImage
         */
        height: `calc(${terminalVars.headerHeight} - ${terminalVars.tabDelta})`,
        marginTop: 'auto',
        marginBottom: 0,
        paddingTop: terminalVars.tabDelta,
        paddingLeft: themeVars.spacing['3'],
        backgroundColor: terminalVars.backgroundColor,

        selectors: {
          '&:before, &:after': {
            content: '',
            display: 'block',
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'transparent',
            width: '8px',
            height: '8px',
            boxShadow: `1px 0px 0px 0px ${terminalVars.backgroundColor}, 3px 4px 0px 0px ${terminalVars.backgroundColor}`,
            overflow: 'hidden',
          },
        },
        ':before': {
          left: '-8px',
          borderBottomRightRadius: '8px',
        },
        ':after': {
          right: '-8px',
          borderBottomRightRadius: '12px',
          transform: 'scaleX(-1)',
        },
      },
    },
    active: {
      true: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        accent: false,
        active: true,
      },
      style: {
        borderRadius: themeVars.borderRadius.lg,
        background: themeVars.backgroundColor.gray['800'],
        padding: `6px 12px`,
      },
    },
  ],
});

export const tabIcon = style([
  {
    display: 'inline-flex',
    marginRight: themeVars.spacing['2'],
  },
]);

export const tabText = style([
  {
    display: 'inline-block',
  },
]);

export const watermark = style({
  position: 'absolute',
  right: '6px',
  bottom: '-6px',
  opacity: 0.35,
  backgroundColor: 'inherit',
});

export const tabHint = style({
  position: 'absolute',
  backgroundColor: themeVars.dynamicColors.dialog.panelBackgroundColor,
  boxShadow: themeVars.dynamicColors.dialog.panelShadow,
  borderRadius: themeVars.borderRadius.lg,
  zIndex: themeVars.zIndex['50'],
  maxHeight: '250px',
  overflowY: 'auto',
  left: 0,
  transition: 'all 100ms ease-in-out',
});

export const tabHintDropdownOption = style({
  outline: 'none',
  ':focus': {
    outline: 'none',
  },
  ':focus-visible': {
    outline: 'none',
  },
});

export const tabHintDropdownItemContent = style({
  height: '32px',
  fontWeight: themeVars.fontWeight.normal,
  fontSize: themeVars.fontSize.sm,
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${themeVars.spacing['3']}`,
  borderBottom: `1px solid ${themeVars.dynamicColors.divider}`,
  color: themeVars.dynamicColors.listBox.textColor,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  vars: {
    ['--highlight-color']: 'rgb(112, 182, 246, 0.25)',
  },
  ':hover': {
    backgroundColor: themeVars.dynamicColors.listBox.hoverBackgroundColor,
    color: themeVars.dynamicColors.listBox.textColor,
  },
  selectors: {
    ['[active] &']: {
      backgroundColor: themeVars.dynamicColors.listBox.activeBackgroundColor,
      color: themeVars.dynamicColors.listBox.activeTextColor,
    },
    ['[aria-selected=true] &']: {
      backgroundColor: themeVars.dynamicColors.listBox.activeBackgroundColor,
      color: themeVars.dynamicColors.listBox.activeTextColor,
    },
  },
});

export const glassReflection = {
  wrapper: style({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  }),
  content: style({
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    transform: `skewX(-18deg) translateX(-55%)`,
    zIndex: '100',

    selectors: {
      '[data-theme-mode=light] &': {
        background:
          'linear-gradient(rgba(100,100,100, .035) 35%, rgba(0,0,0,0%) 100%)',
      },
      '[data-theme-mode=dark] &': {
        background:
          'linear-gradient(rgba(255,255,255, .035) 35%, rgba(255,255,255,0%) 100%)',
      },
    },
  }),
};
