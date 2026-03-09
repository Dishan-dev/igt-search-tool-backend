import axios from "axios";
export declare const expaGraphqlClient: axios.AxiosInstance;
/**
 * Executes a GraphQL query against the EXPA API
 * @param query The GraphQL query string
 * @param variables Optional variables for the query
 * @returns The data object from the GraphQL response
 */
export declare const executeGraphqlQuery: (query: string, variables?: Record<string, any>) => Promise<any>;
//# sourceMappingURL=expaGraphqlClient.d.ts.map