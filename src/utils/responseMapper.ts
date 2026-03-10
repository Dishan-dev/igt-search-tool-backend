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

    // EXPA may return programmes as either an object or an array depending on resolver shape.
    const programmesRaw = Array.isArray(expaData.programmes)
      ? expaData.programmes
      : expaData.programmes
      ? [expaData.programmes]
      : [];

    const programmes = programmesRaw.map((programme) => ({
      id: programme.id,
      shortName: programme.short_name_display,
    }));

    // Category from first programme (legacy field retained for frontend compatibility)
    const category = programmes[0]?.shortName || "IGTa";

    const learningPoints = expaData.role_info?.learning_points_list || [];
    const selectionProcess = expaData.role_info?.selection_process || null;

    // Duration (usually weeks in EXPA)
    const duration = expaData.duration ? `${expaData.duration} Weeks` : "Not specified";

    // Tags are currently represented by learning points.
    const tags = [...learningPoints];

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
      branchId: expaData.branch?.id || null,
      branchName: expaData.branch?.name || "Not specified",
      hostLcId: expaData.host_lc?.id || null,
      location: expaData.location || null,
      programmes,
      learningPoints,
      selectionProcess,
      logistics: {
        accommodationProvided: expaData.logistics_info?.accommodation_provided || null,
        accommodationCovered: expaData.logistics_info?.accommodation_covered || null,
        computerProvided: expaData.logistics_info?.computer_provided || null,
        foodProvided: expaData.logistics_info?.food_provided || null,
        foodCovered: expaData.logistics_info?.food_covered || null,
        transportationProvided: expaData.logistics_info?.transportation_provided || null,
        transportationCovered: expaData.logistics_info?.transportation_covered || null,
      },
      specifics: {
        salary,
        salaryPeriodicity,
        computer: expaData.specifics_info?.computer || null,
        expectedWorkSchedule: expaData.specifics_info?.expected_work_schedule || null,
      },
    };
  }
}

