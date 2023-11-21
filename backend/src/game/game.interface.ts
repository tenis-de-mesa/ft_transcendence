import { Socket } from "socket.io";
import { UserEntity } from "../core/entities";

export type Player = {
    user: UserEntity;
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
    gameId: number;
    players: Player[];
    direction: Direction;
    score: Score;
    ball: Ball;
}