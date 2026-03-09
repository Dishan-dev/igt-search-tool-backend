export declare class FilterBuilder {
    /**
     * Maps common REST query parameters to EXPA OpportunityFilter structures.
     * Note: Some of these mappings (like 'status', 'remote_type') might need to be
     * adjusted based on the exact internal EXPA GraphQL schema parameters.
     *
     * @param query The req.query object from Express
     * @returns EXPA formatted filter object
     */
    static buildOpportunityFilters(query: any): Record<string, any>;
    /**
     * Extracts standard pagination and sorting variables.
     *
     * @param query The req.query object from Express
     * @returns Pagination parameters
     */
    static buildOpportunityPagination(query: any): {
        page: number;
        limit: number;
        searchQuery: string | undefined;
        sort: string | undefined;
    };
}
//# sourceMappingURL=filterBuilder.d.ts.map