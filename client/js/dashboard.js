const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/pages/login.html";
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const profileData = {
    firstName: document.getElementById("firstName").value,
    middleName: document.getElementById("middleName").value,
    lastName: document.getElementById("lastName").value,
    sex: document.getElementById("sex").value,
    dob: document.getElementById("dob").value,
    bloodType: document.getElementById("bloodType").value,
    contactNumber: document.getElementById("contactNumber").value,
    religion: document.getElementById("religion").value,

    emergencyFirstName: document.getElementById("emergencyFirstName").value,
    emergencyMiddleName: document.getElementById("emergencyMiddleName").value,
    emergencyLastName: document.getElementById("emergencyLastName").value,
    emergencyRelationship: document.getElementById("emergencyRelationship").value,
    emergencyContactNumber: document.getElementById("emergencyContactNumber").value,

    height: document.getElementById("height").value,
    weight: document.getElementById("weight").value,

    allergies: document.getElementById("allergies").value,
    medications: document.getElementById("medications").value,
    medicalConditions: document.getElementById("medicalConditions").value,
    pastIllness: document.getElementById("pastIllness").value,
    familyHistory: document.getElementById("familyHistory").value,

    philhealth: document.getElementById("philhealth").value,
    hmo: document.getElementById("hmo").value
  };

  const res = await fetch("/api/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(profileData)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Error saving profile");
    return;
  }

  alert("Profile saved successfully!");
  window.location.href = "/pages/profile.html";
});