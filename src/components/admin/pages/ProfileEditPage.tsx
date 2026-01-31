import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { PROFILE_QUERY, UPDATE_PROFILE_MUTATION } from '../../../lib/graphql/queries';
import type { Profile } from '../../../lib/types';
import ProfileForm from '../forms/ProfileForm';

interface ProfileResponse {
  profile: Profile | null;
}

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const client = getGraphQLClient();
      const data = await client.request<ProfileResponse>(PROFILE_QUERY);
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Profile>) => {
    const client = getGraphQLClient();
    await client.request(UPDATE_PROFILE_MUTATION, { input: data });
    window.location.href = '/admin/profile';
  };

  const handleCancel = () => {
    window.location.href = '/admin/profile';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ProfileForm
      initialData={profile || undefined}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
