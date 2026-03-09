import { ExpaOpportunityRaw, RestOpportunity } from "../types/opportunity.types";

export class ResponseMapper {
  /**
   * Maps a raw EXPA opportunity object to the structured frontend REST format.
   * @param expaData Raw EXPA opportunity object
   * @returns RestOpportunity
   */
  static mapOpportunity(expaData: ExpaOpportunityRaw): RestOpportunity {
    // Safe extractions from the actual EXPA schema
    const safeCompany = expaData.branch?.company?.name || expaData.branch?.name || "Not specified";
    const safeCountry = expaData.city?.country || "Not specified";
    const safeCity = expaData.city?.name || expaData.location || "Not specified";
    const hostLc = expaData.host_lc?.name || "Not specified";
    
    // Remote status is a direct string field on Opportunity
    const remoteOpportunity = expaData.remote_opportunity || "unknown";

    // Salary info
    const salary = expaData.specifics_info?.salary ?? null;
    const salaryPeriodicity = expaData.specifics_info?.salary_periodicity || null;
    const paid = salary !== null && salary > 0;

    // Category from programme
    const category = expaData.programmes?.short_name_display || "IGTa";

    // Duration (usually weeks in EXPA)
    const duration = expaData.duration ? `${expaData.duration} Weeks` : "Not specified";

    // Tags from learning points or other available data
    const tags: string[] = [];
    if (expaData.role_info?.learning_points_list) {
      tags.push(...expaData.role_info.learning_points_list);
    }

    return {
      id: String(expaData.id),
      title: expaData.title || "Untitled Opportunity",
      company: safeCompany,
      country: safeCountry,
      city: safeCity,
      duration: duration,
      category: category,
      remoteOpportunity: remoteOpportunity,
      paid: paid,
      salary: salary,
      salaryPeriodicity: salaryPeriodicity,
      tags: tags,
      description: expaData.description || "",
      startDate: expaData.earliest_start_date || null,
      status: expaData.status || "Unknown",
      applicantsCount: expaData.applicants_count || 0,
      hostLc: hostLc,
    };
  }
}

