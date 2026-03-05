import type { Skill } from '../lib/types';
import { featherIcons } from './icons/featherIcons';
import { customIcons } from './icons/customIcons';
import { getLevelStyles } from '../utils/styles';

interface Props {
  skill: Skill;
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
}

function SkillIcon({ name, className = '' }: { name: string; className?: string }) {
  // Check custom icons first (technology logos with color)
  const custom = customIcons[name];
  if (custom) {
    return (
      <svg
        viewBox={custom.viewBox ?? '0 0 128 128'}
        width="20"
        height="20"
        className={`shrink-0 ${className}`}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: custom.svg }}
      />
    );
  }

  // Fall back to feather icons (stroke-based)
  const featherKey = name.toLowerCase().replace(/\s+/g, '-');
  const featherPath = featherIcons[featherKey] ?? featherIcons['code'];
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: featherPath }}
    />
  );
}

export default function SkillCard({ skill, variant = 'grid', className = '' }: Props) {
  const iconName = skill.iconName || skill.name || 'code';
  const levelClasses = getLevelStyles(skill.level);

  // Compact variant: icon + name + years only, no level badge
  if (variant === 'compact') {
    return (
      <div
        className={`skill-card flex items-center justify-between gap-2 bg-dark-card border border-dark-border rounded-lg px-3 py-2.5 hover:bg-dark-hover transition-colors ${className}`}
        data-focus={skill.roleRelevance?.join(' ')}
        data-categories={skill.tags?.join(' ')}
        data-level={skill.level}
        data-name={skill.name}
      >
        <div className="flex items-center gap-2 min-w-0">
          <SkillIcon name={iconName} className="text-text-muted shrink-0" />
          <span className="text-sm font-medium text-text-primary truncate">{skill.name}</span>
        </div>
        {skill.yearsOfExperience && (
          <span className="text-xs text-text-muted shrink-0">
            {skill.yearsOfExperience}yr{skill.yearsOfExperience !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  const focus = skill.roleRelevance?.join(' ');

  const cardBody = (
    <div className="flex items-stretch gap-2">
      {/* Left: icon + name, vertically centered across full card height */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SkillIcon name={iconName} className="text-text-muted shrink-0" />
        {variant === 'grid'
          ? <h3 className="text-base font-semibold text-text-primary break-words [overflow-wrap:anywhere]">{skill.name}</h3>
          : <span className="font-medium text-text-primary break-words [overflow-wrap:anywhere]">{skill.name}</span>
        }
      </div>
      {/* Right: years on top, level badge below */}
      <div className="flex flex-col items-end shrink-0 justify-between gap-1">
        {skill.yearsOfExperience ? (
          <span className="text-xs text-text-muted whitespace-nowrap">
            {skill.yearsOfExperience}yr{skill.yearsOfExperience !== 1 ? 's' : ''}
          </span>
        ) : null}
        <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${levelClasses}`}>
          {skill.level}
        </span>
      </div>
    </div>
  );

  if (variant === 'list') {
    return (
      <div
        className={`skill-card bg-dark-card border border-dark-border rounded-lg px-4 py-3 hover:shadow-md hover:bg-dark-hover transition-shadow ${className}`}
        data-focus={focus}
        data-categories={skill.tags?.join(' ')}
        data-level={skill.level}
        data-name={skill.name}
      >
        {cardBody}
      </div>
    );
  }

  return (
    <div
      className={`skill-card bg-dark-card border border-dark-border rounded-lg p-4 hover:shadow-lg hover:-translate-y-0.5 hover:bg-dark-hover transition-all duration-200 ${className}`}
      data-focus={focus}
      data-categories={skill.tags?.join(' ')}
      data-level={skill.level}
      data-name={skill.name}
    >
      {cardBody}
    </div>
  );
}
