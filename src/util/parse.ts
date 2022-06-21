export default function getUserFromMention(mention: string) {
  return mention.replace(/<@!/g, '').replace(/>/g, '');
}

export function getChannelFromMention(mention: string) {
  return mention.replace(/<#/g, '').replace(/>/g, '');
}
