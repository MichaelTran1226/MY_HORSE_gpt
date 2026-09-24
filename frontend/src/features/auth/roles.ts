export const roles = {
  HEAD_TRAINER: {
    name: "Head Trainer",
    email: "headtrainer@gmail.com",
    title: "Build a stronger team.",
    description:
      "Plan training, monitor performance and prepare horses for race day.",
    features: [
      ["Training overview", "Fitness and training progress across the club."],
      [
        "Training Plans",
        "Distance, intensity, surface and objectives for each horse.",
      ],
      [
        "Training calendar",
        "Daily assignments for the care team and Trial Runs.",
      ],
      ["Session metrics", "Record performance and professional assessments."],
      ["Race registration", "Select eligible horses and upcoming races."],
    ],
  },
  VETERINARIAN: {
    name: "Veterinarian",
    email: "veterinarian@gmail.com",
    title: "Care that keeps them moving.",
    description: "Monitor herd health and coordinate safe recovery.",
    features: [
      [
        "Herd health",
        "Fit, Under Observation, Injured and Quarantined horses.",
      ],
      [
        "Medical records",
        "Examinations, diagnoses, treatments and prescriptions.",
      ],
      ["Injury tracking", "Anatomical injury locations and recovery history."],
      ["Training Lock", "Protect injured horses from strenuous training."],
      [
        "Preventive care",
        "Vaccination, deworming and Farrier Check schedules.",
      ],
    ],
  },
  GROOM: {
    name: "Groom / Stable Hand",
    email: "groom@gmail.com",
    title: "A better day in every stall.",
    description: "Organize daily care, nutrition and stable operations.",
    features: [
      ["Training assignments", "Your assigned training schedule."],
      ["Stall map", "Stall allocation and daily routines."],
      ["Meal rations", "Approved hay, grain and supplements per meal."],
      ["Daily care", "Feeding, cleaning, bathing and recovery tasks."],
      [
        "Incident reports",
        "Report appetite, health or hoof concerns with photos.",
      ],
      ["Stable supplies", "Track supplies and request replenishment."],
    ],
  },
  HORSE_OWNER: {
    name: "Horse Owner",
    email: "horseowner@gmail.com",
    title: "Closer to your horses.",
    description: "Follow the care, progress and achievements of your horses.",
    features: [
      ["My Horses", "Profiles and race records of horses you own."],
      ["Health updates", "Latest examinations, weight and racing readiness."],
      ["Training journal", "Schedules, Trial Run videos and trainer notes."],
      ["Financial reports", "Care costs, medical expenses and prize revenue."],
    ],
  },
  CLUB_MANAGER: {
    name: "Club Manager",
    email: "clubmanager@gmail.com",
    title: "Your club. In perspective.",
    description:
      "Coordinate people, resources and the performance of the club.",
    features: [
      ["Horse registry", "Manage the club horse directory."],
      ["Stall map", "Manage available stalls and current allocation."],
      ["Staff accounts", "Create and manage club accounts."],
      ["Supplies catalog", "Manage medical and feed supply catalogs."],
      ["Access permissions", "Role responsibilities and workspace access."],
      [
        "Club reports",
        "Training performance, operating costs and race revenue.",
      ],
      ["Audit Log", "Review recorded system activity."],
    ],
  },
} as const;
export type Role = keyof typeof roles;
export function readUser(): {
  email: string;
  fullName: string;
  role: Role;
} | null {
  try {
    const u = JSON.parse(localStorage.getItem("equiflow:user") || "null");
    if (!u) return null;
    const role =
      u.role ||
      (Object.keys(roles) as Role[]).find((r) => roles[r].email === u.email);
    return role && role in roles ? { ...u, role } : null;
  } catch {
    return null;
  }
}
