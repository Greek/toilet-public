import { GuildMember, Guild } from 'discord.js';
// import { ISettings } from "../schemas/Settings";

export const owners = ['403308385539194880'];
export const ignore = [''];

export enum PermissionLevel {
  IGNORE,
  BANNED,
  DEFAULT,
  MOD,
  ADMIN,
  OWNER,
}

export function checkAllowlist(config: any, guild: Guild) {
  if (!config.allowlistServers.includes(guild.id)) return false;
  else return true;
}

export const getPermission = (member: GuildMember) => {
  if (owners.includes(member.id)) return PermissionLevel.OWNER;
  if (ignore.includes(member.id)) return PermissionLevel.IGNORE;
  if (member.permissions.has('ADMINISTRATOR')) return PermissionLevel.ADMIN;
  //   if (member.roles.cache.has(settings.modRole)) return PermissionLevel.MOD;
  //   if (member.roles.cache.has(settings.bannedRole)) return PermissionLevel.BANNED;
  return PermissionLevel.DEFAULT;
};
