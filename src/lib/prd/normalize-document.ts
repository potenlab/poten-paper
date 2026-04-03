import type { PRDDocument, GlobalRules, FeatureSpec, AnalysisData } from './types';

function getCurrentDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
}

/**
 * Normalizes AI-generated PRD document to match expected schema.
 * Handles common deviations from the prompt's JSON structure.
 */
export function normalizeDocument(raw: any): PRDDocument {
  if (!raw) return { cover: { projectName: 'PRD', subtitle: '', date: getCurrentDateString(), version: '1.0' }, globalRules: {} as GlobalRules, features: [] };

  return {
    cover: normalizeCover(raw.cover),
    globalRules: normalizeGlobalRules(raw.globalRules || raw),
    features: normalizeFeatures(raw.features),
  };
}

function normalizeCover(cover: any) {
  const defaultDate = getCurrentDateString();
  if (!cover) return { projectName: 'PRD', subtitle: '', date: defaultDate, version: '1.0' };
  return {
    projectName: cover.projectName || cover.project_name || cover.title || 'PRD',
    subtitle: cover.subtitle || cover.description || '',
    date: cover.date || defaultDate,
    version: cover.version || '1.0',
  };
}

function normalizeGlobalRules(gr: any): GlobalRules {
  if (!gr) return {} as GlobalRules;

  const result: any = {};

  // definitionOfDone
  const dod = gr.definitionOfDone || gr.dod || gr.completionCriteria || gr.definition_of_done;
  if (dod) {
    if (Array.isArray(dod)) {
      result.definitionOfDone = { items: dod.map((d: any) => typeof d === 'string' ? d : d.item || d.description || JSON.stringify(d)) };
    } else if (dod.items && Array.isArray(dod.items)) {
      result.definitionOfDone = { items: dod.items };
    } else if (typeof dod === 'object') {
      result.definitionOfDone = { items: Object.values(dod).filter((v): v is string => typeof v === 'string') };
    }
  }

  // techSpecs - AI often returns as "techStack" with different sub-keys
  const ts = gr.techSpecs || gr.techStack || gr.tech_specs || gr.technology;
  if (ts) {
    if (typeof ts === 'object' && !Array.isArray(ts)) {
      result.techSpecs = {
        frontend: ts.frontend || '',
        backendAndDb: ts.backendAndDb || ts.backend_and_db || ts.backendDb ||
          [ts.backend, ts.database].filter(Boolean).join(' + ') || '',
        externalIntegrations: ts.externalIntegrations || ts.external_integrations || ts.integrations ||
          (Array.isArray(ts.integrations) ? ts.integrations.join(', ') : '') || '',
        dataInitialization: ts.dataInitialization || ts.data_initialization || ts.dataInit || '',
      };
    }
  }

  // userFlow
  const uf = gr.userFlow || gr.user_flow || gr.routing;
  if (uf) {
    if (uf.routes && Array.isArray(uf.routes)) {
      result.userFlow = { routes: uf.routes.map(normalizeRoute) };
    } else if (Array.isArray(uf)) {
      result.userFlow = { routes: uf.map(normalizeRoute) };
    }
  }
  // Also check top-level routes
  if (!result.userFlow && gr.routes && Array.isArray(gr.routes)) {
    result.userFlow = { routes: gr.routes.map(normalizeRoute) };
  }

  // dataDictionary
  const dd = gr.dataDictionary || gr.data_dictionary || gr.masterData;
  if (dd && Array.isArray(dd)) {
    result.dataDictionary = dd;
  }

  // Preserve any extra keys for dynamic rendering (but exclude already mapped ones)
  const mappedKeys = new Set([
    'definitionOfDone', 'dod', 'completionCriteria', 'definition_of_done',
    'techSpecs', 'techStack', 'tech_specs', 'technology',
    'userFlow', 'user_flow', 'routing', 'routes',
    'dataDictionary', 'data_dictionary', 'masterData',
  ]);
  for (const key of Object.keys(gr)) {
    if (!mappedKeys.has(key) && !result[key]) {
      result[key] = gr[key];
    }
  }

  return result;
}

function normalizeRoute(r: any) {
  if (typeof r === 'string') return { route: r, description: '', accessLevel: 'public' };
  return {
    route: r.route || r.path || r.url || '',
    description: r.description || r.desc || '',
    accessLevel: r.accessLevel || r.access_level || r.access || 'public',
  };
}

function normalizeFeatures(features: any): FeatureSpec[] {
  if (!features || !Array.isArray(features)) return [];
  return features.map((f: any, i: number) => normalizeFeature(f, i));
}

function normalizeFeature(f: any, index: number): FeatureSpec {
  if (!f) return emptyFeature(index);

  return {
    id: f.id || `feature-${index + 1}`,
    name: f.name || f.title || f.featureName || `기능 ${index + 1}`,
    purpose: normalizePurpose(f.purpose || f.overview || f.description),
    userDefinition: normalizeUserDefinition(f.userDefinition || f.user_definition || f.users),
    layoutStructure: normalizeLayoutStructure(f.layoutStructure || f.layout_structure || f.layout),
    displayData: normalizeDisplayData(f.displayData || f.display_data || f.data),
    uiElements: normalizeUIElements(f.uiElements || f.ui_elements || f.ui),
    stateMachine: normalizeStateMachine(f.stateMachine || f.state_machine || f.states),
    actionDefinitions: normalizeActionDefinitions(f.actionDefinitions || f.action_definitions || f.actions),
    operationalPolicy: normalizeOperationalPolicy(f.operationalPolicy || f.operational_policy || f.policy),
  };
}

function normalizePurpose(p: any) {
  if (!p) return { problem: '', kpiMetrics: '', scopeIn: [], scopeOut: [] };
  if (typeof p === 'string') return { problem: p, kpiMetrics: '', scopeIn: [], scopeOut: [] };
  return {
    problem: p.problem || p.description || '',
    kpiMetrics: p.kpiMetrics || p.kpi_metrics || p.kpi || '',
    scopeIn: ensureArray(p.scopeIn || p.scope_in || p.included || []),
    scopeOut: ensureArray(p.scopeOut || p.scope_out || p.excluded || []),
  };
}

function normalizeUserDefinition(u: any) {
  if (!u) return { userTypes: '', authCheckTiming: '', accessDenialBehavior: '' };
  if (typeof u === 'string') return { userTypes: u, authCheckTiming: '', accessDenialBehavior: '' };
  return {
    userTypes: u.userTypes || u.user_types || (Array.isArray(u) ? u.join(', ') : '') || '',
    authCheckTiming: u.authCheckTiming || u.auth_check_timing || u.authTiming || '',
    accessDenialBehavior: u.accessDenialBehavior || u.access_denial_behavior || u.denialBehavior || '',
  };
}

function normalizeLayoutStructure(l: any) {
  if (!l) return { areas: [] };
  if (l.areas && Array.isArray(l.areas)) {
    return { areas: l.areas.map((a: any) => ({
      area: a.area || a.name || a.section || '',
      description: a.description || a.desc || '',
      components: a.components || a.children || '',
    }))};
  }
  if (Array.isArray(l)) {
    return { areas: l.map((a: any) => ({
      area: typeof a === 'string' ? a : (a.area || a.name || ''),
      description: typeof a === 'string' ? '' : (a.description || ''),
      components: typeof a === 'string' ? '' : (a.components || ''),
    }))};
  }
  return { areas: [] };
}

function normalizeDisplayData(d: any) {
  if (!d) return { rows: [] };
  const rows = d.rows || (Array.isArray(d) ? d : []);
  return { rows: rows.map((r: any) => ({
    dataField: r.dataField || r.data_field || r.field || r.name || '',
    dataType: r.dataType || r.data_type || r.type || '',
    source: r.source || '',
    displayFormat: r.displayFormat || r.display_format || r.format || '',
    emptyState: r.emptyState || r.empty_state || r.empty || '',
    note: r.note || r.notes || '',
  }))};
}

function normalizeUIElements(u: any) {
  if (!u) return { elements: [] };
  const elements = u.elements || (Array.isArray(u) ? u : []);
  return { elements: elements.map((e: any) => ({
    element: e.element || e.name || e.label || '',
    type: e.type || '',
    behavior: e.behavior || e.action || e.onClick || '',
    condition: e.condition || e.visible || e.when || '',
  }))};
}

function normalizeStateMachine(s: any) {
  if (!s) return { initialState: '', normalState: '', emptyState: '', errorState: '' };
  return {
    initialState: s.initialState || s.initial_state || s.loading || s.initial || '',
    normalState: s.normalState || s.normal_state || s.loaded || s.normal || s.success || '',
    emptyState: s.emptyState || s.empty_state || s.empty || s.noData || '',
    errorState: s.errorState || s.error_state || s.error || s.failed || '',
  };
}

function normalizeActionDefinitions(a: any) {
  if (!a) return { rows: [] };
  const rows = a.rows || (Array.isArray(a) ? a : []);
  return { rows: rows.map((r: any) => ({
    action: r.action || r.name || '',
    trigger: r.trigger || r.event || '',
    process: r.process || r.steps || r.description || '',
    result: r.result || r.outcome || r.response || '',
  }))};
}

function normalizeOperationalPolicy(o: any) {
  if (!o) return { content: '' };
  if (typeof o === 'string') return { content: o };
  return { content: o.content || o.text || o.policy || '' };
}

function ensureArray(v: any): string[] {
  if (Array.isArray(v)) return v.map(i => typeof i === 'string' ? i : JSON.stringify(i));
  if (typeof v === 'string') return [v];
  return [];
}

function emptyFeature(index: number): FeatureSpec {
  return {
    id: `feature-${index + 1}`,
    name: `기능 ${index + 1}`,
    purpose: { problem: '', kpiMetrics: '', scopeIn: [], scopeOut: [] },
    userDefinition: { userTypes: '', authCheckTiming: '', accessDenialBehavior: '' },
    layoutStructure: { areas: [] },
    displayData: { rows: [] },
    uiElements: { elements: [] },
    stateMachine: { initialState: '', normalState: '', emptyState: '', errorState: '' },
    actionDefinitions: { rows: [] },
    operationalPolicy: { content: '' },
  };
}

/**
 * Normalizes analysis data from AI response.
 */
export function normalizeAnalysisData(raw: any): AnalysisData {
  if (!raw) return { identifiedFeatures: [], suggestedTechStack: { frontend: '', backend: '', database: '', integrations: [] }, userTypes: [], estimatedRoutes: [], projectSummary: '' };

  return {
    identifiedFeatures: (raw.identifiedFeatures || raw.identified_features || []).map((f: any) => ({
      name: f.name || '',
      description: f.description || '',
      priority: f.priority || 'medium',
    })),
    suggestedTechStack: {
      frontend: raw.suggestedTechStack?.frontend || raw.suggested_tech_stack?.frontend || '',
      backend: raw.suggestedTechStack?.backend || raw.suggested_tech_stack?.backend || '',
      database: raw.suggestedTechStack?.database || raw.suggested_tech_stack?.database || '',
      integrations: ensureArray(raw.suggestedTechStack?.integrations || raw.suggested_tech_stack?.integrations || []),
    },
    userTypes: ensureArray(raw.userTypes || raw.user_types || []),
    estimatedRoutes: (raw.estimatedRoutes || raw.estimated_routes || []).map(normalizeRoute),
    projectSummary: raw.projectSummary || raw.project_summary || '',
  };
}
