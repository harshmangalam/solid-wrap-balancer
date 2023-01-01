import { Component, createEffect, mergeProps, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

const SYMBOL_KEY = "__wrap_balancer";
type RelayoutFn = (
  id: string | number,
  ratio: number,
  wrapper?: HTMLElement
) => void;

declare global {
  interface Window {
    [SYMBOL_KEY]: RelayoutFn;
  }
}

const relayout: RelayoutFn = (id, ratio, wrapper) => {
  wrapper = wrapper || document.querySelector<HTMLElement>(`[data-br="${id}"]`);
  const container = wrapper.parentElement;

  const update = (width: number) => (wrapper.style.maxWidth = width + "px");

  // Reset wrapper width
  wrapper.style.maxWidth = "";

  // Get the intial container size
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Synchronously do binary search and calculate the layout
  let left: number = width / 2;
  let right: number = width;
  let middle: number;

  if (width) {
    while (left + 1 < right) {
      middle = ~~((left + right) / 2);
      update(middle);
      if (container.clientHeight === height) {
        right = middle;
      } else {
        left = middle;
      }
    }

    // Update the wrapper width
    update(right * ratio + width * (1 - ratio));
  }
};

const MINIFIED_RELAYOUT_STR = relayout.toString();

interface BalancerProps extends JSX.HTMLAttributes<HTMLElement> {
  /**
   * The HTML tag to use for the wrapper element.
   * @default 'span'
   */
  as?: JSX.Element;
  /**
   * The balance ratio of the wrapper width (0 <= ratio <= 1).
   * 0 means the wrapper width is the same as the container width (no balance, browser default).
   * 1 means the wrapper width is the minimum (full balance, most compact).
   * @default 1
   */
  ratio?: number;
  children?: JSX.Element;
}

const Balancer: Component<BalancerProps> = (props) => {
  const merge = mergeProps({ ratio: 1 }, props);
  let wrapperRef: HTMLDivElement;

  // Re-balance on content change and on mount/hydration
  createEffect(() => {
    if (!wrapperRef) {
      return;
    }

    // Re-assign the function here as the component can be dynamically rendered, and script tag won't work in that case.
    (self[SYMBOL_KEY] = relayout)(0, props.ratio, wrapperRef);
  });

  // Re-balance on resize
  createEffect(() => {
    if (!wrapperRef) return;

    const container = wrapperRef.parentElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!wrapperRef) return;
      self[SYMBOL_KEY](0, props.ratio, wrapperRef);
    });
    resizeObserver.observe(container);

    onCleanup(() => resizeObserver.unobserve(container));
  });

  const id = crypto.randomUUID();

  return (
    <>
      <div
        {...props}
        data-br={id}
        data-brr={props.ratio}
        ref={wrapperRef}
        style={{
          display: "inline-block",
          "vertical-align": "top",
          "text-decoration": "inherit",
        }}
      >
        {props.children}
      </div>
      <script
        innerHTML={`self.${SYMBOL_KEY}=${MINIFIED_RELAYOUT_STR};self.${SYMBOL_KEY}("${id}",${props.ratio})`}
      />
    </>
  );
};

export default Balancer;
