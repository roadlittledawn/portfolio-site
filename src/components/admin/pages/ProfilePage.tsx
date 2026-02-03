import { useState, useEffect } from 'react';
import { getGraphQLClient } from '../../../lib/graphql-client';
import { PROFILE_QUERY } from '../../../lib/graphql';
import type { Profile } from '../../../lib/types';
import { Card } from '../ui';

interface ProfileResponse {
  profile: Profile;
}

export default function ProfilePage() {
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

  if (!profile) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-text-secondary mb-4">No profile found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-muted">Name</label>
              <p className="text-text-primary">{profile.personalInfo.name}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Email</label>
              <p className="text-text-primary">{profile.personalInfo.email}</p>
            </div>
            {profile.personalInfo.phone && (
              <div>
                <label className="text-sm text-text-muted">Phone</label>
                <p className="text-text-primary">{profile.personalInfo.phone}</p>
              </div>
            )}
            {profile.personalInfo.location && (
              <div>
                <label className="text-sm text-text-muted">Location</label>
                <p className="text-text-primary">{profile.personalInfo.location}</p>
              </div>
            )}
          </div>
          {profile.personalInfo.links && (
            <div className="mt-4 pt-4 border-t border-dark-border">
              <label className="text-sm text-text-muted block mb-2">Links</label>
              <div className="flex flex-wrap gap-4">
                {profile.personalInfo.links.portfolio && (
                  <a
                    href={profile.personalInfo.links.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    Portfolio
                  </a>
                )}
                {profile.personalInfo.links.github && (
                  <a
                    href={profile.personalInfo.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    GitHub
                  </a>
                )}
                {profile.personalInfo.links.linkedin && (
                  <a
                    href={profile.personalInfo.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {profile.personalInfo.links.writingSamples && (
                  <a
                    href={profile.personalInfo.links.writingSamples}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:underline"
                  >
                    Writing Samples
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Positioning */}
      {profile.positioning && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Positioning</h2>
            {profile.positioning.current && (
              <div className="mb-4">
                <label className="text-sm text-text-muted">Current Positioning</label>
                <p className="text-text-primary">{profile.positioning.current}</p>
              </div>
            )}
            {profile.positioning.byRole && (
              <div className="space-y-3">
                <label className="text-sm text-text-muted block">By Role</label>
                {profile.positioning.byRole.technical_writer && (
                  <div className="pl-4 border-l-2 border-dark-border">
                    <span className="text-sm font-medium text-accent-blue">Technical Writer</span>
                    <p className="text-text-secondary text-sm mt-1">{profile.positioning.byRole.technical_writer}</p>
                  </div>
                )}
                {profile.positioning.byRole.technical_writing_manager && (
                  <div className="pl-4 border-l-2 border-dark-border">
                    <span className="text-sm font-medium text-accent-blue">Technical Writing Manager</span>
                    <p className="text-text-secondary text-sm mt-1">{profile.positioning.byRole.technical_writing_manager}</p>
                  </div>
                )}
                {profile.positioning.byRole.software_engineer && (
                  <div className="pl-4 border-l-2 border-dark-border">
                    <span className="text-sm font-medium text-accent-blue">Software Engineer</span>
                    <p className="text-text-secondary text-sm mt-1">{profile.positioning.byRole.software_engineer}</p>
                  </div>
                )}
                {profile.positioning.byRole.engineering_manager && (
                  <div className="pl-4 border-l-2 border-dark-border">
                    <span className="text-sm font-medium text-accent-blue">Engineering Manager</span>
                    <p className="text-text-secondary text-sm mt-1">{profile.positioning.byRole.engineering_manager}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Value Propositions */}
      {profile.valuePropositions && profile.valuePropositions.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Value Propositions</h2>
            <ul className="space-y-2">
              {profile.valuePropositions.map((vp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent-green mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-text-secondary">{vp}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Professional Mission */}
      {profile.professionalMission && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Professional Mission</h2>
            <p className="text-text-secondary">{profile.professionalMission}</p>
          </div>
        </Card>
      )}

      {/* Unique Selling Points */}
      {profile.uniqueSellingPoints && profile.uniqueSellingPoints.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Unique Selling Points</h2>
            <ul className="space-y-2">
              {profile.uniqueSellingPoints.map((usp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-accent-amber mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </span>
                  <span className="text-text-secondary">{usp}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
