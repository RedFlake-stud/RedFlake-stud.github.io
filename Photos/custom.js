document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".contact-form");
    const submitBtn = document.getElementById("submitBtn");
    const outputBox = document.getElementById("formOutput");
    const successPopup = document.getElementById("successPopup");

    const getEl = id => document.getElementById(id);

    const fields = {
        firstName: {
            el: getEl("firstName"),
            validate: (v) => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(v?.trim() ?? "")
        },
        lastName: {
            el: getEl("lastName"),
            validate: (v) => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/.test(v?.trim() ?? "")
        },
        userEmail: {
            el: getEl("userEmail"),
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() ?? "")
        },
        userAddress: {
            el: getEl("userAddress"),
            validate: (v) => (v?.trim() ?? "").length > 0
        },
        Q1: { el: getEl("Q1"), validate: () => true },
        Q2: { el: getEl("Q2"), validate: () => true },
        Q3: { el: getEl("Q3"), validate: () => true }
    };

    Object.values(fields).forEach(({ el }) => {
        if (!el) return;
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("error-text");
        errorDiv.style.display = "none";
        el.parentElement.appendChild(errorDiv);
    });

    function validateField(id) {
        const field = fields[id];
        const value = field.el.value;
        const errorDiv = field.el.parentElement.querySelector(".error-text");

        if (!field.validate(value)) {
            field.el.classList.add("input-error");
            errorDiv.textContent = "Neteisingai įvesti duomenys";
            errorDiv.style.display = "block";
            return false;
        } else {
            field.el.classList.remove("input-error");
            errorDiv.style.display = "none";
            return true;
        }
    }

    Object.keys(fields).forEach(id => {
        const f = fields[id];
        if (!f.el) return;
        f.el.addEventListener("input", () => {
            validateField(id);
            toggleSubmit();
        });
    });

    const phoneInput = getEl("userPhone");

    if (phoneInput) {
        phoneInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value.startsWith("370")) value = value.replace(/^370/, "");
            if (value.startsWith("0")) value = value.substring(1);

            value = value.slice(0, 8);

            let formatted = "+370";

            if (value.length > 0) formatted += " " + value.substring(0, 1);
            if (value.length > 1) formatted += value.substring(1, 3);
            if (value.length > 3) formatted += " " + value.substring(3);

            e.target.value = formatted;
            toggleSubmit();
        });
    }

    function toggleSubmit() {
        const allValid = Object.keys(fields)
            .filter(id => fields[id].el)
            .every(id => validateField(id));

        const phoneFilled = phoneInput.value.length >= 10;

        submitBtn.disabled = !(allValid && phoneFilled);
    }

    toggleSubmit();

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const data = {
            firstName: getEl("firstName").value,
            lastName: getEl("lastName").value,
            email: getEl("userEmail").value,
            phone: getEl("userPhone").value,
            address: getEl("userAddress").value,
            Q1: Number(getEl("Q1").value),
            Q2: Number(getEl("Q2").value),
            Q3: Number(getEl("Q3").value)
        };

        const average = ((data.Q1 + data.Q2 + data.Q3) / 3).toFixed(1);

        outputBox.innerHTML = `
            <h3>Jūsų įvesti duomenys:</h3>
            <p><strong>Vardas:</strong> ${data.firstName}</p>
            <p><strong>Pavardė:</strong> ${data.lastName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Telefonas:</strong> ${data.phone}</p>
            <p><strong>Adresas:</strong> ${data.address}</p>
            <p><strong>Klausimas 1:</strong> ${data.Q1}</p>
            <p><strong>Klausimas 2:</strong> ${data.Q2}</p>
            <p><strong>Klausimas 3:</strong> ${data.Q3}</p>
            <hr>
            <p><strong>${data.firstName} ${data.lastName}: ${average}</strong></p>
        `;

        successPopup.style.display = "block";
        setTimeout(() => {
            successPopup.style.display = "none";
        }, 3000);
    });

});
