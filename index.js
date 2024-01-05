import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// initalsing application
const app = express();
const port = 3000;

// connnection to db 
const db  = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world", 
  password: "******",
  port: 5432,
});
db.connect();


// middlewere
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// function to add all the country inn array 
async function country(){
  let countries = [];
  const result = await db.query("SELECT country_code FROM visited_countries");
  result.rows.forEach(row => {
    countries.push(row.country_code);
  });
  return countries;
}

// Home route 
app.get("/", async (req, res) => {
  const countries = await country();
  res.render("index.ejs", { countries: countries , total: countries.length});
});


// add route 
app.post("/add", async (req, res) =>{
  const input =  req.body.country;
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    const countryCode = result.rows[0].country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await country();
      res.render("index.ejs",{
          countries: countries,
          total: countries.length,
          error: "coutry has already been added, try another one ",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await country();
    res.render("index.ejs",{
      countries: countries,
      total: countries.length,
      error: "Country name does not exixt, try another country",
    });
  }
});


// listneing to port 
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


