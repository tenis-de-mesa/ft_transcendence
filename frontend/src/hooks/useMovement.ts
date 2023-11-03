import { useEffect } from "react";

type typeMove = { x: number; y: number };
type typeCallback = (move: typeMove) => void;

export default function useMovement(
  { timeInterval = 1000, defaultMovement = 15 },
  callback: typeCallback
) {
  useEffect(() => {
    const keystate = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    const handleKeyDown = function (event) {
      if (keystate[event.key] != undefined) {
        keystate[event.key] = true;
      }
    };

    const handleKeyUp = function (event) {
      if (keystate[event.key] != undefined) {
        keystate[event.key] = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    const interval = setInterval(() => {
      const movement: typeMove = { x: 0, y: 0 };
      if (keystate.ArrowUp) {
        movement.y -= defaultMovement;
      }
      if (keystate.ArrowDown) {
        movement.y += defaultMovement;
      }
      if (keystate.ArrowLeft) {
        movement.x -= defaultMovement;
      }
      if (keystate.ArrowRight) {
        movement.x += defaultMovement;
      }
      callback(movement);
    }, timeInterval);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      clearInterval(interval);
    };
  }, [timeInterval, defaultMovement, callback]);
}
