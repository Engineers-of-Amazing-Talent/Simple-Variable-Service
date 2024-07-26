type IPermissions = {
  capabilities: String,
  userId: String,
  resourceId: String,
}

export const Permissions = {
  create: ({ capabilities, userId, resourceId }: IPermissions): { capabilities: String, userId: String, resourceId: String, } => ({
    capabilities,
    userId,
    resourceId
  })
}