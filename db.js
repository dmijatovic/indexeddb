// This is what our customer data looks like.
const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

export const dbName = "testDB"
export const dbVersion = 2


export function openDatabase(){
  // open database
  const dbCnn = indexedDB.open(dbName, dbVersion);
  return dbCnn
}

export function openDB(){
  return new Promise((res,rej)=>{
    const dbCnn = indexedDB.open(dbName, dbVersion);
    // listen for upgrade event
    dbCnn.onupgradeneeded = onDbUpgrade
    // resolve db on success
    dbCnn.onsuccess=(e)=>{
      // resolve with complete event
      res(e.target.result)
    }
    // reject on error
    dbCnn.onerror=(e)=>{
      rej(e)
    }
  })
}


/**
 *
 * @param {*} event
 */
export function onDbUpgrade(event){
  // debugger
  const db = event.target.result;
  console.group("onupgradeneeded")
  console.log("db...", db)

  // Create another object store called "names" with the autoIncrement flag set as true.
  const names = db.createObjectStore("names", { autoIncrement: true });

  // Because the "names" object store has the key generator, the key for the name value is generated automatically.
  // The added records would be like:
  // key : 1 => value : "Bill"
  // key : 2 => value : "Donna"
  // customerData.forEach((customer) => {
  //   names.add(customer.name);
  // });

  // Create an objectStore to hold information about our customers. We're
  // going to use "ssn" as our key path because it's guaranteed to be
  // unique - or at least that's what I was told during the kickoff meeting.
  const customers = db.createObjectStore("customers", { keyPath: "ssn" });

  // Create an index to search customers by name. We may have duplicates
  // so we can't use a unique index.
  customers.createIndex("name", "name", { unique: false });
  // Create an index to search customers by email. We want to ensure that
  // no two customers have the same email, so use a unique index.
  customers.createIndex("email", "email", { unique: true });

  // Use transaction oncomplete to make sure the objectStore creation is
  // finished before adding data into it.
  // Note! Adding data should be done later in onsuccess event
  // customers.transaction.oncomplete = (event) => {
  //   // debugger
  //   // Store values in the newly created objectStore.
  //   const customerObjectStore = db
  //     .transaction("customers", "readwrite")
  //     .objectStore("customers");

  //   customerData.forEach((customer) => {
  //     customerObjectStore.add(customer);
  //   });
  // };

  // Create another object store called "names" with the autoIncrement flag set as true.
  db.createObjectStore("cars", { autoIncrement: true });

  console.log("db.objectStoreNames...", db.objectStoreNames)
  console.log("db.transaction...", db.transaction)
  console.log("customers...", customers)
  console.log("names...", names)
  console.groupEnd()
}


/**
 *
 * @param {*} event
 */
export function onDbSuccess(event){
  // debugger
  const db = event.target.result;
  // define data objects
  let customers, names, cars

  console.group("onsuccess")
  console.log("event...", event)
  console.log("db.name...", db.name)
  console.log("db.version...", db.version)
  console.log("db.objectStoreNames...", db.objectStoreNames)
  // to check we need to use contains see https://developer.mozilla.org/en-US/docs/Web/API/DOMStringList
  console.log("customers data found", db.objectStoreNames.contains("customers"))

  // Check if object store exists (the only way to add data in onsuccess event)
  if (db.objectStoreNames.contains("customers")===true){
    customers = db
      .transaction(["customers"], "readwrite")
      .objectStore("customers");

    // add customer data
    customerData.forEach((customer) => {
      // make unique ssn id and email otherwise record will not added (already exists)
      const ssn = Math.round(Math.random() * 1000000000).toString()
      const email = `${ssn}.${customer.email}`
      const age = Math.round(Math.random() * 100)
      // debugger
      const request = customers.add({
        ssn,
        email,
        name: customer.name,
        age
      })
      // This event is triggered after success adding. If record exists no event is fired.
      request.onsuccess = (event) => {
        // debugger
        console.log("request...added...", customer)
      };
    });
  }

  if (db.objectStoreNames.contains("names")===true){
    // load names and add random name
    names = db
      .transaction(["names"], "readwrite")
      .objectStore("names")

    // added only if unique
    names.add(`Test name ${Math.random()}`)

    // READ ALL data
    names.getAll().onsuccess = (e) => {
      // console.log("e...", e)
      // debugger
      const namesData = e.target.result
      console.log("namesData...", namesData)
    }

    names.onerror = (e) => {
      debugger
      console.log ("error...",e)
    }
  }

  // alter database by increasing the version
  if (db.objectStoreNames.contains("cars")===true){
    cars = db
      .transaction(["cars"], "readwrite")
      .objectStore("cars")

    cars.add({
      color: 'red',
      brand: 'Audi',
      model: 'A4'
    })

  } else {
    // debugger
    // delete database
    // setTimeout(()=>{
    deleteDatabase()
    // },100)
  }

  console.log("db.transaction...", db.transaction)
  console.log("customers...", customers)
  console.log("names...", names)
  console.groupEnd()
}

export function deleteDatabase(){
  debugger

  const delDB = indexedDB.deleteDatabase(dbName)

  delDB.onerror = (event) => {
    // debugger
    console.error("Error deleting database."), event;
  };

  delDB.onsuccess = (event) => {
    // debugger
    console.log("Database deleted successfully");
    // console.log(event.result); // should be undefined
  };
}

/**
 *
 * @param {*} db event.target.result
 */
export function addCustomer(db){
  // Check if object store exists (the only way to add data in onsuccess event)
  if (db.objectStoreNames.contains("customers")===true){

    const customers = db
      .transaction("customers", "readwrite")
      .objectStore("customers");

    // add customer data
    customerData.forEach((customer) => {
      // make unique ssn id and email otherwise record will not added (already exists)
      const ssn = Math.round(Math.random() * 1000000000).toString()
      const email = `${ssn}.${customer.email}`
      const age = Math.round(Math.random() * 100)
      // debugger
      const transaction = customers.add({
        ssn,
        email,
        name: customer.name,
        age
      })
      // This event is triggered after success adding. If record exists no event is fired.
      transaction.onsuccess = (event) => {
        // debugger
        console.group("addCustomer")
        console.log("event...",event)
        console.log("request...added...", customer)
        console.groupEnd()
      };
    });
  }else{
    alert("Failed to add customer")
  }
}

export function getCustomers(db){
  return new Promise((res,rej)=>{
    // Check if object store exists (the only way to add data in onsuccess event)
    if (db.objectStoreNames.contains("customers")===true){
      const customers = db
        .transaction("customers", "readwrite")
        .objectStore("customers");

      const rec = customers.getAll()

      rec.onsuccess = (e) => {
        res(e.target.result)
      }

      rec.onerror = (e) => {
        rej(e.target.result)
      }
    }
  })
}