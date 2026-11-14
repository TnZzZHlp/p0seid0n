/** Every expected failure is raised as a CliError so the entry point can print it without a stack. */
export class CliError extends Error {}
