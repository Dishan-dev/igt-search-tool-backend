import { executeGraphqlQuery } from "../lib/expaGraphqlClient";
import { env } from "../config/env";
import { PaginatedResponse, RestOpportunity, ExpaOpportunityRaw } from "../types/opportunity.types";
import { ResponseMapper } from "../utils/responseMapper";
import { ExpaApiError } from "../utils/errors";

export class ExpaService {
  /**
   * Helper function to optionally resolve the Colombo South Committee ID
   * if it wasn't supplied strictly in the environment variables.
   */
  static async resolveCommitteeId(): Promise<string> {
    if (env.COLOMBO_SOUTH_COMMITTEE_ID) {
      return env.COLOMBO_SOUTH_COMMITTEE_ID;
    }

    // Fallback: Query EXPA to find the committee by name
    const query = `
      query SearchCommittee($q: String) {
        committees(q: $q, limit: 1) {
          id
          name
        }
      }
    `;
    
    try {
      const result = await executeGraphqlQuery(query, { q: "Colombo South" });
      const committeeId = result.committees?.[0]?.id;
      
      if (!committeeId) {
        throw new ExpaApiError("Could not auto-resolve the Colombo South Committee ID from EXPA.");
      }
      
      return committeeId.toString();
    } catch (error) {
       console.error("Failed to resolve committee:", error);
       throw new ExpaApiError("Failed to auto-resolve committee ID");
    }
  }

  /**
   * Fetches opportunities from EXPA matching specific filters.
   */
  static async fetchOpportunities(
    page: number = 1,
    limit: number = 10,
    searchQuery?: string,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<RestOpportunity>> {
    
    const committeeId = await this.resolveCommitteeId();

    const query = `
      query AllOpportunities($page: Int, $perPage: Int, $q: String, $filters: OpportunityFilter) {
        allOpportunity(page: $page, per_page: $perPage, q: $q, filters: $filters) {
          paging {
            current_page
            total_pages
            total_items
          }
          data {
            id
            title
            description
            status
            earliest_start_date
            duration
            applicants_count
            remote_opportunity
            branch {
              id
              name
              company {
                name
              }
            }
            host_lc {
              id
              name
            }
            location
            city {
              name
              country
            }
            specifics_info {
              salary
              salary_periodicity
              computer
              expected_work_schedule
            }
            role_info {
              learning_points_list
              selection_process
            }
            logistics_info {
              accommodation_provided
              accommodation_covered
              computer_provided
              food_provided
              food_covered
              transportation_provided
              transportation_covered
            }
            programmes {
              id
              short_name_display
            }
          }
        }
      }
    `;

    // Construct the payload filters, forcing programme 8 and the resolved committee ID
    const mergedFilters = {
      committee: parseInt(committeeId),
      programmes: [8],
      ...filters,
    };

    const variables = {
      page,
      perPage: limit,
      q: searchQuery || "",
      filters: mergedFilters,
    };

    try {
      const result = await executeGraphqlQuery(query, variables);
      const opportunitiesRaw: ExpaOpportunityRaw[] = result.allOpportunity.data;
      
      const mappedData = opportunitiesRaw.map(ResponseMapper.mapOpportunity);
      
      return {
        data: mappedData,
        paging: {
          currentPage: result.allOpportunity.paging.current_page,
          totalPages: result.allOpportunity.paging.total_pages,
          totalItems: result.allOpportunity.paging.total_items,
        },
      };
    } catch (error: any) {
      console.error("[ExpaService] Error in fetchOpportunities:", error);
      throw new ExpaApiError(`Failed to fetch opportunities: ${error.message}`);
    }
  }

  /**
   * Fetches a specific opportunity by ID.
   */
  static async fetchOpportunityById(id: string): Promise<RestOpportunity | null> {
    const query = `
      query GetOpportunity($id: ID!) {
        getOpportunity(id: $id) {
          id
          title
          description
          status
          earliest_start_date
          duration
          applicants_count
          remote_opportunity
          branch {
            id
            name
            company {
              name
            }
          }
          host_lc {
            id
            name
          }
          location
          city {
            name
            country
          }
          specifics_info {
            salary
            salary_periodicity
            computer
            expected_work_schedule
          }
          role_info {
            learning_points_list
            selection_process
          }
          logistics_info {
            accommodation_provided
            accommodation_covered
            computer_provided
            food_provided
            food_covered
            transportation_provided
            transportation_covered
          }
          programmes {
            id
            short_name_display
          }
        }
      }
    `;

    const result = await executeGraphqlQuery(query, { id });
    
    if (!result.getOpportunity) {
      return null;
    }

    return ResponseMapper.mapOpportunity(result.getOpportunity);
  }
}

