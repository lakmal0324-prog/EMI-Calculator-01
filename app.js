import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA86NUK-UXZJxCkPUUjVPNV4Cjm20XpWAo",
  authDomain: "emi-calculator-9e048.firebaseapp.com",
  databaseURL: "https://emi-calculator-9e048-default-rtdb.firebaseio.com",
  projectId: "emi-calculator-9e048",
  storageBucket: "emi-calculator-9e048.firebasestorage.app",
  messagingSenderId: "181063869117",
  appId: "1:181063869117:web:e75cf8af947f7c0aa80dd4",
  measurementId: "G-G3ZE9WP5SD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Auth State Monitor - App එක Open වෙද්දීම Status එක Check කරයි
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = ref(db, 'users/' + user.uid);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      if (userData.isApproved === true) {
        // Admin Approve කර ඇත්නම් පමණක් Main App එක පෙන්වයි
        showScreen('app-box');
        document.getElementById('user-display').innerText = `Hello, ${userData.name}!`;
      } else {
        // Admin Approve කර නැත්නම් Pending Screen එක පෙන්වයි
        showScreen('pending-box');
      }
    } else {
      showScreen('login-box');
    }
  } else {
    // Log වී නැත්නම් Login Screen එක පෙන්වයි
    showScreen('login-box');
  }
});

// UI Screen Switcher
function showScreen(screenId) {
  ['login-box', 'register-box', 'pending-box', 'app-box'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

window.showRegister = () => showScreen('register-box');
window.showLogin = () => showScreen('login-box');

// Register Function
window.register = async () => {
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const msg = document.getElementById('reg-msg');

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user with isApproved = false
    await set(ref(db, 'users/' + user.uid), {
      name: name,
      email: email,
      isApproved: false,
      createdAt: new Date().toISOString()
    });

    msg.style.color = "green";
    msg.innerText = "Registration successful! Waiting for admin approval.";
  } catch (error) {
    msg.style.color = "red";
    msg.innerText = error.message;
  }
};

// Login Function
window.login = async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    msg.style.color = "red";
    msg.innerText = error.message;
  }
};

// Logout Function
window.logout = () => {
  signOut(auth);
};
