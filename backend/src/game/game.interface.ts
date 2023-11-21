export type Player = {
    id: string;
    userId: number;
    y: number;
    playerType: string;
};

export interface Ball {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    radius: number;
}

export type Direction = {
    up: boolean;
    down: boolean;
};

export interface Score {
    playerOne: number;
    playerTwo: number;
}

export interface GameRoom {
    id: string;
    players: Player[];
    direction: Direction;
    score: Score;
    ball: Ball;
}