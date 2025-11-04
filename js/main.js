const Name = document.getElementById('username');
const Age = document.getElementById('age');
const Email = document.getElementById('email');
const Color = document.getElementById('color');
const AddButton = document.getElementById('add-user');
const usersContainer = document.getElementById('card-wrap');
const STORAGE_KEY = 'users';
const SearchInput = document.getElementById('search');
const filterSelect = document.getElementById('sorting');
let Users = [];
let isEditing = false;
let currentIndex = null;

if (localStorage.getItem(STORAGE_KEY)) {
  Users = JSON.parse(localStorage.getItem(STORAGE_KEY));
  renderUsers();
}

SearchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();

  const filteredUsers = Users.filter(user => user.name.toLowerCase().includes(searchTerm));

  renderUsers(filteredUsers);
});

Age.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9]/g, '');
});

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


AddButton.addEventListener('click', function(event) {
  event.preventDefault();

  const nameValue = Name.value.trim();
  const ageValue = Age.value.trim();
  const emailValue = Email.value.trim();
  const colorValue = Color.value.trim();

  if (
    nameValue !== "" &&
    emailValue.includes("@") &&
    !isNaN(ageValue) &&
    ageValue > 0 &&
    ageValue <= 100 &&
    colorValue !== ""
  ) {

    if (isEditing) {
      Users[currentIndex] = {
        name: nameValue,
        age: Number(ageValue),
        email: emailValue,
        color: colorValue
      };

      isEditing = false;
      currentIndex = null;
      AddButton.textContent = 'Add User';
    }

    else {
      const user = {
        name: nameValue,
        age: Number(ageValue),
        email: emailValue,
        color: colorValue
      };

      Users.push(user);
    }
    renderUsers();

    Name.value = '';
    Age.value = '';
    Email.value = '';
    Color.value = '';
  }

  else {
    alert("Please enter valid data. Name must be text, Age must be positive number and email must include '@'.");
  }
});

function renderUsers(UsersArray = Users) {
  usersContainer.innerHTML = "";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Users));

  const totalUsersDiv = document.getElementById('total-users');
  totalUsersDiv.textContent = `Total Users: ${UsersArray.length}`;

  UsersArray.forEach(function(user, index) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.style.border = `3px solid ${user.color}`;

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
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.index = index;

    deleteBtn.addEventListener('click', function() {
      const i = Number(this.dataset.index);
      Users.splice(i, 1);
      renderUsers();
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('button');
    editBtn.textContent = 'Edit';
    editBtn.dataset.index = index;

    editBtn.addEventListener('click', function() {
      const i = Number(this.dataset.index);
      const user = Users[i];

      isEditing = true;
      currentIndex = i;
      AddButton.textContent = 'Save Changes';
      this.closest('.card').classList.add('active-card');

      Name.value = user.name;
      Age.value = user.age;
      Email.value = user.email;
      Color.value = user.color;
    });
    const btnWrap = card.querySelector('.button-wrapper');
    btnWrap.appendChild(editBtn);
    btnWrap.appendChild(deleteBtn);

    usersContainer.appendChild(card);
  });
}
