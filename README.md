# IndexedDB

This is test for indexedDB operations. The interface is quite "old fashion" with events like `onsuccess`, `onerror`

## Onupgradeneeded

This is important event. `onupgradeneeded` is triggered w

`onupgradeneeded` is called when you change the db version, from no database to first version, first version to second version etc...

`onsuccess` is called each time you make a new request, even if the database schemas has not been changed.

## Create new object or alter structure

This can be only done in `onupgradeneeded`. This event is triggered by changing the database version.

## Write data to existing table

Writing data can be only done using `transaction`. Read the [documentation](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction)

Transaction modes are `readonly`, `readwrite`, `versionchange`. [Read more in docs](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/mode)

## Check data object exist

To check we need to use contains see https://developer.mozilla.org/en-US/docs/Web/API/DOMStringList

```javascript
console.log("customers data found", db.objectStoreNames.contains("customers"))
```
