export enum UserRole {
  ADMIN = "ADMIN",
  RIGHTSHOLDER = "RIGHTSHOLDER",
}

export enum ApprovalStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum PendingStatus {
  USER = "Pending#USER",
  MOVIE = "Pending#MOVIE"
}

export type Movie = {
  title: string;
  posterUrl: string;
};

export class User {
  accountAddress!: string;

  name!: string;
  
  imdbId!: string;

  email!: string;

  status!: ApprovalStatus;

  pendingStatus!: string;
  
  roles: UserRole[] = [];

  movies: Movie[] = [];
  
  constructor(seed?: object) {
    if (seed) {
      Object.assign(this, seed);
    }
  }

  isRightsHolder(): boolean {
    return this.isApproved() && this.roles.indexOf(UserRole.RIGHTSHOLDER) >= 0;
  }

  isAdmin(): boolean {
    return this.isApproved() && this.roles.indexOf(UserRole.ADMIN) >= 0;
  }

  isApproved(): boolean {
    return this.status === ApprovalStatus.APPROVED 
  }
};
