import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { ExpaApiError } from "../utils/errors";

export const expaGraphqlClient = axios.create({
  baseURL: env.EXPA_GRAPHQL_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: env.EXPA_TOKEN,
  },
});

/**
 * Executes a GraphQL query against the EXPA API
 * @param query The GraphQL query string
 * @param variables Optional variables for the query
 * @returns The data object from the GraphQL response
 */
export const executeGraphqlQuery = async (query: string, variables: Record<string, any> = {}) => {
  try {
    const response = await expaGraphqlClient.post("", {
      query,
      variables,
    });

    if (response.data.errors) {
      const messages = response.data.errors.map((e: any) => e.message).join(", ");
      throw new ExpaApiError(`GraphQL Schema Errors: ${messages}`, response.data.errors);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ExpaApiError) {
      throw error;
    }
    
    if (error instanceof AxiosError) {
      throw new ExpaApiError(
        `EXPA API connection failed: ${error.message}`, 
        error.response?.data || null
      );
    }
    throw new ExpaApiError("Unknown EXPA Query Execution Error", error);
  }
};
