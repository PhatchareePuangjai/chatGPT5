export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function levelRank(level: LogLevel): number {
  switch (level) {
    case 'debug':
      return 10;
    case 'info':
      return 20;
    case 'warn':
      return 30;
    case 'error':
      return 40;
  }
}

const configuredLevel = (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';

export function log(level: LogLevel, msg: string, fields: Record<string, unknown> = {}): void {
  if (levelRank(level) < levelRank(configuredLevel)) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields
  };

  // Structured log line.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

