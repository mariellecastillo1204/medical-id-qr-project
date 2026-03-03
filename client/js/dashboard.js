const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

// LOAD EXISTING DATA
window.onload = async () => {
  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    if (!data || data.message) return;

    Object.keys(data).forEach(key => {
      const element = document.getElementById(key);
      if (element) element.value = data[key];
    });

  } catch (err) {
    console.log("Error loading profile", err);
  }
};

// SAVE FORM
document.getElementById("medicalForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
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
    relationship: document.getElementById("relationship").value,
    emergencyContactNumber: document.getElementById("emergencyContactNumber").value,

    allergies: document.getElementById("allergies").value,
    medications: document.getElementById("medications").value,
    medicalConditions: document.getElementById("medicalConditions").value,

    pastIllness: document.getElementById("pastIllness").value,
    familyHistory: document.getElementById("familyHistory").value,

    philhealth: document.getElementById("philhealth").value,
    hmo: document.getElementById("hmo").value
  };

  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    alert(data.message || "Profile saved successfully!");

    // 🔥 IMPORTANT: Redirect to profile page after save
    window.location.href = "pages/profile.html";

  } catch (err) {
    console.log("Error saving profile", err);
  }
});

// LOGOUT FIX
function logout() {
  localStorage.removeItem("token");
  window.location.href = "pages/profile.html";
}