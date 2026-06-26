import { renderToStaticMarkup } from "react-dom/server";
import { GanttChart } from "../../components/chart/GanttChart";
import { GANTT_DEFAULTS } from "../../constants";
import { type GanttDocument, resolveDisplay, type Theme } from "../../types";
import { chartHeight, computeRowLayouts } from "../geometry";
import { buildLegend, legendBlockHeight } from "../legend";
import { createScale } from "../timescale/scale";

export interface StandaloneSvg {
  svg: string;
  width: number;
  height: number;
}

/**
 * Render the chart to a self-contained SVG string (with the label gutter).
 * Theming is already inline on every element, so the result needs no external
 * stylesheet and renders identically wherever it is opened.
 */
export function buildStandaloneSvg(
  document: GanttDocument,
  theme: Theme,
  themes: Theme[],
): StandaloneSvg {
  const scale = createScale(document.timescale);
  const layouts = computeRowLayouts(document.rows, theme.header.height, {
    barHeight: theme.bar.height,
    laneGap: GANTT_DEFAULTS.laneGap,
    padding: GANTT_DEFAULTS.rowPadding,
  });
  const width = GANTT_DEFAULTS.gutterWidth + scale.totalWidth;
  // Match GanttChart's own height computation so raster/PDF exports aren't
  // cropped when the legend is shown.
  const display = resolveDisplay(document);
  const legendEntries = display.legend.show
    ? buildLegend(document.rows, display.legend.groupBy, theme, themes)
    : [];
  const height =
    chartHeight(layouts, theme.header.height) +
    legendBlockHeight(legendEntries, scale.totalWidth, theme);

  const markup = renderToStaticMarkup(
    <GanttChart
      document={document}
      theme={theme}
      themes={themes}
      withGutter
      interactive={false}
    />,
  );

  return {
    svg: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${markup}`,
    width,
    height,
  };
}
