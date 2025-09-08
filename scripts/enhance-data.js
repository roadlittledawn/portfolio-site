/**
 * Script to enhance existing career data with focus tags
 * Run with: node scripts/enhance-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import career data
const careerDataPath = path.join(__dirname, '..', 'src', 'data', 'careerData.json');
const careerData = JSON.parse(fs.readFileSync(careerDataPath, 'utf8'));

// Enhancement functions (inline for simplicity)
function enhanceSkillsWithFocus(skills) {
  return skills.map(skill => {
    const name = skill.name.toLowerCase();
    const tags = skill.tags || [];
    
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
      (tags.includes('concepts') && !name.includes('technical'))
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
      name.includes('git') ||
      name.includes('typescript') ||
      name.includes('sass') ||
      name.includes('css') ||
      name.includes('html')
    ) {
      focus.push('engineering');
    }
    
    // Both if no specific focus determined or if it's cross-cutting
    if (focus.length === 0 || name.includes('seo') || name.includes('performance')) {
      if (focus.length === 0) {
        focus = ['both'];
      }
    }
    
    return {
      ...skill,
      focus: focus
    };
  });
}

function enhanceProjectsWithFocus(projects) {
  return projects.map(project => {
    const name = project.name.toLowerCase();
    const description = (project.description || '').toLowerCase();
    const summary = (project.summary || '').toLowerCase();
    
    let focus = [];
    let type = 'website';
    
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
    
    if (focus.length === 0) {
      focus = ['both'];
    }
    
    return {
      ...project,
      focus: focus,
      type: type,
      featured: name.includes('docs') || name.includes('developer') || name.includes('gatsby-theme')
    };
  });
}

// Enhance the data
const enhancedData = {
  ...careerData,
  skills: enhanceSkillsWithFocus(careerData.skills),
  projects: enhanceProjectsWithFocus(careerData.projects)
};

// Write enhanced data back
fs.writeFileSync(careerDataPath, JSON.stringify(enhancedData, null, 2));

console.log('✅ Enhanced career data with focus tags');
console.log(`📊 Skills: ${enhancedData.skills.length} total`);
console.log(`📊 Projects: ${enhancedData.projects.length} total`);

// Show some examples
console.log('\n📝 Sample enhanced skills:');
enhancedData.skills.slice(0, 5).forEach(skill => {
  console.log(`  ${skill.name}: ${skill.focus.join(', ')}`);
});

console.log('\n🚀 Sample enhanced projects:');
enhancedData.projects.slice(0, 3).forEach(project => {
  console.log(`  ${project.name}: ${project.focus.join(', ')} (${project.type})`);
});