// Public rooms are open to everyone; private rooms and DMs only to their members.
export const accessFilter = (username) => ({
  $or: [{ isPrivate: { $ne: true }, isDM: { $ne: true } }, { members: username }],
});

// Never expose passwordHash; only DMs reveal their members.
export const publicRoom = (r) => ({
  _id: r._id, name: r.name, createdBy: r.createdBy,
  isPrivate: !!r.isPrivate, isDM: !!r.isDM, members: r.isDM ? r.members : undefined,
});
