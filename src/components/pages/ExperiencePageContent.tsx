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
        <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
          <p className="text-accent-pink mb-4">{error}</p>
          <button
            onClick={fetchExperiences}
            className="px-4 py-2 bg-accent-blue text-text-inverse rounded-lg hover:bg-accent-blue/80 transition-colors"
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
      <section className="max-w-4xl mx-auto mt-12 pt-8 border-t border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-dark-card rounded-lg p-6">
            <div className="text-2xl font-bold text-accent-blue mb-2">11+</div>
            <div className="text-text-secondary">Years in Technical Writing</div>
          </div>
          <div className="bg-dark-card rounded-lg p-6">
            <div className="text-2xl font-bold text-accent-blue mb-2">7+</div>
            <div className="text-text-secondary">Years in Software Engineering</div>
          </div>
          <div className="bg-dark-card rounded-lg p-6">
            <div className="text-2xl font-bold text-accent-blue mb-2">3+</div>
            <div className="text-text-secondary">Years in Engineering Leadership</div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Experience Card Component - shows only: title, company, dates, location, summary
function ExperienceCard({
  experience,
  formatDate,
}: {
  experience: Experience;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6 hover:bg-dark-hover transition-colors">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">{experience.title}</h3>
          <p className="text-lg text-accent-blue">{experience.company}</p>
        </div>
        <div className="text-text-muted text-sm text-right">
          <p>
            {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </p>
          <p>{experience.location}</p>
        </div>
      </div>

      {experience.summary && (
        <p className="text-text-secondary mt-3">{experience.summary}</p>
      )}
    </div>
  );
}
