# Web integration

## Vite setup

Use the alphaTab Vite plugin so the score renderer's worker and audio worklet entry points are bundled correctly. The plugin also copies alphaTab's default font and SoundFont assets unless asset copying is customized.

The tutorial app uses:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { alphaTab } from '@coderline/alphatab-vite'

export default defineConfig({
  plugins: [react(), alphaTab()],
  base: './',
})
```

Use the configured app base when constructing runtime URLs for the score, music font, and SoundFont. Do not assume the site is hosted at `/`; GitHub Pages and subpath deployments can change the base path.

## Fonts and sound assets

Set `core.fontDirectory` to the deployed alphaTab `font/` assets when overriding the plugin's default behavior. Configure `player.soundFont` to the actual SoundFont URL. This app keeps its own ukulele SF2 under `public/soundfonts/` and keeps its CC0 notice beside it.

When custom assets replace defaults, verify both the development server and production build output. Check case-sensitive names and include the actual runtime paths in offline caching.

## Offline cache

This app's service worker caches the app shell, MusicXML scores, ukulele soundfont, Bravura fonts and license texts, and generated JS/CSS assets from the Vite manifest. If adding a score or static player asset, add it to the precache list and increment the cache name so installed clients fetch the new version.

Workers and worklets are runtime dependencies too. Inspect the built asset manifest after changing Vite or alphaTab plugin configuration and confirm those generated resources remain available offline.

## Sources

- [Vite installation and plugin behavior](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/installation-vite.mdx)
- [Web installation](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/installation-web.mdx), [Web settings](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/getting-started/configuration-web.mdx), and [`core.fontDirectory`](https://github.com/CoderLine/alphaTabWebsite/blob/72f8d0ccce53f2563c4fb5cf5b1560396f5b3f45/docs/reference/settings/core/fontdirectory.mdx)
- Tutorial project: [`vite.config.ts`](../../vite.config.ts), [`sw.js`](../../public/sw.js), and [soundfont license](../../public/soundfonts/LICENSE-ukulele.txt)
