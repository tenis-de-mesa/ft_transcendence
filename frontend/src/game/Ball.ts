const INITIAL_VELOCITY = 0.025;
const VELOCITY_INCREASE = 0.000001;

function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export class Ball {
  ballElem: HTMLDivElement;
  direction: any; // object {x: number, y: number}
  velocity!: number;

  constructor(ballElem: HTMLDivElement) {
    this.ballElem = ballElem;
    this.reset();
  }
  get x(): number {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"));
  }
  set x(value: any) {
    this.ballElem.style.setProperty("--x", value.toString());
  }

  get y() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"));
  }
  set y(value: number) {
    this.ballElem.style.setProperty("--y", value.toString());
  }

  rect() {
    return this.ballElem.getBoundingClientRect();
  }

  reset() {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0 };
    
    while (
      Math.abs(this.direction.x) <= 0.2 || 
      Math.abs(this.direction.x) >= 0.9
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) }
    }
    this.velocity = INITIAL_VELOCITY;
  }

  update(delta: number) {
    this.x += this.direction.x * this.velocity * delta;
    this.y += this.direction.y * this.velocity * delta;
    this.velocity += VELOCITY_INCREASE * delta;
    const rect = this.rect();

    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
    }
    if (rect.right >= window.innerWidth || rect.left <= 0) {
      this.direction.x *= -1;
    }
  }
}
