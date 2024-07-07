
const body = document.querySelector("body")

body.innerHTML = `
  <section>
    <h1>This is indexed DB test</h1>
    <p>Examine console logs for the operations performed</p>
  </section
`

// This is what our customer data looks like.
const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

const dbName = "testDB"
const request = indexedDB.open(dbName,2);

request.onsuccess = (event) => {
  // debugger
  const db = event.target.result;

  console.group("onsuccess")
  console.log("event...", event)
  console.log("db.name...", db.name)
  console.log("db.version...", db.version)
  console.log("db.objectStoreNames...", db.objectStoreNames)
  // to check we need to use contains see https://developer.mozilla.org/en-US/docs/Web/API/DOMStringList
  console.log("customers data found", db.objectStoreNames.contains("customers"))

  const customers = db
    .transaction(["customers"], "readwrite")
    .objectStore("customers");

  // add customer data
  customerData.forEach((customer) => {
    // debugger
    const request = customers.add(customer);
    request.onsuccess = (event) => {
      // debugger
      console.log("request...event...", event)
      // event.target.result === customer.ssn;
    };
  });

  // load names and add random name
  const names = db
    .transaction(["names"], "readwrite")
    .objectStore("names")

  names.add(`Test name ${Math.random()}`)

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

  console.log("db.transaction...", db.transaction)
  console.log("customers...", customers)
  console.log("names...", names)
  console.groupEnd()
};

request.onupgradeneeded = (event) => {
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
  customerData.forEach((customer) => {
    names.add(customer.name);
  });

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
  customers.transaction.oncomplete = (event) => {
    // debugger
    // Store values in the newly created objectStore.
    const customerObjectStore = db
      .transaction("customers", "readwrite")
      .objectStore("customers");

    customerData.forEach((customer) => {
      customerObjectStore.add(customer);
    });
  };

  console.log("db.objectStoreNames...", db.objectStoreNames)
  console.log("db.transaction...", db.transaction)
  console.log("customers...", customers)
  console.log("names...", names)
  console.groupEnd()
};


console.log("Started")