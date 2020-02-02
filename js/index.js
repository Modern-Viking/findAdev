const inquirer = require("inquirer");
const fs = require("fs");
const util = require("util");
const axios = require("axios");
const puppeteer = require("puppeteer");
const generateHTML = require("./generate");
const writeFileAsync = util.promisify(fs.writeFile);

let profile;

init();

async function init() {
  try {
    let { username } = await getUserName();
    const { color } = await getColor();
    let starCountData = await getStarredNumber(username);
    let { data } = await getResponse(username);
    let starCount = starCountData.data.length;
    data.color = color;
    data.starCount = starCount;
    profile = username;

    const createHtml = generateHTML(data);
    writeFileAsync("initial.html", createHtml).then(function() {
      console.log("Successfully wrote html file");
    });
    makePDF();
  } catch (err) {
    console.log(err);
  }
}

function getUserName() {
  const username = inquirer.prompt({
    type: "input",
    message: "What is your GitHub Username?",
    name: "username"
  });
  return username;
}

function getResponse(username) {
  const data = axios.get(`https://api.github.com/users/${username}`);
  return data;
}

function getStarredNumber(username) {
  let starred = axios.get(`https://api.github.com/users/${username}/starred`);
  return starred;
}

function getColor() {
  const color = inquirer.prompt({
    type: "list",
    name: "color",
    message: "What is your favorite color?",
    choices: ["Red", "Green", "Blue", "Pink"]
  });

  return color;
}

async function makePDF() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    });
    await page.goto(
      "file://C:/Users/thoma/bootcamp/homework/findAdev/js/initial.html",
      {
        waitUntil: "networkidle2"
      }
    );  
    await page.pdf({
      path: `${profile}.pdf`,
      pageRanges: "1",
      format: "A4",
      printBackground: true
    });
    await browser.close();
    console.log(`PDF Created at ${profile}.pdf`);
  } catch (err) {
    console.log(err);
  }
}