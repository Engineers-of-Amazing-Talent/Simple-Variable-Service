type IListItem = {
  listId: String,
  resourceId: String,
}

export const ListItem = {
  create: ({ listId, resourceId }: IListItem): { listId: String, resourceId: String, } => ({
    listId,
    resourceId
  })
}