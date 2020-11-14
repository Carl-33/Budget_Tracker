
let db;
//  create an empty db for the budget-tracker database

const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("offline-transactions", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    // checks if the app is online, then reads from teh database 
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    // console logs an error if/when there is one
    console.log("error: " + event.target.errorCode);
};

// saves a record to indexedDB
function saveRecord(record) {
    const transaction = db.transaction(["offline-transactions"], "readwrite");
    // access the "offline-transactions" object store
    const store = transaction.objectStore("offline-transactions");
    // adds the record to the object store
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["offline-transactions"], "readwrite");
    const store = transaction.objectStore("offline-transactions");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        // if there is anything in indexedDB, it will post it to api/transaction/bulk
        if(getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json text/plain, */*", "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            // after everythingn in indexedDB is passed to the mongo database, the indexedDB is cleared.
            .then(() => {
                const transaction = db.transaction(["offline-transactions"], "readwrite");
                const store = transaction.objectStore("offline-transactions");
                store.clear();
            })
        }
    }
}

// when internet access is reastablished the checkDatabase function is called
window.addEventListener("online", checkDatabase); 