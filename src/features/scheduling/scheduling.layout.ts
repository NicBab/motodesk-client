import type { ScheduleWorkBlock } from "./scheduling.types";

//************************************************************** */

export type ScheduleOverlapLayout = {
  column: number;

  totalColumns: number;
};

//************************************************************** */

export function computeScheduleOverlapLayout(
  blocks: ScheduleWorkBlock[],
): Map<string, ScheduleOverlapLayout> {
  const layouts = new Map<string, ScheduleOverlapLayout>();

  const usableBlocks = blocks
    .filter((block) => Boolean(block.scheduledEnd))
    .sort(
      (left, right) =>
        new Date(left.scheduledDate).getTime() -
        new Date(right.scheduledDate).getTime(),
    );

  if (usableBlocks.length === 0) {
    return layouts;
  }

  const clusters: ScheduleWorkBlock[][] = [];

  let currentCluster: ScheduleWorkBlock[] = [usableBlocks[0]];

  let clusterEnd = getScheduleEnd(usableBlocks[0]);

  for (let index = 1; index < usableBlocks.length; index += 1) {
    const block = usableBlocks[index];

    const start = new Date(block.scheduledDate).getTime();

    const end = getScheduleEnd(block);

    if (start < clusterEnd) {
      currentCluster.push(block);

      clusterEnd = Math.max(clusterEnd, end);

      continue;
    }

    clusters.push(currentCluster);

    currentCluster = [block];

    clusterEnd = end;
  }

  clusters.push(currentCluster);

  //************************************************************** */

  for (const cluster of clusters) {
    const columnEnds: number[] = [];

    for (const block of cluster) {
      const start = new Date(block.scheduledDate).getTime();

      const end = getScheduleEnd(block);

      let column = columnEnds.findIndex((columnEnd) => columnEnd <= start);

      if (column === -1) {
        column = columnEnds.length;

        columnEnds.push(end);
      } else {
        columnEnds[column] = end;
      }

      layouts.set(block.id, {
        column,

        totalColumns: 0,
      });
    }

    const totalColumns = columnEnds.length;

    for (const block of cluster) {
      const layout = layouts.get(block.id);

      if (layout) {
        layout.totalColumns = totalColumns;
      }
    }
  }

  return layouts;
}

//************************************************************** */

function getScheduleEnd(block: ScheduleWorkBlock): number {
  if (!block.scheduledEnd) {
    return new Date(block.scheduledDate).getTime();
  }

  return new Date(block.scheduledEnd).getTime();
}

//************************************************************** */
