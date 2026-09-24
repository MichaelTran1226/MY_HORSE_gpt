export interface Account {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isLocked?: boolean;
  emailVerified?: boolean;
}
export interface Session {
  id: string;
  sessionDate: string;
  assignedToId?: string;
  isCompleted: boolean;
  cancelledAt?: string;
  rating?: number;
  trainerNote?: string;
  trialRun?: {
    finishTimeSeconds: number;
    maxSpeedKmh: number;
    preHeartRate: number;
    postHeartRate: number;
    videoUrl?: string;
  };
}
export interface Plan {
  id: string;
  title: string;
  objective: string;
  distanceMeters: number;
  intensity: string;
  surfaceType: string;
  startDate: string;
  endDate: string;
  sessions: Session[];
}
export interface Horse {
  id: string;
  chipId: string;
  name: string;
  breed: string;
  dateOfBirth: string;
  color: string;
  gender: string;
  heightHands: number;
  weightKg: number;
  avatarUrl?: string;
  ownerId?: string;
  stallId?: string;
  intakeStatus: string;
  healthStatus: string;
  isTrainingLocked: boolean;
  lockReason?: string;
  owner?: { fullName: string };
  stall?: { stallNumber: string };
  trainingPlans: Plan[];
  medicalRecords: {
    id: string;
    diagnosis: string;
    treatmentPlan: string;
    prescription?: string;
    createdAt: string;
    withdrawalDays: number;
    vet?: { fullName: string };
    injuries: {
      id: string;
      bodyLocation: string;
      severity: string;
      notes?: string;
    }[];
  }[];
  careSchedules: {
    id: string;
    careType: string;
    scheduledDate: string;
    isCompleted: boolean;
  }[];
  raceEntries: {
    id: string;
    raceName: string;
    raceDate: string;
    result?: { finishRank: number; prizeMoney: string };
  }[];
}
export const date = (value: string) => new Date(value).toLocaleDateString();
