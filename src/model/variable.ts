type IVariable = {
  name: String,
  type: String,
  value: String
}

export const Variable = {
  create: ({ name, type, value }: IVariable): {name: String, value: String, type: String } => ({
    name,
    value,
    type
  })
}