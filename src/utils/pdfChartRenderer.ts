/**
 * PDF Chart Renderer Utility
 * Converts rendered chart SVG elements to images for PDF embedding
 *
 * Uses direct SVG-to-Canvas conversion instead of html2canvas for reliability.
 * This approach works regardless of element visibility or DOM position.
 */

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
 * Renders a chart DOM element to a PNG data URL by converting SVG to Canvas.
 *
 * This approach is more reliable than html2canvas because:
 * 1. Works regardless of element visibility or position
 * 2. Directly serializes SVG without depending on browser rendering
 * 3. Handles off-screen elements properly
 *
 * @param element - DOM element containing the chart (must have an SVG child)
 * @param options - Render configuration
 * @returns PNG data URL string (base64 encoded)
 * @throws Error if element is null, has no SVG, or conversion fails
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

  // Find SVG element
  const svgElement = element.querySelector("svg");
  if (!svgElement) {
    throw new Error("No SVG found in chart element");
  }

  // Get SVG dimensions
  const svgWidth = svgElement.width?.baseVal?.value || renderOptions.width;
  const svgHeight = svgElement.height?.baseVal?.value || renderOptions.height;

  try {
    // Clone SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

    // Ensure SVG has explicit dimensions
    svgClone.setAttribute("width", String(svgWidth));
    svgClone.setAttribute("height", String(svgHeight));

    // Add xmlns if not present (required for serialization)
    if (!svgClone.getAttribute("xmlns")) {
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    // Serialize SVG to string
    const svgData = new XMLSerializer().serializeToString(svgClone);

    // Create blob and URL
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    // Load SVG as image
    const img = await loadImage(url);

    // Create high-DPI canvas
    const canvas = document.createElement("canvas");
    const scale = renderOptions.scale;
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      throw new Error("Failed to get canvas context");
    }

    // Fill background
    ctx.fillStyle = renderOptions.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale for high-DPI and draw
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

    // Cleanup and return
    URL.revokeObjectURL(url);
    return canvas.toDataURL("image/png");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to render chart: ${errorMessage}`);
  }
}

/**
 * Helper to load an image from URL as a Promise
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load SVG as image"));
    img.src = url;
  });
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
      // Check for Recharts-specific elements (pie slices have path elements)
      const hasChartContent = svgElement && (
        svgElement.querySelector("path") !== null ||
        svgElement.querySelector("circle") !== null ||
        svgElement.children.length > 2
      );

      if (hasChartContent) {
        // Add a small delay to ensure animations complete
        setTimeout(() => resolve(), 100);
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
