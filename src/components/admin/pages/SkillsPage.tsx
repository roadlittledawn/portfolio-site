import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { SKILLS_QUERY, DELETE_SKILL_MUTATION } from '../../../lib/graphql/queries';
import type { Skill } from '../../../lib/types';
import SkillsList from '../lists/SkillsList';

interface SkillsResponse {
  skills: Skill[];
}

interface DeleteResponse {
  deleteSkill: {
    success: boolean;
    id: string;
  };
}

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
      await client.request<DeleteResponse>(DELETE_SKILL_MUTATION, { id });
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete skill:', err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchSkills}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
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
