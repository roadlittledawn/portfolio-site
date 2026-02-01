import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { SKILLS_QUERY, DELETE_SKILL_MUTATION } from '../../../lib/graphql';
import type { Skill, SkillsResponse, DeleteSkillResponse } from '../../../lib/types';
import { ErrorState } from '../ui';
import SkillsList from '../lists/SkillsList';

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<SkillsResponse>(SKILLS_QUERY);
      // Sort by rating (highest first), then by name
      const sorted = [...(data.skills || [])].sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return a.name.localeCompare(b.name);
      });
      setSkills(sorted);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    window.location.href = `/admin/skills/${skill.id}/edit`;
  };

  const handleDelete = async (id: string) => {
    try {
      const client = getGraphQLClient();
      await client.request<DeleteSkillResponse>(DELETE_SKILL_MUTATION, { id });
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete skill:', err);
      throw err;
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchSkills} />;
  }

  return (
    <SkillsList
      skills={skills}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
