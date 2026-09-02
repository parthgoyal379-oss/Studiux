function csvCell(value){const text=String(value??'');return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text}
export function sessionsToCsv(sessions){const keys=['id','subject_id','chapter_id','task_id','source','session_type','started_at','finished_at','duration_seconds','focus_rating','questions_attempted','questions_correct','notes'];return[keys.join(','),...sessions.map(row=>keys.map(k=>csvCell(row[k])).join(','))].join('\n')}
export function fullDataJson(data){return JSON.stringify({format:'studiux-export',version:1,exportedAt:new Date().toISOString(),data},null,2)}
export function downloadText(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
