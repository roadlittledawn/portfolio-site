import type { Project } from '../lib/types';

const focusMap: Record<string, string> = {
  software_engineer: 'engineering',
  engineering_manager: 'engineering',
  technical_writer: 'writing',
  technical_writing_manager: 'writing',
};

const typeLabels: Record<string, string> = {
  software_engineering: 'Engineering',
  technical_writing: 'Writing',
};

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ─── Featured Card ────────────────────────────────────────────────────────────

interface FeaturedProps {
  project: Project;
}

export function FeaturedProjectCard({ project }: FeaturedProps) {
  const detailUrl = `/projects/${project.id}`;
  const formattedDate = formatDate(project.date);
  const typeLabel = typeLabels[project.type] ?? 'Project';
  const focus = project.roleTypes?.map((rt) => focusMap[rt] ?? rt).join(' ');

  return (
    <article
      className="group relative bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-accent-blue/40 transition-all duration-300"
      data-focus={focus}
      data-type={project.type}
    >
      <div className="p-8 lg:p-10 flex flex-col">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-blue">
            {typeLabel}
          </span>
          {formattedDate && (
            <>
              <span className="w-1 h-1 rounded-full bg-dark-border" />
              <span className="text-xs text-text-muted">{formattedDate}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-4 leading-tight tracking-tight">
          {project.name}
        </h2>

        {/* Overview — full, not clamped */}
        <p className="text-text-secondary leading-relaxed mb-6 text-[0.95rem]">
          {project.overview}
        </p>

        {/* Tech tags */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs rounded-full bg-dark-base/60 text-text-secondary border border-dark-border-subtle"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div>
          <a
            href={detailUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-text-inverse text-sm font-semibold hover:bg-accent-blue/85 transition-colors duration-200"
          >
            View Project
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── Regular Card ─────────────────────────────────────────────────────────────

interface CardProps {
  project: Project;
  className?: string;
}

export default function ProjectCard({ project, className = '' }: CardProps) {
  const detailUrl = `/projects/${project.id}`;
  const formattedDate = formatDate(project.date);
  const focus = project.roleTypes?.map((rt) => focusMap[rt] ?? rt).join(' ');

  return (
    <article
      className={`group flex flex-col p-5 bg-dark-card border border-dark-border rounded-xl hover:bg-dark-hover hover:border-dark-border hover:-translate-y-0.5 transition-all duration-200 ${className}`}
      data-focus={focus}
      data-type={project.type}
    >
      {formattedDate && (
        <span className="text-xs text-text-muted mb-2 block">{formattedDate}</span>
      )}

      <h3 className="text-base font-semibold text-text-primary mb-2 leading-snug">
        {project.name}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-grow mb-4">
        {project.overview}
      </p>

      <a
        href={detailUrl}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-blue hover:text-accent-blue/75 transition-colors duration-150 self-start"
      >
        View Details
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1.5 6h9M6 1.5l4.5 4.5L6 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </article>
  );
}
