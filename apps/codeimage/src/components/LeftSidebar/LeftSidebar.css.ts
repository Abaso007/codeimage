import {createTheme, style} from '@vanilla-extract/css';
import {themeVars} from '../../theme/global.css';
import {recipe} from '@vanilla-extract/recipes';

export const [sidebarTheme, sidebarVars] = createTheme({
  gap: themeVars.spacing['4'],
  panelTitleTextColor: themeVars.dynamicColors.panelTextColor,
});

export const sidebar = style([
  sidebarTheme,
  {
    padding: `0px ${sidebarVars.gap} ${sidebarVars.gap}`,
  },
]);

export const panelHeader = style([
  {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    flexShrink: 0,
    width: '100%',
    color: sidebarVars.panelTitleTextColor,
  },
]);

export const panelRow = style([
  {
    position: 'relative',
    display: 'grid',
    width: '100%',
    paddingTop: themeVars.spacing['1'],
    paddingBottom: themeVars.spacing['1'],
    columnGap: themeVars.spacing['2'],
    gridTemplateColumns: 'minmax(0,1.25fr) repeat(2,minmax(0,1fr))',
    gridTemplateRows: 'auto',
    color: sidebarVars.panelTitleTextColor,
  },
]);

export const panelRowContent = recipe({
  base: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flex: '1 0 0',
  },
  variants: {
    twoColumn: {
      true: {
        gridColumn: '2 / -1',
      },
    },
    threeColumn: {
      true: {
        gridColumn: '1 / -1',
        paddingLeft: themeVars.spacing['3'],
      },
    },
  },
});

export const titleWrapper = style([
  {
    selectors: {
      [`${panelRow} &`]: {
        height: '26px',
        display: 'flex',
        position: 'relative',
        paddingLeft: '15px',
        alignItems: 'center',
        userSelect: 'none',
      },
    },
  },
]);
