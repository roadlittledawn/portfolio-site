/**
 * Constants and configuration options for the admin UI
 */

export interface SelectOption {
  value: string;
  label: string;
  category?: string;
}

// Role type options for experiences, projects, and skills
export const ROLE_TYPE_OPTIONS: SelectOption[] = [
  { value: "technical_writer", label: "Technical Writer" },
  { value: "manager_technical_writing", label: "Technical Writing Manager" },
  { value: "software_engineer", label: "Software Engineer" },
  {
    value: "manager_software_engineering",
    label: "Software Engineering Manager",
  },
];

// Mapping from old/legacy role type values to new standard values
export const ROLE_TYPE_MAPPING: Record<string, string> = {
  // Current standard (pass through)
  technical_writer: "technical_writer",
  manager_technical_writing: "manager_technical_writing",
  software_engineer: "software_engineer",
  manager_software_engineering: "manager_software_engineering",
  // Legacy values from database
  technical_writing_manager: "manager_technical_writing",
  engineering_manager: "manager_software_engineering",
  engineering: "software_engineer",
  writing: "technical_writer",
  technical_writing: "technical_writer",
  management: "manager_software_engineering",
  both: "technical_writer", // Default to writer if ambiguous
};

/**
 * Normalizes role type values from database to standard values
 */
export function normalizeRoleType(roleType: string): string {
  return ROLE_TYPE_MAPPING[roleType] || roleType;
}

/**
 * Normalizes an array of role types
 */
export function normalizeRoleTypes(roleTypes: string[]): string[] {
  return roleTypes
    .map(normalizeRoleType)
    .filter((value, index, self) => self.indexOf(value) === index);
}

/**
 * Check if a skill is relevant for software engineering roles
 */
export function isEngineeringRole(roleTypes: string[]): boolean {
  const normalized = normalizeRoleTypes(roleTypes);
  return (
    normalized.includes("software_engineer") ||
    normalized.includes("manager_software_engineering")
  );
}

/**
 * Check if a skill is relevant for technical writing roles
 */
export function isWritingRole(roleTypes: string[]): boolean {
  const normalized = normalizeRoleTypes(roleTypes);
  return (
    normalized.includes("technical_writer") ||
    normalized.includes("manager_technical_writing")
  );
}

// Skill level options
export const SKILL_LEVEL_OPTIONS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

// Project type options
export const PROJECT_TYPE_OPTIONS: SelectOption[] = [
  { value: "documentation", label: "Documentation" },
  { value: "web-application", label: "Web Application" },
  { value: "api", label: "API" },
  { value: "library", label: "Library/Package" },
  { value: "tool", label: "Tool/Utility" },
  { value: "open-source", label: "Open Source" },
  { value: "content-strategy", label: "Content Strategy" },
  { value: "developer-experience", label: "Developer Experience" },
];

// Organization/Team options grouped by category
export const ORGANIZATION_OPTIONS: SelectOption[] = [
  // Engineering/Technical
  { value: "engineering", label: "Engineering", category: "Engineering" },
  {
    value: "platform-engineering",
    label: "Platform Engineering",
    category: "Engineering",
  },
  { value: "infrastructure", label: "Infrastructure", category: "Engineering" },
  {
    value: "sre",
    label: "Site Reliability Engineering (SRE)",
    category: "Engineering",
  },
  { value: "devops", label: "DevOps", category: "Engineering" },
  { value: "qa", label: "QA/Quality Assurance", category: "Engineering" },
  { value: "security", label: "Security/InfoSec", category: "Engineering" },
  {
    value: "data-engineering",
    label: "Data Engineering",
    category: "Engineering",
  },
  { value: "ml-ai", label: "Machine Learning/AI", category: "Engineering" },
  {
    value: "mobile-engineering",
    label: "Mobile Engineering",
    category: "Engineering",
  },
  {
    value: "frontend-engineering",
    label: "Frontend Engineering",
    category: "Engineering",
  },
  {
    value: "backend-engineering",
    label: "Backend Engineering",
    category: "Engineering",
  },
  {
    value: "cloud-engineering",
    label: "Cloud Engineering",
    category: "Engineering",
  },
  {
    value: "release-engineering",
    label: "Release Engineering",
    category: "Engineering",
  },

  // Product & Design
  {
    value: "product-management",
    label: "Product Management",
    category: "Product & Design",
  },
  {
    value: "product-design",
    label: "Product Design",
    category: "Product & Design",
  },
  { value: "ux-design", label: "UX Design", category: "Product & Design" },
  { value: "ux-research", label: "UX Research", category: "Product & Design" },
  {
    value: "design-systems",
    label: "Design Systems",
    category: "Product & Design",
  },
  {
    value: "creative-services",
    label: "Creative Services",
    category: "Product & Design",
  },

  // Documentation & Content
  {
    value: "technical-writing",
    label: "Technical Writing",
    category: "Documentation & Content",
  },
  {
    value: "developer-relations",
    label: "Developer Relations (DevRel)",
    category: "Documentation & Content",
  },
  {
    value: "developer-experience",
    label: "Developer Experience",
    category: "Documentation & Content",
  },
  {
    value: "content-strategy",
    label: "Content Strategy",
    category: "Documentation & Content",
  },
  {
    value: "knowledge-management",
    label: "Knowledge Management",
    category: "Documentation & Content",
  },
  {
    value: "learning-development",
    label: "Learning & Development",
    category: "Documentation & Content",
  },

  // Business/Operations
  { value: "marketing", label: "Marketing", category: "Business & Operations" },
  { value: "sales", label: "Sales", category: "Business & Operations" },
  {
    value: "sales-engineering",
    label: "Sales Engineering",
    category: "Business & Operations",
  },
  {
    value: "customer-success",
    label: "Customer Success",
    category: "Business & Operations",
  },
  {
    value: "customer-support",
    label: "Customer Support",
    category: "Business & Operations",
  },
  {
    value: "business-development",
    label: "Business Development",
    category: "Business & Operations",
  },
  {
    value: "partnerships",
    label: "Partnerships",
    category: "Business & Operations",
  },
  { value: "legal", label: "Legal", category: "Business & Operations" },
  { value: "finance", label: "Finance", category: "Business & Operations" },
  {
    value: "hr-people-ops",
    label: "HR/People Operations",
    category: "Business & Operations",
  },
  {
    value: "recruiting",
    label: "Recruiting/Talent Acquisition",
    category: "Business & Operations",
  },
  {
    value: "operations",
    label: "Operations",
    category: "Business & Operations",
  },
  {
    value: "it-internal-tools",
    label: "IT/Internal Tools",
    category: "Business & Operations",
  },

  // Management
  {
    value: "executive-leadership",
    label: "Executive Leadership",
    category: "Management",
  },
  {
    value: "program-management",
    label: "Program Management",
    category: "Management",
  },
  {
    value: "project-management",
    label: "Project Management",
    category: "Management",
  },
  { value: "agile-scrum", label: "Agile/Scrum", category: "Management" },
];

// Group options by category for react-select
export const GROUPED_ORGANIZATION_OPTIONS = [
  {
    label: "Engineering",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Engineering"),
  },
  {
    label: "Product & Design",
    options: ORGANIZATION_OPTIONS.filter(
      (o) => o.category === "Product & Design",
    ),
  },
  {
    label: "Documentation & Content",
    options: ORGANIZATION_OPTIONS.filter(
      (o) => o.category === "Documentation & Content",
    ),
  },
  {
    label: "Business & Operations",
    options: ORGANIZATION_OPTIONS.filter(
      (o) => o.category === "Business & Operations",
    ),
  },
  {
    label: "Management",
    options: ORGANIZATION_OPTIONS.filter((o) => o.category === "Management"),
  },
];

// Helper to convert string array to SelectOption array
export function stringsToOptions(values: string[]): SelectOption[] {
  return values.map((value) => {
    // Try to find existing option
    const existing = ORGANIZATION_OPTIONS.find(
      (o) => o.value === value || o.label === value,
    );
    if (existing) return existing;
    // Create new option for custom values
    return { value, label: value };
  });
}

// Helper to convert SelectOption array to string array (using labels for display)
export function optionsToStrings(options: SelectOption[]): string[] {
  return options.map((o) => o.label);
}

// Role type to focus mapping (for portfolio display)
export const FOCUS_MAP: Record<string, "engineering" | "writing"> = {
  // Standard values
  software_engineer: "engineering",
  manager_software_engineering: "engineering",
  technical_writer: "writing",
  manager_technical_writing: "writing",
  // Legacy values (for backward compatibility)
  engineering_manager: "engineering",
  technical_writing_manager: "writing",
  engineering: "engineering",
  writing: "writing",
  technical_writing: "writing",
};

// Get focus from role types
export function getFocusFromRoleTypes(
  roleTypes: string[],
): ("engineering" | "writing")[] {
  const focuses = new Set<"engineering" | "writing">();
  const normalized = normalizeRoleTypes(roleTypes);
  normalized.forEach((rt) => {
    const focus = FOCUS_MAP[rt];
    if (focus) focuses.add(focus);
  });
  return Array.from(focuses);
}

// ============================================================================
// Google Drive Folders
// ============================================================================

export interface GoogleDriveFolder {
  id: string;
  name: string;
}

export const GOOGLE_DRIVE_FOLDERS: GoogleDriveFolder[] = [
  { id: "1nQEV2mL-OkRDnp9fqNQ_1Jun6toGy2MI", name: "JDs: Technical Writing" },
  { id: "1JTb75UsJozfY1J-TASz_JwOnROvS4aAY", name: "JDs: Engineer" },
  { id: "1jvoknTI_k6aFoNAEOZvY0U79Gtg4oY8Y", name: "JDs: Manager Technical Writing" },
  { id: "1EMpDax26zfZjWz4A45eDVhksif19zMH0", name: "JDs: Manager Engineering" },
  { id: "1ASFZCXyhRBWj5hghV9LLblktQv8_H27j", name: "Applications: Technical Writing" },
  { id: "1qRhBZ0dPkXWhWDHu_AJWy-Iw9QF3sZxt", name: "Applications: Engineer" },
  { id: "1gX0DGyIBCqZ_1OOeEa9w6df_bWNvfzBO", name: "Applications: Manager Technical Writing" },
  { id: "1wsdfl3AX3ZE_55h-Ets4CQpgMPHYjGuQ", name: "Applications: Manager Engineering" },
];

// Map role types to default Google Drive folders
export function getDefaultFolderForRole(
  roleType: string,
  fileType: 'job-description' | 'application'
): string | undefined {
  const prefix = fileType === 'job-description' ? 'JDs:' : 'Applications:';
  
  const roleToFolderName: Record<string, string> = {
    'technical_writer': `${prefix} Technical Writing`,
    'manager_technical_writing': `${prefix} Manager Technical Writing`,
    'software_engineer': `${prefix} Engineer`,
    'manager_software_engineering': `${prefix} Manager Engineering`,
  };
  
  const folderName = roleToFolderName[roleType];
  if (!folderName) return undefined;
  
  const folder = GOOGLE_DRIVE_FOLDERS.find(f => f.name === folderName);
  return folder?.id;
}
