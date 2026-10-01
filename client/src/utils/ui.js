const COLORS = ['#ff5ca8', '#6c4df6', '#2ec4b6', '#ff8a3d', '#3a86ff', '#e0a800', '#e63946', '#06a77d'];

export const avatarColor = (name = '') =>
  COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length];

export const roomLabel = (room, me) =>
  room?.isDM ? room.members?.find((m) => m !== me) : room?.name;
