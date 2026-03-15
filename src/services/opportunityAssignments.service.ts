import axios from "axios";
import { env } from "../config/env";
import { RestOpportunity } from "../types/opportunity.types";

interface OpportunityAssignment {
  personName: string;
  whatsappNumber: string;
  whatsappUrl: string;
}

interface CachedAssignments {
  expiry: number;
  values: Map<string, OpportunityAssignment>;
}

export class OpportunityAssignmentsService {
  private static cache: CachedAssignments | null = null;

  private static normalizeHeader(header: string): string {
    return header.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  }

  private static parseCsvLine(line: string): string[] {
    const cells: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (char === "," && !insideQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    cells.push(current.trim());
    return cells;
  }

  private static sanitizePhoneNumber(raw: string): string {
    const normalized = raw.trim();

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }

    const digitsOnly = normalized.replace(/[^\d+]/g, "");
    if (digitsOnly.startsWith("+")) {
      return digitsOnly.slice(1);
    }

    return digitsOnly;
  }

  private static buildWhatsappUrl(rawValue: string): string {
    const normalized = rawValue.trim();

    if (!normalized) return "";

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }

    const phone = this.sanitizePhoneNumber(normalized);
    return phone ? `https://wa.me/${phone}` : "";
  }

  private static getRowValue(row: Record<string, string>, aliases: string[]): string {
    for (const alias of aliases) {
      const match = row[alias];
      if (match && match.trim()) {
        return match.trim();
      }
    }
    return "";
  }

  private static parseAssignments(csv: string): Map<string, OpportunityAssignment> {
    const lines = csv
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      return new Map();
    }

    const headerLine = lines[0];
    if (!headerLine) {
      return new Map();
    }

    const headerRow = this.parseCsvLine(headerLine);
    const normalizedHeaders = headerRow.map((header) => this.normalizeHeader(header));

    // Expose for debug inspection
    this.lastRawHeaders = headerRow;
    this.lastNormalizedHeaders = normalizedHeaders;

    const assignments = new Map<string, OpportunityAssignment>();

    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) continue;

      const values = this.parseCsvLine(line);
      const row: Record<string, string> = {};

      for (let j = 0; j < normalizedHeaders.length; j += 1) {
        const header = normalizedHeaders[j];
        if (!header) continue;
        row[header] = values[j] ?? "";
      }

      const opportunityId = this.getRowValue(row, [
        "id",
        "opportunityid",
        "expaid",
        "opportunityexpaid",
        "opportunity",
      ]);

      const personName = this.getRowValue(row, [
        "matchingtlincharge",
        "matchingtl",
        "tlincharge",
        "assignedperson",
        "assignee",
        "responsible",
        "responsibleperson",
        "owner",
        "person",
      ]);

      const whatsappRaw = this.getRowValue(row, [
        "assignedpersonwhatsapp",
        "assignedpersonwhatsappnumber",
        "whatsappnumber",
        "whatsapp",
        "whatsappurl",
        "whatsapplink",
        "contactnumber",
        "phone",
        "mobilenumber",
      ]);

      const whatsappUrl = this.buildWhatsappUrl(whatsappRaw);
      const whatsappNumber = this.sanitizePhoneNumber(whatsappRaw);

      // WhatsApp is optional — button only shows if a number is present
      // Skip rows with no ID, no person, or person marked as TBA
      if (!opportunityId || !personName || personName.toLowerCase() === "tba") {
        continue;
      }

      assignments.set(opportunityId, {
        personName,
        whatsappNumber,
        whatsappUrl,
      });
    }

    return assignments;
  }



  // Exposed for debug endpoint inspection
  static lastRawHeaders: string[] = [];
  static lastNormalizedHeaders: string[] = [];

  private static async loadAssignments(): Promise<Map<string, OpportunityAssignment>> {
    if (!env.GOOGLE_SHEET_CSV_URL) return new Map();

    const now = Date.now();
    if (this.cache && now < this.cache.expiry) return this.cache.values;

    try {
      const response = await axios.get<string>(env.GOOGLE_SHEET_CSV_URL, {
        responseType: "text",
        timeout: 10000,
      });

      const assignments = this.parseAssignments(response.data || "");
      const ttl = Number.isFinite(env.GOOGLE_SHEET_SYNC_TTL_MS)
        ? env.GOOGLE_SHEET_SYNC_TTL_MS
        : 120000;

      this.cache = { values: assignments, expiry: now + ttl };
      return assignments;
    } catch (error) {
      console.error("[OpportunityAssignmentsService] Failed to sync Google Sheet:", error);
      return this.cache?.values ?? new Map();
    }
  }

  static async enrichOpportunities(opportunities: RestOpportunity[]): Promise<RestOpportunity[]> {
    const assignments = await this.loadAssignments();
    if (assignments.size === 0) return opportunities;

    return opportunities.map((opportunity) => {
      const assignment = assignments.get(opportunity.id);
      if (!assignment) return opportunity;
      return {
        ...opportunity,
        assignedPersonName: assignment.personName,
        assignedPersonWhatsapp: assignment.whatsappNumber,
        assignedPersonWhatsappUrl: assignment.whatsappUrl,
      };
    });
  }

  static async enrichOpportunity(opportunity: RestOpportunity): Promise<RestOpportunity> {
    const assignments = await this.loadAssignments();
    const assignment = assignments.get(opportunity.id);
    if (!assignment) return opportunity;
    return {
      ...opportunity,
      assignedPersonName: assignment.personName,
      assignedPersonWhatsapp: assignment.whatsappNumber,
      assignedPersonWhatsappUrl: assignment.whatsappUrl,
    };
  }
}
