import 'server-only';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { env } from '@/config/env';

// Cache compiled templates in memory
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  const templatePath = path.join(
    process.cwd(),
    'src/lib/email/templates',
    `${name}.hbs`,
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${name}`);
  }

  const source = fs.readFileSync(templatePath, 'utf-8');
  const compiled = Handlebars.compile(source);
  templateCache.set(name, compiled);
  return compiled;
}

export interface RenderTemplateOptions {
  template: string;
  subject: string;
  data: Record<string, unknown>;
  recipientEmail: string;
}

export function renderTemplate(options: RenderTemplateOptions): string {
  const bodyTemplate = loadTemplate(options.template);
  const baseTemplate = loadTemplate('base');

  // Render the inner body first
  const body = bodyTemplate({ ...options.data });

  // Inject body into base layout
  return baseTemplate({
    subject: options.subject,
    appName: env.EMAIL_FROM_NAME,
    appUrl: env.APP_URL,
    recipientEmail: options.recipientEmail,
    year: new Date().getFullYear(),
    body,
    ...options.data,
  });
}