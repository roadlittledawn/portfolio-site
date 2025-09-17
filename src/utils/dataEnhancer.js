/**
 * Data enhancement utilities for adding focus tags to career data
 * This helps separate technical writing vs engineering content
 */

/**
 * Adds focus tags to skills based on their nature
 * @param {Array} skills - Array of skill objects
 * @returns {Array} Enhanced skills with focus tags
 */
export function enhanceSkillsWithFocus(skills) {
  return skills.map(skill => {
    const name = skill.name.toLowerCase();
    const tags = skill.tags || [];
    
    // Determine focus based on skill name and tags
    let focus = [];
    
    // Technical Writing focused skills
    if (
      name.includes('documentation') ||
      name.includes('content') ||
      name.includes('style guide') ||
      name.includes('dita') ||
      name.includes('framemaker') ||
      name.includes('markdown') ||
      name.includes('docs as code') ||
      name.includes('culture of documentation') ||
      name.includes('generative ai for docs') ||
      name.includes('personalization') ||
      tags.includes('management') ||
      tags.includes('concepts')
    ) {
      focus.push('writing');
    }
    
    // Engineering focused skills  
    if (
      tags.includes('frontend') ||
      tags.includes('backend') ||
      tags.includes('database') ||
      tags.includes('tools') ||
      tags.includes('testing') ||
      tags.includes('cloud-platform') ||
      name.includes('javascript') ||
      name.includes('react') ||
      name.includes('node') ||
      name.includes('aws') ||
      name.includes('docker') ||
      name.includes('git')
    ) {
      focus.push('engineering');
    }
    
    // Both if no specific focus determined or if it's cross-cutting
    if (focus.length === 0 || name.includes('seo') || name.includes('performance')) {
      focus = ['both'];
    }
    
    return {
      ...skill,
      focus: focus
    };
  });
}

/**
 * Adds focus tags to projects based on their nature
 * @param {Array} projects - Array of project objects  
 * @returns {Array} Enhanced projects with focus tags
 */
export function enhanceProjectsWithFocus(projects) {
  return projects.map(project => {
    const name = project.name.toLowerCase();
    const description = (project.description || '').toLowerCase();
    const summary = (project.summary || '').toLowerCase();
    
    let focus = [];
    let type = 'website'; // default type
    
    // Determine focus and type based on project characteristics
    if (
      name.includes('docs') ||
      description.includes('documentation') ||
      description.includes('content') ||
      summary.includes('docs') ||
      summary.includes('help content')
    ) {
      focus.push('writing');
      type = 'documentation';
    }
    
    if (
      description.includes('react') ||
      description.includes('gatsby') ||
      description.includes('static site') ||
      description.includes('graphql') ||
      description.includes('api') ||
      project.languages?.includes('JavaScript') ||
      project.libraries?.length > 0
    ) {
      focus.push('engineering');
    }
    
    // If no focus determined, assume both
    if (focus.length === 0) {
      focus = ['both'];
    }
    
    return {
      ...project,
      focus: focus,
      type: type,
      featured: name.includes('docs') || name.includes('developer') // Feature key projects
    };
  });
}

/**
 * Filter skills by focus area
 * @param {Array} skills - Array of skill objects
 * @param {string} focusFilter - 'writing', 'engineering', or 'all'  
 * @returns {Array} Filtered skills
 */
export function filterSkillsByFocus(skills, focusFilter = 'all') {
  if (focusFilter === 'all') return skills;
  
  return skills.filter(skill => 
    skill.focus?.includes(focusFilter) || skill.focus?.includes('both')
  );
}

/**
 * Filter projects by focus area
 * @param {Array} projects - Array of project objects
 * @param {string} focusFilter - 'writing', 'engineering', or 'all'
 * @returns {Array} Filtered projects  
 */
export function filterProjectsByFocus(projects, focusFilter = 'all') {
  if (focusFilter === 'all') return projects;
  
  return projects.filter(project =>
    project.focus?.includes(focusFilter) || project.focus?.includes('both')  
  );
}