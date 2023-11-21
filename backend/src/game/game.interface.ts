import { Socket } from "socket.io";
import { UserEntity } from "../core/entities";

export type Player = {
    user: UserEntity;
    y: number;
    score: number;
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

export interface GameRoom {
    gameId: number;
    players: Player[];
    ball: Ball;
}