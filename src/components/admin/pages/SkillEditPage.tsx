import { useState, useEffect } from "react";
import { getGraphQLClient } from "../../../lib/graphql-client";
import {
  SKILL_QUERY,
  UPDATE_SKILL_MUTATION,
  CREATE_SKILL_MUTATION,
} from "../../../lib/graphql";
import type { Skill } from "../../../lib/types";
import SkillsForm from "../forms/SkillsForm";

interface SkillEditPageProps {
  skillId?: string;
}

interface SkillResponse {
  skill: Skill | null;
}

export default function SkillEditPage({ skillId }: SkillEditPageProps) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(!!skillId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skillId) {
      fetchSkill();
    }
  }, [skillId]);

  const fetchSkill = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<SkillResponse>(SKILL_QUERY, {
        id: skillId,
      });
      setSkill(data.skill);
    } catch (err) {
      console.error("Failed to fetch skill:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch skill");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Skill>) => {
    console.log("=== SkillEditPage handleSubmit ===");
    console.log("Skill data being sent:", JSON.stringify(data, null, 2));
    console.log("roleRelevance:", data.roleRelevance);

    const client = getGraphQLClient();

    if (skillId) {
      await client.request(UPDATE_SKILL_MUTATION, { id: skillId, input: data });
    } else {
      await client.request(CREATE_SKILL_MUTATION, { input: data });
    }

    window.location.href = "/admin/skills";
  };

  const handleCancel = () => {
    window.location.href = "/admin/skills";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading skill...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchSkill}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (skillId && !skill) {
    return (
      <div className="p-6 bg-dark-card border border-dark-border rounded-lg text-center">
        <p className="text-text-secondary">Skill not found</p>
      </div>
    );
  }

  return (
    <SkillsForm
      initialData={skill || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
