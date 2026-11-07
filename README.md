# isabellaminzly.com

Isabella Minzly's design portfolio, built from the Figma file "Portfolio" as a static site with [Astro](https://astro.build).

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npx playwright test   # accessibility (axe) and keyboard checks
```

## Structure

- `src/styles/tokens.css`: design tokens, named as the Figma variables, with dark mode values
- `src/components/`: the Figma components (Logo, NavigationMenu, Link, Button, Icon button, Icon, Footer, Frog)
- `src/layouts/BaseLayout.astro`: page shell, sidebar above 1024, header and menu button below
- `src/data/navigation.ts`: navigation; pages not ready yet show "Under construction"
- `/design-system/`: review page for tokens and components (not indexed)

Fonts are self-hosted under the SIL Open Font License, see `public/fonts/licences/`.
