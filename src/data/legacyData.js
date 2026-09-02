export const LEGACY_WORKSPACE_KEY='studiux:v1';
export const IMPORT_DECISION_KEY=userId=>`studiux:import-decision:v1:${userId}`;
export function readLegacyWorkspace(storage=localStorage){try{const value=JSON.parse(storage.getItem(LEGACY_WORKSPACE_KEY)||'null');return value&&typeof value==='object'?value:null}catch{return null}}
export function hasImportableData(state){return Boolean((state?.subjects?.length||0)+(state?.tasks?.length||0)+(state?.sessions?.length||0))}
