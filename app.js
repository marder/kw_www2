// AUTOCOMPLETE
const input = document.getElementById("courtInput");
const hiddenCourt = document.getElementById("court");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestions.innerHTML = "";

    if (value.length === 0) {
        hiddenCourt.value = "";
        return;
    }

    const filtered = courts.filter(c =>
        c.city.toLowerCase().includes(value) ||
        c.code.toLowerCase().includes(value)
    );

    filtered.forEach(court => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = `${court.city} (${court.code})`;

        li.addEventListener("click", () => {
            input.value = `${court.city} (${court.code})`;
            hiddenCourt.value = court.code;
            suggestions.innerHTML = "";
            validateLive();
        });

        suggestions.appendChild(li);
    });
});

// LOGIKA KW
function get_wage(c) {
    const wages = "0123456789XABCDEFGHIJKLMNOPRSTUWYZ";
    return wages.indexOf(c);
}

function calculateNr(court, old) {
    let filling = "";
    for (let i = 0; i < 8 - old.length; i++) filling += "0";

    const full_number = court + filling + old;
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];

    let sum = 0;
    for (let i = 0; i < 12; i++) sum += get_wage(full_number[i]) * weights[i];

    return sum % 10;
}

document.getElementById("old").addEventListener("input", validateLive);

function validateLive() {
    const court = document.getElementById("court");
    const old = document.getElementById("old");

    if (court.value.length === 4) {
        input.classList.add("is-valid");
        input.classList.remove("is-invalid");
    } else {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
    }

    if (/^[0-9]+$/.test(old.value)) {
        old.classList.add("is-valid");
        old.classList.remove("is-invalid");
    } else {
        old.classList.add("is-invalid");
        old.classList.remove("is-valid");
    }

    if (court.value.length === 4 && /^[0-9]+$/.test(old.value)) {
        generateKW();
    }
}

function generateKW() {
    const court = document.getElementById("court").value.trim();
    const old = document.getElementById("old").value.trim();

    if (court.length !== 4) return;
    if (!/^[0-9]+$/.test(old)) return;

    const control = calculateNr(court, old);
    const filling = "0".repeat(8 - old.length);
    const newNumber = `${court}/${filling}${old}/${control}`;

    document.getElementById("result").innerText =
        "Nowy numer księgi wieczystej: " + newNumber;
}

function downloadMultiple() {
    const court = document.getElementById("court").value.trim();
    const multiOld = document.getElementById("multiOld").value.trim();

    if (court.length !== 4) {
        alert("Najpierw wybierz sygnaturę sądu.");
        return;
    }

    if (multiOld.length === 0) {
        alert("Wpisz co najmniej jeden numer KW.");
        return;
    }

    const numbers = multiOld
        .split(",")
        .map(n => n.trim())
        .filter(n => /^[0-9]+$/.test(n));

    if (numbers.length === 0) {
        alert("Brak poprawnych numerów KW.");
        return;
    }

    let output = "";

    numbers.forEach(old => {
        const control = calculateNr(court, old);
        const filling = "0".repeat(8 - old.length);
        const newNumber = `${court}/${filling}${old}/${control}`;
        output += newNumber + "\n";
    });

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "nowe_numery_kw.txt";
    a.click();

    URL.revokeObjectURL(url);
}