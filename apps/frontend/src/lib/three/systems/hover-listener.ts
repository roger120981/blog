import { InstancedMesh } from "three";

import { hasTouchScreen } from "@lib/hooks/hasTouchScreen";
import { isPatched } from "../types/Patched";

import type { Intersection } from "three";
import type { Events } from "./Events";

export function hoverListener({ castRay, world }: Events): void {
  if (hasTouchScreen()) return; // Don't listen for hover events on touch devices.

  let prevIntersection: Intersection | undefined = undefined;
  let newIntersection: Intersection | undefined = undefined;

  function runPrevIntersectOnPointerLeave() {
    if (
      prevIntersection &&
      isPatched(prevIntersection.object) &&
      "onPointerLeave" in prevIntersection.object
    ) {
      prevIntersection.object.onPointerLeave({
        intersection: prevIntersection,
        world,
      });
      world.requestRender();
    }
  }

  function runNewIntersectOnPointerEnter() {
    if (
      newIntersection &&
      isPatched(newIntersection.object) &&
      "onPointerEnter" in newIntersection.object
    ) {
      newIntersection.object.onPointerEnter({
        intersection: newIntersection,
        world,
      });
      world.requestRender();
    }
  }

  world.renderer.domElement.addEventListener("mousemove", () => {
    const intersections = castRay();
    newIntersection = intersections[0];

    // If no object is hovered, run previous object's onPointerLeave if
    // applicable, else do nothing.
    if (!newIntersection) {
      if (prevIntersection) {
        runPrevIntersectOnPointerLeave();
        prevIntersection = undefined;
      }
      return;
    }

    // If object hovered is different than previous object, run previous
    // object's onPointerLeave if applicable then run the new object's
    // onPointerEnter.
    if (newIntersection.object !== prevIntersection?.object) {
      runPrevIntersectOnPointerLeave();
      prevIntersection = newIntersection;
      runNewIntersectOnPointerEnter();
      return;
    }

    // If object hovered is an instanced mesh check if the instanceId has
    // changed. If so, run the previous instance's onPointerLeave if
    // applicable then run the new instance's onPointerEnter.
    if (
      newIntersection.object instanceof InstancedMesh &&
      newIntersection.instanceId !== prevIntersection?.instanceId
    ) {
      runPrevIntersectOnPointerLeave();
      prevIntersection = newIntersection;
      runNewIntersectOnPointerEnter();
      return;
    }
  });
}
