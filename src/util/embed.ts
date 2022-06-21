import { MessageEmbed, User } from 'discord.js';

// Colors
export const successEmbed = '#63d46f';
export const warnEmbed = '#ebbd47';
export const failedEmbed = '#eb4747';

/**
 * Ephemeral message to display on success.
 * @param text Text to display on success
 * @returns {MessageEmbed} The embed.
 */
export const successEmbedEphemeral = (text: any) =>
  new MessageEmbed()
    .setColor(successEmbed)
    .setDescription(`<:check:954163199446499389> ${text}`);

/**
 * Message to display publicly with author on success.
 * @param author The author that issued the interaction
 * @param text Text to display on success
 * @returns {MessageEmbed} The embed.
 */
export const successEmbedReply = (author: User, text: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(successEmbed)
    .setDescription(`<:check:954163199446499389> ${text}`);

/**
 * Warning message publicly posted for the author.
 * @param author The author that issued the interaction
 * @param text Warning text to display.
 * @returns {MessageEmbed} The embed.
 */
export const warnEmbedReply = (author: User, text: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(warnEmbed)
    .setDescription(`⚠️ ${text}`);

/**
 * Ephemeral warning message posted for the author.
 * @param text Warning text to display.
 * @returns {MessageEmbed} The embed.
 */
export const warnEmbedEphemeral = (text: any) =>
  new MessageEmbed().setColor(warnEmbed).setDescription(`⚠️ ${text}`);

/**
 * A cancellable message that gives information to user on
 * a certain action, like a ban action warning.
 * @param author The author that issued the interaction
 * @param text Warning text to display.
 * @param footer Additional information to be displayed to user.
 * @returns {MessageEmbed} The embed.
 */
export const cancellableEmbedWarning = (author: any, text: any, footer: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(warnEmbed)
    .setDescription(`⚠️ ${text}`)
    .setFooter({
      text: `${footer}`,
    });

/**
 * Failed action message posted for the user.
 * @param text The text displayed as to why this action failed.
 * @returns {MessageEmbed} The embed.
 */
export const failedEmbedEphemeral = (text: any) =>
  new MessageEmbed()
    .setColor(failedEmbed)
    .setDescription(`<:red_tick:954499768124583947> ${text}`);

/**
 * Public failed action message posted for the user.
 * @param author The author that issued the interaction
 * @param text The text displayed as to why this action failed.
 * @returns {MessageEmbed} The embed.
 */
export const failedEmbedReply = (author: User, text: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(failedEmbed)
    .setDescription(`<:red_tick:954499768124583947> ${text}`);

/**
 * Failed action message posted for the user.
 * @param text The text displayed as to why this action failed.
 * @returns {MessageEmbed} The embed.
 */
export const errorEmbed = (text: any, diagCode: any) =>
  new MessageEmbed()
    .setColor(warnEmbed)
    .setDescription(`⚠️ ${text}`)
    .setFooter({ text: diagCode });

export const missingPermissionMessage = (author: User, permission: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(failedEmbed)
    .setDescription(
      `<:red_tick:954499768124583947> You're missing the \`${permission.toLowerCase()}\` permission.`
    );

export const selfMissingPermissionMessage = (author: User, permission: any) =>
  new MessageEmbed()
    .setAuthor({
      name: author.username,
      iconURL: author.displayAvatarURL(),
    })
    .setColor(failedEmbed)
    .setDescription(
      `<:red_tick:954499768124583947> I don't have the \`${permission.toLowerCase()}\` permission.`
    );
