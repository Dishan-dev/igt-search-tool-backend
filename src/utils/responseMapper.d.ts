import { ExpaOpportunityRaw, RestOpportunity } from "../types/opportunity.types";
export declare class ResponseMapper {
    /**
     * Maps a raw EXPA opportunity object to the structured frontend REST format.
     * @param expaData Raw EXPA opportunity object
     * @returns RestOpportunity
     */
    static mapOpportunity(expaData: ExpaOpportunityRaw): RestOpportunity;
}
//# sourceMappingURL=responseMapper.d.ts.map