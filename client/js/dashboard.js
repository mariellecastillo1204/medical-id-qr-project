const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

// Load existing data
window.onload = async () => {
  const res = await fetch("/api/profile", {
    headers: { Authorization: token }
  });

  const data = await res.json();
  if (!data) return;

  Object.keys(data).forEach(key => {
    const element = document.getElementById(key);
    if (element) element.value = data[key];
  });
};

// Save form
document.getElementById("medicalForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    firstName: firstName.value,
    middleName: middleName.value,
    lastName: lastName.value,
    sex: sex.value,
    dateOfBirth: dateOfBirth.value,
    bloodType: bloodType.value,
    contactNumber: contactNumber.value,
    religion: religion.value,

    emergencyFirstName: emergencyFirstName.value,
    emergencyMiddleName: emergencyMiddleName.value,
    emergencyLastName: emergencyLastName.value,
    emergencyRelationship: emergencyRelationship.value,
    emergencyContactNumber: emergencyContactNumber.value,

    allergies: allergies.value,
    medications: medications.value,
    medicalConditions: medicalConditions.value,

    pastIllness: pastIllness.value,
    familyHistory: familyHistory.value,

    philHealthNumber: philHealthNumber.value,
    insuranceProvider: insuranceProvider.value
  };

  const res = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  alert(data.message);
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}