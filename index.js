
import {
  openDB,
  deleteDatabase,
  addCustomer,
  getCustomers
} from "./db.js";

// open database
const db = await openDB()

console.log("db...", db)

const body = document.querySelector("body")

body.innerHTML = `
  <section>
    <h1>This is indexed DB test</h1>
    <p>Examine console logs for the operations performed</p>
    <button id="delete">Delete database</button>
    <button id="customers">Add customer</button>
  </section
`

const btnDel = document.querySelector("#delete")
const btnAdd = document.querySelector("#customers")

if (btnDel){
  btnDel.onclick = deleteDatabase
}

if (btnAdd){
  // debugger
  // disable button if customer data object is not present in db
  btnAdd.disabled = !db.objectStoreNames.contains("customers")
  // bind click event
  btnAdd.onclick = ()=>{
    addCustomer(db)
    setTimeout(()=>{
      getCustomers(db).then(items=>renderTable(items))
    },100)
  }
}

function renderTable(customers){
  if (customers.length === 0) return
  const custList = document.querySelector("#customer-list")

  const tBody = customers.reduce((body,item)=>{
    return (`
      ${body}
      <tr>
        <td>${item.name}</td>
        <td>${item.age}</td>
        <td>${item.email}</td>
      </tr>
    `)
  },"")

  const tbl = `
    <table style="margin:3rem 0rem">
      <thead>
        <th>Name</th>
        <th>Age</th>
        <th>Email</th>
      </thead>
      <tbody>
        ${tBody}
      </tbody>
    </table>
  `

  // debugger

  if (custList){
    custList.innerHTML = tbl
  }else{
    const list = body.appendChild(document.createElement("section"))
    const id = document.createAttribute("id")
    id.value = "customer-list"
    list.setAttributeNode(id)
    list.innerHTML = tbl
  }
}


/**
 * Event is triggered on db open. Here you can read and write data to existing objects using transation.
 * Note@ You cannot change db/object structure. This is possible only from onupgradeneeded event OR maybe
 * using versionchange transaction type?
 * @param {*} event
 */
// dbCnn.onsuccess = onDbSuccess;

/**
 * Event is triggered on db version change or when db does not exist.
 * In this event you can change db structure add/remove objects, set indexes or change properties.
 * @param {*} event
 */
// dbCnn.onupgradeneeded = onDbUpgrade

console.log("Started")