import { useEffect, useRef } from 'react';
import { Ball } from '../../game/Ball';

const Game = (props: any) => {
  let ball: Ball;
  const ballRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ballRef.current) {
      return;
    }
    ball = new Ball(ballRef.current);
    console.log(ball);
  }, []);

  let lastTime: number | null;
  const update = (time: number) => {
    if (lastTime != null) {
      const delta = time - lastTime;
      ball.update(delta);
    };

    lastTime = time;
    window.requestAnimationFrame(update);
  }
  window.requestAnimationFrame(update);
  return (
    <>
      <div className="score">
        <div id="player1-score">0</div>
        <div id="player2-score">0</div>
      </div>

      <div ref={ballRef} className="ball"></div>
      <div className="paddle left" id="player-paddle"></div>
      <div className="paddle right" id="player-paddle"></div>
    </>
  )
}

export default Game;