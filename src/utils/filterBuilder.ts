export class FilterBuilder {
  /**
   * Maps common REST query parameters to EXPA OpportunityFilter structures.
   * Note: Some of these mappings (like 'status', 'remote_type') might need to be
   * adjusted based on the exact internal EXPA GraphQL schema parameters.
   * 
   * @param query The req.query object from Express
   * @returns EXPA formatted filter object
   */
  static buildOpportunityFilters(query: any): Record<string, any> {
    const filters: Record<string, any> = {};

    // Map `country` string search
    // If EXPA requires a specific country ID instead of string, this needs adjustment
    if (query.country) {
      filters.country = String(query.country);
    }

    // Map `remote` boolean 
    // Usually mapped as `remote_opportunity: true` or `is_remote: true` in EXPA
    if (query.remote === 'true') {
      filters.remote_opportunity = true;
    }

    // Map `paid` boolean
    // Might require a complex nested filter like `salary: { gt: 0 }` or `is_paid` depending on schema
    // Placing a placeholder structure that can be scaled
    if (query.paid === 'true') {
      filters.is_paid = true;
    }

    // Map specific statuses (e.g. "open", "matched")
    if (query.status) {
      filters.statuses = [String(query.status)];
    }

    return filters;
  }

  /**
   * Extracts standard pagination and sorting variables.
   * 
   * @param query The req.query object from Express
   * @returns Pagination parameters
   */
  static buildOpportunityPagination(query: any) {
    return {
      page: parseInt(query.page as string) || 1,
      limit: parseInt(query.limit as string) || 10,
      searchQuery: query.q ? String(query.q) : undefined,
      sort: query.sort ? String(query.sort) : undefined,
    };
  }
}
