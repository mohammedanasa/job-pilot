/**
 * Derives an employer's homepage URL from a job's external apply URL.
 *
 * Adzuna redirects overwhelmingly land on ATS platforms (Greenhouse, Lever,
 * Workday...), not the employer's own domain. Stripping the subdomain off an
 * ATS host would produce the ATS vendor's domain, not the employer's — so a
 * resolved host is checked against a blocklist before it's trusted.
 */

const ATS_HOSTS = [
  "greenhouse.io",
  "lever.co",
  "myworkdayjobs.com",
  "ashbyhq.com",
  "smartrecruiters.com",
  "workable.com",
  "icims.com",
  "taleo.net",
  "jobvite.com",
  "recruitee.com",
  "teamtailor.com",
  "breezy.hr",
];

const FETCH_TIMEOUT_MS = 5000;

function isAtsHost(hostname: string): boolean {
  return ATS_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function slugifyCompany(company: string): string {
  return company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function hostnameResolves(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return res.ok || (res.status >= 300 && res.status < 500);
  } catch {
    return false;
  }
}

/**
 * Resolves the redirect chain, filters out ATS/job-board hosts, and falls
 * back to guessing from the company name. Returns null when no candidate can
 * be trusted as the employer's own site — callers should skip web research
 * entirely rather than research the wrong company.
 */
export async function deriveCompanyHomepage(
  externalApplyUrl: string | null,
  company: string,
): Promise<string | null> {
  if (externalApplyUrl) {
    try {
      const res = await fetch(externalApplyUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const hostname = new URL(res.url).hostname;

      if (!isAtsHost(hostname) && !hostname.includes("adzuna.com")) {
        const rootDomain = hostname.replace(/^www\./, "");
        return `https://${rootDomain}`;
      }
    } catch {
      // fall through to the company-name guess
    }
  }

  const slug = slugifyCompany(company);
  if (!slug) return null;

  const guess = `https://www.${slug}.com`;
  return (await hostnameResolves(guess)) ? guess : null;
}
