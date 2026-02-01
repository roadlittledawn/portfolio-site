import { useState, useEffect, useMemo } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { SKILLS_QUERY, DELETE_SKILL_MUTATION } from '../../../lib/graphql';
import type { Skill, SkillsResponse, DeleteSkillResponse } from '../../../lib/types';
import { ErrorState, Input, Select } from '../ui';
import { ROLE_TYPE_OPTIONS } from '../../../lib/constants';
import SkillsList from '../lists/SkillsList';

const FEATURED_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Featured' },
  { value: 'false', label: 'Not Featured' },
];

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All Roles' },
  ...ROLE_TYPE_OPTIONS,
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

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

  // Filter skills based on search and filter criteria
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      // Search by name (case-insensitive contains)
      if (searchTerm && !skill.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by role relevance
      if (roleFilter && !skill.roleRelevance.includes(roleFilter)) {
        return false;
      }

      // Filter by featured
      if (featuredFilter !== '') {
        const isFeatured = featuredFilter === 'true';
        if (skill.featured !== isFeatured) {
          return false;
        }
      }

      return true;
    });
  }, [skills, searchTerm, roleFilter, featuredFilter]);

  if (error) {
    return <ErrorState message={error} onRetry={fetchSkills} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-dark-card border border-dark-border rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            options={FEATURED_OPTIONS}
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-text-muted">
        Showing {filteredSkills.length} of {skills.length} skills
      </div>

      <SkillsList
        skills={filteredSkills}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
