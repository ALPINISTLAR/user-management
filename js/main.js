  // Firebase module
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

  //  my config code
  const firebaseConfig = {
    apiKey: "AIzaSyBSTTbPAIAF6R2OHy3MvV73wI5rPopOoQA",
    authDomain: "user-management-6e16f.firebaseapp.com",
    projectId: "user-management-6e16f",
    storageBucket: "user-management-6e16f.firebasestorage.app",
    messagingSenderId: "822317517829",
    appId: "1:822317517829:web:16b40fc0de0c301ac0606c"
  };

  // initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // GLOBAL VARIABLES
  const Name = document.getElementById('username');
  const Age = document.getElementById('age');
  const Email = document.getElementById('email');
  const Color = document.getElementById('color');
  const AddButton = document.getElementById('add-user');
  const usersContainer = document.getElementById('card-wrap');
  const FIREBASE_COLLECTION = 'users';
  const SearchInput = document.getElementById('search');
  const filterSelect = document.getElementById('sorting');
  let Users = [];
  let isEditing = false;
  let currentDocId = null;
  let initialUserData = {};

  // REAL-TIME LISTENING
  onSnapshot(collection(db, FIREBASE_COLLECTION), (snapshot) => {
    Users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.remove();

    renderUsers(Users);
  });

  // SEARCH
  SearchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const filteredUsers = Users.filter(user => user.name.toLowerCase().includes(searchTerm));

    renderUsers(filteredUsers);
  });

  Age.addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // SORTING
  filterSelect.addEventListener('change', function() {
    const value = this.value;

    if(value === 'name') {
      Users.sort((a,b) => a.name.toLowerCase().localeCompare(b.name));
    } else if(value === 'age') {
      Users.sort((a,b) => a.age - b.age);
    } else if(value === 'color') {
      Users.sort((a,b) => a.color.toLowerCase().localeCompare(b.color));
    }

    renderUsers();
  });

  // ADD USERS
  AddButton.addEventListener('click', async function(event) {
    event.preventDefault();

    const nameValue = Name.value.trim();
    const ageValue = Age.value.trim();
    const emailValue = Email.value.trim();
    const colorValue = Color.value.trim() || '#000000';


    let isValid = true;
    document.getElementById('name-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('age-error').textContent = '';

    Name.classList.remove('input-error');
    Email.classList.remove('input-error');
    Age.classList.remove('input-error');

    // Validation
    // NAME
    if(nameValue === '') {
      document.getElementById('name-error').textContent = 'Name is required';
      Name.classList.add('input-error');
      isValid = false;
    } else if(!/^[a-zA-Z\s]+$/.test(nameValue)) {
      document.getElementById('name-error').textContent = 'Name can contain only letters';
      Name.classList.add('input-error');
      isValid = false;
    } else {
      document.getElementById('name-error').textContent = '';
      Name.classList.remove('input-error');
    }
    // EMAIL
    if(emailValue === '') {
      document.getElementById('email-error').textContent = 'Email is required';
      Email.classList.add('input-error');
      isValid = false;
    } else if(!emailValue.includes('@')) {
      document.getElementById('email-error').textContent = "Email must include '@'";
      Email.classList.add('input-error');
      isValid = false;
    } else {
      document.getElementById('email-error').textContent = '';
      Email.classList.remove('input-error');
    }
    // AGE
    if(ageValue === '') {
      document.getElementById('age-error').textContent = 'Age is required';
      Age.classList.add('input-error');
      isValid = false;
    } else if(isNaN(ageValue) || ageValue <= 0 || ageValue > 100) {
      document.getElementById('age-error').textContent = 'Age must be a positive number (1-100)';
      Age.classList.add('input-error');
      isValid = false;
    } else {
      document.getElementById('age-error').textContent = '';
      Age.classList.remove('input-error');
    }
    if(!isValid) return;

    const user = {
      name: nameValue,
      age: Number(ageValue),
      email: emailValue,
      color: colorValue
    };
    try {
      if (isEditing && currentDocId) {
        await updateDoc(doc(db, FIREBASE_COLLECTION, currentDocId), user);

        isEditing = false;
        currentDocId = null;
        AddButton.textContent = 'Add user';
      } else {
        await addDoc(collection(db, FIREBASE_COLLECTION), user);
      }

      Name.value = '';
      Age.value = '';
      Email.value = '';
      Color.value = '#000000';
    } catch (error) {
      console.error("Error adding/updating user:", error);
    }
  });

  // RENDER USERS
  function renderUsers(UsersArray = Users) {
    usersContainer.innerHTML = "";
    const totalUsersDiv = document.getElementById('total-users');
    totalUsersDiv.textContent = `Total Users: ${Users.length}`;

    UsersArray.forEach(function(user) {
      const card = document.createElement('div');
      card.classList.add('card');
      card.style.border = `3px solid ${user.color || '#000000'}`;

      if (user.age >= 50) {
        card.style.backgroundColor = '#fff3cd';
        card.style.boxShadow = `0 0 20px ${user.color}`;
        card.style.animation = 'glow 1s infinite alternate';
      }

      card.innerHTML = `
            <div>Name: <p>${user.name}</p></div>
            <div>Age: <p>${user.age}</p></div>
            <div>Email: <p>${user.email}</p></div>
            <div>Color: <p class="color" style="background-color: ${user.color}"></p></div>
            <div class="button-wrapper">
            </div>
`;
      // DELETE BUTTON
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        await deleteDoc(doc(db, FIREBASE_COLLECTION, user.id));
      });
      // EDIT BUTTON
      const editBtn = document.createElement('button');
      editBtn.classList.add('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        isEditing = true;
        currentDocId = user.id;
        AddButton.textContent = 'Save Changes';
        AddButton.disabled = true;
        document.querySelectorAll('.card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');

        Name.value = user.name;
        Age.value = user.age;
        Email.value = user.email;
        Color.value = user.color;

        document.querySelector('.form-wrapper').scrollIntoView({ behavior: 'smooth', block: 'center' });
        Name.focus();
        initialUserData = { ...user };
      });
      const btnWrap = card.querySelector('.button-wrapper');
      btnWrap.appendChild(editBtn);
      btnWrap.appendChild(deleteBtn);
      usersContainer.appendChild(card);
    });
  };
  [Name, Age, Email, Color].forEach(input => {
    input.addEventListener('input', () => {
      const hasChanges = Name.value !== initialUserData.name ||
      Age.value != initialUserData.age ||
      Email.value !== initialUserData.email ||
      Color.value !== initialUserData.color;

      AddButton.disabled = !hasChanges;
    });
  });