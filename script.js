"use strict";

//DOM elements

const uName = document.querySelector(".userName");
const pin = document.querySelector(".pin");
const btn = document.getElementById("logIn");
const transfer = document.getElementById("transfer");
const total = document.querySelector("h2");
const close = document.querySelector(".closee");
const sort = document.querySelector(".btn--sort");
const request = document.getElementById("request");
const transaction = document.querySelector(".transaction");
let closeName = document.querySelector(".close-name");
let closePin = document.querySelector("#close-pin");
let loan = document.querySelector("#loan-amount");
const signUpBtn = document.querySelector(".sign");
let activeUser;
let timer;

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2018-12-18T21:31:17.178Z",
    "2019-12-24T07:42:02.383Z",
    "2022-12-23T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2023-12-17T14:11:59.604Z",
    "2023-12-20T17:01:17.194Z",
    "2023-12-23T23:36:17.929Z",
    "2023-12-24T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};
const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2013-01-28T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2012-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2022-09-28T23:36:17.929Z",
    "2015-08-01T10:51:36.790Z",
  ],
  currency: "Birr",
  locale: "et-ET",
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2018-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2023-05-08T14:11:59.604Z",
    "2022-07-26T17:01:17.194Z",
    "2120-07-28T23:36:17.929Z",
    "2220-08-01T10:51:36.790Z",
  ],
  currency: "USD",
  locale: "en-US",
};
!localStorage.getItem("accounts") &&
  localStorage.setItem(
    "accounts",
    JSON.stringify([account1, account2, account3, account4])
  );
const accounts = JSON.parse(localStorage.getItem("accounts"));
const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

accounts.map((account) => {
  account.userName = account.owner.toLowerCase();
});

const formatDate = function (date, locale) {
  const daysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  if (daysPassed(new Date(), date) === 0) return "Today";
  if (daysPassed(new Date(), date) === 1) return "Yesterday";
  if (daysPassed(new Date(), date) <= 7)
    return `${daysPassed(new Date(), date)} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatNum = (num, locale, curr) =>
  Intl.NumberFormat(locale, {
    style: "currency",
    currency: curr,
    useGrouping: true,
  }).format(num);

const logTimer = function () {
  let minute = 4;
  let second = 59;
  const tick = function () {
    if (minute >= 0) {
      if (second > 0) {
        document.querySelector(".timer").textContent = `${
          String(minute).padStart(2, 0) + ":" + String(second).padStart(2, 0)
        }`;
        second--;
      } else {
        document.querySelector(".timer").textContent = `${
          String(minute).padStart(2, 0) + ":" + String(second).padStart(2, 0)
        }`;
        second = 59;
        minute--;
      }
    } else {
      clearInterval(timer);
      document.querySelector("main").classList.add("hidden");
      message.textContent = "Log in to get started";
    }
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
const displayMovement = function (movements, sorted = true, date) {
  transaction.innerHTML = "";
  const movs = movements.length
    ? sorted
      ? movements
      : movements.slice().sort((a, b) => a - b)
    : [];
  movs?.forEach(function (mov, i) {
    const type = mov > 0 ? "Deposit" : "Withdrawal";
    const displayDate = formatDate(date[i], activeUser.locale);
    const html = `
    <div class="transaction-detail">
      <div class="transaction-type">
        <span class="${type}">${i + 1} ${type}</span>
        <date>${displayDate}</date>
      </div>
      <span class="amount">${formatNum(
        mov.toFixed(2),
        activeUser.locale,
        activeUser.currency
      )}</span>
    </div>
    `;
    transaction.insertAdjacentHTML("afterbegin", html);
  });
};

const displayBalance = function (movements) {
  const balance = movements.length
    ? movements.reduce((acc, mov) => acc + mov, 0)
    : 0;
  const deposit = movements.length
    ? movements
        .filter((mov) => mov > 0)
        .reduce((acc, deposit) => acc + deposit, 0)
    : 0;
  const withdrawal = Math.abs(
    movements
      .filter((mov) => mov < 0)
      .reduce((acc, deposit) => acc + deposit, 0)
  );
  total.textContent = `${formatNum(
    balance.toFixed(2),
    activeUser.locale,
    activeUser.currency
  )}`;
  document.querySelector(".in").textContent = formatNum(
    deposit.toFixed(2),
    activeUser.locale,
    activeUser.currency
  );
  document.querySelector(".out").textContent = formatNum(
    withdrawal.toFixed(2),
    activeUser.locale,
    activeUser.currency
  );
};

const updateUi = function (acc, date) {
  displayMovement(acc.movements, true, date);
  displayBalance(acc.movements);
};

const logIn = function () {
  activeUser = accounts.find(
    (account) => account.userName === uName.value && account.pin == pin.value
  );

  if (activeUser) {
    const interest = activeUser.movements.length
      ? activeUser.movements
          .map((mov) => (mov * activeUser.interestRate) / 100)
          .reduce((acc, interest, i, arr) => acc + interest)
      : 0;
    document.querySelector(".message").textContent = `Good Afternoon, ${
      activeUser.owner.split(" ")[0]
    }`;
    document.querySelector(".int").textContent = formatNum(
      interest.toFixed(2),
      activeUser.locale,
      activeUser.currency
    );
    uName.value = pin.value = "";
    const date = activeUser.movementsDates.map((date) => new Date(date));
    updateUi(activeUser, date);
    const options = {
      hour: "numeric",
      minute: "numeric",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    };
    const now = new Intl.DateTimeFormat(activeUser.locale, options).format(
      new Date()
    );
    document.querySelector(".now").textContent = now;
    document.querySelector("main").classList.remove("hidden");
  } else {
    uName.value = pin.value = "";
  }
};

btn.addEventListener("click", function (e) {
  e.preventDefault();
  logIn();
  if (timer) clearInterval(timer);
  timer = logTimer();
});
pin.addEventListener("keydown", function (e) {
  e.key === "Enter" && logIn();
});
transfer.addEventListener("click", function (e) {
  e.preventDefault();
  clearInterval(timer);
  timer = logTimer();
  let transferTo = document.querySelector(".transfer-to");
  let transferAmt = document.getElementById("transfer-amt");
  const numTransfer = Number(transferAmt.value);
  const receiverAcc = accounts.find(
    (account) =>
      account.userName === transferTo.value &&
      activeUser.userName !== transferTo.value
  );
  const currbalance = activeUser.movements.reduce((acc, mov) => acc + mov);
  if (numTransfer > 0 && numTransfer < currbalance) {
    const now = new Date();
    if (receiverAcc) {
      activeUser.movements.push(-numTransfer);
      activeUser.movementsDates.push(now.toISOString());
      const date = activeUser.movementsDates.map((date) => new Date(date));
      receiverAcc.movements.push(numTransfer);
      receiverAcc.movementsDates.push(now.toISOString());
      updateActiveUser();
      updateUi(activeUser, date);
    }
  }
  transferTo.value = transferAmt.value = "";
});
const message = document.querySelector(".message");
let requestMessage = "";
request.addEventListener("click", function (e) {
  e.preventDefault();
  clearInterval(timer);
  timer = logTimer();
  if (requestMessage !== "") {
    message.textContent = message.textContent.replace(
      requestMessage,
      " Your loan request is pending"
    );
    requestMessage = " Your loan request is pending";
  } else {
    message.insertAdjacentText("beforeend", " Your loan request is pending");
    requestMessage = " Your loan request is pending";
  }
  setTimeout(() => {
    const amount = Math.floor(Number(loan.value));
    const date = activeUser.movementsDates.map((date) => new Date(date));
    if (
      amount > 0 &&
      (activeUser.movements.some((deposit) => deposit > 0.1 * amount) ||
        (!activeUser.movements.length && loan.value.length < 10_000))
    ) {
      message.textContent = message.textContent.replace(
        requestMessage,
        ` Your loan request has been approved`
      );
      requestMessage = " Your loan request has been approved";
      activeUser.movements.push(amount);
      const now = new Date();
      activeUser.movementsDates.push(now.toISOString());
      const date = activeUser.movementsDates.map((date) => new Date(date));
      loan.value = "";
    } else {
      message.textContent = message.textContent.replace(
        requestMessage,
        ` Your loan request has been denied`
      );
      requestMessage = " Your loan request has been denied";
    }
    updateActiveUser();
    updateUi(activeUser, date);
    loan.value = "";
  }, 5000);
});
setInterval(() => {
  message.textContent.includes(requestMessage)
    ? (message.textContent = message.textContent.replace(requestMessage, ""))
    : false;
}, 3000 * 60);

close.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    closeName.value === activeUser.userName &&
    closePin.value === String(activeUser.pin)
  ) {
    let index = accounts.findIndex(
      (account) =>
        closeName.value === account.userName &&
        closePin.value === String(account.pin)
    );
    accounts.splice(index, 1);
    document.querySelector("main").classList.add("hidden");
    closePin.value = "";
    closeName.value = "";
  }
});
let sorted = false;
sort.addEventListener("click", function (e) {
  e.preventDefault();
  const date = activeUser.movementsDates.map((date) => new Date(date));
  displayMovement(activeUser.movements, sorted, date);
  sorted = !sorted;
});

signUpBtn.addEventListener("click", function () {
  const signUpForm = `
    <div class="overlay">
      <form action="" class="sign_up_form">
        <fieldset>
          <legend>Create Account</legend>
          <div>
            <label for="na">Name</label>
            <input type="text" id="na" name="name">
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" name="password">
          </div>
          <div>
            <label for="ir">Interest rate</label>
            <input type="number" id="ir" name="ir">
          </div>
          <div class="submit">
            <button class="sign-up">Sign up</button>
          </div>
        </fieldset>
      </form>
    </div>
  `;
  document.querySelector("header").insertAdjacentHTML("beforeend", signUpForm);
});

document.addEventListener("submit", function (e) {
  if (!e.target.classList.contains("sign_up_form")) return;
  e.preventDefault();
  const name = e.target.querySelector("#na").value;
  const pin = e.target.querySelector("#password").value;
  const rate = e.target.querySelector("#ir").value;
  const account = {
    owner: name,
    movements: [],
    interestRate: rate,
    pin,
    userName: name,
    movementsDates: [],
    currency: "USD",
    locale: "en-US",
  };
  accounts.push(account);
  updateAccounts(accounts);
  e.target.closest(".overlay").remove();
  window.alert("Welcome to Bankist enter your user name and pin to Log in !");
});

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("sign_up_form"))
    e.target.closest(".overlay").remove();
});

const updateAccounts = (accounts) => {
  localStorage.setItem("accounts", JSON.stringify(accounts));
};

const updateActiveUser = (_) => {
  const accs = accounts.map((account) => {
    if (
      account.userName === activeUser.userName &&
      account.pin === activeUser.pin
    ) {
      account = activeUser;
    }
    return account;
  });
  updateAccounts(accs);
};
