import{describe,expect,it}from'vitest';
import{advanceRevision,challengeProgress,deterministicInsights,mockAnalysis,planActualForRange,taskActualMs,taskProgress}from'./product.js';
describe('connected product calculations',()=>{
it('derives task time and subtask progress from source records',()=>{expect(taskActualMs('t',[{taskId:'t',status:'COMPLETED',duration:60000},{taskId:'x',status:'COMPLETED',duration:9}])).toBe(60000);expect(taskProgress({id:'t'},[{taskId:'t',completed:true},{taskId:'t',completed:false}])).toBe(.5)});
it('advances revision conservatively from feedback',()=>{const item={intervalIndex:1,intervalsDays:[1,3,7]};expect(advanceRevision(item,'WEAK',0)).toMatchObject({intervalIndex:1,dueAt:3*86400000});expect(advanceRevision(item,'STRONG',0)).toMatchObject({intervalIndex:2,dueAt:7*86400000})});
it('calculates mock accuracy and mistake loss',()=>{expect(mockAnalysis({id:'m',score:80,maxScore:100},[{mockTestId:'m',attempted:10,correct:7}],[{mockTestId:'m',type:'Calculation',marksLost:4}])).toMatchObject({percentage:80,accuracy:70,marksLost:4,distribution:{Calculation:1}})});
it('compares planned and actual ranges',()=>{expect(planActualForRange({events:[{startsAt:10,endsAt:3600010}],sessions:[{startedAt:20,endedAt:30,duration:1800000}],tasks:[],start:0,end:100})).toMatchObject({plannedMinutes:60,actualMs:1800000,adherence:.5})});
it('derives challenges and only grounded insights',()=>{expect(challengeProgress({metric:'TASKS_COMPLETED',target:2,startsAt:0,endsAt:100},{tasks:[{done:true,completedAt:10}]}).ratio).toBe(.5);expect(deterministicInsights({revisionItems:[{status:'DUE',dueAt:1}],now:2})).toEqual(['1 revision is overdue.'])});
});
