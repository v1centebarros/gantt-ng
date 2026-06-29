# gantt-ng

gantt-ng is a local-first Gantt chart editor that runs entirely in your browser. It is free, open source, and built for the community.

There are no accounts, no servers, and no tracking. Every chart you create is stored in your own browser using IndexedDB, and the application itself is a static site that can be hosted anywhere. You can try it at [v1centebarros.github.io/gantt-ng](https://v1centebarros.github.io/gantt-ng/).

## Your data, your choice

gantt-ng never sends your project data anywhere. Documents live in your browser's local storage, and nothing leaves your machine unless you explicitly export it. When you want to keep a project or move it elsewhere, you can save it as a portable `.gantt` file — a versioned JSON document with built-in schema migrations — and import it again later, on any device, in any browser.

## What it does

gantt-ng is built SVG-first: the chart is a single self-contained `<svg>`, so what you see on screen is exactly what gets exported, losslessly, at any scale.

- Create tasks and milestones, drag them to move, drag their edges to resize, and drop bars across rows. Overlapping bars are automatically packed into lanes so nothing is ever hidden.
- Reorder rows by dragging, or right-click anywhere on the timeline to add a task or marker at that exact position.
- Export the chart as SVG, PNG, JPEG, or PDF. Raster formats are rendered at 2x for crisp output.
- Theme the chart with the built-in Light and Dark themes, or use the theme editor to create, duplicate, and fine-tune your own. Themes can be shared as `.gtheme` files.
- Adjust the timescale: zoom from individual days out to a wide overview, choose scale presets, toggle date labels and month formats, and track the current date with a live "today" marker.
- Undo and redo any change with `Cmd/Ctrl+Z` and `Cmd/Ctrl+Shift+Z` (or `Ctrl+Y`).
- Work in a resizable, collapsible sidebar, with an optional reduced-motion mode for accessibility.

## Run

The application lives in the `app/` directory and requires [Node.js](https://nodejs.org/) 22 or newer.

```bash
git clone https://github.com/v1centebarros/gantt-ng.git
cd gantt-ng/app
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build

`npm run build` produces a fully static export in `app/out/`, which can be served from any static host. The repository includes a GitHub Pages workflow (`.github/workflows/deploy.yml`) that builds and deploys on every push to `main`. To host under a subdirectory, set the `NEXT_PUBLIC_BASE_PATH` environment variable (for example `/gantt-ng`) at build time.

Other useful scripts, all run from `app/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Produce a static export in `app/out/` |
| `npm run lint` | Check formatting and lint with Biome |
| `npm run format` | Auto-format the source with Biome |
| `npm run test` | Run the Vitest test suite |

## Built with

gantt-ng is a [Next.js 16](https://nextjs.org/) and [React 19](https://react.dev/) application (static export, with the React Compiler enabled). It is styled with [Tailwind CSS v4](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/), stores data through [Dexie](https://dexie.org/) and [TanStack Query](https://tanstack.com/query), and uses [dnd-kit](https://dndkit.com/) for row reordering. PDF export is handled by [jsPDF](https://github.com/parallax/jsPDF) and [svg2pdf.js](https://github.com/yWorks/svg2pdf.js). The codebase is linted and formatted with [Biome](https://biomejs.dev/) and tested with [Vitest](https://vitest.dev/).

## Contributing

Contributions, bug reports, and feature ideas are welcome. To contribute code, fork the repository, create a branch from `main`, make your changes in `app/`, and run `npm run lint` and `npm run test` before opening a pull request. For anything else, please [open an issue](https://github.com/v1centebarros/gantt-ng/issues).

## License

The gantt-ng source is licensed under the [GNU General Public License v3.0](LICENSE).
