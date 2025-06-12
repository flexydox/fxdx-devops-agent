export function guardEnvVars(requiredVars: string[]): void {
  if (!Array.isArray(requiredVars) || requiredVars.length === 0) {
    throw new Error('Required environment variables must be provided as a non-empty array.');
  }
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}
