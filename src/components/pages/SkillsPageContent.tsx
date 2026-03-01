import { useState, useEffect, useMemo } from "react";
import { getGraphQLClient } from "../../lib/graphql-client";
import { SKILLS_QUERY } from "../../lib/graphql";
import type { Skill } from "../../lib/types";
import { isEngineeringRole, isWritingRole } from "../../lib/constants";
import SkillCard from "../SkillCard";

interface SkillsResponse {
  skills: Skill[];
}

// Category definitions
const categoryOrder = [
  { key: "frontend", name: "Frontend Development", icon: "palette" },
  { key: "backend", name: "Backend Development", icon: "settings" },
  { key: "database", name: "Databases", icon: "database" },
  { key: "tools", name: "Development Tools", icon: "tool" },
  { key: "cloud-platform", name: "Cloud Platforms", icon: "cloud" },
  { key: "concepts", name: "Concepts & Practices", icon: "light-bulb" },
  { key: "management", name: "Leadership & Management", icon: "users" },
  { key: "testing", name: "Testing", icon: "test-tube" },
];

export default function SkillsPageContent() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"grid" | "category">("grid");
  const [level, setLevel] = useState("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState("name-asc");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const client = getGraphQLClient();
      const data = await client.request<SkillsResponse>(SKILLS_QUERY);
      setSkills(data.skills);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch skills");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort skills
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Apply focus filter
    if (filter === "engineering") {
      result = result.filter(
        (s) => s.roleRelevance && isEngineeringRole(s.roleRelevance),
      );
    } else if (filter === "writing") {
      result = result.filter(
        (s) => s.roleRelevance && isWritingRole(s.roleRelevance),
      );
    }

    // Apply level filter
    if (level !== "all") {
      result = result.filter((s) => s.level?.toLowerCase() === level);
    }

    // Apply tag filter
    if (tag !== "all") {
      result = result.filter((s) => s.tags?.includes(tag));
    }

    // Apply sorting
    if (sort === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name-desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [skills, filter, level, tag, sort]);

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

  // Split filtered skills into featured and regular
  const featuredSkills = useMemo(
    () => filteredSkills.filter((s) => s.featured),
    [filteredSkills],
  );
  const regularSkills = useMemo(
    () => filteredSkills.filter((s) => !s.featured),
    [filteredSkills],
  );

  // Derive sorted unique tags from all skills
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    skills.forEach((s) => s.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [skills]);

  // Count skills by focus
  const engineeringCount = skills.filter(
    (s) => s.roleRelevance && isEngineeringRole(s.roleRelevance),
  ).length;
  const writingCount = skills.filter(
    (s) => s.roleRelevance && isWritingRole(s.roleRelevance),
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
        <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
          <p className="text-accent-pink mb-4">{error}</p>
          <button
            onClick={fetchSkills}
            className="px-4 py-2 bg-accent-blue text-text-inverse rounded-lg hover:bg-accent-blue/80 transition-colors"
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
      <div className="flex flex-col gap-3 bg-dark-layer p-4 rounded-lg sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All Skills", count: skills.length },
            {
              value: "engineering",
              label: "Engineering",
              count: engineeringCount,
            },
            { value: "writing", label: "Writing", count: writingCount },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === opt.value
                  ? "bg-accent-blue text-text-inverse"
                  : "bg-dark-card text-text-secondary hover:bg-dark-hover"
              }`}
            >
              {opt.label} ({opt.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-text-primary min-w-0"
          >
            <option value="all">All Levels</option>
            <option value="expert">Expert</option>
            <option value="advanced">Advanced</option>
            <option value="intermediate">Intermediate</option>
            <option value="beginner">Beginner</option>
          </select>

          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-text-primary min-w-0"
          >
            <option value="all">All Categories</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-text-primary min-w-0"
          >
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>

          <div className="flex border border-dark-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-2 text-sm ${
                view === "grid"
                  ? "bg-accent-blue text-text-inverse"
                  : "bg-dark-card text-text-secondary"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("category")}
              className={`px-3 py-2 text-sm ${
                view === "category"
                  ? "bg-accent-blue text-text-inverse"
                  : "bg-dark-card text-text-secondary"
              }`}
            >
              Category
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="space-y-8">
          {featuredSkills.length > 0 && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} variant="grid" />
                ))}
              </div>
            </section>
          )}

          {regularSkills.length > 0 && (
            <section>
              {featuredSkills.length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted mb-4">
                  More Skills
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {regularSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Category View */}
      {view === "category" && (
        <div className="space-y-10">
          {categoryOrder.map((category) => {
            const categorySkills = skillsByCategory[category.key] || [];
            if (categorySkills.length === 0) return null;

            const catFeatured = categorySkills.filter((s) => s.featured);
            const catRegular = categorySkills.filter((s) => !s.featured);

            return (
              <div key={category.key} className="space-y-3">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-text-muted">
                    ({categorySkills.length})
                  </span>
                </h3>

                {catFeatured.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {catFeatured.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} variant="grid" />
                    ))}
                  </div>
                )}

                {catRegular.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {catRegular.map((skill) => (
                      <SkillCard key={skill.id} skill={skill} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No skills match the current filters.
        </div>
      )}
    </div>
  );
}
