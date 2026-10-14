/*
|--------------------------------------------------------------------------
| CRISIS SUPPORT RESOURCES (Sri Lanka)
|--------------------------------------------------------------------------
|
| Shown to a user when their post contains crisis language.
| Verify these numbers periodically — helplines can change.
|
*/

export interface CrisisResource {
  name: string;
  description: string;
  phone: string;
  displayPhone: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Mental Health Helpline",
    description: "Free, 24/7 — National Institute of Mental Health",
    phone: "1926",
    displayPhone: "1926",
  },
  {
    name: "CCCline",
    description: "Free, confidential support, 24/7",
    phone: "1333",
    displayPhone: "1333",
  },
  {
    name: "Sumithrayo",
    description: "Emotional support from trained volunteers",
    phone: "0112696666",
    displayPhone: "011 2 696 666",
  },
  {
    name: "Emergency Ambulance (Suwa Seriya)",
    description: "If you are in immediate danger",
    phone: "1990",
    displayPhone: "1990",
  },
];
