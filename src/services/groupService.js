import{DomainError,ErrorCode}from'../domain/errors.js';
const requireRemote=remote=>{if(!remote)throw new DomainError(ErrorCode.OFFLINE,'Group membership requires the connected account service.');return remote};
export async function joinGroup(remote,code){const value=code.trim();if(value.length<4)throw new DomainError(ErrorCode.VALIDATION_ERROR,'Enter a valid group code.');return requireRemote(remote).joinGroupByCode(value)}
export async function loadGroupMembers(remote,groupId){return requireRemote(remote).groupMembers(groupId)}
export async function loadGroupLeaderboard(remote,groupId,from,to){return requireRemote(remote).groupLeaderboard(groupId,from,to)}
