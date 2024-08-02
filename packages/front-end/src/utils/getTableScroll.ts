import { MutableRefObject } from "react";

interface GetTableScrollParams {
  extraHeight?: number;
  ref?: MutableRefObject<HTMLElement | null>;
}

export function getTableScroll({
  extraHeight = 112,
  ref,
}: GetTableScrollParams = {}): string {
  let tHeader: HTMLElement | null = null;

  if (ref && ref.current) {
    tHeader = ref.current.getElementsByClassName(
      "ant-table-thead"
    )[0] as HTMLElement;
  } else {
    tHeader = document.getElementsByClassName(
      "ant-table-thead"
    )[0] as HTMLElement;
  }

  let tHeaderTop = 0;
  if (tHeader) {
    const { top } = tHeader.getBoundingClientRect();

    tHeaderTop = top + 32 + 24;
  }

  const height = `calc(100vh - ${tHeaderTop + extraHeight}px)`;

  return height;
}
