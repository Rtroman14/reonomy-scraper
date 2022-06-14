let contact = {
    name: "test",
    title: "owner",
};

let fields = {
    age: 23,
    phone: "123",
};

contact = { ...contact, fields };
console.log(contact);
