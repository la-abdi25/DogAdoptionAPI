# DogAdoptionAPI

<h2>Description</h2>
<p>A RESTful API for managing dog adoptions, where users can register, login, register their dogs for adoption, adopt dogs, and manage their registered or adopted dogs using Node.js, Express.js, and MongoDB.</p>

<h2>Features</h2>
<h3>User Registration</h3>
<ul>
  <li>Users can sign up with a unique username and password.</li>
  <li>Passwords are hashed before being stored in the database.</li>
</ul>

<h3>User Authentication</h3>
<ul>
  <li>Users log in with their credentials.</li>
  <li>A JWT token valid for 24 hours is issued for authenticated requests.</li>
</ul>


<h3>Dog Registration</h3>
<ul>
  <li>Authenticated users can register dogs awaiting adoption.</li>
  <li>Each dog entry includes a name and a brief description.</li>
</ul>


<h3>Dog Adoption</h3>
<ul>
  <li>Authenticated users can adopt dogs by ID.</li>
  <li>A thank-you message is recorded for the original owner.</li>
  <ul>Restrictions:
    <li>A dog already adopted cannot be adopted again.</li>
    <li>Users cannot adopt dogs they themselves registered.</li>
  </ul>
</ul>


<h3>Removing Dogs</h3>
<ul>
  <li>Owners can remove their registered dogs unless the dog has already been adopted.</li>
  <li>Users cannot remove dogs registered by others.</li>
</ul>


<h3>Listing Registered Dogs</h3>
<ul>
  <li>Authenticated users can view the list of dogs they registered.</li>
  <li>Supports filtering by adoption status (true/false) and pagination.</li>
</ul>

<h3>Listing Adopted Dogs</h3>
<ul>
  <li>Authenticated users can view the list of dogs they have adopted.</li>
  <li>Supports pagination.</li>
</ul>

<h3>Listing All Dogs</h3>
<ul>
  <li>Authenticated users can view the list of all dogs registered on the platform to then be able to adopt by id.</li>
  <li>Supports pagination.</li>
</ul>

<h3>Error Handling</h3>
<ul>
  <li>All API endpoints use try/catch blocks with centralized error handling. Responses follow a consistent JSON structure so users can easily parse errors.</li>
</ul>

<h2>Tech Stack</h2>
<ul>
  <ul>
    <h4>BackEnd:</h4>
    <li>Node.js</li>
    <li>Express.js</li>
  </ul>
   <ul>
    <h4>Database:</h4>
    <li>MongoDB (Mongoose ODM)</li>
  </ul>
  <ul>
    <h4>Authentication:</h4>
    <li>JWT (JSON Web Tokens)</li>
    <li>bcrypt for password hashing</li>
  </ul>
  <ul>
    <h4>Environment Variables:</h4>
    <li>dotenv</li>
  </ul>
  <ul>
    <h4>Automated tests:</h4>
    <li>Mocha: JavaScript test framework</li>
    <li>Chai: Assertion library</li>
    <li>Supertest: HTTP assertions for API endpoints</li>
  </ul>
</ul>
  
<h2>How To Get Started</h2>
<ol>
  <li>git clone https://github.com/la-abdi25/DogAdoptionAPI.git</li>
  <li>cd DogAdoptionAPI</li>
  <li>npm install</li>
  <li>create a .env file, follow .env.example file</li>
  <li>run: nodemon app, in your terminal via an IDE</li>
  <li>Visit Postman and test the endpoints via http://localhost:3000</li>
  <li>To test the API run: npm run test</li>
</ol>

<h2>How to use the App via Render</h2>
<ul>
  <li>Login to Postman</li>
  <li>Visit https://dogadoptionapi.onrender.com</li>
  <li>Test out all endpoints</li>
</ul>

<h2>All Endpoints for API</h2>
<ul>
  <h4>Authentication(Register/Login/Logout)</h4>
  <li>Method: "POST" - https://dogadoptionapi.onrender.com/register</li>
  <li>Method: "POST" - https://dogadoptionapi.onrender.com/login</li>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/logout</li>
</ul>
<ul>
  <h4>Getting All registered dogs on the platform</h4>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/registereddogs/getalldogs</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Getting your registered dogs on the platform</h4>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/registereddogs/getmydogs</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Getting your adopted dogs on the platform</h4>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/adopteddogs/getmydogs</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Adopt a dog on the platform</h4>
  <li>Method: "PUT" - https://dogadoptionapi.onrender.com/adoptdog</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Register your dog for adoption</h4>
  <li>Method: "POST" - https://dogadoptionapi.onrender.com/registermydog</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Delete your dog from the platform</h4>
  <li>Method: "DELETE" - https://dogadoptionapi.onrender.com/deletemydog</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Viewing messages you sent as a user </h4>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/sentmessages</li>
  <li>Authorization required</li>
</ul>
<ul>
  <h4>Viewing messages you recieved as a user </h4>
  <li>Method: "GET" - https://dogadoptionapi.onrender.com/recmessages</li>
  <li>Authorization required</li>
</ul>



