import { Types } from "mongoose"

export const mongo_parseId = (val) => {
  return Types.ObjectId(val?.id || val?._id || val)
}
export const mongo_equals = (val, val2) => {
  const value = Types.ObjectId(val?.id || val?._id || val)
  const value2 = Types.ObjectId(val2?.id || val2?._id || val2)
  return value.equals(value2)
}

export const mongo_includes = (arrs, val) => {
  const value = Types.ObjectId(val?.id || val?._id || val)
  return arrs.some(item => {
    const id = Types.ObjectId(item?.id || item?._id || item)
    return id.equals(value)
  })
}
