import { ExpaOpportunityRaw, RestOpportunity } from "../types/opportunity.types";

export class ResponseMapper {
  private static parseNumberValue(value: unknown): number | null {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private static mapOpportunityCost(raw: any) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    return {
      programmeFee: ResponseMapper.parseNumberValue(raw.programme_fee),
      projectFee: ResponseMapper.parseNumberValue(raw.project_fee),
      total: ResponseMapper.parseNumberValue(raw.total),
      currency: typeof raw.currency === "string" ? raw.currency : null,
      country: typeof raw.country === "string" ? raw.country : null,
      healthInsuranceLink:
        typeof raw.health_insurance_link === "string" ? raw.health_insurance_link : null,
    };
  }

  private static decodeHtmlEntities(value: string): string {
    const entities: Record<string, string> = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };

    return value.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => entities[entity] || entity);
  }

  private static htmlToReadableText(value: string): string {
    if (!value) return "";

    const withBreaks = value
      .replace(/<\s*li\s*>/gi, "\n- ")
      .replace(/<\s*\/\s*li\s*>/gi, "")
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\s*\/\s*p\s*>/gi, "\n")
      .replace(/<\s*p[^>]*>/gi, "")
      .replace(/<\s*\/\s*div\s*>/gi, "\n")
      .replace(/<\s*div[^>]*>/gi, "");

    return ResponseMapper.decodeHtmlEntities(withBreaks.replace(/<[^>]+>/g, " "))
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  private static uniqueItems(values: Array<string | null | undefined>): string[] {
    const normalized = values
      .map((value) => (value || "").trim())
      .filter(Boolean)
      .map((value) => value.replace(/^[-#*\s]+/, "").trim())
      .filter(Boolean);

    return Array.from(new Set(normalized));
  }

  private static splitToItems(value: string | null | undefined): string[] {
    if (!value) return [];

    return value
      .split(/\n|\||;|•/g)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^[-#*\s]+/, "").trim())
      .filter(Boolean);
  }

  private static extractSectionItems(source: string, keywords: string[]): string[] {
    if (!source) return [];

    const lines = source
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
    const allHeadingHints = [
      "role",
      "responsibil",
      "process",
      "eligib",
      "requirement",
      "visa",
      "permit",
      "logistic",
      "benefit",
      "support",
    ];

    const startIndex = lines.findIndex((line) => {
      const normalized = line.toLowerCase().replace(/[:\-]/g, " ").trim();
      return normalizedKeywords.some((keyword) => normalized.includes(keyword));
    });

    if (startIndex < 0) return [];

    const collected: string[] = [];
    for (let i = startIndex + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) {
        continue;
      }

      const normalized = line.toLowerCase().replace(/[:\-]/g, " ").trim();

      const isNewHeading =
        normalized.length < 80 &&
        allHeadingHints.some((hint) => normalized.includes(hint)) &&
        !normalizedKeywords.some((keyword) => normalized.includes(keyword));

      if (isNewHeading) {
        break;
      }

      collected.push(line);
    }

    return ResponseMapper.uniqueItems(collected);
  }

  private static toFriendlyBoolean(value: string | null | undefined): string {
    const normalized = (value || "").toLowerCase();
    if (!normalized) return "Not specified";
    if (normalized.includes("yes") || normalized.includes("provided") || normalized === "true") return "Yes";
    if (normalized.includes("no") || normalized === "false") return "No";
    return value || "Not specified";
  }

  private static buildLogisticsDetails(expaData: ExpaOpportunityRaw): string[] {
    const logistics = expaData.logistics_info;
    if (!logistics) return [];

    const details = [
      `Accommodation provided: ${ResponseMapper.toFriendlyBoolean(logistics.accommodation_provided || null)}`,
      `Accommodation covered: ${ResponseMapper.toFriendlyBoolean(logistics.accommodation_covered || null)}`,
      `Computer provided: ${ResponseMapper.toFriendlyBoolean(logistics.computer_provided || null)}`,
      `Food provided: ${ResponseMapper.toFriendlyBoolean(logistics.food_provided || null)}`,
      `Food covered: ${ResponseMapper.toFriendlyBoolean(logistics.food_covered || null)}`,
      `Transportation provided: ${ResponseMapper.toFriendlyBoolean(logistics.transportation_provided || null)}`,
      `Transportation covered: ${ResponseMapper.toFriendlyBoolean(logistics.transportation_covered || null)}`,
    ];

    return ResponseMapper.uniqueItems(details.filter((item) => !item.endsWith("Not specified")));
  }

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
    const salaryRaw = expaData.specifics_info?.salary;
    const salaryParsed =
      typeof salaryRaw === "number"
        ? salaryRaw
        : typeof salaryRaw === "string"
        ? Number(salaryRaw.replace(/[^\d.-]/g, ""))
        : NaN;
    const salary = Number.isFinite(salaryParsed) ? salaryParsed : null;
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
    const readableDescription = ResponseMapper.htmlToReadableText(expaData.description || "");

    const roleDetails = ResponseMapper.uniqueItems([
      ...learningPoints,
      ...ResponseMapper.extractSectionItems(readableDescription, ["role", "responsibilities", "tasks"]),
    ]);

    const processDetails = ResponseMapper.uniqueItems([
      ...ResponseMapper.splitToItems(selectionProcess),
      ...ResponseMapper.extractSectionItems(readableDescription, ["selection process", "application process", "recruitment process", "process"]),
    ]);

    const eligibilityDetails = ResponseMapper.extractSectionItems(readableDescription, [
      "eligibility",
      "requirements",
      "requirement",
      "who can apply",
      "candidate profile",
    ]);

    const visaDetails = ResponseMapper.extractSectionItems(readableDescription, ["visa", "work permit", "permit", "legal"]);

    const logisticsDetails = ResponseMapper.uniqueItems([
      ...ResponseMapper.buildLogisticsDetails(expaData),
      ...ResponseMapper.extractSectionItems(readableDescription, ["logistics", "benefits", "support", "accommodation", "food", "transport"]),
    ]);

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
      roleDetails,
      processDetails,
      eligibilityDetails,
      logisticsDetails,
      visaDetails,
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
      opportunityCost: ResponseMapper.mapOpportunityCost(expaData.opportunity_cost),
      feeAndHealthInsurance: ResponseMapper.mapOpportunityCost(expaData.fee_and_health_insurance),
      assignedPersonName: null,
      assignedPersonWhatsapp: null,
      assignedPersonWhatsappUrl: null,
    };
  }
}

