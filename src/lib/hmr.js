import * as allStores from '@/stores'

let stores = {}

export function registerStore(id, store) {
  stores[id] = store
}

// Register all stores automatically for HMR
Object.entries(allStores).forEach(([id, store]) => registerStore(id, store))

// preserve the store across HMR updates
if (import.meta.hot) {
  if (import.meta.hot.data.stores) {
    stores = import.meta.hot?.data.stores
  }
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    import.meta.hot.data.stores = stores
  })
}
