import{createClient}from'@supabase/supabase-js';
import{randomUUID}from'node:crypto';

const required=['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','STUDIUX_QA_A_EMAIL','STUDIUX_QA_A_PASSWORD','STUDIUX_QA_B_EMAIL','STUDIUX_QA_B_PASSWORD'];
const missing=required.filter(key=>!process.env[key]);
if(missing.length){console.error(`BLOCKED: missing ${missing.join(', ')}`);process.exit(2)}
const client=()=>createClient(process.env.VITE_SUPABASE_URL,process.env.VITE_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const a=client(),b=client(),created={subjects:[],tasks:[],sessions:[]};
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const signIn=async(c,email,password)=>{const{data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;return data.user};
const forbidden=async(promise,label)=>{const{data,error}=await promise;assert(Boolean(error)||!data||data.length===0,`${label}: unauthorized operation unexpectedly succeeded`)};
const cleanup=async()=>{for(const[id]of created.sessions)await a.from('study_sessions').delete().eq('id',id);for(const[id]of created.tasks)await a.from('tasks').delete().eq('id',id);for(const[id]of created.subjects)await a.from('subjects').delete().eq('id',id);await Promise.allSettled([a.auth.signOut(),b.auth.signOut()])};

try{
  const userA=await signIn(a,process.env.STUDIUX_QA_A_EMAIL,process.env.STUDIUX_QA_A_PASSWORD),userB=await signIn(b,process.env.STUDIUX_QA_B_EMAIL,process.env.STUDIUX_QA_B_PASSWORD);
  assert(userA.id!==userB.id,'QA accounts must be distinct');
  const subjectId=randomUUID(),taskId=randomUUID(),sessionId=randomUUID();created.subjects.push([subjectId]);created.tasks.push([taskId]);created.sessions.push([sessionId]);
  let result=await a.from('subjects').insert({id:subjectId,owner_id:userA.id,name:`R2D ${subjectId.slice(0,8)}`}).select().single();if(result.error)throw result.error;
  result=await a.from('tasks').insert({id:taskId,owner_id:userA.id,subject_id:subjectId,title:'R2D isolation task'}).select().single();if(result.error)throw result.error;
  result=await a.from('study_sessions').insert({id:sessionId,owner_id:userA.id,subject_id:subjectId,status:'ACTIVE',source:'TIMER',started_at:new Date().toISOString(),client_request_id:sessionId}).select().single();if(result.error)throw result.error;
  await forbidden(b.from('subjects').select('*').eq('id',subjectId),'B select A subject');
  await forbidden(b.from('subjects').update({name:'spoof'}).eq('id',subjectId).select(),'B update A subject');
  await forbidden(b.from('subjects').delete().eq('id',subjectId).select(),'B delete A subject');
  await forbidden(b.from('subjects').insert({id:randomUUID(),owner_id:userA.id,name:'ownership spoof'}).select(),'B spoof subject owner');
  await forbidden(b.from('tasks').select('*').eq('id',taskId),'B select A task');
  await forbidden(b.from('tasks').update({title:'spoof'}).eq('id',taskId).select(),'B update A task');
  await forbidden(b.from('study_sessions').select('*').eq('id',sessionId),'B select A session');
  const duplicate=randomUUID();created.sessions.push([duplicate]);const duplicateResult=await a.from('study_sessions').insert({id:duplicate,owner_id:userA.id,status:'ACTIVE',source:'TIMER',started_at:new Date().toISOString(),client_request_id:duplicate});assert(Boolean(duplicateResult.error),'second ACTIVE session was not rejected');
  const ownPrefs=await a.from('user_preferences').select('*').eq('owner_id',userA.id);if(ownPrefs.error)throw ownPrefs.error;
  const otherPrefs=await b.from('user_preferences').select('*').eq('owner_id',userA.id);assert(!otherPrefs.error&&otherPrefs.data.length===0,'B could read A preferences');
  console.log('VERIFIED LIVE: core two-user RLS and active-session invariant passed');
}catch(error){console.error(`FAILED: ${error.message}`);process.exitCode=1}finally{await cleanup()}
