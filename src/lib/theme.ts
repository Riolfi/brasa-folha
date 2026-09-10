import defaultTheme from '../data/theme.json';

export interface ThemeColors {
  bone: { DEFAULT: string; 50: string; 100: string; 200: string; 300: string };
  ink: { DEFAULT: string; soft: string; muted: string };
  agua: { DEFAULT: string; light: string; dark: string; wash: string };
  blush: { DEFAULT: string; light: string };
}
export interface ThemeFile {
  colors: ThemeColors;
  fonts?: { display: string[]; sans: string[]; accent?: string[] };
  radius?: string;
  themeColor?: string;
}

/** Paleta e tokens visuais do site — de `src/data/theme.json`. */
export const theme: ThemeFile = defaultTheme as ThemeFile;
