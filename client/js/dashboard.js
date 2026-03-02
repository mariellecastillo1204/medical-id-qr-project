const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please log in again.");
  window.location.href = "/pages/login.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/pages/login.html";
}