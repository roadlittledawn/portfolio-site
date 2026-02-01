import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { EXPERIENCES_QUERY } from '../../lib/graphql/queries';
import type { Experience } from '../../lib/types';

interface ExperiencesResponse {
  experiences: Experience[];
}

export default function ExperiencePageContent() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const client = getGraphQLClient();
      const data = await client.request<ExperiencesResponse>(EXPERIENCES_QUERY);
      // Sort by start date (most recent first)
      const sorted = [...data.experiences].sort((a, b) => {
        const aDate = new Date(a.startDate);
        const bDate = new Date(b.startDate);
        return bDate.getTime() - aDate.getTime();
      });
      setExperiences(sorted);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch experiences');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">Loading experience...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchExperiences}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Timeline */}
      <section className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} formatDate={formatDate} />
          ))}
        </div>
      </section>

      {/* Career Stats */}
      <section className="max-w-4xl mx-auto mt-12 pt-8 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-bg-light rounded-lg p-6">
            <div className="text-2xl font-bold text-accent mb-2">11+</div>
            <div className="text-secondary">Years in Technical Writing</div>
          </div>
          <div className="bg-bg-light rounded-lg p-6">
            <div className="text-2xl font-bold text-accent mb-2">7+</div>
            <div className="text-secondary">Years in Software Engineering</div>
          </div>
          <div className="bg-bg-light rounded-lg p-6">
            <div className="text-2xl font-bold text-accent mb-2">3+</div>
            <div className="text-secondary">Years in Engineering Leadership</div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Experience Card Component
function ExperienceCard({
  experience,
  formatDate,
}: {
  experience: Experience;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-primary-dark">{experience.title}</h3>
          <p className="text-lg text-primary">{experience.company}</p>
          <p className="text-muted text-sm">
            {experience.location} • {formatDate(experience.startDate)} -{' '}
            {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {experience.roleTypes?.map((role) => (
            <span
              key={role}
              className={`px-2 py-1 text-xs font-medium rounded ${
                role.includes('engineer')
                  ? 'bg-blue-100 text-blue-700'
                  : role.includes('manager')
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {role.replace(/_/g, ' ')}
            </span>
          ))}
          {experience.featured && (
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
              Featured
            </span>
          )}
        </div>
      </div>

      {experience.summary && (
        <p className="text-secondary mb-4">{experience.summary}</p>
      )}

      {experience.responsibilities && experience.responsibilities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-primary-dark mb-2">Key Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1 text-secondary text-sm">
            {experience.responsibilities.slice(0, 4).map((resp, idx) => (
              <li key={idx}>{resp}</li>
            ))}
          </ul>
        </div>
      )}

      {experience.achievements && experience.achievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-primary-dark mb-2">Achievements</h4>
          <ul className="space-y-2">
            {experience.achievements.slice(0, 3).map((achievement, idx) => (
              <li key={idx} className="text-sm text-secondary pl-4 border-l-2 border-accent">
                {achievement.description}
                {achievement.metrics && (
                  <span className="block text-xs text-muted mt-1">{achievement.metrics}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {experience.technologies && experience.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-4 border-t border-border">
          {experience.technologies.slice(0, 8).map((tech) => (
            <span key={tech} className="px-2 py-0.5 bg-bg-light text-xs text-muted rounded">
              {tech}
            </span>
          ))}
          {experience.technologies.length > 8 && (
            <span className="px-2 py-0.5 text-xs text-muted">
              +{experience.technologies.length - 8} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
