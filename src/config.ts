export const APP_TITLE = 'Idea Wedge Playbook';

export const STATUS_OPTIONS = [
  'backlog',
  'researching',
  'approved',
  'deferred',
  'rejected',
  'building',
] as const;

export const SCORE_OPTIONS = [
  { value: 'strong', label: 'Strong' },
  { value: 'medium', label: 'Medium' },
  { value: 'weak', label: 'Weak' },
  { value: 'unknown', label: 'Unknown' },
] as const;

export const SECTION_DEFINITIONS = [
  {
    key: 'market',
    title: '1. Market Exists',
    description: 'Confirm that this is an existing buying category with real customers and visible competitors.',
    fields: [
      { key: 'category', label: 'Category / market', type: 'text', placeholder: 'e.g. customer feedback SaaS for B2B teams' },
      { key: 'competitors', label: 'Known competitors', type: 'textarea', placeholder: 'List active competitors, pricing pages, or review sites' },
      { key: 'proof', label: 'Evidence customers already pay', type: 'textarea', placeholder: 'Pricing pages, testimonials, G2 reviews, case studies, search demand' },
      { key: 'marketScore', label: 'Confidence', type: 'select' },
    ],
  },
  {
    key: 'wedge',
    title: '2. Clear Improvement / Wedge',
    description: 'Name the exact improvement that makes a new entrant worth considering.',
    fields: [
      { key: 'problem', label: 'What is broken today?', type: 'textarea', placeholder: 'Bad UX, slow setup, bloated workflow, overpriced, weak onboarding, poor positioning' },
      { key: 'improvement', label: 'Our wedge in one sentence', type: 'textarea', placeholder: 'We win by being simpler / faster / narrower / more trustworthy for X' },
      { key: 'evidence', label: 'Evidence this wedge matters', type: 'textarea', placeholder: 'Repeated complaints, review themes, community discussions, customer calls' },
      { key: 'wedgeScore', label: 'Confidence', type: 'select' },
    ],
  },
  {
    key: 'mvp',
    title: '3. Small MVP Scope',
    description: 'Define the smallest sellable version that can test the wedge with real users.',
    fields: [
      { key: 'core', label: 'Smallest sellable version', type: 'textarea', placeholder: 'What must exist on day one for the promise to be real?' },
      { key: 'outOfScope', label: 'Explicitly out of scope', type: 'textarea', placeholder: 'What are you deliberately not building yet?' },
      { key: 'complexity', label: 'What could cause scope blowout?', type: 'textarea', placeholder: 'Integrations, permissions, compliance, data dependencies, workflow sprawl' },
      { key: 'mvpScore', label: 'Confidence', type: 'select' },
    ],
  },
  {
    key: 'distribution',
    title: '4. Distribution Path',
    description: 'Identify a plausible first route to customers before approving the idea.',
    fields: [
      { key: 'buyer', label: 'First buyer', type: 'text', placeholder: 'e.g. Head of Support at 20-200 person SaaS companies' },
      { key: 'channel', label: 'First channel', type: 'text', placeholder: 'e.g. outbound, SEO, niche communities, channel partner, paid ads' },
      { key: 'message', label: 'First message', type: 'textarea', placeholder: 'What sharp claim gets attention?' },
      { key: 'proofPoint', label: 'First proof point', type: 'textarea', placeholder: 'Why should someone trust the outreach?' },
      { key: 'distributionScore', label: 'Confidence', type: 'select' },
    ],
  },
  {
    key: 'risk',
    title: '5. Structural Risk',
    description: 'Reject ideas that are attractive on the surface but fragile underneath.',
    fields: [
      { key: 'dependencies', label: 'External dependencies', type: 'textarea', placeholder: 'Platforms, APIs, app stores, policy dependencies, vendors, data sources' },
      { key: 'killShot', label: 'What could structurally kill this business?', type: 'textarea', placeholder: 'One platform ban, pricing change, policy shift, compliance blocker' },
      { key: 'mitigation', label: 'Mitigation / why risk is acceptable', type: 'textarea', placeholder: 'How survivable is this if a dependency changes?' },
      { key: 'riskScore', label: 'Confidence', type: 'select' },
    ],
  },
] as const;
