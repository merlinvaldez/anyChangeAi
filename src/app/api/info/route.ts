// API Info endpoint
// Provides general information about the API

export async function GET() {
  const apiInfo = {
    name: 'AnyChange AI API',
    version: '0.1.0',
    description: 'AI-powered document change detection and analysis',
    status: 'active',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      version: '/api/version',
    },
    documentation: {
      swagger: '/api/docs',
      readme: 'https://github.com/merlinvaldez/anyChangeAi#readme',
    },
    contact: {
      email: 'support@anychange-ai.com',
      github: 'https://github.com/merlinvaldez/anyChangeAi',
    },
    timestamp: new Date().toISOString(),
  };

  return Response.json(apiInfo);
}
