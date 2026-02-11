
export enum Role {
  CIVILIAN = 'CIVILIAN',
  UNDERCOVER = 'UNDERCOVER',
  MR_WHITE = 'MR_WHITE'
}

export interface Player {
  id: number;
  name: string;
  role: Role;
  word: string;
  isAlive: boolean;
  hasSeenCard: boolean;
}

export interface GameSettings {
  playerCount: number;
  undercoverCount: number;
  mrWhiteCount: number;
}

export enum GameStage {
  SETUP = 'SETUP',
  DEALING = 'DEALING',
  REVEALING = 'REVEALING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface WordPair {
  civilian: string;
  undercover: string;
}
