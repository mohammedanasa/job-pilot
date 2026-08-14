/**
 * The generated resume document.
 *
 * Pure and server-only: it takes a profile row plus the model's prose and
 * returns JSX. No database access, no fetching, no AI calls — those belong to
 * the route. Keeping it out of `components/` is deliberate: anything imported
 * there can end up in a client bundle, and @react-pdf/renderer must never reach
 * the browser.
 */

import type { ReactElement } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { GeneratedResumeProse, ProfileData, WorkExperience } from "@/types";

/**
 * Literal hex is unavoidable here. @react-pdf/renderer resolves styles in a PDF
 * layout engine with no CSS custom properties, so `var(--color-text-primary)`
 * would resolve to nothing. These values are copied from context/ui-tokens.md
 * and must be updated alongside it.
 */
const COLOR = {
  textPrimary: "#101828",
  textSecondary: "#6a7282",
  textMuted: "#99a1af",
  border: "#e7eaf3",
  accent: "#7c5cfc",
} as const;

const styles = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    color: COLOR.textPrimary,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLOR.textPrimary,
  },
  title: {
    fontSize: 11,
    color: COLOR.accent,
    fontWeight: "bold",
    marginTop: 3,
  },
  contact: {
    fontSize: 9,
    color: COLOR.textSecondary,
    marginTop: 6,
    lineHeight: 1.4,
  },

  rule: {
    height: 1,
    backgroundColor: COLOR.border,
    marginTop: 14,
    marginBottom: 12,
  },

  sectionHeading: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLOR.textPrimary,
    marginBottom: 7,
  },
  section: {
    marginBottom: 14,
  },

  summary: {
    fontSize: 9.5,
    color: COLOR.textSecondary,
    lineHeight: 1.5,
  },

  role: {
    marginBottom: 10,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  roleTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: COLOR.textPrimary,
  },
  roleCompany: {
    fontSize: 9.5,
    color: COLOR.textSecondary,
    marginTop: 2,
  },
  roleDates: {
    fontSize: 9,
    color: COLOR.textMuted,
  },

  bulletRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  bulletMark: {
    fontSize: 9.5,
    color: COLOR.accent,
    width: 10,
  },
  bulletText: {
    fontSize: 9.5,
    color: COLOR.textSecondary,
    lineHeight: 1.45,
    flex: 1,
  },

  skills: {
    fontSize: 9.5,
    color: COLOR.textSecondary,
    lineHeight: 1.5,
  },

  educationLine: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLOR.textPrimary,
  },
  educationDetail: {
    fontSize: 9.5,
    color: COLOR.textSecondary,
    marginTop: 2,
  },
});

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Dates arrive as "YYYY-MM" from the profile form, but a resume read by a human
 * wants "Mar 2021". Anything that does not match that shape is passed through
 * untouched rather than coerced — a user who typed "Summer 2021" meant it.
 */
function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value.trim();

  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return value.trim();

  return `${MONTHS[monthIndex]} ${match[1]}`;
}

function formatDateRange(role: WorkExperience): string {
  const start = formatMonth(role.startDate ?? "");
  const end = role.currentlyWorking ? "Present" : formatMonth(role.endDate ?? "");

  if (start && end) return `${start} — ${end}`;
  return start || end;
}

/** Drops blanks so an absent portfolio does not leave a dangling separator. */
function joinPresent(parts: Array<string | null | undefined>, separator: string): string {
  return parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part)).join(separator);
}

type Props = {
  profile: ProfileData;
  prose: GeneratedResumeProse;
};

function ResumeDocument({ profile, prose }: Props): ReactElement<DocumentProps> {
  const roles = profile.work_experience ?? [];
  const education = profile.education;

  const bulletsFor = (index: number): string[] => {
    const match = prose.roles.find((role) => role.index === index);
    const bullets = match?.bullets?.filter((bullet) => bullet.trim().length > 0) ?? [];

    // The model returning nothing for a role must not silently erase it from the
    // page — fall back to what the user actually wrote.
    if (bullets.length === 0) {
      const written = roles[index]?.keyResponsibilities?.trim();
      return written ? [written] : [];
    }

    return bullets;
  };

  const contactLine = joinPresent(
    [profile.email, profile.phone, profile.location],
    "  ·  ",
  );
  const linkLine = joinPresent([profile.linkedin_url, profile.portfolio_url], "  ·  ");

  return (
    <Document
      title={`${profile.full_name ?? "Resume"} — Resume`}
      author={profile.full_name ?? undefined}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>{profile.full_name ?? ""}</Text>
          {profile.current_title && <Text style={styles.title}>{profile.current_title}</Text>}
          {contactLine && <Text style={styles.contact}>{contactLine}</Text>}
          {linkLine && <Text style={styles.contact}>{linkLine}</Text>}
        </View>

        <View style={styles.rule} />

        {/* Summary */}
        {prose.summary.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.summary}>{prose.summary.trim()}</Text>
          </View>
        )}

        {/* Experience */}
        {roles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>EXPERIENCE</Text>
            {roles.map((role, index) => {
              const dates = formatDateRange(role);
              return (
                <View key={role.id ?? `${role.companyName}-${index}`} style={styles.role}>
                  <View style={styles.roleHeader}>
                    <Text style={styles.roleTitle}>{role.jobTitle}</Text>
                    {dates && <Text style={styles.roleDates}>{dates}</Text>}
                  </View>
                  {role.companyName && <Text style={styles.roleCompany}>{role.companyName}</Text>}
                  {bulletsFor(index).map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={styles.bulletRow}>
                      <Text style={styles.bulletMark}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>SKILLS</Text>
            <Text style={styles.skills}>{profile.skills.join("  ·  ")}</Text>
          </View>
        )}

        {/* Education */}
        {education && (education.degree || education.institution) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>EDUCATION</Text>
            <Text style={styles.educationLine}>
              {joinPresent([education.degree, education.fieldOfStudy], " in ")}
            </Text>
            {joinPresent([education.institution, education.graduationYear], "  ·  ") && (
              <Text style={styles.educationDetail}>
                {joinPresent([education.institution, education.graduationYear], "  ·  ")}
              </Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}

/**
 * What the route calls.
 *
 * Exporting a builder rather than the component keeps every piece of JSX inside
 * this module: the route stays a plain .ts file with no rendering syntax in it,
 * which is the boundary architecture.md draws around API routes. It also types
 * cleanly — createElement() would infer from the props and lose the Document
 * shape renderToBuffer requires.
 */
export function buildResumeDocument(props: Props): ReactElement<DocumentProps> {
  return <ResumeDocument {...props} />;
}
