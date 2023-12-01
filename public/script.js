const getCountries = async() => {
    try {
        return (await fetch("/api/countries")).json();
    } catch (error) {
        console.log(error);
    }
};

const showCountries = async() => {
    let countries = await getCountries();
    let countriesDiv = document.getElementById("country-list");
    countriesDiv.innerHTML = "";
    countries.forEach((country) => {
        const section = document.createElement("section");
        section.classList.add("country");
        countriesDiv.append(section);

        const a = document.createElement("a");
        a.href = "#";
        section.append(a);

        const h3 = document.createElement("h3");
        h3.innerHTML = country.name;
        a.append(h3);

        a.onclick = (e) => {
            e.preventDefault();
            displayDetails(country);
        };
    });
};

const displayDetails = (country) => {
    const countryDetails = document.getElementById("country-details");
    countryDetails.innerHTML = "";

    const h3 = document.createElement("h3");
    h3.innerHTML = country.name;
    countryDetails.append(h3);

    const dLink = document.createElement("a");
    dLink.innerHTML = "	&#x2715;";
    countryDetails.append(dLink);
    dLink.id = "delete-link";

    const eLink = document.createElement("a");
    eLink.innerHTML = "&#9998;";
    countryDetails.append(eLink);
    eLink.id = "edit-link";

    const language = document.createElement("p");
    countryDetails.append(language);
    language.innerHTML = "Language: "+country.language;

    const origin = document.createElement("p");
    countryDetails.append(origin);
    origin.innerHTML = "Origin: "+country.origin;

    const population = document.createElement("p");
    countryDetails.append(population);
    population.innerHTML = "Population: "+country.population;

    const p = document.createElement("p");
    countryDetails.append(p);
    p.innerHTML = "Capitol: "+country.capitol;

    const president = document.createElement("p");
    countryDetails.append(president);
    president.innerHTML = "President: "+country.president;

    const ul = document.createElement("ul");
    countryDetails.append(ul);
    ul.innerHTML = "Funfacts: ";
    console.log(country.funfacts);
    country.funfacts.forEach((funfact) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = funfact;
    });

    eLink.onclick = (e) => {
        e.preventDefault();
        document.querySelector(".dialog").classList.remove("transparent");
        document.getElementById("add-edit-title").innerHTML = "Edit Country";
    };

    dLink.onclick = (e) => {
        e.preventDefault();
        const confirmDelete = confirm(`Are you sure you want to delete ${country.name}?`);
        if (confirmDelete) {
        deleteCountry(country);
        }
    };

    populateEditForm(country);
};

const deleteCountry = async(country) => {
    let response = await fetch(`/api/countries/${country._id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    if (response.status != 200) {
        console.log("error deleting");
        return;
    }

    let result = await response.json();
    showCountries();
    document.getElementById("country-details").innerHTML = "";
    resetForm();
}
const populateEditForm = (country) => {
    const form = document.getElementById("add-edit-country-form");
    form._id.value = country._id;
    form.name.value = country.name;
    form.population.value = country.population;
    form.language.value = country.language;
    form.origin.value = country.origin;
    form.capitol.value = country.capitol;
    form.president.value = country.president;
    populateFunfact(country)
};

const populateFunfact = (country) => {
    const section = document.getElementById("funfact-boxes");

    country.funfacts.forEach((funfact) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = funfact;
        section.append(input);
    });
}

const addEditCountry = async(e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-country-form");
    const formData = new FormData(form);
    let response;
    formData.append("funfacts", getFunfacts());
  
    if (form._id.value == -1) {
        formData.delete("_id");
    
        response = await fetch("/api/countries", {
            method: "POST",
            body: formData
        });
    } 
    else {
        console.log(...formData);

        response = await fetch(`/api/countries/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    //successfully got data from server
    if (response.status != 200) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.style.display = "block";

        // Delay hiding the error message for 3 seconds
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 3000);

        console.log("Error posting data");
        return;
    } else {
        // Display success message for 3 seconds
        const successMessage = document.getElementById("success-message");
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
            resetForm();
        document.querySelector(".dialog").classList.add("transparent");
        showCountries();
        }, 3000);
    }

    country = await response.json();

    if (form._id.value != -1) {
        displayDetails(country);
    }
    
};

const getFunfacts = () => {
    const inputs = document.querySelectorAll("#funfact-boxes input");
    let funfacts = [];

    inputs.forEach((input) => {
        funfacts.push(input.value);
    });

    return funfacts;
}

const resetForm = () => {
    const form = document.getElementById("add-edit-country-form");
    form.reset();
    form._id = "-1";
    document.getElementById("funfact-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.querySelector(".dialog").classList.add("animation");
    document.getElementById("add-edit-title").innerHTML = "Add Country";
    resetForm();
};

const addFunfact = (e) => {
    e.preventDefault();
    const section = document.getElementById("funfact-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
}



window.onload = () => {
    showCountries();
    document.getElementById("add-edit-country-form").onsubmit = addEditCountry;
    document.getElementById("add-link").onclick = showHideAdd;

    document.querySelector(".close").onclick = () => {
        document.querySelector(".dialog").classList.add("transparent");
    };

    document.getElementById("add-funfact").onclick = addFunfact;
};

