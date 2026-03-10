export interface ExpaOpportunityRaw {
  id: string | number;
  title: string;
  status: string;
  description?: string;
  earliest_start_date?: string;
  duration?: number;
  applicants_count?: number;
  remote_opportunity?: string;
  branch?: {
    id: number;
    name: string;
    company?: {
      name: string;
    };
  };
  host_lc?: {
    id: number;
    name: string;
  };
  location?: string;
  city?: {
    name?: string;
    country?: string;
  };
  specifics_info?: {
    salary?: number | null;
    salary_periodicity?: string;
    computer?: string;
    expected_work_schedule?: unknown;
  };
  role_info?: {
    learning_points_list?: string[];
    selection_process?: string;
  };
  logistics_info?: {
    accommodation_provided?: string;
    accommodation_covered?: string;
    computer_provided?: string;
    food_provided?: string;
    food_covered?: string;
    transportation_provided?: string;
    transportation_covered?: string;
  };
  programmes?:
    | {
        id: number;
        short_name_display: string;
      }
    | Array<{
        id: number;
        short_name_display: string;
      }>;
  [key: string]: any;
}

export interface OpportunityProgramme {
  id: number;
  shortName: string;
}

export interface OpportunityLogistics {
  accommodationProvided: string | null;
  accommodationCovered: string | null;
  computerProvided: string | null;
  foodProvided: string | null;
  foodCovered: string | null;
  transportationProvided: string | null;
  transportationCovered: string | null;
}

export interface OpportunitySpecifics {
  salary: number | null;
  salaryPeriodicity: string | null;
  computer: string | null;
  expectedWorkSchedule: unknown | null;
}

export interface RestOpportunity {
  id: string;
  title: string;
  company: string;
  country: string;
  city: string;
  duration: string;
  category: string;
  remoteOpportunity: string;
  paid: boolean;
  salary: number | null;
  salaryPeriodicity: string | null;
  tags: string[];
  description: string;
  startDate: string | null;
  status: string;
  applicantsCount: number;
  hostLc: string;
  branchId: number | null;
  branchName: string;
  hostLcId: number | null;
  location: string | null;
  programmes: OpportunityProgramme[];
  learningPoints: string[];
  selectionProcess: string | null;
  logistics: OpportunityLogistics;
  specifics: OpportunitySpecifics;
}

export interface PaginatedResponse<T> {
  data: T[];
  paging: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
