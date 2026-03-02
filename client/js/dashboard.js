window.onload = function () {
  initializeDashboard();
};

async function initializeDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const profileView = document.getElementById("profileView");
  const form = document.getElementById("medicalForm");
  const qrImage = document.getElementById("qrImage");

  if (!profileView || !form) {
    console.error("Required elements not found in HTML");
    return;
  }

  // LOAD PROFILE
  try {
    const res = await fetch("https://medical-id-qr-project.onrender.com/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();

    profileView.innerHTML = `
      <h3>${data.firstName || ""} ${data.lastName || ""}</h3>
      <p>Blood Type: ${data.bloodType || ""}</p>
      <p>Contact: ${data.contactNumber || ""}</p>
      <p>Emergency: ${data.emergencyFirstName || ""} ${data.emergencyLastName || ""}</p>
      <p>Emergency Number: ${data.emergencyNumber || ""}</p>
    `;

    if (data.qrCode && qrImage) {
      qrImage.src = data.qrCode;
    }

    // Autofill safely
    setValue("firstName", data.firstName);
    setValue("lastName", data.lastName);
    setValue("bloodType", data.bloodType);
    setValue("contactNumber", data.contactNumber);
    setValue("emergencyFirstName", data.emergencyFirstName);
    setValue("emergencyLastName", data.emergencyLastName);
    setValue("emergencyNumber", data.emergencyNumber);
    setValue("allergies", data.allergies);
    setValue("medications", data.medications);
    setValue("medicalConditions", data.medicalConditions);

  } catch (error) {
    console.error(error);
    alert("Session expired. Please login again.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  // SAFE SUBMIT HANDLER
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const body = {
      firstName: getValue("firstName"),
      lastName: getValue("lastName"),
      bloodType: getValue("bloodType"),
      contactNumber: getValue("contactNumber"),
      emergencyFirstName: getValue("emergencyFirstName"),
      emergencyLastName: getValue("emergencyLastName"),
      emergencyNumber: getValue("emergencyNumber"),
      allergies: getValue("allergies"),
      medications: getValue("medications"),
      medicalConditions: getValue("medicalConditions")
    };

    try {
      const res = await fetch("https://medical-id-qr-project.onrender.com/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Save failed");

      alert("Profile Saved");
      initializeDashboard();
      form.style.display = "none";

    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  });
}

// Helper functions (prevents null crash)
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || "";
}

function toggleEdit() {
  const form = document.getElementById("medicalForm");
  if (form) {
    form.style.display =
      form.style.display === "none" ? "block" : "none";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}