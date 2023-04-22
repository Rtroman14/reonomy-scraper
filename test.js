const text =
    "client: Hey Ryan, my name is Chris with Roper Roofing & Solar. I was just wondering if you’d be interested in a free roof inspection? lead: Not at this time, thanks lead: This is a test to see how the contact conversation field gets updated";

const messages = text
    .split(/(client|lead):\s/)
    .filter(Boolean)
    .reduce((acc, curr, i, arr) => {
        if (i % 2 === 0) {
            const message = {
                role: curr.trim() === "lead" ? "user" : "assistant",
                content: arr[i + 1].trim(),
            };
            acc.push(message);
        }
        return acc;
    }, []);

console.log(messages);
