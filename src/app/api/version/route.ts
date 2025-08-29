// Version endpoint
// Returns the current version of the API

export async function GET() {
  const versionInfo = {
    version: '0.1.0',
    buildDate: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  };

  return Response.json(versionInfo);
}
