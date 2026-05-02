
function calculateBookingTotal(tickets, pricePerTicket, discount = 0) {
    let total = tickets * pricePerTicket;
    if (discount > 0) {
        total = total - (total * discount / 100);
    }
    console.log(`DEBUG: Booking total for ${tickets} tickets: ${total}`);
    return total;
}

// Testing with the user's example
console.log("Running Test 1 (3 tickets, 500 each, 10% discount):");
calculateBookingTotal(3, 500, 10);

console.log("\nRunning Test 2 (1 ticket, 1000 each, 0% discount):");
calculateBookingTotal(1, 1000, 0);

console.log("\nRunning Test 3 (5 tickets, 200 each, 20% discount):");
calculateBookingTotal(5, 200, 20);
