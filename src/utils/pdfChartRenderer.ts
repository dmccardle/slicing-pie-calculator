/**
 * PDF Chart Renderer Utility
 * Converts rendered chart DOM elements to images for PDF embedding
 */

import html2canvas from "html2canvas";

/**
 * Options for rendering a chart to an image
 */
export interface ChartRenderOptions {
  /** Width of the output image in pixels */
  width: number;

  /** Height of the output image in pixels */
  height: number;

  /** Background color (default: '#ffffff') */
  backgroundColor?: string;

  /** Scale factor for resolution (default: 2 for retina) */
  scale?: number;
}

/**
 * Default render options for chart capture
 */
const DEFAULT_RENDER_OPTIONS: Required<ChartRenderOptions> = {
  width: 400,
  height: 300,
  backgroundColor: "#ffffff",
  scale: 2,
};

/**
 * Renders a chart DOM element to a PNG data URL
 *
 * @param element - DOM element containing the chart
 * @param options - Render configuration
 * @returns PNG data URL string (base64 encoded)
 * @throws Error if element is null or not ready for capture
 */
export async function renderChartToImage(
  element: HTMLElement | null,
  options: Partial<ChartRenderOptions> = {}
): Promise<string> {
  if (!element) {
    throw new Error("Chart element not found");
  }

  // Merge options with defaults
  const renderOptions: Required<ChartRenderOptions> = {
    ...DEFAULT_RENDER_OPTIONS,
    ...options,
  };

  // Check if element has content (SVG or child elements)
  const svgElement = element.querySelector("svg");
  if (!svgElement && element.children.length === 0) {
    throw new Error("Chart not ready for capture");
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: renderOptions.backgroundColor,
      scale: renderOptions.scale,
      logging: false,
      width: renderOptions.width,
      height: renderOptions.height,
      useCORS: true,
      allowTaint: true,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to render chart: ${errorMessage}`);
  }
}

/**
 * Waits for a chart element to be ready for capture
 * Useful when chart needs time to render after data changes
 *
 * @param element - DOM element containing the chart
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 1000)
 * @returns Promise that resolves when chart is ready
 * @throws Error if chart is not ready within timeout
 */
export async function waitForChartReady(
  element: HTMLElement | null,
  maxWaitMs: number = 1000
): Promise<void> {
  if (!element) {
    throw new Error("Chart element not found");
  }

  const startTime = Date.now();
  const checkInterval = 50;

  return new Promise((resolve, reject) => {
    const check = () => {
      const svgElement = element.querySelector("svg");

      if (svgElement && svgElement.children.length > 0) {
        resolve();
        return;
      }

      if (Date.now() - startTime > maxWaitMs) {
        reject(new Error("Chart did not render within timeout"));
        return;
      }

      setTimeout(check, checkInterval);
    };

    check();
  });
}
