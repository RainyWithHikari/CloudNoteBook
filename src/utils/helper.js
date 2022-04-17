//transform Array to object
export const flattenArr = (arr) => {
  //ruduce归并
  //map: 之前的结果；item：现在的结果
  return arr.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
}

//transform object to arr
export const objToArr = (obj) => {
  return Object.keys(obj).map(key => obj[key])
}

// 让Dom中的信息浮到父节点
export const getParentNode = (node, parentClassName) => {
   let current = node
   while(current !== null) {
     if (current.classList.contains(parentClassName)) {
       return current
     }
     current = current.parentNode
   }
   return false
 }

export const timestampToString = (timestamp) => {
  const date = new Date(timestamp)
   return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}