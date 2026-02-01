import { useState, useEffect, useMemo } from 'react';
import { getGraphQLClient } from '../../lib/graphql-client';
import { SKILLS_QUERY } from '../../lib/graphql/queries';
import type { Skill } from '../../lib/types';

interface SkillsResponse {
  skills: Skill[];
}

// Category definitions
const categoryOrder = [
  { key: 'frontend', name: 'Frontend Development', icon: 'palette' },
  { key: 'backend', name: 'Backend Development', icon: 'settings' },
  { key: 'database', name: 'Databases', icon: 'database' },
  { key: 'tools', name: 'Development Tools', icon: 'tool' },
  { key: 'cloud-platform', name: 'Cloud Platforms', icon: 'cloud' },
  { key: 'concepts', name: 'Concepts & Practices', icon: 'light-bulb' },
  { key: 'management', name: 'Leadership & Management', icon: 'users' },
  { key: 'testing', name: 'Testing', icon: 'test-tube' },
];

export default function SkillsPageContent() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'category'>('grid');
  const [level, setLevel] = useState('all');
  const [sort, setSort] = useState('name-asc');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const client = getGraphQLClient();
      const data = await client.request<SkillsResponse>(SKILLS_QUERY);
      setSkills(data.skills);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Apply focus filter
    if (filter === 'engineering') {
      result = result.filter(
        (s) => s.roleRelevance?.includes('engineering') || s.roleRelevance?.includes('both')
      );
    } else if (filter === 'writing') {
      result = result.filter(
        (s) =>
          s.roleRelevance?.includes('writing') ||
          s.roleRelevance?.includes('technical_writing') ||
          s.roleRelevance?.includes('both')
      );
    }

    // Apply level filter
    if (level !== 'all') {
      result = result.filter((s) => s.level?.toLowerCase() === level);
    }

    // Apply sorting
    if (sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [skills, filter, level, sort]);

  // Organize skills by category
  const skillsByCategory = useMemo(() => {
    const result: Record<string, Skill[]> = {};
    filteredSkills.forEach((skill) => {
      skill.tags?.forEach((tag) => {
        if (!result[tag]) result[tag] = [];
        if (!result[tag].some((s) => s.name === skill.name)) {
          result[tag].push(skill);
        }
      });
    });
    return result;
  }, [filteredSkills]);

  // Count skills by focus
  const engineeringCount = skills.filter(
    (s) => s.roleRelevance?.includes('engineering') || s.roleRelevance?.includes('both')
  ).length;
  const writingCount = skills.filter(
    (s) =>
      s.roleRelevance?.includes('writing') ||
      s.roleRelevance?.includes('technical_writing') ||
      s.roleRelevance?.includes('both')
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">Loading skills...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSkills}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Navigation */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-bg-light p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Skills', count: skills.length },
            { value: 'engineering', label: 'Engineering', count: engineeringCount },
            { value: 'writing', label: 'Writing', count: writingCount },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-secondary hover:bg-bg-lighter'
              }`}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 bg-white border border-border rounded-lg text-sm"
          >
            <option value="all">All Levels</option>
            <option value="expert">Expert</option>
            <option value="advanced">Advanced</option>
            <option value="intermediate">Intermediate</option>
            <option value="beginner">Beginner</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-white border border-border rounded-lg text-sm"
          >
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 text-sm ${
                view === 'grid' ? 'bg-primary text-white' : 'bg-white text-secondary'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('category')}
              className={`px-3 py-2 text-sm ${
                view === 'category' ? 'bg-primary text-white' : 'bg-white text-secondary'
              }`}
            >
              Category
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      {/* Category View */}
      {view === 'category' && (
        <div className="space-y-8">
          {categoryOrder.map((category) => {
            const categorySkills = skillsByCategory[category.key] || [];
            if (categorySkills.length === 0) return null;

            return (
              <div key={category.key} className="space-y-4">
                <h3 className="text-xl font-semibold text-primary-dark flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-muted">({categorySkills.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorySkills.map((skill) => (
                    <SkillCardCompact key={skill.id} skill={skill} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-muted">
          No skills match the current filters.
        </div>
      )}
    </div>
  );
}

// Skill Card Component
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-primary-dark">{skill.name}</h3>
        {skill.featured && (
          <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            skill.level === 'Expert'
              ? 'bg-green-100 text-green-700'
              : skill.level === 'Advanced'
              ? 'bg-blue-100 text-blue-700'
              : skill.level === 'Intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {skill.level}
        </span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-sm ${star <= skill.rating ? 'text-accent' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {skill.yearsOfExperience && (
        <p className="text-sm text-muted mb-3">{skill.yearsOfExperience} years experience</p>
      )}

      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-bg-light text-xs text-secondary rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact Skill Card for Category View
function SkillCardCompact({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center justify-between bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        <h4 className="font-medium text-primary-dark">{skill.name}</h4>
        {skill.featured && (
          <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-xs rounded">★</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded ${
            skill.level === 'Expert'
              ? 'bg-green-100 text-green-700'
              : skill.level === 'Advanced'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {skill.level}
        </span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xs ${star <= skill.rating ? 'text-accent' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
