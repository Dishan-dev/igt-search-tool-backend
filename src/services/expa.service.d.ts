import { PaginatedResponse, RestOpportunity } from "../types/opportunity.types";
export declare class ExpaService {
    /**
     * Helper function to optionally resolve the Colombo South Committee ID
     * if it wasn't supplied strictly in the environment variables.
     */
    static resolveCommitteeId(): Promise<string>;
    /**
     * Fetches opportunities from EXPA matching specific filters.
     */
    static fetchOpportunities(page?: number, limit?: number, searchQuery?: string, filters?: Record<string, any>): Promise<PaginatedResponse<RestOpportunity>>;
    /**
     * Fetches a specific opportunity by ID.
     */
    static fetchOpportunityById(id: string): Promise<RestOpportunity | null>;
}
//# sourceMappingURL=expa.service.d.ts.map